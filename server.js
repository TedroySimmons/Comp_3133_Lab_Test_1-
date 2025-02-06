require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api', apiRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('userTyping', (room) => {
    if (room) {
    socket.to(room).emit('userTyping', socket.id);
    }
  });

  socket.on('stopTyping', (room) => {
    socket.to(room).emit('stopTyping');
  });

  socket.on('sendMessage', (messageData) => {
    socket.broadcast.to(messageData.room).emit('receiveMessage', messageData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
