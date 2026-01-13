import db from "../database/connection.js";
export const sendMessage = (req, res) => {
    const { receiver_id, message } = req.body;
    db.query("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)", 
    [req.user.id, receiver_id, message], (err, r) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Sent" });
    });
};

export const getMessages = (req, res) => {
    const { userId } = req.params;
    const q = "SELECT * FROM messages WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?) ORDER BY created_at ASC";
    db.query(q, [req.user.id, userId, userId, req.user.id], (err, r) => {
        if (err) return res.status(500).json(err);
        res.json(r || []);
    });
};
