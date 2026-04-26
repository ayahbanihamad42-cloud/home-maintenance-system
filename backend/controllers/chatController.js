import { db } from "../database/connection.js";

export const sendMessage = (req, res) => {
  const { receiver_id, message, type = "text" } = req.body;

  if (!receiver_id || !message) {
    return res.status(400).json({ message: "receiver_id and message are required" });
  }

  db.query(
    "INSERT INTO messages (sender_id, receiver_id, message, type) VALUES (?, ?, ?, ?)",
    [req.user.id, receiver_id, message, type],
    (err, result) => {
      if (err) {
        console.error("sendMessage error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json({
        message: "Sent",
        id: result?.insertId || null
      });
    }
  );
};

export const getMessages = (req, res) => {
  const { userId } = req.params;

  const q = `
    SELECT *
    FROM messages
    WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `;

  db.query(q, [req.user.id, userId, userId, req.user.id], (err, rows) => {
    if (err) {
      console.error("getMessages error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(rows || []);
  });
};

export const getConversations = (req, res) => {
  const currentUserId = req.user.id;

  const q = `
    SELECT
      u.id AS userId,
      u.name,
      m.message AS lastMessage,
      m.type AS lastMessageType,
      m.created_at AS lastMessageAt
    FROM (
      SELECT
        CASE
          WHEN sender_id = ? THEN receiver_id
          ELSE sender_id
        END AS partner_id,
        MAX(id) AS last_message_id
      FROM messages
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY
        CASE
          WHEN sender_id = ? THEN receiver_id
          ELSE sender_id
        END
    ) c
    JOIN messages m ON m.id = c.last_message_id
    JOIN users u ON u.id = c.partner_id
    ORDER BY m.created_at DESC
  `;

  db.query(
    q,
    [currentUserId, currentUserId, currentUserId, currentUserId],
    (err, rows) => {
      if (err) {
        console.error("getConversations error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json(rows || []);
    }
  );
};