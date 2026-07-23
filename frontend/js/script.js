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
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="#2a2a2a"/>
      <circle cx="40" cy="30" r="14" fill="#6a6a6a"/>
      <ellipse cx="40" cy="64" rx="24" ry="18" fill="#6a6a6a"/>
    </svg>`
  );

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

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
const RECENT_EMOJIS_KEY = "fastchat-recent-emojis";
const RECENT_EMOJIS_MAX = 32;

const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    label: "Rostos",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
      "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
      "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫",
      "🤔", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏", "😒", "🙄",
      "😬", "😮‍💨", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒",
      "🤕", "🤢", "🤮", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳",
      "🥸", "😎", "🤓", "🧐", "😕", "🫤", "😟", "🙁", "☹️", "😮",
      "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢",
      "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤",
      "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹",
      "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼",
      "😽", "🙀", "😿", "😾",
    ],
  },
  {
    id: "people",
    label: "Gestos",
    icon: "👋",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
      "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍",
      "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝",
      "🙏", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠",
      "👀", "👁️", "👅", "👄", "💋", "🩸",
    ],
  },
  {
    id: "hearts",
    label: "Corações",
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
    ],
  },
  {
    id: "nature",
    label: "Natureza",
    icon: "🌿",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨",
      "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊",
      "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉",
      "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌",
      "🐞", "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️", "🕸️", "🦂",
      "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀",
      "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆",
      "🦓", "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒",
      "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙",
      "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🪶", "🐓",
      "🦃", "🦤", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨",
      "🦡", "🦫", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔", "🐾", "🐉",
      "🐲", "🌵", "🎄", "🌲", "🌳", "🌴", "🪵", "🌱", "🌿", "☘️",
      "🍀", "🎍", "🪴", "🎋", "🍃", "🍂", "🍁", "🍄", "🐚", "🪨",
      "🌾", "💐", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼", "🌻", "🌞",
      "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒",
      "🌓", "🌔", "🌙", "🌎", "🌍", "🌏", "🪐", "💫", "⭐", "🌟",
      "✨", "⚡", "☄️", "💥", "🔥", "🌪️", "🌈", "☀️", "🌤️", "⛅",
      "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄",
      "🌬️", "💨", "💧", "💦", "☔", "☂️", "🌊", "🌫️",
    ],
  },
  {
    id: "food",
    label: "Comida",
    icon: "🍕",
    emojis: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐",
      "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑",
      "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅",
      "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳",
      "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔",
      "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗",
      "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟",
      "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡",
      "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬",
      "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "🫖",
      "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷",
      "🥃", "🍸", "🍹", "🧉", "🍾", "🧊", "🥄", "🍴", "🍽️", "🥣",
      "🥡", "🥢", "🧂",
    ],
  },
  {
    id: "activity",
    label: "Atividades",
    icon: "⚽",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
      "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
      "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷",
      "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "⛹️",
      "🤺", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚣", "🧗",
      "🚵", "🚴", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️",
      "🎫", "🎟️", "🎪", "🤹", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧",
      "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🪗", "🎸", "🪕", "🎻",
      "🎲", "♟️", "🎯", "🎳", "🎮", "🎰", "🧩",
    ],
  },
  {
    id: "travel",
    label: "Viagem",
    icon: "✈️",
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
      "🛻", "🚚", "🚛", "🚜", "🦯", "🦽", "🦼", "🛴", "🚲", "🛵",
      "🏍️", "🛺", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟",
      "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇",
      "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸",
      "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "🪝",
      "⛽", "🚧", "🚦", "🚥", "🚏", "🗺️", "🗿", "🗽", "🗼", "🏰",
      "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️",
      "🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺", "🏠", "🏡", "🏘️", "🏚️",
      "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪",
      "🏫", "🏩", "💒", "🏛️", "⛪", "🕌", "🕍", "🛕", "🕋", "⛩️",
      "🛤️", "🛣️", "🗾", "🎑", "🏞️", "🌅", "🌄", "🌠", "🎇", "🎆",
      "🌇", "🌆", "🏙️", "🌃", "🌌", "🌉", "🌁",
    ],
  },
  {
    id: "objects",
    label: "Objetos",
    icon: "💡",
    emojis: [
      "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️",
      "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥",
      "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "⏱️",
      "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦",
      "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "🪙",
      "💰", "💳", "💎", "⚖️", "🪜", "🧰", "🪛", "🔧", "🔨", "⚒️",
      "🛠️", "⛏️", "🪚", "🔩", "⚙️", "🪤", "🧱", "⛓️", "🧲", "🔫",
      "💣", "🧨", "🪓", "🔪", "🗡️", "⚔️", "🛡️", "🚬", "⚰️", "🪦",
      "⚱️", "🏺", "🔮", "📿", "🧿", "💈", "⚗️", "🔭", "🔬", "🕳️",
      "🩹", "🩺", "💊", "💉", "🩸", "🧬", "🦠", "🧫", "🧪", "🌡️",
      "🧹", "🪠", "🧺", "🧻", "🚽", "🚰", "🚿", "🛁", "🛀", "🧼",
      "🪥", "🪒", "🧽", "🪣", "🧴", "🛎️", "🔑", "🗝️", "🚪", "🪑",
      "🛋️", "🛏️", "🛌", "🧸", "🪆", "🖼️", "🪞", "🪟", "🛍️", "🛒",
      "🎁", "🎈", "🎏", "🎀", "🪄", "🪅", "🎊", "🎉", "🎎", "🏮",
      "🎐", "🧧", "✉️", "📩", "📨", "📧", "💌", "📥", "📤", "📦",
      "🏷️", "🪧", "📪", "📫", "📬", "📭", "📮", "📯", "📜", "📃",
      "📄", "📑", "🧾", "📊", "📈", "📉", "🗒️", "🗓️", "📆", "📅",
      "🗑️", "📇", "🗃️", "🗳️", "🗄️", "📋", "📁", "📂", "🗂️", "🗞️",
      "📰", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📚", "📖",
      "🔖", "🧷", "🔗", "📎", "🖇️", "📐", "📏", "🧮", "📌", "📍",
      "✂️", "🖊️", "🖋️", "✒️", "🖌️", "🖍️", "📝", "✏️", "🔍", "🔎",
      "🔏", "🔐", "🔒", "🔓",
    ],
  },
  {
    id: "symbols",
    label: "Símbolos",
    icon: "🔣",
    emojis: [
      "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️",
      "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏",
      "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴",
      "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐",
      "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑",
      "🅾️", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢",
      "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕",
      "❓", "❔", "‼️", "⁉️", "🔅", "🔆", "〽️", "⚠️", "🚸", "🔱",
      "⚜️", "🔰", "♻️", "✅", "🈯", "💹", "❇️", "✳️", "❎", "🌐",
      "💠", "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿", "🅿️", "🛗", "🛂",
      "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "🚻", "🚮", "🎦", "📶",
      "🈁", "🔣", "ℹ️", "🔤", "🔡", "🔠", "🆖", "🆗", "🆙", "🆒",
      "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣",
      "8️⃣", "9️⃣", "🔟", "🔢", "#️⃣", "*️⃣", "⏏️", "▶️", "⏸️", "⏯️",
      "⏹️", "⏺️", "⏭️", "⏮️", "⏩", "⏪", "⏫", "⏬", "◀️", "🔼",
      "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️",
      "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁", "🔂", "🔄", "🔃",
      "🎵", "🎶", "➕", "➖", "➗", "✖️", "♾️", "💲", "💱", "™️",
      "©️", "®️", "👁️‍🗨️", "🔚", "🔙", "🔛", "🔝", "🔜", "〰️", "➰",
      "➿", "✔️", "☑️", "🔘", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣",
      "⚫", "⚪", "🟤", "🔺", "🔻", "🔸", "🔹", "🔶", "🔷", "🔳",
      "🔲", "▪️", "▫️", "◾", "◽", "◼️", "◻️", "🟥", "🟧", "🟨",
      "🟩", "🟦", "🟪", "⬛", "⬜", "🟫", "🔈", "🔇", "🔉", "🔊",
      "🔔", "🔕", "📣", "📢", "💬", "💭", "🗯️", "♠️", "♣️", "♥️",
      "♦️", "🃏", "🎴", "🀄", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕",
      "🕖", "🕗", "🕘", "🕙", "🕚", "🕛", "🕜", "🕝", "🕞", "🕟",
      "🕠",
    ],
  }
];

let notificationsEnabled = false;

function requestNotifications() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    notificationsEnabled = true;
    return;
  }
  if (Notification.permission !== "denied") {
    Notification.requestPermission().then((p) => {
      notificationsEnabled = p === "granted";
    });
  }
}

function notifyBrowser(title, body, icon) {
  if (!notificationsEnabled || !document.hidden) return;
  try {
    const n = new Notification(title, {
      body: body || "",
      icon: icon || undefined,
      silent: false,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
    setTimeout(() => n.close(), 5000);
  } catch {
    /* ignore */
  }
}

function sendWs(payload) {
  if (!websocket || websocket.readyState !== WebSocket.OPEN) return;
  websocket.send(JSON.stringify(payload));
}


// DOM
const login = document.getElementById("login");
const loginForm = login.querySelector(".login__form");
const avatarInput = login.querySelector(".login__avatar");
const loginInput = login.querySelector(".login__input");
const loginBtn = login.querySelector(".login__button");
const descInput = login.querySelector(".des__input");
const PreviewAvatar = document.getElementById("avatarPreview");
const PreviewAvatarImg = document.getElementById("avatarPreviewImg");

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
const audioInput = document.getElementById("audioInput");
const clipBtn = document.getElementById("clipBtn");
const attachMenu = document.getElementById("attachMenu");
const attachImageBtn = document.getElementById("attachImageBtn");
const attachAudioBtn = document.getElementById("attachAudioBtn");
const stickerBtn = document.getElementById("stickerBtn");
const stickerPicker = document.getElementById("stickerPicker");
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
let intentionalClose = false;
let reconnectAttempt = 0;
let reconnectTimer = null;
let isReconnect = false;
const activeUsers = {};
/** @type {Array<{userId:string,userName:string,userColor:string,userAvatar:string,userDesc:string}>} */
let presenceUsers = [];

const reconnectBanner = document.getElementById("reconnectBanner");
const reconnectBannerText = document.getElementById("reconnectBannerText");
let emojiActiveCategory = "recent";

/** @type {{ file: File|Blob|null, kind: 'image'|'audio'|null, previewUrl: string|null }} */
let pendingAttachment = { file: null, kind: null, previewUrl: null };

let mediaRecorder = null;
let recordChunks = [];
let isRecording = false;
let recordStream = null;
let recordMime = "";
let recordStartedAt = 0;

const typingUsers = new Map();
let typingClearTimers = new Map();
let lastTypingSent = 0;
let mentionActiveIndex = 0;
let mentionQuery = null;

PreviewAvatarImg.hidden = true;
PreviewAvatar.classList.remove("has-image");
user.avatar = defaultAvatar;

function setAvatarPreview(src) {
  if (!src) {
    PreviewAvatarImg.removeAttribute("src");
    PreviewAvatarImg.hidden = true;
    PreviewAvatar.classList.remove("has-image");
    return;
  }
  PreviewAvatarImg.src = src;
  PreviewAvatarImg.hidden = false;
  PreviewAvatar.classList.add("has-image");
}

function pickRecorderMime() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/aac",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

function extForAudioMime(mime) {
  const m = (mime || "").toLowerCase();
  if (m.includes("mp4") || m.includes("aac") || m.includes("m4a")) return "m4a";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  return "webm";
}

function stopRecordTracks() {
  if (recordStream) {
    recordStream.getTracks().forEach((t) => t.stop());
    recordStream = null;
  }
}

function finishRecording() {
  isRecording = false;
  audioBtn.classList.remove("recording");
  audioBtnIcon.textContent = "mic";
  audioBtn.title = "Gravar áudio";

  const mimeType =
    (mediaRecorder && mediaRecorder.mimeType) || recordMime || "audio/webm";
  const cleanType = mimeType.split(";")[0] || "audio/webm";
  const blob = new Blob(recordChunks, { type: cleanType });
  recordChunks = [];
  mediaRecorder = null;
  stopRecordTracks();

  const elapsed = Date.now() - recordStartedAt;
  if (elapsed < 400 || blob.size < 200) {
    alert("Áudio muito curto. Grave um pouco mais antes de parar.");
    return;
  }

  const ext = extForAudioMime(cleanType);
  const file = new File([blob], `mensagem-de-voz.${ext}`, {
    type: cleanType,
  });
  setPendingAttachment(file, "audio");
}

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

const URL_REGEX = /https?:\/\/[^\s<>"']+/gi;

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
  if (audioInput) audioInput.value = "";
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
    const preview = document.createElement("div");
    preview.className = "preview-audio";

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "preview-audio__play";
    playBtn.setAttribute("aria-label", "Ouvir prévia");
    playBtn.innerHTML = `<span class="material-symbols-outlined">play_arrow</span>`;

    const info = document.createElement("div");
    info.className = "preview-audio__info";
    const name = document.createElement("span");
    name.className = "preview-audio__name";
    name.textContent =
      file.name?.replace(/\.[^.]+$/, "") || "Mensagem de voz";
    const hint = document.createElement("span");
    hint.className = "preview-audio__hint";
    hint.textContent = "Pronto para enviar";
    info.append(name, hint);

    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = previewUrl;

    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });
    audio.addEventListener("play", () => {
      playBtn.querySelector(".material-symbols-outlined").textContent = "pause";
      preview.classList.add("is-playing");
    });
    audio.addEventListener("pause", () => {
      playBtn.querySelector(".material-symbols-outlined").textContent =
        "play_arrow";
      preview.classList.remove("is-playing");
    });
    audio.addEventListener("ended", () => {
      playBtn.querySelector(".material-symbols-outlined").textContent =
        "play_arrow";
      preview.classList.remove("is-playing");
    });
    audio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(audio.duration)) {
        hint.textContent = formatDuration(audio.duration);
      }
    });

    preview.append(playBtn, info, audio);
    previewMedia.appendChild(preview);
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

function formatDuration(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** @type {AudioContext | null} */
let sharedAudioCtx = null;

function getSharedAudioCtx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx) sharedAudioCtx = new Ctx();
  return sharedAudioCtx;
}

function createAudioPlayer(url, name) {
  const BAR_COUNT = 28;
  const wrap = document.createElement("div");
  wrap.className = "audio-msg";

  const playBtn = document.createElement("button");
  playBtn.type = "button";
  playBtn.className = "audio-msg__play";
  playBtn.setAttribute("aria-label", "Reproduzir áudio");
  playBtn.innerHTML = `<span class="material-symbols-outlined">play_arrow</span>`;

  const body = document.createElement("div");
  body.className = "audio-msg__body";

  const wave = document.createElement("div");
  wave.className = "audio-msg__wave";
  wave.setAttribute("aria-hidden", "true");
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement("span");
    bar.style.setProperty("--h", "18%");
    wave.appendChild(bar);
    bars.push(bar);
  }

  const progress = document.createElement("div");
  progress.className = "audio-msg__progress";
  const fill = document.createElement("div");
  fill.className = "audio-msg__progress-fill";
  progress.appendChild(fill);

  const meta = document.createElement("div");
  meta.className = "audio-msg__meta";
  const label = document.createElement("span");
  label.className = "audio-msg__label";
  label.textContent = name || "Áudio";
  const time = document.createElement("span");
  time.className = "audio-msg__time";
  time.textContent = "0:00";
  meta.append(label, time);

  body.append(wave, progress, meta);

  const audio = document.createElement("audio");
  audio.preload = "metadata";
  audio.crossOrigin = "anonymous";
  audio.src = url;

  const icon = playBtn.querySelector(".material-symbols-outlined");

  /** @type {MediaElementAudioSourceNode | null} */
  let sourceNode = null;
  /** @type {AnalyserNode | null} */
  let analyser = null;
  let rafId = 0;
  const freqData = new Uint8Array(32);

  const resetBars = () => {
    bars.forEach((bar) => bar.style.setProperty("--h", "18%"));
  };

  const ensureAudioGraph = () => {
    if (sourceNode) return;
    const ctx = getSharedAudioCtx();
    if (!ctx) return;
    try {
      sourceNode = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.65;
      sourceNode.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (err) {
      console.warn("Visualizador de áudio indisponível:", err);
      sourceNode = null;
      analyser = null;
    }
  };

  const drawWave = () => {
    if (!analyser || audio.paused || audio.ended) {
      rafId = 0;
      resetBars();
      return;
    }
    analyser.getByteFrequencyData(freqData);
    const usable = Math.floor(freqData.length * 0.7);
    for (let i = 0; i < bars.length; i++) {
      const idx = Math.min(
        usable - 1,
        Math.floor((i / bars.length) * usable)
      );
      const val = (freqData[idx] || 0) / 255;
      const h = 12 + val * 88;
      bars[i].style.setProperty("--h", `${h}%`);
    }
    rafId = requestAnimationFrame(drawWave);
  };

  const startVisualizer = async () => {
    const ctx = getSharedAudioCtx();
    if (ctx?.state === "suspended") {
      await ctx.resume().catch(() => {});
    }
    ensureAudioGraph();
    if (!rafId) rafId = requestAnimationFrame(drawWave);
  };

  const stopVisualizer = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    resetBars();
  };

  const syncProgress = () => {
    const dur = audio.duration || 0;
    const cur = audio.currentTime || 0;
    const pct = dur ? (cur / dur) * 100 : 0;
    fill.style.width = `${pct}%`;
    time.textContent = dur
      ? `${formatDuration(cur)} / ${formatDuration(dur)}`
      : formatDuration(cur);
  };

  playBtn.addEventListener("click", () => {
    document.querySelectorAll(".audio-msg audio").forEach((other) => {
      if (other !== audio && !other.paused) {
        other.pause();
      }
    });

    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    wrap.classList.add("is-playing");
    icon.textContent = "pause";
    startVisualizer();
  });
  audio.addEventListener("pause", () => {
    wrap.classList.remove("is-playing");
    icon.textContent = "play_arrow";
    stopVisualizer();
  });
  audio.addEventListener("ended", () => {
    wrap.classList.remove("is-playing");
    icon.textContent = "play_arrow";
    fill.style.width = "0%";
    time.textContent = formatDuration(audio.duration || 0);
    stopVisualizer();
  });
  audio.addEventListener("loadedmetadata", syncProgress);
  audio.addEventListener("timeupdate", syncProgress);

  progress.addEventListener("click", (e) => {
    const rect = progress.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = ratio * audio.duration;
      syncProgress();
    }
  });

  wrap.append(playBtn, body, audio);
  return wrap;
}

function createAttachmentNodes(attachments) {
  const frag = document.createDocumentFragment();
  for (const att of attachments || []) {
    if (!att?.url) continue;
    if (att.kind === "audio") {
      const rawName = att.name || att.url.split("/").pop() || "Áudio";
      const name = rawName.replace(/\.[^.]+$/, "") || "Áudio";
      frag.appendChild(createAudioPlayer(mediaUrl(att.url), name));
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

  const spotify =
    embed.kind === "spotify" || embed.embedPath || embed.spotifyId
      ? {
          type: embed.spotifyType,
          id: embed.spotifyId,
          embedPath:
            embed.embedPath ||
            (embed.spotifyType && embed.spotifyId
              ? `${embed.spotifyType}/${embed.spotifyId}`
              : null),
        }
      : spotifyFromUrl(embed.url);

  if (spotify && (spotify.embedPath || (spotify.type && spotify.id))) {
    const path = spotify.embedPath || `${spotify.type}/${spotify.id}`;
    const type = spotify.type || path.split("/")[0];
    const tall = ["album", "playlist", "artist", "show"].includes(type);
    const wrap = document.createElement("div");
    wrap.className = `embed embed--spotify${tall ? " embed--spotify-tall" : ""}`;
    const iframe = document.createElement("iframe");
    iframe.src = `https://open.spotify.com/embed/${path}?utm_source=generator&theme=0`;
    iframe.allow =
      "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    iframe.title = embed.title || "Spotify";
    iframe.setAttribute("frameborder", "0");
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

