import { db } from "../database/connection.js";

export const addRating = (req, res) => {
  const { technician_id, request_id, rating, comment } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating 1-5 only" });
  }

  db.query(
    `INSERT INTO ratings (user_id, technician_id, request_id, rating, comment)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, technician_id, request_id, rating, comment || null],
    (err) => {
      if (err) {
        console.error("addRating error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ message: "Rating added" });
    }
  );
};

export const getTechnicianRatings = (req, res) => {
  const { technicianId } = req.params;

  db.query(
    "SELECT rating, comment FROM ratings WHERE technician_id = ?",
    [technicianId],
    (err, rows) => {
      if (err) {
        console.error("getTechnicianRatings error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json(rows || []);
    }
  );
};

export const getRatingByRequest = (req, res) => {
  const { requestId } = req.params;

  db.query(
    "SELECT rating, comment FROM ratings WHERE request_id = ? AND user_id = ?",
    [requestId, req.user.id],
    (err, rows) => {
      if (err) {
        console.error("getRatingByRequest error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json(rows[0] || null);
    }
  );
};