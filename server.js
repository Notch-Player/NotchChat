const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let loggedInUsers = [];

app.use(express.static("public"));

io.on("connection", (socket) => {
  let currentUser = "";

  socket.on("login", ({ username }) => {
    currentUser = username;
    if (!loggedInUsers.includes(currentUser)) {
      loggedInUsers.push(currentUser);
    }
    io.emit("updateUsers", loggedInUsers); // Update users list for the admin
  });

  socket.on("message", ({ username, message, timestamp }) => {
    io.emit("message", { username, message, timestamp });
  });

  socket.on("getUsers", () => {
    io.emit("updateUsers", loggedInUsers); // Emit the list of users to the admin
  });

  socket.on("logout", () => {
    loggedInUsers = loggedInUsers.filter((user) => user !== currentUser);
    io.emit("updateUsers", loggedInUsers); // Update users list for the admin
  });

  socket.on("disconnect", () => {
    loggedInUsers = loggedInUsers.filter((user) => user !== currentUser);
    io.emit("updateUsers", loggedInUsers); // Update users list for the admin
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
