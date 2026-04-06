import { db } from "../database/connection.js";

// Fetch technicians by service
export const getTechniciansByService = (req, res) => {
  const { service } = req.params;

  const q = `
    SELECT 
      t.id AS technicianId,
      u.name,
      t.service,
      t.experience
    FROM technicians t
    JOIN users u ON t.user_id = u.id
    WHERE LOWER(t.service) = LOWER(?)
  `;

  db.query(q, [service], (err, rows) => {
    if (err) {
      console.error("getTechniciansByService error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(rows || []);
  });
};

// Fetch technician availability
export const getAvailability = (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  const q = `
    SELECT id, start_time
    FROM technician_availability
    WHERE technician_id = ?
      AND available_date = ?
      AND is_booked = FALSE
  `;

  db.query(q, [id, date], (err, result) => {
    if (err) {
      console.error("getAvailability error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(result || []);
  });
};

// Create technician availability
export const createAvailability = (req, res) => {
  const { day, start_time, end_time } = req.body;

  if (req.user.role !== "technician" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only technician/admin can manage availability" });
  }

  db.query(
    "SELECT id FROM technicians WHERE user_id = ?",
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error("createAvailability lookup error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!rows.length) {
        return res.status(404).json({ message: "Technician profile not found" });
      }

      const technicianId = rows[0].id;

      db.query(
        `INSERT INTO technician_availability (technician_id, available_date, start_time, end_time)
         VALUES (?,?,?,?)`,
        [technicianId, day, start_time, end_time],
        (insertErr, result) => {
          if (insertErr) {
            console.error("createAvailability insert error:", insertErr);
            return res.status(500).json({ message: "Server error" });
          }

          res.json({ message: "Availability saved", id: result.insertId });
        }
      );
    }
  );
};

// Fetch technician profile with rating
export const getTechnicianProfile = (req, res) => {
  const { id } = req.params;

  const q = `
    SELECT
      t.id AS technicianId,
      t.user_id,
      u.name,
      u.email,
      u.phone,
      u.city,
      t.service,
      t.experience,
      COALESCE(AVG(r.rating), 0) AS rating
    FROM technicians t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN ratings r ON r.technician_id = t.id
    WHERE t.id = ?
    GROUP BY t.id, t.user_id, u.name, u.email, u.phone, u.city, t.service, t.experience
  `;

  db.query(q, [id], (err, rows) => {
    if (err) {
      console.error("getTechnicianProfile error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.json(rows[0]);
  });
};

// Fetch technician by user ID
export const getTechnicianByUserId = (req, res) => {
  const { userId } = req.params;

  const q = `
    SELECT 
      t.id AS technicianId,
      t.user_id,
      u.name,
      t.service,
      t.experience
    FROM technicians t
    JOIN users u ON t.user_id = u.id
    WHERE t.user_id = ?
  `;

  db.query(q, [userId], (err, rows) => {
    if (err) {
      console.error("getTechnicianByUserId error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.json(rows[0]);
  });
};

// Fetch maintenance requests for technician
export const getTechnicianRequests = (req, res) => {
  const { id } = req.params;

  if (req.user.role === "admin") {
    return db.query(
      "SELECT * FROM maintenance_requests WHERE technician_id = ? ORDER BY created_at DESC",
      [id],
      (err, rows) => {
        if (err) {
          console.error("getTechnicianRequests admin error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        res.json(rows || []);
      }
    );
  }

  if (req.user.role !== "technician") {
    return res.status(403).json({ message: "Not authorized" });
  }

  db.query(
    "SELECT id FROM technicians WHERE user_id = ?",
    [req.user.id],
    (err, techRows) => {
      if (err) {
        console.error("getTechnicianRequests lookup error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!techRows.length || Number(techRows[0].id) !== Number(id)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      db.query(
        "SELECT * FROM maintenance_requests WHERE technician_id = ? ORDER BY created_at DESC",
        [id],
        (err2, rows) => {
          if (err2) {
            console.error("getTechnicianRequests fetch error:", err2);
            return res.status(500).json({ message: "Server error" });
          }

          res.json(rows || []);
        }
      );
    }
  );
};