function renderReactionBar(container, reactions, messageId) {
  container.innerHTML = "";
  const data = reactions && typeof reactions === "object" ? reactions : {};

  Object.entries(data).forEach(([emoji, users]) => {
    const list = Array.isArray(users) ? users : [];
    if (!list.length) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "reaction-chip";
    if (list.some((u) => u.userId === user.id)) btn.classList.add("is-mine");
    btn.title = list.map((u) => u.userName).join(", ");
    btn.innerHTML = `<span>${emoji}</span><span class="reaction-chip__count">${list.length}</span>`;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleReaction(messageId, emoji);
    });
    container.appendChild(btn);
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "reaction-add";
  addBtn.title = "Reagir";
  addBtn.innerHTML = `<span class="material-symbols-outlined">add_reaction</span>`;
  addBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openReactionPicker(addBtn, messageId);
  });
  container.appendChild(addBtn);
}

function openReactionPicker(anchor, messageId) {
  document.querySelectorAll(".reaction-picker").forEach((el) => el.remove());
  const picker = document.createElement("div");
  picker.className = "reaction-picker";
  REACTION_EMOJIS.forEach((emoji) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = emoji;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleReaction(messageId, emoji);
      picker.remove();
    });
    picker.appendChild(b);
  });
  anchor.parentElement.appendChild(picker);
  const close = (ev) => {
    if (!picker.contains(ev.target) && ev.target !== anchor) {
      picker.remove();
      document.removeEventListener("click", close);
    }
  };
  setTimeout(() => document.addEventListener("click", close), 0);
}

