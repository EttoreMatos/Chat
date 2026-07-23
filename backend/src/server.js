const http = require("http");
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { WebSocketServer } = require("ws");
const { randomUUID } = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 8080;
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");
const DIRS = {
  images: path.join(UPLOAD_ROOT, "images"),
  audio: path.join(UPLOAD_ROOT, "audio"),
  avatars: path.join(UPLOAD_ROOT, "avatars"),
};

for (const dir of Object.values(DIRS)) {
  fs.mkdirSync(dir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(UPLOAD_ROOT));

function mimeToExt(mime) {
  const base = (mime || "").split(";")[0].trim().toLowerCase();
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "audio/webm": ".webm",
    "video/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/mp4": ".m4a",
    "audio/aac": ".m4a",
    "audio/x-m4a": ".m4a",
  };
  return map[base] || "";
}

function isAudioMime(mime) {
  const m = (mime || "").toLowerCase();
  return (
    m.startsWith("audio/") ||
    m === "video/webm" ||
    m === "application/octet-stream"
  );
}

function isImageMime(mime) {
  return (mime || "").toLowerCase().startsWith("image/");
}

function folderForField(fieldname, mimetype, originalname = "") {
  if (fieldname === "avatar") return "avatars";
  if (isImageMime(mimetype)) return "images";
  if (isAudioMime(mimetype)) return "audio";
  const ext = path.extname(originalname || "").toLowerCase();
  if ([".webm", ".ogg", ".mp3", ".wav", ".m4a", ".aac", ".mp4"].includes(ext)) {
    return "audio";
  }
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
    return "images";
  }
  return null;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folder = folderForField(
      file.fieldname,
      file.mimetype,
      file.originalname
    );
    if (!folder) return cb(new Error("Unsupported file type"));
    cb(null, DIRS[folder]);
  },
  filename(req, file, cb) {
    const ext =
      path.extname(file.originalname) || mimeToExt(file.mimetype) || ".bin";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ok =
      isImageMime(file.mimetype) ||
      isAudioMime(file.mimetype) ||
      Boolean(
        folderForField(file.fieldname, file.mimetype, file.originalname)
      );
    cb(ok ? null : new Error("Only image and audio files are allowed"), ok);
  },
});

app.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const folder = folderForField(
      req.file.fieldname,
      req.file.mimetype,
      req.file.originalname
    );
    const kind = folder === "audio" ? "audio" : "image";
    const url = `/uploads/${folder}/${req.file.filename}`;
    res.json({ url, kind });
  });
});

app.post("/upload/avatar", (req, res) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const url = `/uploads/avatars/${req.file.filename}`;
    res.json({ url, kind: "image" });
  });
});

function youtubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] || null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/")[2] || null;
      }
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

/** @returns {{ type: string, id: string, embedPath: string } | null} */
function spotifyEmbed(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    // open.spotify.com/intl-pt/track/ID or /track/ID or /embed/track/ID
    let type;
    let id;
    if (parts[0] === "embed" && parts[1] && parts[2]) {
      type = parts[1];
      id = parts[2].split("?")[0];
    } else {
      const types = new Set([
        "track",
        "album",
        "playlist",
        "episode",
        "show",
        "artist",
      ]);
      for (let i = 0; i < parts.length - 1; i++) {
        if (types.has(parts[i])) {
          type = parts[i];
          id = parts[i + 1].split("?")[0];
          break;
        }
      }
    }
    if (!type || !id) return null;
    return { type, id, embedPath: `${type}/${id}` };
  } catch {
    return null;
  }
}

function extractMeta(html, prop) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

app.get("/embed", async (req, res) => {
  const raw = req.query.url;
  if (!raw || typeof raw !== "string") {
    return res.status(400).json({ error: "Missing url" });
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return res.status(400).json({ error: "Invalid url" });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return res.status(400).json({ error: "Invalid protocol" });
  }

  const yt = youtubeId(raw);
  if (yt) {
    return res.json({
      url: raw,
      kind: "youtube",
      videoId: yt,
      title: "YouTube",
      description: "",
      image: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
    });
  }

  const sp = spotifyEmbed(raw);
  if (sp) {
    return res.json({
      url: raw,
      kind: "spotify",
      spotifyType: sp.type,
      spotifyId: sp.id,
      embedPath: sp.embedPath,
      title: "Spotify",
      description: "",
      image: null,
    });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(raw, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FastChatBot/1.0",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    clearTimeout(timer);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return res.json({
        url: raw,
        kind: "link",
        title: parsed.hostname,
        description: "",
        image: null,
      });
    }

    const html = await response.text();
    const title =
      extractMeta(html, "og:title") ||
      (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] ||
      parsed.hostname;
    const description = extractMeta(html, "og:description") || "";
    let image = extractMeta(html, "og:image");
    if (image) {
      try {
        image = new URL(image, raw).href;
      } catch {
        image = null;
      }
    }

    res.json({
      url: raw,
      kind: "link",
      title: title.trim(),
      description: description.trim(),
      image,
    });
  } catch {
    res.json({
      url: raw,
      kind: "link",
      title: parsed.hostname,
      description: "",
      image: null,
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/** @type {Map<import("ws").WebSocket, object>} */
const clients = new Map();

function presenceList() {
  return [...clients.values()];
}

function broadcast(payload, except) {
  const data = typeof payload === "string" ? payload : JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1 && client !== except) {
      client.send(data);
    }
  }
}

function broadcastAll(payload) {
  const data = typeof payload === "string" ? payload : JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(data);
  }
}

function sendPresence() {
  broadcastAll({ type: "presence", users: presenceList() });
}

wss.on("connection", (ws) => {
  console.log("client connected");

  ws.on("error", console.error);

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (!msg || typeof msg !== "object") return;

    if (msg.type === "connect") {
      const user = {
        userId: msg.userId,
        userName: msg.userName,
        userColor: msg.userColor,
        userAvatar: msg.userAvatar || "",
        userDesc: msg.userDesc || "",
      };
      clients.set(ws, user);
      broadcastAll({
        type: "connect",
        ...user,
        content: msg.content || `${msg.userName} entrou no chat`,
      });
      sendPresence();
      return;
    }

    if (msg.type === "disconnect") {
      const user = clients.get(ws);
      clients.delete(ws);
      broadcastAll({
        type: "disconnect",
        userId: user?.userId,
        userName: user?.userName || msg.userName || "",
        content:
          msg.content ||
          `${user?.userName || "Alguém"} saiu do chat`,
      });
      sendPresence();
      return;
    }

    if (msg.type === "typing") {
      const user = clients.get(ws);
      if (!user) return;
      broadcast(
        {
          type: "typing",
          userId: user.userId,
          userName: user.userName,
        },
        ws
      );
      return;
    }

    // chat message
    if (msg.type === "message" || msg.text != null || msg.attachments || msg.content) {
      broadcastAll(msg);
    }
  });

  ws.on("close", () => {
    const user = clients.get(ws);
    if (user) {
      clients.delete(ws);
      const agora = new Date();
      const horario = `${String(agora.getHours()).padStart(2, "0")}:${String(
        agora.getMinutes()
      ).padStart(2, "0")}`;
      broadcastAll({
        type: "disconnect",
        userId: user.userId,
        userName: user.userName,
        content: `${user.userName} saiu do chat às ${horario}`,
      });
      sendPresence();
    }
  });
});

server.listen(PORT, () => {
  console.log(`FastChat server listening on ${PORT}`);
});
