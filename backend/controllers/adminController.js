import db from "../database/connection.js";
import bcrypt from "bcryptjs";

export const getAllUsers = (req, res) => {
    db.query("SELECT id, name, email, phone, city, role FROM users", (e, r) => {
        if (e) return res.status(500).json(e);
        res.json(r || []);
    });
};

export const getAllTechnicians = (req, res) => {
    const q = `SELECT t.id AS technicianId, u.id AS userId, u.name, u.email, u.phone, u.city, t.service, t.experience FROM users u 
               JOIN technicians t ON u.id = t.user_id`;
    db.query(q, (e, r) => {
        if (e) return res.status(500).json(e);
        res.json(r || []);
    });
};

export const createUser = async (req, res) => {
    const { name, email, phone, city, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.length) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hash = await bcrypt.hash(password, 10);
        db.query(
            "INSERT INTO users (name, email, phone, city, password, role) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, phone, city, hash, role || "user"],
            (insertErr, insertResult) => {
                if (insertErr) return res.status(500).json({ message: "Database error", error: insertErr });
                res.json({ message: "User created", id: insertResult.insertId });
            }
        );
    });
};

export const createTechnician = async (req, res) => {
    const { name, email, phone, city, password, service, experience } = req.body;

    if (!name || !email || !password || !service) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.length) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hash = await bcrypt.hash(password, 10);
        db.query(
            "INSERT INTO users (name, email, phone, city, password, role) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, phone, city, hash, "technician"],
            (insertErr, insertResult) => {
                if (insertErr) return res.status(500).json({ message: "Database error", error: insertErr });

                db.query(
                    "INSERT INTO technicians (user_id, service, experience) VALUES (?, ?, ?)",
                    [insertResult.insertId, service, experience || 0],
                    (techErr, techResult) => {
                        if (techErr) return res.status(500).json({ message: "Database error", error: techErr });
                        res.json({ message: "Technician created", technicianId: techResult.insertId });
                    }
                );
            }
        );
    });
};

export const deleteUser = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Missing user id" });
    }

    db.query("DELETE FROM technicians WHERE user_id = ?", [id], (techErr) => {
        if (techErr) return res.status(500).json({ message: "Database error", error: techErr });

        db.query("DELETE FROM users WHERE id = ?", [id], (userErr, result) => {
            if (userErr) return res.status(500).json({ message: "Database error", error: userErr });
            if (!result.affectedRows) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ message: "User deleted" });
        });
    });
};

export const deleteTechnician = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Missing technician id" });
    }

    db.query("SELECT user_id FROM technicians WHERE id = ?", [id], (findErr, rows) => {
        if (findErr) return res.status(500).json({ message: "Database error", error: findErr });
        if (!rows.length) {
            return res.status(404).json({ message: "Technician not found" });
        }

        const userId = rows[0].user_id;
        db.query("DELETE FROM technicians WHERE id = ?", [id], (techErr) => {
            if (techErr) return res.status(500).json({ message: "Database error", error: techErr });
            db.query("DELETE FROM users WHERE id = ?", [userId], (userErr) => {
                if (userErr) return res.status(500).json({ message: "Database error", error: userErr });
                res.json({ message: "Technician deleted" });
            });
        });
    });
};
