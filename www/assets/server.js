const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // allow any frontend
});

app.use(cors());

io.on('connection', (socket) => {
  let username = "Anonymous";

  socket.on('set username', (name) => {
    username = name || "Anonymous";
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', {
      username,
      message: msg,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on('disconnect', () => {
    console.log(`${username} disconnected`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});