function toggleReaction(messageId, emoji) {
  sendWs({
    type: "react",
    messageId,
    emoji,
    userId: user.id,
    userName: user.name,
  });
}

function applyReactionUpdate(parsed) {
  const row = chatMessages.querySelector(`[data-message-id="${parsed.messageId}"]`);
  if (!row) return;
  let reactions = {};
  try {
    reactions = JSON.parse(row.dataset.reactions || "{}");
  } catch {
    reactions = {};
  }
  const emoji = parsed.emoji;
  if (!emoji) return;

  const current = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
  const already = current.some((u) => u.userId === parsed.userId);

  if (already) {
    reactions[emoji] = current.filter((u) => u.userId !== parsed.userId);
    if (!reactions[emoji].length) delete reactions[emoji];
  } else {
    Object.keys(reactions).forEach((key) => {
      reactions[key] = (reactions[key] || []).filter(
        (u) => u.userId !== parsed.userId
      );
      if (!reactions[key].length) delete reactions[key];
    });
    if (!reactions[emoji]) reactions[emoji] = [];
    reactions[emoji].push({
      userId: parsed.userId,
      userName: parsed.userName,
    });
  }

  row.dataset.reactions = JSON.stringify(reactions);
  const bar = row.querySelector(".message-reactions");
  if (bar) renderReactionBar(bar, reactions, parsed.messageId);
}

