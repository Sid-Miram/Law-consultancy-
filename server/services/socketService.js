const socketService = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle joining a chat room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle sending messages
    socket.on('send-message', (data) => {
      io.to(data.roomId).emit('receive-message', {
        message: data.message,
        sender: data.sender,
        timestamp: new Date()
      });
    });

    // Handle typing status
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user-typing', {
        userId: data.userId,
        isTyping: data.isTyping
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketService; 