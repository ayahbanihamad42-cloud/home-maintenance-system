import { db } from "../database/connection.js";
import bcrypt from "bcryptjs";

export const getAllUsers = (req, res) => {
  db.query("SELECT id, name, email, phone, city, role FROM users", (err, rows) => {
    if (err) {
      console.error("getAllUsers error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(rows || []);
  });
};

export const getAllTechnicians = (req, res) => {
  const q = `
    SELECT 
      t.id AS technicianId,
      u.id AS userId,
      u.name,
      u.email,
      u.phone,
      u.city,
      t.service,
      t.experience
    FROM users u
    JOIN technicians t ON u.id = t.user_id
  `;

  db.query(q, (err, rows) => {
    if (err) {
      console.error("getAllTechnicians error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(rows || []);
  });
};

export const createUser = async (req, res) => {
  const { name, email, phone, city, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
      if (err) {
        console.error("createUser check error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (rows.length) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hash = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name, email, phone, city, password, role) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, phone || null, city || null, hash, role || "user"],
        (insertErr, result) => {
          if (insertErr) {
            console.error("createUser insert error:", insertErr);
            return res.status(500).json({ message: "Server error" });
          }

          res.json({ message: "User created", id: result.insertId });
        }
      );
    });
  } catch (error) {
    console.error("createUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createTechnician = async (req, res) => {
  const { name, email, phone, city, password, service, experience } = req.body;

  if (!name || !email || !password || !service) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
      if (err) {
        console.error("createTechnician check error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (rows.length) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hash = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name, email, phone, city, password, role) VALUES (?, ?, ?, ?, ?, 'technician')",
        [name, email, phone || null, city || null, hash],
        (insertErr, userResult) => {
          if (insertErr) {
            console.error("createTechnician user insert error:", insertErr);
            return res.status(500).json({ message: "Server error" });
          }

          db.query(
            "INSERT INTO technicians (user_id, service, experience) VALUES (?, ?, ?)",
            [userResult.insertId, service, experience || 0],
            (techErr, techResult) => {
              if (techErr) {
                console.error("createTechnician tech insert error:", techErr);
                return res.status(500).json({ message: "Server error" });
              }

              res.json({ message: "Technician created", id: techResult.insertId });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("createTechnician error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("deleteUser error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!result.affectedRows) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  });
};

export const deleteTechnician = (req, res) => {
  const { id } = req.params;

  db.query("SELECT user_id FROM technicians WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("deleteTechnician select error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "Technician not found" });
    }

    const userId = rows[0].user_id;

    db.query("DELETE FROM technicians WHERE id = ?", [id], (techErr) => {
      if (techErr) {
        console.error("deleteTechnician delete tech error:", techErr);
        return res.status(500).json({ message: "Server error" });
      }

      db.query("DELETE FROM users WHERE id = ?", [userId], (userErr) => {
        if (userErr) {
          console.error("deleteTechnician delete user error:", userErr);
          return res.status(500).json({ message: "Server error" });
        }

        res.json({ message: "Technician deleted" });
      });
    });
  });
};