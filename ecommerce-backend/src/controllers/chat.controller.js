const asyncHandler = require("express-async-handler");
const { ChatRoom, Message } = require("../models/mysql");
const ApiError = require("../utils/ApiError");
const sendResponse = require("../utils/ApiResponse");
const { Op } = require("sequelize");

// @route POST /api/chat/rooms  -> get or create a room between buyer and seller
const getOrCreateRoom = asyncHandler(async (req, res) => {
  const { sellerId, productId } = req.body;
  const buyerId = req.user._id.toString();

  let room = await ChatRoom.findOne({
    where: { buyerId, sellerId, productId: productId || null },
  });

  if (!room) {
    room = await ChatRoom.create({ buyerId, sellerId, productId: productId || null });
  }

  sendResponse(res, 200, "Chat room ready", { room });
});

// @route GET /api/chat/rooms  -> all rooms this user is part of (as buyer OR seller)
const getMyRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  const rooms = await ChatRoom.findAll({
    where: { [Op.or]: [{ buyerId: userId }, { sellerId: userId }] },
    order: [["lastMessageAt", "DESC"]],
  });

  sendResponse(res, 200, "Chat rooms fetched", { rooms });
});

// @route GET /api/chat/rooms/:roomId/messages  -> "populate" equivalent using Sequelize include
const getRoomMessages = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findByPk(req.params.roomId, {
    include: [{ model: Message, as: "messages", order: [["createdAt", "ASC"]] }],
  });

  if (!room) throw new ApiError(404, "Chat room not found");

  const userId = req.user._id.toString();
  if (room.buyerId !== userId && room.sellerId !== userId) {
    throw new ApiError(403, "Not authorized to view this chat");
  }

  sendResponse(res, 200, "Messages fetched", { room });
});

module.exports = { getOrCreateRoom, getMyRooms, getRoomMessages };
