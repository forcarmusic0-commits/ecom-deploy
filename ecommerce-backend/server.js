require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./src/app");
const connectMongo = require("./src/config/db.mongo");
const { connectMySQL } = require("./src/config/db.mysql");
const initChatSocket = require("./src/sockets/chat.socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // connect both databases before accepting traffic
  await connectMongo();
  await connectMySQL();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true },
  });

  initChatSocket(io);

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
