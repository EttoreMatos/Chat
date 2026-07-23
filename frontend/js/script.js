const isLocal =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1" ||
  location.hostname === "";

const API_HTTP = isLocal
  ? "http://localhost:8080"
  : "https://chat-backend-xuyc.onrender.com";
const API_WS = isLocal
  ? "ws://localhost:8080"
  : "wss://chat-backend-xuyc.onrender.com";

const defaultAvatar =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAArklEQVRYR+3WwQ2AIBRE0Sx+kOVZwVYKJ3hTYnSY9TxAIp9R2tHX9vMxNMGkD4C8AgkJgFZgg0YA2gDTAM7kAQA4DRhsMABGY2k3pcoAcNgD2FwB1Z/7x+9hyoDKB7pADaSvIVwlz4Gi6ARHtDT9tgCI4BMCm54A2VbbA9i8A32BpaV7rc3xEvkW2NY+j4c6Rr2nOtu3AqKzNSc0poD02pTbSCau+Kd7kH4Fxoc6+FquFNsAAAAASUVORK5CYII=";

const colors = [
  "cadetblue",
  "darkgoldenrod",
  "darkolivegreen",
  "cornflowerblue",
  "darkkhaki",
  "gold",
  "deeppink",
  "green",
];

const URL_REGEX = /((https?|ftp):\/\/[^\s<]+)/gi;

// DOM
const login = document.getElementById("login");
const loginForm = login.querySelector(".login__form");
const avatarInput = login.querySelector(".login__avatar");
const loginInput = login.querySelector(".login__input");
const loginBtn = login.querySelector(".login__button");
const descInput = login.querySelector(".des__input");
const PreviewAvatar = document.querySelector(".Preview-avatar");

const app = document.getElementById("app");
const chat = document.getElementById("chat");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const topoAvatar = document.querySelector(".topo-avatar");
const topoNome = document.querySelector(".topo-nome");
const userList = document.getElementById("userList");
const onlineCount = document.getElementById("onlineCount");
const logoutBtn = document.getElementById("logoutBtn");
const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const typingIndicator = document.getElementById("typingIndicator");
const mentionPopup = document.getElementById("mentionPopup");

const imageInput = document.getElementById("imageInput");
const imageBtn = document.getElementById("imageBtn");
const audioBtn = document.getElementById("audioBtn");
const audioBtnIcon = document.getElementById("audioBtnIcon");
const previewBar = document.getElementById("previewBar");
const previewMedia = document.getElementById("previewMedia");
const clearPreview = document.getElementById("clearPreview");

const profileModal = document.getElementById("profileModal");
const imageModal = document.getElementById("imageModal");
const lightboxImage = document.getElementById("lightboxImage");

const audio_alert = document.getElementById("alert");
const audio_connect = document.getElementById("connect");
const audio_disconnect = document.getElementById("disconnect");

const user = { id: "", name: "", color: "", avatar: "", description: "" };
let websocket = null;
const activeUsers = {};
/** @type {Array<{userId:string,userName:string,userColor:string,userAvatar:string,userDesc:string}>} */
let presenceUsers = [];

/** @type {{ file: File|Blob|null, kind: 'image'|'audio'|null, previewUrl: string|null }} */
let pendingAttachment = { file: null, kind: null, previewUrl: null };

let mediaRecorder = null;
let recordChunks = [];
let isRecording = false;

const typingUsers = new Map();
let typingClearTimers = new Map();
let lastTypingSent = 0;
let mentionActiveIndex = 0;
let mentionQuery = null;

PreviewAvatar.src = defaultAvatar;
user.avatar = defaultAvatar;

function mediaUrl(path) {
  if (!path) return defaultAvatar;
  if (path.startsWith("data:") || path.startsWith("http") || path.startsWith("blob:")) {
    return path;
  }
  return `${API_HTTP}${path}`;
}

function nowTime() {
  const agora = new Date();
  return `${String(agora.getHours()).padStart(2, "0")}:${String(
    agora.getMinutes()
  ).padStart(2, "0")}`;
}

function getRandomColor() {
  const name = user.name.trim().toLowerCase();
  if (name === "ettore") return "#00FA9A";
  if (name === "phantom") return "#FF69B4";
  return colors[Math.floor(Math.random() * colors.length)];
}

