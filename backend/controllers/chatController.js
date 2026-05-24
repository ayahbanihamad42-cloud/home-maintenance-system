import { db } from "../database/connection.js";

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

const allowedTypes = ["text", "image", "location"];

const isBase64Image = (value) => {
  if (!value) return false;
  return /^data:image\/(png|jpg|jpeg|webp);base64,/.test(String(value));
};

const isSafeImageSize = (value, maxMB = 2) => {
  if (!value) return true;

  const sizeInBytes = (String(value).length * 3) / 4;
  const maxBytes = maxMB * 1024 * 1024;

  return sizeInBytes <= maxBytes;
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user?.id;
    const { receiver_id, message } = req.body;
    const rawType = req.body.type || req.body.message_type || "text";
    const messageType = String(rawType).toLowerCase();

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!receiver_id) {
      return res.status(400).json({ message: "Receiver is required" });
    }

    if (Number(receiver_id) === Number(senderId)) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    if (!message || String(message).trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (!allowedTypes.includes(messageType)) {
      return res.status(400).json({ message: "Invalid message type" });
    }

    if (messageType === "image") {
      if (!isBase64Image(message)) {
        return res.status(400).json({
          message: "Invalid image format. Use png, jpg, jpeg, or webp.",
        });
      }

      if (!isSafeImageSize(message, 2)) {
        return res.status(400).json({
          message: "Image is too large. Maximum size is 2MB.",
        });
      }
    }

    const receiverRows = await query(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [receiver_id]
    );

    if (!receiverRows.length) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const result = await query(
      `
      INSERT INTO messages (sender_id, receiver_id, message, type)
      VALUES (?, ?, ?, ?)
      `,
      [senderId, Number(receiver_id), message, messageType]
    );

    return res.status(201).json({
      id: result.insertId,
      sender_id: senderId,
      receiver_id: Number(receiver_id),
      message,
      type: messageType,
      created_at: new Date(),
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({
      message: err.sqlMessage || err.message || "Server error",
    });
  }
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