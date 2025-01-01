const socket = io();

const loginSection = document.getElementById("login-section");
const chatSection = document.getElementById("chat-section");
const loginError = document.getElementById("login-error");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");
const clearChatBtn = document.getElementById("clear-chat-btn");
const chatUsername = document.getElementById("chat-username");
const logoutBtn = document.getElementById("logout-btn");
const adminUsersList = document.getElementById("admin-users-list");

let username = "";
let isAdmin = false;

document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  socket.emit("login", { email, password });
});

socket.on("loginError", (msg) => {
  loginError.textContent = msg;
  loginError.classList.remove("hidden");
});

socket.on("loginSuccess", ({ username: user, isAdmin: admin }) => {
  username = user;
  isAdmin = admin;

  loginSection.classList.add("hidden");
  chatSection.classList.remove("hidden");

  chatUsername.textContent = `Welcome, ${username}${isAdmin ? " (Admin)" : ""}`;
  if (isAdmin) {
    clearChatBtn.classList.remove("hidden");
    adminUsersList.classList.remove("hidden");
  }
});

sendBtn.addEventListener("click", () => {
  const message = messageInput.value;
  if (!message) return;

  socket.emit("message", { username, message });
  messageInput.value = "";
});

socket.on("message", ({ username: user, message, timestamp }) => {
  const div = document.createElement("div");
  div.className = user === username ? "message message-right" : "message message-left";
  div.innerHTML = `
    <div class="sender">${user}</div>
    <div>${message}</div>
    <div class="timestamp">${timestamp}</div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight; // Auto-scroll to the latest message
});

    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight; // Auto-scroll to the latest message
  });

socket.on("updateUsers", (users) => {
  if (isAdmin) {
    adminUsersList.innerHTML = `<strong>Online Users:</strong><br>${users
      .map((u) => u.username)
      .join("<br>")}`;
  }
});

socket.on("typing", (user) => {
  typingIndicator.textContent = `${user} is typing...`;
  typingIndicator.classList.remove("hidden");

  setTimeout(() => typingIndicator.classList.add("hidden"), 1000);
});

messageInput.addEventListener("input", () => {
  socket.emit("typing", username);
});

logoutBtn.addEventListener("click", () => {
  location.reload();
});

clearChatBtn.addEventListener("click", () => {
  socket.emit("clearChat");
});

socket.on("clearChat", () => {
  messages.innerHTML = "";
});

  
