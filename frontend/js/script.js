//script.js
// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const avatarInput = login.querySelector(".login__avatar");
const loginInput = login.querySelector(".login__input");
const loginBtn = login.querySelector(".login__button");
const PreviewAvatar = document.querySelector(".Preview-avatar");

// chat elements
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");
const chatHour = chat.querySelector(".hour")
const audio_alert = document.getElementById("alert");
const topoAvatar = document.querySelector(".topo-avatar");
topoAvatar.style.display = "none"
const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
];

// Avatar padrão (círculo preto de 40x40 em PNG Base64)
const defaultAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAArklEQVRYR+3WwQ2AIBRE0Sx+kOVZwVYKJ3hTYnSY9TxAIp9R2tHX9vMxNMGkD4C8AgkJgFZgg0YA2gDTAM7kAQA4DRhsMABGY2k3pcoAcNgD2FwB1Z/7x+9hyoDKB7pADaSvIVwlz4Gi6ARHtDT9tgCI4BMCm54A2VbbA9i8A32BpaV7rc3xEvkW2NY+j4c6Rr2nOtu3AqKzNSc0poD02pTbSCau+Kd7kH4Fxoc6+FquFNsAAAAASUVORK5CYII=";


// Evento para mostrar preview do avatar ou padrão
avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (!file) {
        PreviewAvatar.src = defaultAvatar;  // base64 ou caminho válido
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        PreviewAvatar.src = reader.result;
    };
    reader.readAsDataURL(file);
});

const user = { id: "", name: "", color: "", avatar: "" };
let websocket;
PreviewAvatar.src = defaultAvatar;
user.avatar = defaultAvatar;
// Cria elemento de mensagem própria

function highlightMentions(text) {
  return text.replace(/@(\w+)/g, (match, username) => {
    const color = activeUsers[username.toLowerCase()];
    if (color) {
      return `<span class="mention" style="color: Yellow">${match}</span>`;
    }
    return match;
  });
}

const createMessageSelfElement = (content) => {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const horario = `${horas}:${minutos}`;

    const div = document.createElement("div");
    const spanHour = document.createElement("span");

    div.classList.add("message--self");
    spanHour.classList.add("hour");
    div.innerHTML = content;
    spanHour.textContent = horario;
    div.appendChild(spanHour);

    return div;
};

