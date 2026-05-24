import { db } from "../database/connection.js";

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

export const addRating = async (req, res) => {
  try {
    const { technician_id, request_id, rating, comment } = req.body;
    const userId = req.user.id;

    const numericRating = Number(rating);
    const technicianId = Number(technician_id);
    const requestId = Number(request_id);

    if (!technicianId || !requestId) {
      return res.status(400).json({
        message: "Technician id and request id are required.",
      });
    }

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5.",
      });
    }

    const requestRows = await query(
      `
      SELECT id, user_id, technician_id, status
      FROM maintenance_requests
      WHERE id = ?
      LIMIT 1
      `,
      [requestId]
    );

    if (!requestRows.length) {
      return res.status(404).json({
        message: "Maintenance request not found.",
      });
    }

    const request = requestRows[0];

    if (Number(request.user_id) !== Number(userId)) {
      return res.status(403).json({
        message: "You can rate only your own maintenance request.",
      });
    }

    if (Number(request.technician_id) !== Number(technicianId)) {
      return res.status(400).json({
        message: "Technician does not match this maintenance request.",
      });
    }

    if (String(request.status).toLowerCase() !== "completed") {
      return res.status(400).json({
        message: "You can rate only completed maintenance requests.",
      });
    }

    const existingRows = await query(
      `
      SELECT id
      FROM ratings
      WHERE request_id = ?
      LIMIT 1
      `,
      [requestId]
    );

    if (existingRows.length) {
      return res.status(400).json({
        message: "This request has already been rated.",
      });
    }

    await query(
      `
      INSERT INTO ratings (user_id, technician_id, request_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        userId,
        technicianId,
        requestId,
        numericRating,
        comment ? String(comment).trim() : null,
      ]
    );

    return res.json({ message: "Rating added" });
  } catch (err) {
    console.error("addRating error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "This request has already been rated.",
      });
    }

    return res.status(500).json({
      message: err.sqlMessage || err.message || "Server error",
    });
  }
};

export const getTechnicianRatings = (req, res) => {
  const { technicianId } = req.params;

  db.query(
    `
    SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      r.user_id,
      u.name AS user_name
    FROM ratings r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.technician_id = ?
      AND r.comment IS NOT NULL
      AND TRIM(r.comment) <> ''
    ORDER BY r.created_at DESC, r.id DESC
    `,
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