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
