import db from "../database/connection.js";
import bcrypt from "bcryptjs";

export const getAllUsers = (req, res) => {
    db.query("SELECT id, name, email, city, role FROM users", (e, r) => {
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
