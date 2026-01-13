import db from "../database/connection.js";

export const getUserNotifications = (req, res) => {
  db.query(
    "SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC",
    [req.user.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

export const markAsRead = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?",
    [id, req.user.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Notification marked as read" });
    }
  );
};

export const createNotification = (userId, message) => {
  db.query(
    "INSERT INTO notifications (user_id, message) VALUES (?,?)",
    [userId, message]
  );
};

export const getNotificationFeed = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  const fetchMessages = () =>
    new Promise((resolve, reject) => {
      db.query(
        "SELECT id, sender_id, receiver_id, message, created_at FROM messages WHERE receiver_id = ? ORDER BY created_at DESC LIMIT 5",
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });

  const fetchRequestsForTechnician = () =>
    new Promise((resolve, reject) => {
      const q = `
        SELECT r.id, r.service, r.status, r.created_at
        FROM maintenance_requests r
        JOIN technicians t ON r.technician_id = t.id
        WHERE t.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT 5
      `;
      db.query(q, [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });

  const fetchRequestsForUser = () =>
    new Promise((resolve, reject) => {
      db.query(
        "SELECT id, service, status, created_at FROM maintenance_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });

  Promise.all([
    fetchMessages(),
    userRole === "technician" ? fetchRequestsForTechnician() : fetchRequestsForUser()
  ])
    .then(([messages, requests]) => {
      const messageItems = messages.map((item) => ({
        id: `msg-${item.id}`,
        type: "message",
        title: "New message",
        body: item.message,
        chatUserId: item.sender_id,
        created_at: item.created_at
      }));
      const requestItems = requests.map((item) => ({
        id: `req-${item.id}`,
        type: "request",
        title: `Request: ${item.service}`,
        body: `Status: ${item.status}`,
        requestId: item.id,
        created_at: item.created_at
      }));

      const feed = [...messageItems, ...requestItems].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      res.json(feed);
    })
    .catch((err) => res.status(500).json(err));
};
