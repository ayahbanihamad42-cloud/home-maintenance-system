import { db } from "../database/connection.js";

const normalizeMessageType = (type) => {
  const allowedTypes = ["text", "image", "location"];

  if (allowedTypes.includes(String(type || "").toLowerCase())) {
    return String(type).toLowerCase();
  }

  return "text";
};

export const sendMessage = (req, res) => {
  const senderId = req.user?.id;
  const { receiver_id, message, type = "text" } = req.body;

  if (!senderId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!receiver_id) {
    return res.status(400).json({ message: "Receiver is required" });
  }

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  const messageType = normalizeMessageType(type);

  const q = `
    INSERT INTO messages (sender_id, receiver_id, message, type)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    q,
    [senderId, Number(receiver_id), message, messageType],
    (err, result) => {
      if (err) {
        console.error("sendMessage insert error:", err);
        return res.status(500).json({
          message: err.sqlMessage || err.message || "Server error",
        });
      }

      return res.status(201).json({
        id: result.insertId,
        sender_id: senderId,
        receiver_id: Number(receiver_id),
        message,
        type: messageType,
        created_at: new Date(),
      });
    }
  );
};

export const getMessages = (req, res) => {
  const currentUserId = req.user?.id;
  const otherUserId = req.params.userId;

  if (!currentUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!otherUserId) {
    return res.status(400).json({ message: "User id is required" });
  }

  const q = `
    SELECT 
      id,
      sender_id,
      receiver_id,
      message,
      COALESCE(type, 'text') AS type,
      created_at
    FROM messages
    WHERE 
      (sender_id = ? AND receiver_id = ?)
      OR
      (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC, id ASC
  `;

  db.query(
    q,
    [currentUserId, otherUserId, otherUserId, currentUserId],
    (err, rows) => {
      if (err) {
        console.error("getMessages error:", err);
        return res.status(500).json({
          message: err.sqlMessage || err.message || "Server error",
        });
      }

      return res.json(rows || []);
    }
  );
};

export const getConversations = (req, res) => {
  const currentUserId = req.user?.id;

  if (!currentUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const q = `
    SELECT 
      u.id AS userId,
      u.name,
      u.email,
      u.role,
      latest.message AS lastMessage,
      COALESCE(latest.type, 'text') AS lastMessageType,
      latest.created_at AS lastMessageAt
    FROM users u
    JOIN (
      SELECT 
        CASE 
          WHEN sender_id = ? THEN receiver_id
          ELSE sender_id
        END AS partner_id,
        message,
        type,
        created_at,
        id
      FROM messages
      WHERE sender_id = ? OR receiver_id = ?
    ) latest ON latest.partner_id = u.id
    JOIN (
      SELECT 
        partner_id,
        MAX(id) AS last_id
      FROM (
        SELECT 
          id,
          CASE 
            WHEN sender_id = ? THEN receiver_id
            ELSE sender_id
          END AS partner_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
      ) x
      GROUP BY partner_id
    ) last_msg ON last_msg.partner_id = latest.partner_id 
              AND last_msg.last_id = latest.id
    ORDER BY latest.created_at DESC, latest.id DESC
  `;

  db.query(
    q,
    [
      currentUserId,
      currentUserId,
      currentUserId,
      currentUserId,
      currentUserId,
      currentUserId,
    ],
    (err, rows) => {
      if (err) {
        console.error("getConversations error:", err);
        return res.status(500).json({
          message: err.sqlMessage || err.message || "Server error",
        });
      }

      return res.json(rows || []);
    }
  );
};