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

// جلب توفر الفني
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
