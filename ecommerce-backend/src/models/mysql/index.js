const { sequelize } = require("../../config/db.mysql");
const ChatRoom = require("./ChatRoom");
const Message = require("./Message");

module.exports = { sequelize, ChatRoom, Message };
