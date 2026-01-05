import db from "../database/connection.js";
export const getUserProfile = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT id, name, email, phone, city, dob, role FROM users WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      if (!rows.length) return res.status(404).json({ message: "User not found" });
      res.json(rows[0]);
    }
  );
};