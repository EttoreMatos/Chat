// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const avatarInput = login.querySelector(".login__avatar");
const loginInput = login.querySelector(".login__input");
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
PreviewAvatar.style.display = "none"
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
        PreviewAvatar.style.display = "block";
        PreviewAvatar.src = defaultAvatar;  // base64 ou caminho válido
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        PreviewAvatar.style.display = "block";
        PreviewAvatar.src = reader.result;
    };
    reader.readAsDataURL(file);
});

const user = { id: "", name: "", color: "", avatar: "" };
let websocket;
PreviewAvatar.src = defaultAvatar;
user.avatar = defaultAvatar;
// Cria elemento de mensagem própria
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

    const message =
        userId === user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor, userAvatar);

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

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    const file = avatarInput?.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            user.avatar = reader.result;
            iniciarChat();
        };
        reader.readAsDataURL(file);
    } else {
        user.avatar = defaultAvatar;  // usa imagem padrão aqui também
        iniciarChat();
    }
};
const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        userAvatar: user.avatar,
        content: chatInput.value
    };

    websocket.send(JSON.stringify(message));
    chatInput.value = "";
};

// Eventos
loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
