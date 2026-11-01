const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { getOrCreateRoom, getMyRooms, getRoomMessages } = require("../controllers/chat.controller");

router.use(protect);

router.post("/rooms", getOrCreateRoom);
router.get("/rooms", getMyRooms);
router.get("/rooms/:roomId/messages", getRoomMessages);

module.exports = router;