function createMessageElement(msg, isSelf) {
  const row = document.createElement("div");
  row.className = `message-row${isSelf ? " message-row--self" : ""}`;
  const messageId = msg.id || crypto.randomUUID();
  row.dataset.messageId = messageId;
  row.dataset.userId = msg.userId || "";
  row.dataset.reactions = JSON.stringify(msg.reactions || {});

  if (!isSelf) {
    const img = document.createElement("img");
    img.className = "message-avatar";
    img.src = mediaUrl(msg.userAvatar);
    img.alt = "";
    row.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "message-body";

  if (!isSelf) {
    const meta = document.createElement("div");
    meta.className = "message-meta";
    const sender = document.createElement("span");
    sender.className = "message--sender";
    sender.textContent = msg.userName || "";
    if (msg.userColor) sender.style.color = msg.userColor;
    meta.appendChild(sender);
    body.appendChild(meta);
  }

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  if (msg.sticker) {
    const sticker = document.createElement("div");
    sticker.className = "message-sticker";
    sticker.textContent = msg.sticker;
    bubble.appendChild(sticker);
  }

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

  const footer = document.createElement("div");
  footer.className = "message-footer";

  const hour = document.createElement("span");
  hour.className = "hour hour--inside";
  hour.textContent = nowTime();
  footer.appendChild(hour);

  if (isSelf) {
    const del = document.createElement("button");
    del.type = "button";
    del.className = "message-delete";
    del.title = "Apagar";
    del.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm("Apagar esta mensagem?")) return;
      sendWs({ type: "delete", messageId, userId: user.id });
    });
    footer.appendChild(del);
  }

  bubble.appendChild(footer);

  const reactionsBar = document.createElement("div");
  reactionsBar.className = "message-reactions";
  renderReactionBar(reactionsBar, msg.reactions || {}, messageId);

  body.append(bubble, reactionsBar);
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

  if (parsed.type === "react") {
    applyReactionUpdate(parsed);
    return;
  }

  if (parsed.type === "delete") {
    const row = chatMessages.querySelector(
      `[data-message-id="${parsed.messageId}"]`
    );
    if (row && row.dataset.userId === parsed.userId) row.remove();
    return;
  }

  if (parsed.type && parsed.type !== "message") return;

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
    const preview =
      parsed.sticker ||
      parsed.text ||
      (parsed.attachments?.length ? "Enviou um anexo" : "Nova mensagem");
    notifyBrowser(parsed.userName || "FastChat", preview, mediaUrl(parsed.userAvatar));
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
  document.body.classList.add("app-open");
  requestNotifications();

  topoNome.textContent = user.name;
  topoNome.style.color = user.color;
  topoAvatar.src = mediaUrl(user.avatar);

  intentionalClose = false;
  isReconnect = false;
  reconnectAttempt = 0;
  connectWebSocket();
}

