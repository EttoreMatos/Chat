// login elements
const login = document.querySelector(".login")
const loginForm = login.querySelector(".login__form")
const loginInput = login.querySelector(".login__input")

// chat elements
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = chat.querySelector(".chat__input")
const chatMessages = chat.querySelector(".chat__messages")
const chatHour = chat.querySelector(".hour")

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

const user = { id: "", name: "", color: "" }

let websocket

const createMessageSelfElement = (content) => {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const horario = `${horas}:${minutos}`;

    const div = document.createElement("div")
    const spanHour = document.createElement("span")

    div.classList.add("message--self")
    spanHour.classList.add("hour")
    div.innerHTML = content
    spanHour.innerHTML += horario
    div.appendChild(spanHour)

    return div
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const horario = `${horas}:${minutos}`;

    const div = document.createElement("div")
    const span = document.createElement("span")
    const spanHour = document.createElement("span")

    div.classList.add("message--other")

    span.classList.add("message--sender")
    spanHour.classList.add("hour")
    span.style.color = senderColor

    div.appendChild(span)

    span.innerHTML = sender
    div.innerHTML += content
    spanHour.innerHTML += horario
    div.appendChild(spanHour)

    return div
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const parsed = JSON.parse(data)

    if (parsed.type === "connect") {
        const connectDiv = document.createElement("div")
        connectDiv.classList.add("message--entry")
        connectDiv.textContent = parsed.content
        chatMessages.appendChild(connectDiv)
        scrollScreen()
        return
    }

    const { userId, userName, userColor, content } = parsed

    const message =
        userId == user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor)

    chatMessages.appendChild(message)

    scrollScreen()
}

const handleLogin = (event) => {
    event.preventDefault()

    user.id = crypto.randomUUID()
    user.name = loginInput.value
    user.color = getRandomColor()

    login.style.display = "none"
    chat.style.display = "flex"

    websocket = new WebSocket("wss://chat-backend-xuyc.onrender.com")

    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const horario = `${horas}:${minutos}`;
    websocket.onopen = () => {
        const connectMessage = {
            userName: "",
            type: "connect",
            content: `${user.name} entrou no chat as ${horario}`
        }
        websocket.send(JSON.stringify(connectMessage))
    }

    websocket.onmessage = processMessage
}

const sendMessage = (event) => {
    event.preventDefault()

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    }

    websocket.send(JSON.stringify(message))

    chatInput.value = ""
}

loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)