function scrollScreen() {
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: "smooth",
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTextHtml(text) {
  const escaped = escapeHtml(text);
  const myName = user.name.trim().toLowerCase();
  return escaped
    .replace(/\r\n|\r|\n/g, "<br>")
    .replace(/@([^\s*`#]+(?:\s[^\s*`#]+)*)|\*(.*?)\*/g, (match, mention, bold) => {
      if (mention) {
        const username = mention.trim().toLowerCase();
        const color = activeUsers[username];
        const isMe = username === myName;
        const cls = isMe ? "mention mention--me" : "mention";
        if (color || isMe) {
          const style = color ? ` style="color:${color}"` : "";
          return `<span class="${cls}"${style}>@${escapeHtml(mention)}</span>`;
        }
        return `@${escapeHtml(mention)}`;
      }
      if (bold != null) return `<b>${bold}</b>`;
      return match;
    })
    .replace(URL_REGEX, (url) => {
      const safe = escapeHtml(url);
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
    });
}

function extractUrls(text) {
  if (!text) return [];
  const found = text.match(URL_REGEX) || [];
  return [...new Set(found)];
}

function youtubeIdFromUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function spotifyFromUrl(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const types = new Set([
      "track",
      "album",
      "playlist",
      "episode",
      "show",
      "artist",
    ]);
    let type;
    let id;
    if (parts[0] === "embed" && parts[1] && parts[2]) {
      type = parts[1];
      id = parts[2].split("?")[0];
    } else {
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

async function uploadFile(file, asAvatar = false) {
  const form = new FormData();
  if (asAvatar) {
    form.append("avatar", file, file.name || "avatar.jpg");
  } else {
    form.append("file", file, file.name || (file.type?.startsWith("audio/") ? "audio.webm" : "image.png"));
  }
  const endpoint = asAvatar ? `${API_HTTP}/upload/avatar` : `${API_HTTP}/upload`;
  const res = await fetch(endpoint, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha no upload");
  }
  return res.json();
}

async function fetchEmbed(url) {
  try {
    const res = await fetch(
      `${API_HTTP}/embed?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function clearPendingAttachment() {
  if (pendingAttachment.previewUrl) {
    URL.revokeObjectURL(pendingAttachment.previewUrl);
  }
  pendingAttachment = { file: null, kind: null, previewUrl: null };
  previewMedia.innerHTML = "";
  previewBar.hidden = true;
  imageInput.value = "";
}

function setPendingAttachment(file, kind) {
  clearPendingAttachment();
  const previewUrl = URL.createObjectURL(file);
  pendingAttachment = { file, kind, previewUrl };
  previewMedia.innerHTML = "";
  if (kind === "image") {
    const img = document.createElement("img");
    img.src = previewUrl;
    img.alt = "Prévia";
    previewMedia.appendChild(img);
  } else {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = previewUrl;
    previewMedia.appendChild(audio);
  }
  previewBar.hidden = false;
}

function renderPresence(users) {
  userList.innerHTML = "";
  const list = Array.isArray(users) ? users : [];
  presenceUsers = list;
  onlineCount.textContent = `${list.length} online`;

  Object.keys(activeUsers).forEach((k) => delete activeUsers[k]);

  for (const u of list) {
    if (u.userName) {
      activeUsers[u.userName.toLowerCase()] = u.userColor;
    }
    const li = document.createElement("li");
    li.className = "sidebar__user";
    li.dataset.username = u.userName || "";
    li.dataset.description = u.userDesc || "";
    li.dataset.avatar = u.userAvatar || "";

    const img = document.createElement("img");
    img.src = mediaUrl(u.userAvatar);
    img.alt = "";

    const meta = document.createElement("div");
    meta.className = "sidebar__user-meta";

    const name = document.createElement("span");
    name.className = "sidebar__user-name";
    name.textContent = u.userName || "Anônimo";
    if (u.userColor) name.style.color = u.userColor;

    const status = document.createElement("span");
    status.className = "sidebar__user-status";
    status.textContent = "online";

    meta.append(name, status);
    li.append(img, meta);
    userList.appendChild(li);
  }
}

function updateTypingUI() {
  const names = [...typingUsers.values()].filter(
    (n) => n.toLowerCase() !== user.name.toLowerCase()
  );
  if (!names.length) {
    typingIndicator.hidden = true;
    typingIndicator.textContent = "";
    return;
  }
  typingIndicator.hidden = false;
  if (names.length === 1) {
    typingIndicator.textContent = `${names[0]} está digitando`;
  } else if (names.length === 2) {
    typingIndicator.textContent = `${names[0]} e ${names[1]} estão digitando`;
  } else {
    typingIndicator.textContent = `${names[0]} e mais ${names.length - 1} estão digitando`;
  }
}

function handleTypingEvent(parsed) {
  if (!parsed.userId || parsed.userId === user.id) return;
  const name = parsed.userName || "Alguém";
  typingUsers.set(parsed.userId, name);
  updateTypingUI();

  const prev = typingClearTimers.get(parsed.userId);
  if (prev) clearTimeout(prev);
  typingClearTimers.set(
    parsed.userId,
    setTimeout(() => {
      typingUsers.delete(parsed.userId);
      typingClearTimers.delete(parsed.userId);
      updateTypingUI();
    }, 2500)
  );
}

function sendTyping() {
  if (!websocket || websocket.readyState !== WebSocket.OPEN) return;
  const now = Date.now();
  if (now - lastTypingSent < 1200) return;
  lastTypingSent = now;
  websocket.send(
    JSON.stringify({
      type: "typing",
      userId: user.id,
      userName: user.name,
    })
  );
}

function getMentionContext() {
  const value = chatInput.value;
  const caret = chatInput.selectionStart ?? value.length;
  const before = value.slice(0, caret);
  const match = before.match(/(^|\s)@([^\s@]*)$/);
  if (!match) return null;
  return {
    start: match.index + match[1].length,
    query: match[2].toLowerCase(),
    caret,
  };
}

function getMentionMatches() {
  const ctx = getMentionContext();
  if (!ctx) return [];
  return presenceUsers.filter((u) => {
    if (!u.userName) return false;
    if (u.userId === user.id) return false;
    return u.userName.toLowerCase().includes(ctx.query);
  });
}

function hideMentionPopup() {
  mentionPopup.hidden = true;
  mentionPopup.innerHTML = "";
  mentionQuery = null;
}

function showMentionPopup() {
  const matches = getMentionMatches();
  if (!matches.length) {
    hideMentionPopup();
    return;
  }
  mentionQuery = getMentionContext();
  mentionActiveIndex = Math.min(mentionActiveIndex, matches.length - 1);
  if (mentionActiveIndex < 0) mentionActiveIndex = 0;

  mentionPopup.innerHTML = "";
  matches.forEach((u, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `mention-option${i === mentionActiveIndex ? " is-active" : ""}`;
    btn.dataset.name = u.userName;

    const img = document.createElement("img");
    img.src = mediaUrl(u.userAvatar);
    img.alt = "";

    const span = document.createElement("span");
    span.textContent = u.userName;
    if (u.userColor) span.style.color = u.userColor;

    btn.append(img, span);
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      insertMention(u.userName);
    });
    li.appendChild(btn);
    mentionPopup.appendChild(li);
  });
  mentionPopup.hidden = false;
}

function insertMention(name) {
  const ctx = getMentionContext();
  if (!ctx) return;
  const value = chatInput.value;
  const before = value.slice(0, ctx.start);
  const after = value.slice(ctx.caret);
  const insertion = `@${name} `;
  chatInput.value = before + insertion + after;
  const pos = before.length + insertion.length;
  chatInput.focus();
  chatInput.setSelectionRange(pos, pos);
  hideMentionPopup();
  chatInput.dispatchEvent(new Event("input"));
}

function openProfile(name, desc, avatar) {
  document.getElementById("profileImage").src = mediaUrl(avatar);
  document.getElementById("profileName").textContent = name || "";
  document.getElementById("profileDesc").textContent = desc || "";
  profileModal.hidden = false;
}

function createSystemMessage(text, type, dataset = {}) {
  const div = document.createElement("div");
  div.className = `message-system message-system--${type === "connect" ? "entry" : "exit"}`;
  div.textContent = text;
  if (type === "connect") {
    div.dataset.username = dataset.userName || "";
    div.dataset.description = dataset.userDesc || "";
    div.dataset.avatar = dataset.userAvatar || "";
  }
  return div;
}

function createAttachmentNodes(attachments) {
  const frag = document.createDocumentFragment();
  for (const att of attachments || []) {
    if (!att?.url) continue;
    if (att.kind === "audio") {
      const audio = document.createElement("audio");
      audio.className = "chat-audio";
      audio.controls = true;
      audio.preload = "metadata";
      audio.src = mediaUrl(att.url);
      frag.appendChild(audio);
    } else {
      const img = document.createElement("img");
      img.className = "chat-image";
      img.src = mediaUrl(att.url);
      img.alt = "Imagem";
      img.loading = "lazy";
      frag.appendChild(img);
    }
  }
  return frag;
}

function createEmbedNode(embed) {
  if (!embed) return null;

  if (embed.kind === "youtube" && (embed.videoId || youtubeIdFromUrl(embed.url))) {
    const id = embed.videoId || youtubeIdFromUrl(embed.url);
    const wrap = document.createElement("div");
    wrap.className = "embed embed--youtube";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${id}`;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.title = embed.title || "YouTube";
    wrap.appendChild(iframe);
    return wrap;
  }

  const a = document.createElement("a");
  a.className = "embed embed--link";
  a.href = embed.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";

  if (embed.image) {
    const img = document.createElement("img");
    img.className = "embed__image";
    img.src = embed.image;
    img.alt = "";
    a.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "embed__body";

  const title = document.createElement("div");
  title.className = "embed__title";
  title.textContent = embed.title || embed.url;

  const desc = document.createElement("div");
  desc.className = "embed__desc";
  desc.textContent = embed.description || "";

  const host = document.createElement("div");
  host.className = "embed__host";
  try {
    host.textContent = new URL(embed.url).hostname;
  } catch {
    host.textContent = embed.url;
  }

  body.append(title, desc, host);
  a.appendChild(body);
  return a;
}

function createMessageElement(msg, isSelf) {
  const row = document.createElement("div");
  row.className = `message-row${isSelf ? " message-row--self" : ""}`;

  if (!isSelf) {
    const img = document.createElement("img");
    img.className = "message-avatar";
    img.src = mediaUrl(msg.userAvatar);
    img.alt = "";
    row.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "message-body";

  const meta = document.createElement("div");
  meta.className = "message-meta";

  if (!isSelf) {
    const sender = document.createElement("span");
    sender.className = "message--sender";
    sender.textContent = msg.userName || "";
    if (msg.userColor) sender.style.color = msg.userColor;
    meta.appendChild(sender);
  }

  const hour = document.createElement("span");
  hour.className = "hour";
  hour.textContent = nowTime();
  meta.appendChild(hour);
  body.appendChild(meta);

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  const text =
    msg.text != null
      ? msg.text
      : typeof msg.content === "string" && !msg.content.startsWith("<img")
        ? msg.content
        : "";

  if (text) {
    const textEl = document.createElement("div");
    textEl.className = "message-text";
    textEl.innerHTML = formatTextHtml(text);
    bubble.appendChild(textEl);
  }

  // legacy base64 image in content
  if (
    (!msg.attachments || !msg.attachments.length) &&
    typeof msg.content === "string" &&
    msg.content.includes("<img")
  ) {
    const tmp = document.createElement("div");
    tmp.innerHTML = msg.content;
    const legacyImg = tmp.querySelector("img");
    if (legacyImg) {
      legacyImg.classList.add("chat-image");
      bubble.appendChild(legacyImg);
    }
  }

  bubble.appendChild(createAttachmentNodes(msg.attachments));

  for (const emb of msg.embeds || []) {
    const node = createEmbedNode(emb);
    if (node) bubble.appendChild(node);
  }

  body.appendChild(bubble);
  row.appendChild(body);
  return row;
}

const processMessage = ({ data }) => {
  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch {
    return;
  }

  if (parsed.type === "presence") {
    renderPresence(parsed.users);
    return;
  }

  if (parsed.type === "typing") {
    handleTypingEvent(parsed);
    return;
  }

  if (parsed.type === "connect") {
    audio_connect.play().catch(() => {});
    if (parsed.userName) {
      activeUsers[parsed.userName.toLowerCase()] = parsed.userColor;
    }
    chatMessages.appendChild(
      createSystemMessage(parsed.content, "connect", parsed)
    );
    scrollScreen();
    return;
  }

  if (parsed.type === "disconnect") {
    audio_disconnect.play().catch(() => {});
    if (parsed.userName) {
      delete activeUsers[parsed.userName.toLowerCase()];
    }
    if (parsed.userId) {
      typingUsers.delete(parsed.userId);
      const t = typingClearTimers.get(parsed.userId);
      if (t) clearTimeout(t);
      typingClearTimers.delete(parsed.userId);
      updateTypingUI();
    }
    chatMessages.appendChild(
      createSystemMessage(parsed.content, "disconnect", parsed)
    );
    scrollScreen();
    return;
  }

  // stop showing this user as typing when they send a message
  if (parsed.userId) {
    typingUsers.delete(parsed.userId);
    const t = typingClearTimers.get(parsed.userId);
    if (t) clearTimeout(t);
    typingClearTimers.delete(parsed.userId);
    updateTypingUI();
  }

  const isSelf = parsed.userId === user.id;
  if (!isSelf) {
    audio_alert.play().catch(() => {});
  }
  if (parsed.userName) {
    activeUsers[parsed.userName.toLowerCase()] = parsed.userColor;
  }

  chatMessages.appendChild(createMessageElement(parsed, isSelf));
  scrollScreen();
};

function iniciarChat() {
  login.hidden = true;
  app.hidden = false;

  topoNome.textContent = user.name;
  topoNome.style.color = user.color;
  topoAvatar.src = mediaUrl(user.avatar);

  websocket = new WebSocket(API_WS);

  websocket.onopen = () => {
    websocket.send(
      JSON.stringify({
        type: "connect",
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        userAvatar: user.avatar,
        userDesc: user.description,
        content: `${user.name} entrou no chat às ${nowTime()}`,
      })
    );
  };

  websocket.onmessage = processMessage;

  websocket.onclose = () => {
    // server already emits disconnect on close
  };

  websocket.onerror = () => {
    console.error("WebSocket error");
  };
}

function exit() {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(
      JSON.stringify({
        type: "disconnect",
        userName: user.name,
        content: `${user.name} saiu do chat às ${nowTime()}`,
      })
    );
    websocket.close();
  }
  window.location.reload();
}

const handleLogin = async (event) => {
  event.preventDefault();
  const token =
    typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : "dev";
  if (typeof grecaptcha !== "undefined" && !token) {
    alert("Por favor, confirme que você não é um robô.");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Conectando...";

  user.id = crypto.randomUUID();
  user.name = loginInput.value.trim();
  user.color = getRandomColor();
  user.description = descInput.value.trim() || "";

  try {
    const file = avatarInput?.files?.[0];
    if (file) {
      const result = await uploadFile(file, true);
      user.avatar = result.url;
    } else {
      user.avatar = defaultAvatar;
    }
    iniciarChat();
  } catch (err) {
    alert(err.message || "Não foi possível conectar.");
    loginBtn.disabled = false;
    loginBtn.textContent = "Entrar";
  }
};

async function buildEmbeds(text) {
  const urls = extractUrls(text).slice(0, 3);
  const embeds = [];
  for (const url of urls) {
    const yt = youtubeIdFromUrl(url);
    if (yt) {
      embeds.push({
        url,
        kind: "youtube",
        videoId: yt,
        title: "YouTube",
        description: "",
        image: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
      });
      continue;
    }
    const data = await fetchEmbed(url);
    if (data) embeds.push(data);
  }
  return embeds;
}

const sendMessage = async (event) => {
  event.preventDefault();
  if (!websocket || websocket.readyState !== WebSocket.OPEN) return;

  const text = chatInput.value.trim();
  const hasAttachment = Boolean(pendingAttachment.file);

  if (!text && !hasAttachment) return;

  const submitBtn = chatForm.querySelector(".chat__button");
  submitBtn.disabled = true;

  try {
    const attachments = [];
    if (hasAttachment) {
      const uploaded = await uploadFile(pendingAttachment.file, false);
      attachments.push({
        kind: pendingAttachment.kind || uploaded.kind,
        url: uploaded.url,
      });
      clearPendingAttachment();
    }

    const embeds = text ? await buildEmbeds(text) : [];

    const message = {
      type: "message",
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      userAvatar: user.avatar,
      text,
      attachments,
      embeds,
    };

    websocket.send(JSON.stringify(message));
    chatInput.value = "";
    chatInput.style.height = "auto";
  } catch (err) {
    alert(err.message || "Falha ao enviar.");
  } finally {
    submitBtn.disabled = false;
  }
};

async function toggleRecording() {
  if (isRecording && mediaRecorder) {
    mediaRecorder.stop();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordChunks = [];
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

    mediaRecorder = mime
      ? new MediaRecorder(stream, { mimeType: mime })
      : new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      isRecording = false;
      audioBtn.classList.remove("recording");
      audioBtnIcon.textContent = "mic";

      const blob = new Blob(recordChunks, {
        type: mediaRecorder.mimeType || "audio/webm",
      });
      if (blob.size < 100) return;
      const file = new File([blob], `audio-${Date.now()}.webm`, {
        type: blob.type,
      });
      setPendingAttachment(file, "audio");
    };

    mediaRecorder.start();
    isRecording = true;
    audioBtn.classList.add("recording");
    audioBtnIcon.textContent = "stop";
  } catch {
    alert("Não foi possível acessar o microfone.");
  }
}

function openSidebar() {
  sidebar.classList.add("is-open");
  sidebarBackdrop.hidden = false;
}

function closeSidebar() {
  sidebar.classList.remove("is-open");
  sidebarBackdrop.hidden = true;
}

// ——— Events ———

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) {
    PreviewAvatar.src = defaultAvatar;
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    PreviewAvatar.src = reader.result;
  };
  reader.readAsDataURL(file);
});

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
logoutBtn.addEventListener("click", exit);
clearPreview.addEventListener("click", clearPendingAttachment);

imageBtn.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  setPendingAttachment(file, "image");
});

audioBtn.addEventListener("click", toggleRecording);

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 120)}px`;
  sendTyping();
  showMentionPopup();
});

chatInput.addEventListener("keydown", (e) => {
  const matches = getMentionMatches();
  const popupOpen = !mentionPopup.hidden && matches.length > 0;

  if (popupOpen && e.key === "ArrowDown") {
    e.preventDefault();
    mentionActiveIndex = (mentionActiveIndex + 1) % matches.length;
    showMentionPopup();
    return;
  }
  if (popupOpen && e.key === "ArrowUp") {
    e.preventDefault();
    mentionActiveIndex =
      (mentionActiveIndex - 1 + matches.length) % matches.length;
    showMentionPopup();
    return;
  }
  if (popupOpen && (e.key === "Enter" || e.key === "Tab")) {
    e.preventDefault();
    insertMention(matches[mentionActiveIndex].userName);
    return;
  }
  if (popupOpen && e.key === "Escape") {
    e.preventDefault();
    hideMentionPopup();
    return;
  }

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

document.addEventListener("paste", (event) => {
  const items = event.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) setPendingAttachment(file, "image");
      break;
    }
  }
});

chatMessages.addEventListener("click", (e) => {
  const img = e.target.closest(".chat-image");
  if (img) {
    lightboxImage.src = img.src;
    imageModal.hidden = false;
    return;
  }

  const entry = e.target.closest(".message-system--entry");
  if (entry) {
    openProfile(
      entry.dataset.username,
      entry.dataset.description,
      entry.dataset.avatar
    );
  }
});

userList.addEventListener("click", (e) => {
  const item = e.target.closest(".sidebar__user");
  if (!item) return;
  openProfile(
    item.dataset.username,
    item.dataset.description,
    item.dataset.avatar
  );
  closeSidebar();
});

profileModal.addEventListener("click", (e) => {
  if (e.target === profileModal) profileModal.hidden = true;
});

imageModal.addEventListener("click", () => {
  imageModal.hidden = true;
  lightboxImage.src = "";
});

sidebarToggle.addEventListener("click", openSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);

// expose for any leftover inline handlers
window.exit = exit;
