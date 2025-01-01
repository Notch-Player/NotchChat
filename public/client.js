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
const adminUsersList = document.getElementById("admin-users-list");

let username = "";
let isAdmin = false;
let loggedInUsers = [];

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
    // Prevent same user from logging in multiple times
    if (loggedInUsers.includes(email)) {
      loginError.innerText = "This email is already logged in.";
      loginError.classList.remove("hidden");
      return;
    }

    loggedInUsers.push(email);
    username = email.split('@')[0];  // Get username from email

    // Check if user is admin
    if (email === "unknownplayers001@outlook.com") {
      isAdmin = true;
    }

    loginSection.classList.add("hidden");
    chatSection.classList.remove("hidden");
    chatUsername.innerHTML = `Welcome, ${username}`;

    if (isAdmin) {
      // Show admin view (list of users)
      adminUsersList.classList.remove("hidden");
      socket.emit("getUsers"); // Emit event to get all logged-in users
    }

    socket.emit("login", { username });
  } else {
    loginError.classList.remove("hidden");
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

// Admin: Show list of logged-in users
socket.on("updateUsers", (usersList) => {
  adminUsersList.innerHTML = `<h4>Logged-in Users:</h4>`;
  usersList.forEach((user) => {
    const userDiv = document.createElement("div");
    userDiv.innerText = user;
    adminUsersList.appendChild(userDiv);
  });
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

// Handle logout
document.getElementById("logout-btn").addEventListener("click", () => {
  socket.emit("logout");
  loggedInUsers = loggedInUsers.filter((user) => user !== emailInput.value);
  chatSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

// Handle chat clearing (for admin)
clearChatBtn.addEventListener("click", () => {
  messages.innerHTML = "";
});
