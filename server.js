const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let loggedInUsers = [];

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  let currentUser = "";

  socket.on("login", ({ username }) => {
    currentUser = username;
    // Prevent multiple logins from the same user
    if (!loggedInUsers.includes(currentUser)) {
      loggedInUsers.push(currentUser);
      io.emit("updateUsers", loggedInUsers); // Update users list for the admin
    } else {
      socket.emit("loginError", "This email is already logged in.");
    }
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

// Listen on the port provided by Render or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
