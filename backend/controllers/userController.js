import db from "../database/connection.js";
import bcrypt from "bcryptjs";

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

export const updateUserPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (Number(id) !== Number(req.user.id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hash, id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        if (!result.affectedRows) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Password updated" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Password update failed" });
  }
};

export const updateUserProfile = (req, res) => {
  const { id } = req.params;
  const { email, phone } = req.body;

  if (Number(id) !== Number(req.user.id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  db.query("SELECT id FROM users WHERE email = ? AND id != ?", [email, id], (checkErr, rows) => {
    if (checkErr) return res.status(500).json(checkErr);
    if (rows.length) return res.status(400).json({ message: "Email already in use." });

    db.query(
      "UPDATE users SET email = ?, phone = ? WHERE id = ?",
      [email, phone || null, id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        if (!result.affectedRows) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Profile updated" });
      }
    );
  });
};
