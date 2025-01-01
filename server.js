const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

let activeUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("login", ({ username }) => {
    activeUsers.push({ username, socketId: socket.id });
    console.log(`${username} logged in.`);
  });

  socket.on("message", ({ username, message, timestamp }) => {
    io.emit("message", { username, message, timestamp });
  });

  socket.on("logout", () => {
    activeUsers = activeUsers.filter(user => user.socketId !== socket.id);
    console.log("A user logged out.");
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter(user => user.socketId !== socket.id);
    console.log("A user disconnected.");
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
