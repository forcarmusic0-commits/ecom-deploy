const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db.mysql");
const ChatRoom = require("./ChatRoom");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roomId: { type: DataTypes.INTEGER, allowNull: false },
    senderId: { type: DataTypes.STRING, allowNull: false }, // Mongo user id
    text: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "messages",
    timestamps: true,
  }
);

// Associations -> lets us do ChatRoom.findAll({ include: Message }) etc (Sequelize's version of "populate")
ChatRoom.hasMany(Message, { foreignKey: "roomId", as: "messages" });
Message.belongsTo(ChatRoom, { foreignKey: "roomId", as: "room" });

module.exports = Message;
