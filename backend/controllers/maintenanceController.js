import db from "../database/connection.js";
// Create a new maintenance request
export const createRequest = (req, res) => {
    const { technician_id, description, scheduled_date, scheduled_time, city = null, service, location_note = null } = req.body;
    const qWithLocation = "INSERT INTO maintenance_requests (user_id, technician_id, description, scheduled_date, scheduled_time, city, service, location_note) VALUES (?,?,?,?,?,?,?,?)";
    const qWithoutLocation = "INSERT INTO maintenance_requests (user_id, technician_id, description, scheduled_date, scheduled_time, city, service) VALUES (?,?,?,?,?,?,?)";

    const finalizeRequest = (result) => {
        db.query("UPDATE technician_availability SET is_booked = TRUE WHERE technician_id = ? AND available_date = ? AND start_time = ?",
        [technician_id, scheduled_date, scheduled_time]);
        res.json({ message: "Request created", id: result.insertId });
    };

    db.query(qWithLocation, [req.user.id, technician_id, description, scheduled_date, scheduled_time, city, service, location_note], (err, r) => {
        if (err && err.code === "ER_BAD_FIELD_ERROR") {
            return db.query(qWithoutLocation, [req.user.id, technician_id, description, scheduled_date, scheduled_time, city, service], (fallbackErr, fallbackResult) => {
                if (fallbackErr) return res.status(500).json(fallbackErr);
                return finalizeRequest(fallbackResult);
            });
        }
        if (err) return res.status(500).json(err);
        finalizeRequest(r);
    });
};
// Fetch user request history
export const getHistory = (req, res) => {
    db.query("SELECT * FROM maintenance_requests WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, r) => {
        res.json(r || []); // Empty array prevents frontend crash

    });
};
// Fetch a specific request for the user
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
// Update maintenance request status
export const updateRequestStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["pending", "confirmed", "completed"];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    db.query(
        "UPDATE maintenance_requests SET status = ? WHERE id = ?",
        [status, id],
        (err, r) => {
            if (err) return res.status(500).json(err);
            if (!r.affectedRows) return res.status(404).json({ message: "Request not found" });
            res.json({ message: "Status updated" });
        }
    );
};