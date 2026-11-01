const { pool } = require("../../config/db.mysql");

// Create a chat room (e.g. between a customer and support/admin)
const createRoom = async (roomName, createdBy, isGroup = false) => {
  const [result] = await pool.query(
    "INSERT INTO chat_rooms (room_name, is_group, created_by) VALUES (?, ?, ?)",
    [roomName, isGroup, createdBy]
  );
  return result.insertId;
};

// Add a member to a room
const addRoomMember = async (roomId, userId) => {
  await pool.query(
    "INSERT INTO chat_room_members (room_id, user_id) VALUES (?, ?)",
    [roomId, userId]
  );
};

// Find an existing 1:1 room between two users, or return null
const findOneToOneRoom = async (userIdA, userIdB) => {
  const [rows] = await pool.query(
    `SELECT r.id AS room_id FROM chat_rooms r
     JOIN chat_room_members m1 ON r.id = m1.room_id AND m1.user_id = ?
     JOIN chat_room_members m2 ON r.id = m2.room_id AND m2.user_id = ?
     WHERE r.is_group = false
     LIMIT 1`,
    [userIdA, userIdB]
  );
  return rows[0]?.room_id || null;
};

// Get all rooms a user belongs to
const getRoomsForUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT r.* FROM chat_rooms r
     JOIN chat_room_members m ON r.id = m.room_id
     WHERE m.user_id = ?
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return rows;
};

// Save a new message
const saveMessage = async (roomId, senderId, senderName, message) => {
  const [result] = await pool.query(
    "INSERT INTO chat_messages (room_id, sender_id, sender_name, message) VALUES (?, ?, ?, ?)",
    [roomId, senderId, senderName, message]
  );
  const [rows] = await pool.query("SELECT * FROM chat_messages WHERE id = ?", [result.insertId]);
  return rows[0];
};

// Get message history for a room (paginated)
const getMessagesForRoom = async (roomId, limit = 50, offset = 0) => {
  const [rows] = await pool.query(
    `SELECT * FROM chat_messages WHERE room_id = ?
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [roomId, limit, offset]
  );
  return rows.reverse(); // oldest first for display
};

// Mark all messages in a room as read for everyone except the given sender
const markMessagesAsRead = async (roomId, readerUserId) => {
  await pool.query(
    "UPDATE chat_messages SET is_read = true WHERE room_id = ? AND sender_id != ?",
    [roomId, readerUserId]
  );
};

module.exports = {
  createRoom,
  addRoomMember,
  findOneToOneRoom,
  getRoomsForUser,
  saveMessage,
  getMessagesForRoom,
  markMessagesAsRead,
};