function setReconnectBanner(visible, text) {
  if (!reconnectBanner) return;
  reconnectBanner.hidden = !visible;
  if (text && reconnectBannerText) reconnectBannerText.textContent = text;
  document.body.classList.toggle("is-reconnecting", visible);
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (intentionalClose) return;
  clearReconnectTimer();
  const delay = Math.min(1000 * 2 ** reconnectAttempt, 15000);
  reconnectAttempt += 1;
  setReconnectBanner(
    true,
    reconnectAttempt === 1
      ? "Conexão perdida. Reconectando…"
      : `Reconectando… (tentativa ${reconnectAttempt})`
  );
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectWebSocket();
  }, delay);
}

function sendConnectPayload(reconnect) {
  if (!websocket || websocket.readyState !== WebSocket.OPEN) return;
  websocket.send(
    JSON.stringify({
      type: "connect",
      reconnect: Boolean(reconnect),
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      userAvatar: user.avatar,
      userDesc: user.description,
      content: `${user.name} entrou no chat às ${nowTime()}`,
    })
  );
}

function connectWebSocket() {
  clearReconnectTimer();
  if (
    websocket &&
    (websocket.readyState === WebSocket.OPEN ||
      websocket.readyState === WebSocket.CONNECTING)
  ) {
    try {
      websocket.onclose = null;
      websocket.close();
    } catch {
      /* ignore */
    }
  }

  websocket = new WebSocket(API_WS);

  websocket.onopen = () => {
    const wasReconnect = isReconnect || reconnectAttempt > 0;
    sendConnectPayload(wasReconnect);
    reconnectAttempt = 0;
    isReconnect = true;
    setReconnectBanner(false);
  };

  websocket.onmessage = processMessage;

  websocket.onclose = () => {
    if (intentionalClose) {
      setReconnectBanner(false);
      return;
    }
    scheduleReconnect();
  };

  websocket.onerror = () => {
    console.error("WebSocket error");
  };
}

