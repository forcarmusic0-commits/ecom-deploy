const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db.mysql");

// A chat room between a customer and a seller/support agent about (optionally) a product
const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // These reference Mongo ObjectIds (stored as strings) since users/products live in MongoDB
    buyerId: { type: DataTypes.STRING, allowNull: false },
    sellerId: { type: DataTypes.STRING, allowNull: false },
    productId: { type: DataTypes.STRING, allowNull: true },
    lastMessage: { type: DataTypes.STRING, allowNull: true },
    lastMessageAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "chat_rooms",
    timestamps: true,
  }
);

module.exports = ChatRoom;