function createMessageOtherElement(content, sender, senderColor, avatarData) {
    audio_alert.play().catch((e) => {
        console.warn("Não foi possível tocar o som:", e.message);
    });

    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const horario = `${horas}:${minutos}`;
    
    // Container geral da mensagem
    const container = document.createElement("div");
    container.classList.add("message-container");

    // Avatar
    const img = document.createElement("img");
    img.classList.add("message-avatar");
    img.src = avatarData || defaultAvatar;

    // Caixa de mensagem
    const div = document.createElement("div");
    div.classList.add("message--other");

    // Nome do remetente
    const span = document.createElement("span");
    span.classList.add("message--sender");
    span.style.color = senderColor;
    span.textContent = sender;

    // Conteúdo da mensagem
    const contentBox = document.createElement("div");
    contentBox.style.wordBreak = "break-word";
    contentBox.style.whiteSpace = "normal";
    contentBox.style.overflowWrap = "break-word";
    contentBox.innerHTML = content;

    // Horário
    const spanHour = document.createElement("span");
    spanHour.classList.add("hour");
    spanHour.textContent = horario;

    // Montagem da bolha
    div.appendChild(span);
    div.appendChild(contentBox);
    div.appendChild(spanHour);

    // Montagem do container final
    container.appendChild(img);
    container.appendChild(div);

    return container;
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

const activeUsers = {}; // { nomeMinusculo: cor }

const processMessage = ({ data }) => {
    const parsed = JSON.parse(data);

    if (parsed.type === "connect") {
        const connectDiv = document.createElement("div");
        connectDiv.classList.add("message--entry");
        connectDiv.textContent = parsed.content;
        chatMessages.appendChild(connectDiv);
        scrollScreen();
        return;
    }

    const { userId, userName, userColor, content, userAvatar } = parsed;

    // Atualiza mapa de usuários ativos
    activeUsers[userName.toLowerCase()] = userColor;

    // Destaca menções na mensagem
    const contentWithMentions = highlightMentions(content);

    const message =
        userId === user.id
            ? createMessageSelfElement(contentWithMentions)
            : createMessageOtherElement(contentWithMentions, userName, userColor, userAvatar);

        chatMessages.appendChild(message);
        scrollScreen();
    };

// Função chamada após carregar avatar (ou usar padrão)
function iniciarChat() {
    login.style.display = "none";
    chat.style.display = "flex";
    topoAvatar.style.display = "flex"

     // Atualiza a barra superior com nome e avatar
     const topoNome = document.querySelector(".topo-nome");
     topoNome.textContent = user.name;
     topoNome.style.color = user.color;
     topoAvatar.src = user.avatar || defaultAvatar;

    websocket = new WebSocket("wss://chat-backend-xuyc.onrender.com");

    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const horario = `${horas}:${minutos}`;

    websocket.onopen = () => {
        const connectMessage = {
            userName: "",
            type: "connect",
            content: `${user.name} entrou no chat às ${horario}`
        };
        websocket.send(JSON.stringify(connectMessage));
    };

    websocket.onmessage = processMessage;
}

function exit() {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const horario = `${horas}:${minutos}`;

    scrollScreen();

    const connectMessage = {
        userName: "",
        type: "connect",
        content: `${user.name} saiu do chat às ${horario}`
    };

    websocket.send(JSON.stringify(connectMessage));

    const connectDiv = document.createElement("div");
    connectDiv.classList.add("message--entry");
    connectDiv.textContent = connectMessage.content;

    chatMessages.appendChild(connectDiv);

    window.location.href = "";
}

const handleLogin = async (event) => {
  event.preventDefault();

  loginBtn.textContent = "Conectando...";

  user.id = crypto.randomUUID();
  user.name = loginInput.value;
  user.color = getRandomColor();

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const file = avatarInput?.files?.[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
          user.avatar = reader.result;
          await delay(1000); // espera 1 segundo
          iniciarChat();
      };
      reader.readAsDataURL(file);
  } else {
      user.avatar = defaultAvatar;
      await delay(1000); // espera 1 segundo
      iniciarChat();
  }
};


let imageBase64 = null;
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      imageBase64 = reader.result;
      previewImage.src = imageBase64;
      previewImage.style.display = "block";
      document.querySelector(".preview-wrapper").style.display = "block";  // mostrar wrapper
    };
    reader.readAsDataURL(file);
  });
  
  const sendMessage = (event) => {
    event.preventDefault();
    let content = "";
  
    if (imageBase64) {
      content = `<img src="${imageBase64}" class="chat-image">`;
      imageBase64 = null;
      imageInput.value = "";
      previewImage.style.display = "none";
      document.querySelector(".preview-wrapper").style.display = "none"; // esconder wrapper
    } else {
      let raw = chatInput.value.trim();
      if (!raw) return;
        
      // Transforma URLs em links clicáveis
      const urlRegex = /((https?|ftp):\/\/[^\s]+)/g;
      content = raw.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" style="color:#0479c1; text-decoration: underline;">${url}</a>`;
      });
      if (!content.trim()) return;
      chatInput.value = "";
    }
  
    const message = {
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      userAvatar: user.avatar,
      content
    };
  
    websocket.send(JSON.stringify(message));
};

// Adicione visualização no modal ao clicar em qualquer imagem enviada
chatMessages.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG" && e.target.classList.contains("chat-image")) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");

    // Se o modal já estiver aberto com a mesma imagem, feche
    if (modal.style.display === "flex" && modalImg.src === e.target.src) {
      modal.style.display = "none";
      return;
    }

    modalImg.src = e.target.src;
    modal.style.display = "flex";
  }
});

// Fechar o modal ao clicar na imagem exibida
const modalImg = document.getElementById("modalImage");
modalImg.addEventListener("click", () => {
  document.getElementById("imageModal").style.display = "none";
});

// Eventos
loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
document.addEventListener("paste", (event) => {
    const items = (event.clipboardData || window.Clipboard).items;
  
    for (let item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
  
        reader.onload = () => {
          imageBase64 = reader.result;
          previewImage.src = imageBase64;
          previewImage.style.display = "block";
          document.querySelector(".preview-wrapper").style.display = "block";
        };
  
        reader.readAsDataURL(file);
        break;
      }
    }
  });
