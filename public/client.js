const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Store users and messages
let onlineUsers = {};
let chatHistory = [];

// Authentication
const AUTH_PASSWORD = "Notch@1188";
const AUTH_EMAILS = [
  "unknownplayers001@outlook.com",
  "unknownplayers002@outlook.com",
  "unknownplayers003@outlook.com",
  "unknownplayers004@outlook.com",
  "unknownplayers005@outlook.com",
  "unknownplayers006@outlook.com",
  "unknownplayers007@outlook.com",
];

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle login
  socket.on("login", ({ email, password }) => {
    if (!AUTH_EMAILS.includes(email) || password !== AUTH_PASSWORD) {
      socket.emit("loginError", "Invalid email or password");
      return;
    }

    if (Object.values(onlineUsers).includes(email)) {
      socket.emit("loginError", "This email is already logged in!");
      return;
    }

    const username = email.split("@")[0];
    onlineUsers[socket.id] = { email, username };

    socket.emit("loginSuccess", { username, isAdmin: email === AUTH_EMAILS[0] });
    io.emit("updateUsers", Object.values(onlineUsers));
    socket.emit("loadChatHistory", chatHistory);
  });

  // Handle messages
  socket.on("message", ({ username, message }) => {
    const msg = { username, message, timestamp: new Date().toLocaleTimeString() };
    chatHistory.push(msg);
    io.emit("message", msg);
  });

  // Typing indicator
  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  // Admin clears chat
  socket.on("clearChat", () => {
    chatHistory = [];
    io.emit("clearChat");
  });

  // Disconnect
  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("updateUsers", Object.values(onlineUsers));
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
