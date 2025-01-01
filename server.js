const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Credentials
const AUTH_PASSWORD = 'Notch@1188';
const AUTH_EMAILS = [
    'unknownplayers001@outlook.com',
    'unknownplayers002@outlook.com',
    'unknownplayers003@outlook.com',
    'unknownplayers004@outlook.com',
    'unknownplayers005@outlook.com',
    'unknownplayers006@outlook.com',
    'unknownplayers007@outlook.com',
];

// Track active users by email to prevent duplicates
let activeUsers = {};

// Serve static files
app.use(express.static('public'));

// Authentication endpoint
app.post('/login', express.json(), (req, res) => {
    const { email, password } = req.body;

    if (!AUTH_EMAILS.includes(email)) {
        return res.status(401).json({ success: false, message: 'Email not authorized!' });
    }

    if (activeUsers[email]) {
        return res.status(401).json({ success: false, message: 'This email is already in use by another user!' });
    }

    if (password === AUTH_PASSWORD) {
        const username = email.split('@')[0]; // Extract username from email
        activeUsers[email] = username;  // Mark email as logged in
        return res.status(200).json({ success: true, username });
    }

    res.status(401).json({ success: false, message: 'Invalid credentials!' });
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle cahat message
    socket.on('chat message', ({ username, message }) => {
        // Broadcast the message to all other clients, excluding the sender
        socket.broadcast.emit('chat message', { username, message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Clean up user when they disconnect
        for (let email in activeUsers) {
            if (activeUsers[email] === socket.username) {
                delete activeUsers[email];
                break;
            }
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
