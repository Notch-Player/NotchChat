const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let loggedInUsers = {}; // Track logged-in users by their email
const allowedUsers = [
  "unknownplayers001@outlook.com",
  "unknownplayers002@outlook.com",
  "unknownplayers003@outlook.com",
  "unknownplayers004@outlook.com",
  "unknownplayers005@outlook.com",
  "unknownplayers006@outlook.com",
  "unknownplayers007@outlook.com",
];

// Serve static files
app.use(express.static("public"));

// Handle new connections
io.on("connection", (socket) => {
  let currentEmail = "";
  let currentUsername = "";

  // Handle login event
  socket.on("login", ({ email, password }) => {
    // If email is not in allowed list, reject login
    if (!allowedUsers.includes(email)) {
      socket.emit("loginError", "Email is not allowed.");
      return;
    }

    // If the email is already logged in, reject
    if (loggedInUsers[email]) {
      socket.emit("loginError", "This email is already logged in.");
      return;
    }

    // Add user to loggedInUsers
    loggedInUsers[email] = socket.id;
    currentEmail = email;
    currentUsername = email.split('@')[0]; // Use the part before the "@" as the username

    // Notify all clients of updated users
    io.emit("updateUsers", Object.keys(loggedInUsers));

    // Emit the login success message to the client
    socket.emit("loginSuccess", currentUsername);
  });

  // Handle new messages
  socket.on("message", ({ message, timestamp }) => {
    io.emit("message", {
      username: currentUsername,
      message,
      timestamp,
    });
  });

  // Handle user logout
  socket.on("logout", () => {
    if (currentEmail) {
      delete loggedInUsers[currentEmail];
      io.emit("updateUsers", Object.keys(loggedInUsers)); // Update users list for everyone
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    if (currentEmail) {
      delete loggedInUsers[currentEmail];
      io.emit("updateUsers", Object.keys(loggedInUsers)); // Update users list for everyone
    }
  });

  // Get the list of logged-in users
  socket.on("getUsers", () => {
    io.emit("updateUsers", Object.keys(loggedInUsers)); // Emit the list of users to the admin
  });
});

// Start the server
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
