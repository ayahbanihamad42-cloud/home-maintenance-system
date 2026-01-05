import db from "../database/connection.js";

export const getAllUsers = (req, res) => {
    db.query("SELECT id, name, email, city, role FROM users", (e, r) => {
        if (e) return res.status(500).json(e);
        res.json(r || []); // التأكد من إرجاع مصفوفة فارغة بدل null لمنع الصفحة الفاضية
    });
};

export const getAllTechnicians = (req, res) => {
    const q = `SELECT u.id, u.name, t.service, t.experience FROM users u 
               JOIN technicians t ON u.id = t.user_id`;
    db.query(q, (e, r) => {
        if (e) return res.status(500).json(e);
        res.json(r || []);
    });
};