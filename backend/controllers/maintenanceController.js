import db from "../database/connection.js";
export const createRequest = (req, res) => {
     const { technician_id, description, scheduled_date, scheduled_time, city, service, latitude, longitude } = req.body;
    const q = "INSERT INTO maintenance_requests (user_id, technician_id, description, scheduled_date, scheduled_time, city, service, latitude, longitude) VALUES (?,?,?,?,?,?,?,?,?)";
    db.query(q, [req.user.id, technician_id, description, scheduled_date, scheduled_time, city, service, latitude, longitude], (err, r) => {
        if (err) return res.status(500).json(err);
        // تحديث الوقت المحجوز لكي لا يظهر لمستخدم آخر (اللوجيك الناقص)
        db.query("UPDATE technician_availability SET is_booked = TRUE WHERE technician_id = ? AND available_date = ? AND start_time = ?", 
        [technician_id, scheduled_date, scheduled_time]);
        res.json({ message: "Request created", id: r.insertId });
    });
};

export const getHistory = (req, res) => {
    db.query("SELECT * FROM maintenance_requests WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, r) => {
        res.json(r || []); // مصفوفة فارغة تمنع الـ Crash بالفرونت
    });
    };

export const getRequestById = (req, res) => {
    const { id } = req.params;
    db.query(
        "SELECT * FROM maintenance_requests WHERE id = ? AND user_id = ?",
        [id, req.user.id],
        (err, r) => {
            if (err) return res.status(500).json(err);
            if (!r.length) return res.status(404).json({ message: "Request not found" });
            res.json(r[0]);
        }
    );
};