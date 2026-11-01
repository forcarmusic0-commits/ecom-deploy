const jwt = require("jsonwebtoken");
const { ChatRoom, Message } = require("../models/mysql");

// Track which socket ids belong to which user (Mongo user id) for online status
const onlineUsers = new Map(); // userId -> socketId

function initChatSocket(io) {
  // Middleware: every socket connection must present a valid JWT access token
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error: no token"));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id; // attach for later use
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] User connected: ${socket.userId} (${socket.id})`);
    onlineUsers.set(socket.userId, socket.id);
    io.emit("user_online", { userId: socket.userId });

    // Client joins a specific chat room (roomId comes from /api/chat/rooms)
    socket.on("join_room", (roomId) => {
      socket.join(`room_${roomId}`);
      console.log(`[Socket] ${socket.userId} joined room_${roomId}`);
    });

    // Sending a message: persist to MySQL, then broadcast to everyone in the room
    socket.on("send_message", async ({ roomId, text }) => {
      try {
        const message = await Message.create({
          roomId,
          senderId: socket.userId,
          text,
        });

        await ChatRoom.update(
          { lastMessage: text, lastMessageAt: new Date() },
          { where: { id: roomId } }
        );

        io.to(`room_${roomId}`).emit("receive_message", {
          id: message.id,
          roomId,
          senderId: socket.userId,
          text,
          createdAt: message.createdAt,
        });
      } catch (err) {
        socket.emit("error_message", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing", ({ roomId }) => {
      socket.to(`room_${roomId}`).emit("typing", { userId: socket.userId });
    });
    socket.on("stop_typing", ({ roomId }) => {
      socket.to(`room_${roomId}`).emit("stop_typing", { userId: socket.userId });
    });

    // Mark messages as read
    socket.on("mark_read", async ({ roomId }) => {
      await Message.update(
        { isRead: true },
        { where: { roomId, senderId: { [require("sequelize").Op.ne]: socket.userId } } }
      );
      socket.to(`room_${roomId}`).emit("messages_read", { roomId, readBy: socket.userId });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
      io.emit("user_offline", { userId: socket.userId });
    });
  });
}

module.exports = initChatSocket;