function exit() {
  intentionalClose = true;
  clearReconnectTimer();
  setReconnectBanner(false);
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
    const sp = spotifyFromUrl(url);
    if (sp) {
      embeds.push({
        url,
        kind: "spotify",
        spotifyType: sp.type,
        spotifyId: sp.id,
        embedPath: sp.embedPath,
        title: "Spotify",
        description: "",
        image: null,
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
      const rawName = pendingAttachment.file.name || "";
      const displayName =
        pendingAttachment.kind === "audio" &&
        (/^mensagem-de-voz/i.test(rawName) || /^audio-/i.test(rawName))
          ? "Mensagem de voz"
          : rawName.replace(/\.[^.]+$/, "") || undefined;
      attachments.push({
        kind: pendingAttachment.kind || uploaded.kind,
        url: uploaded.url,
        name: displayName,
      });
      clearPendingAttachment();
    }

    const embeds = text ? await buildEmbeds(text) : [];

    const message = {
      type: "message",
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      userAvatar: user.avatar,
      text,
      attachments,
      embeds,
      reactions: {},
    };

    websocket.send(JSON.stringify(message));
    chatInput.value = "";
    chatInput.style.height = "auto";
    hideStickerPicker();
    hideAttachMenu();
  } catch (err) {
    alert(err.message || "Falha ao enviar.");
  } finally {
    submitBtn.disabled = false;
  }
};

function getRecentEmojis() {
  try {
    const raw = localStorage.getItem(RECENT_EMOJIS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((e) => typeof e === "string") : [];
  } catch {
    return [];
  }
}

function rememberEmoji(emoji) {
  const next = [emoji, ...getRecentEmojis().filter((e) => e !== emoji)].slice(
    0,
    RECENT_EMOJIS_MAX
  );
  try {
    localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function insertEmoji(emoji) {
  const start = chatInput.selectionStart ?? chatInput.value.length;
  const end = chatInput.selectionEnd ?? chatInput.value.length;
  const before = chatInput.value.slice(0, start);
  const after = chatInput.value.slice(end);
  chatInput.value = `${before}${emoji}${after}`;
  const pos = start + emoji.length;
  chatInput.focus();
  chatInput.setSelectionRange(pos, pos);
  chatInput.dispatchEvent(new Event("input", { bubbles: true }));
  rememberEmoji(emoji);
  if (emojiActiveCategory === "recent") {
    renderEmojiGrid();
  }
}

function emojiListForCategory(id) {
  if (id === "recent") return getRecentEmojis();
  const cat = EMOJI_CATEGORIES.find((c) => c.id === id);
  return cat ? cat.emojis : [];
}

function renderEmojiGrid() {
  const grid = stickerPicker.querySelector(".sticker-picker__grid");
  const empty = stickerPicker.querySelector(".sticker-picker__empty");
  if (!grid) return;
  grid.innerHTML = "";
  const list = emojiListForCategory(emojiActiveCategory);
  if (!list.length) {
    if (empty) {
      empty.hidden = false;
      empty.textContent =
        emojiActiveCategory === "recent"
          ? "Nenhum recente ainda. Escolha um emoji!"
          : "Nenhum emoji nesta categoria.";
    }
    return;
  }
  if (empty) empty.hidden = true;
  list.forEach((emoji) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sticker-picker__item";
    btn.textContent = emoji;
    btn.title = emoji;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      insertEmoji(emoji);
    });
    grid.appendChild(btn);
  });
}

function buildEmojiPicker() {
  stickerPicker.innerHTML = "";

  const tabs = document.createElement("div");
  tabs.className = "sticker-picker__tabs";
  const tabDefs = [
    { id: "recent", label: "Recentes", icon: "🕒" },
    ...EMOJI_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      icon: c.icon,
    })),
  ];

  const recent = getRecentEmojis();
  emojiActiveCategory = recent.length ? "recent" : "smileys";

  tabDefs.forEach((tab) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sticker-picker__tab";
    btn.dataset.cat = tab.id;
    btn.title = tab.label;
    btn.setAttribute("aria-label", tab.label);
    if (tab.id === emojiActiveCategory) btn.classList.add("is-active");
    btn.textContent = tab.icon;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      emojiActiveCategory = tab.id;
      tabs.querySelectorAll(".sticker-picker__tab").forEach((el) => {
        el.classList.toggle("is-active", el.dataset.cat === tab.id);
      });
      const titleEl = stickerPicker.querySelector(".sticker-picker__title");
      if (titleEl) titleEl.textContent = tab.label;
      renderEmojiGrid();
    });
    tabs.appendChild(btn);
  });

  const title = document.createElement("div");
  title.className = "sticker-picker__title";
  title.textContent =
    tabDefs.find((t) => t.id === emojiActiveCategory)?.label || "Emojis";

  const empty = document.createElement("div");
  empty.className = "sticker-picker__empty";
  empty.hidden = true;

  const grid = document.createElement("div");
  grid.className = "sticker-picker__grid";

  stickerPicker.append(tabs, title, empty, grid);
  renderEmojiGrid();
}

