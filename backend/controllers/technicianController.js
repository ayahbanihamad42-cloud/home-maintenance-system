import db from "../database/connection.js";

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
    if (err) return res.status(500).json(err);
    res.json(rows || []);
  });
};

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
    if (err) return res.status(500).json({ error: err });
    res.json(result || []);
  });
};

export const createAvailability = (req, res) => {
  const { technician_id, day, start_time, end_time } = req.body;
  const q = `
    INSERT INTO technician_availability (technician_id, available_date, start_time, end_time)
    VALUES (?,?,?,?)
  `;
  db.query(q, [technician_id, day, start_time, end_time], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Availability saved", id: result.insertId });
  });
};

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
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(404).json({ message: "Technician not found" });
    res.json(rows[0]);
  });
};

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
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(404).json({ message: "Technician not found" });
    res.json(rows[0]);
  });
};

export const getTechnicianRequests = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM maintenance_requests WHERE technician_id = ? ORDER BY created_at DESC",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows || []);
    }
  );
};
