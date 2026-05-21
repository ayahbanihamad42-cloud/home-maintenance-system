import { db } from "../database/connection.js";

export const getUserNotifications = (req, res) => {
  db.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC",
    [req.user.id],
    (err, result) => {
      if (err) {
        console.error("getUserNotifications error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json(result || []);
    }
  );
};

export const markAsRead = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [id, req.user.id],
    (err) => {
      if (err) {
        console.error("markAsRead error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ message: "Notification marked as read" });
    }
  );
};

export const createNotification = (userId, message, title = "Notification") => {
  db.query(
    "INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, 0)",
    [userId, title, message],
    (err) => {
      if (err) {
        console.error("createNotification error:", err);
      }
    }
  );
};

export const getNotificationFeed = (req, res) => {
  const userId = req.user.id;
  const userRole = String(req.user.role || "").toLowerCase();

  const fetchStoredNotifications = () =>
    new Promise((resolve) => {
      db.query(
        `
        SELECT id, title, message, is_read, created_at
        FROM notifications
        WHERE user_id = ? AND is_read = 0
        ORDER BY id DESC
        LIMIT 10
        `,
        [userId],
        (err, rows) => {
          if (err) {
            console.error("Error fetching stored notifications:", err);
            return resolve([]); // كود محمي: يرجع مصفوفة فارغة بدل ما يضرب السيرفر
          }
          resolve(
            (rows || []).map((item) => ({
              id: `stored-${item.id}`,
              type: "stored",
              title: item.title || "Notification",
              body: item.message || "",
              created_at: item.created_at,
            }))
          );
        }
      );
    });

  const fetchMessages = () =>
    new Promise((resolve) => {
      db.query(
        `
        SELECT id, sender_id, receiver_id, message, created_at
        FROM messages
        WHERE receiver_id = ?
        ORDER BY id DESC
        LIMIT 5
        `,
        [userId],
        (err, rows) => {
          if (err) {
            console.error("Error fetching messages:", err);
            return resolve([]); // كود محمي
          }
          resolve(
            (rows || []).map((item) => ({
              id: `msg-${item.id}`,
              type: "message",
              title: "New message",
              body: item.message,
              chatUserId: item.sender_id,
              created_at: item.created_at,
            }))
          );
        }
      );
    });

  const fetchRequestsForTechnician = () =>
    new Promise((resolve) => {
      db.query(
        `
        SELECT r.id, r.service, r.status, r.created_at
        FROM maintenance_requests r
        JOIN technicians t ON r.technician_id = t.id
        WHERE t.user_id = ?
          AND r.status IN ('pending', 'accepted', 'in_progress')
        ORDER BY r.id DESC
        LIMIT 5
        `,
        [userId],
        (err, rows) => {
          if (err) {
            console.error("Error fetching tech requests:", err);
            return resolve([]); // كود محمي
          }
          resolve(
            (rows || []).map((item) => ({
              id: `req-${item.id}`,
              type: "request",
              title: `Request: ${item.service}`,
              body: `Status: ${item.status}`,
              requestId: item.id,
              created_at: item.created_at,
            }))
          );
        }
      );
    });

  const fetchRequestsForUser = () =>
    new Promise((resolve) => {
      db.query(
        `
        SELECT id, service, status, created_at
        FROM maintenance_requests
        WHERE user_id = ?
          AND status IN ('accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled')
        ORDER BY id DESC
        LIMIT 5
        `,
        [userId],
        (err, rows) => {
          if (err) {
            console.error("Error fetching user requests:", err);
            return resolve([]); // كود محمي
          }
          resolve(
            (rows || []).map((item) => ({
              id: `req-${item.id}`,
              type: "request",
              title: `Request: ${item.service}`,
              body: `Status: ${item.status}`,
              requestId: item.id,
              created_at: item.created_at,
            }))
          );
        }
      );
    });

  Promise.all([
    fetchStoredNotifications(),
    fetchMessages(),
    userRole === "technician"
      ? fetchRequestsForTechnician()
      : fetchRequestsForUser(),
  ])
    .then(([stored, messages, requests]) => {
      const feed = [...stored, ...messages, ...requests].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );

      res.json(feed);
    })
    .catch((err) => {
      console.error("getNotificationFeed global error:", err);
      res.status(500).json({ message: "Server error" });
    });
};