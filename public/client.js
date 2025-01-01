const socket = io();

// Handle Login
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const loginSection = document.getElementById("login-section");
const chatSection = document.getElementById("chat-section");
const chatUsername = document.getElementById("chat-username");
const sendBtn = document.getElementById("send-btn");
const messageInput = document.getElementById("message-input");
const messages = document.getElementById("messages");
const clearChatBtn = document.getElementById("clear-chat-btn");

let username = "";

// Predefined users and credentials
const users = {
  "unknownplayers001@outlook.com": "Notch@1188",
  "unknownplayers002@outlook.com": "Notch@1188",
  "unknownplayers003@outlook.com": "Notch@1188",
  "unknownplayers004@outlook.com": "Notch@1188",
  "unknownplayers005@outlook.com": "Notch@1188",
  "unknownplayers006@outlook.com": "Notch@1188",
  "unknownplayers007@outlook.com": "Notch@1188",
};

loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  // Check credentials
  if (users[email] && users[email] === password) {
    username = email.split('@')[0];  // Get username from email
    loginSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    chatUsername.innerHTML = `Welcome, ${username}`;

    socket.emit("login", { username });
  } else {
    loginError.classList.remove("hidden");
  }
});

// Handle sending message
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message) {
    const timestamp = new Date().toLocaleTimeString();
    socket.emit("message", { username, message, timestamp });
    messageInput.value = ""; // Clear the message input
  }
});

// Listen for incoming messages
socket.on("message", ({ username, message, timestamp }) => {
  const div = document.createElement("div");
  div.className = username === username ? "message message-right" : "message message-left";
  div.innerHTML = `
    <div class="sender">${username}</div>
    <div>${message}</div>
    <div class="timestamp">${timestamp}</div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight; // Auto-scroll to the latest message
});

// Handle logout
document.getElementById("logout-btn").addEventListener("click", () => {
  socket.emit("logout");
  chatSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

// Handle chat clearing (for admin)
clearChatBtn.addEventListener("click", () => {
  messages.innerHTML = "";
});
