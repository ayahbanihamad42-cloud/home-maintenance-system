import { db } from "../database/connection.js";

const imageMap = {
  plumbing: "/images/services/plumbing.png",
  electrical: "/images/services/Electrical.png",
  painting: "/images/services/Painting.png",
  decoration: "/images/services/Decoration.png",
};

export const getPublicServices = (req, res) => {
  const sql = `
    SELECT id, name, image_url
    FROM services
    ORDER BY id ASC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("getPublicServices error:", err);
      return res.status(500).json({
        message: err.sqlMessage || err.message || "Failed to load services",
      });
    }

    const services = (rows || []).map((service) => {
      const key = String(service.name || "").trim().toLowerCase();

      return {
        ...service,
        image_url: imageMap[key] || service.image_url,
      };
    });

    return res.json(services);
  });
};