import { db } from "../database/connection.js";

// Fetch stores by service type
export const getStoresByService = (req, res) => {
  const { service } = req.query;

  const q = `
    SELECT 
      s.id AS storeId,
      s.store_name AS name,
      s.category AS service,
      s.city,
      s.address
    FROM stores s
    WHERE LOWER(s.category) = LOWER(?)
  `;

  db.query(q, [service], (err, rows) => {
    if (err) {
      console.error("getStoresByService error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(rows || []);
  });
};
