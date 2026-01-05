import db from "../database/connection.js";

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
    if (err) return res.status(500).json(err);
    res.json(rows || []);
  });
};