function hideAttachMenu() {
  attachMenu.hidden = true;
  clipBtn.setAttribute("aria-expanded", "false");
}

function toggleAttachMenu() {
  const open = attachMenu.hidden;
  hideStickerPicker();
  attachMenu.hidden = !open;
  clipBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

function hideStickerPicker() {
  stickerPicker.hidden = true;
  stickerBtn.setAttribute("aria-expanded", "false");
}

function toggleStickerPicker() {
  hideAttachMenu();
  if (stickerPicker.hidden) {
    buildEmojiPicker();
    stickerPicker.hidden = false;
    stickerBtn.setAttribute("aria-expanded", "true");
  } else {
    hideStickerPicker();
  }
}

async function toggleRecording() {
  if (isRecording && mediaRecorder) {
    if (mediaRecorder.state === "recording" || mediaRecorder.state === "paused") {
      try {
        mediaRecorder.requestData();
      } catch {
        /* ignore */
      }
      mediaRecorder.stop();
    }
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    alert("Seu navegador não suporte gravação de áudio.");
    return;
  }

  try {
    recordStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    recordChunks = [];
    recordMime = pickRecorderMime();

    mediaRecorder = recordMime
      ? new MediaRecorder(recordStream, { mimeType: recordMime })
      : new MediaRecorder(recordStream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordChunks.push(e.data);
    };

    mediaRecorder.onerror = () => {
      stopRecordTracks();
      isRecording = false;
      audioBtn.classList.remove("recording");
      audioBtnIcon.textContent = "mic";
      alert("Erro ao gravar o áudio.");
    };

    mediaRecorder.onstop = () => {
      // espera o último dataavailable chegar (race comum em alguns browsers)
      setTimeout(finishRecording, 80);
    };

    mediaRecorder.start(250);
    isRecording = true;
    recordStartedAt = Date.now();
    audioBtn.classList.add("recording");
    audioBtnIcon.textContent = "stop";
    audioBtn.title = "Parar gravação";
  } catch (err) {
    stopRecordTracks();
    console.error(err);
    alert("Não foi possível acessar o microfone. Verifique a permissão do site.");
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
    setAvatarPreview(null);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    setAvatarPreview(reader.result);
  };
  reader.readAsDataURL(file);
});

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
logoutBtn.addEventListener("click", exit);
clearPreview.addEventListener("click", clearPendingAttachment);

clipBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleAttachMenu();
});
attachImageBtn.addEventListener("click", () => {
  hideAttachMenu();
  imageInput.click();
});
attachAudioBtn.addEventListener("click", () => {
  hideAttachMenu();
  audioInput.click();
});
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  setPendingAttachment(file, "image");
});
audioInput.addEventListener("change", () => {
  const file = audioInput.files[0];
  if (!file) return;
  if (!file.type.startsWith("audio/") && !/\.(mp3|ogg|wav|m4a|webm|aac)$/i.test(file.name)) {
    alert("Selecione um arquivo de áudio válido.");
    audioInput.value = "";
    return;
  }
  setPendingAttachment(file, "audio");
});

stickerBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleStickerPicker();
});

audioBtn.addEventListener("click", toggleRecording);

document.addEventListener("click", (e) => {
  if (!attachMenu.hidden && !e.target.closest(".attach-menu-wrap")) {
    hideAttachMenu();
  }
  if (!stickerPicker.hidden && !e.target.closest(".emoji-picker-wrap")) {
    hideStickerPicker();
  }
});

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
