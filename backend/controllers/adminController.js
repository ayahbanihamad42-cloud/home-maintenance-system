import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import { db } from "../database/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const safeImagePath = (imageUrl) => {
  if (!imageUrl) return "";
  if (String(imageUrl).startsWith("/") || String(imageUrl).startsWith("http")) {
    return imageUrl;
  }
  return `/${imageUrl}`;
};

const saveBase64ServiceImage = (name, imageBase64) => {
  const matches = String(imageBase64).match(
    /^data:image\/([a-zA-Z0-9]+);base64,(.+)$/
  );

  if (!matches) {
    throw new Error("Invalid image format");
  }

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const base64Data = matches[2];

  const safeName = String(name || "service")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const fileName = `${safeName || "service"}-${Date.now()}.${ext}`;
  const servicesDir = path.join(__dirname, "..", "images", "services");

  if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(servicesDir, fileName),
    Buffer.from(base64Data, "base64")
  );

  return `/images/services/${fileName}`;
};

/* USERS */
export const getAllUsers = (req, res) => {
  db.query("SELECT * FROM users ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
    res.json(rows || []);
  });
};

export const createUser = async (req, res) => {
  try {
    const { name, email, phone, dob, city, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      `
      INSERT INTO users (name, email, phone, dob, city, password, role, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [name, email, phone || null, dob || null, city || null, hashedPassword, role],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        res.status(201).json({ id: result.insertId, message: "User created" });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
    if (!result.affectedRows) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  });
};

/* TECHNICIANS */
export const getAllTechnicians = (req, res) => {
  db.query(
    `
    SELECT 
      t.id AS technicianId,
      t.user_id,
      t.service,
      t.experience,
      t.price_per_hour,
      u.name,
      u.email,
      u.phone,
      u.city
    FROM technicians t
    JOIN users u ON u.id = t.user_id
    ORDER BY t.id DESC
    `,
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
      res.json(rows || []);
    }
  );
};

export const createTechnician = async (req, res) => {
  try {
    const { name, email, phone, city, password, service, experience, price_per_hour } = req.body;

    if (!name || !email || !password || !service) {
      return res.status(400).json({ message: "Name, email, password and service are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      `
      INSERT INTO users (name, email, phone, city, password, role, is_verified)
      VALUES (?, ?, ?, ?, ?, 'technician', 1)
      `,
      [name, email, phone || null, city || null, hashedPassword],
      (userErr, userResult) => {
        if (userErr) return res.status(500).json({ message: userErr.sqlMessage || userErr.message });

        db.query(
          `
          INSERT INTO technicians (user_id, service, experience, price_per_hour)
          VALUES (?, ?, ?, ?)
          `,
          [
            userResult.insertId,
            service,
            Number(experience || 0),
            Number(price_per_hour || 0),
          ],
          (techErr, techResult) => {
            if (techErr) return res.status(500).json({ message: techErr.sqlMessage || techErr.message });

            res.status(201).json({
              id: techResult.insertId,
              user_id: userResult.insertId,
              message: "Technician created",
            });
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTechnician = (req, res) => {
  db.query("SELECT user_id FROM technicians WHERE id = ?", [req.params.id], (findErr, rows) => {
    if (findErr) return res.status(500).json({ message: findErr.sqlMessage || findErr.message });
    if (!rows.length) return res.status(404).json({ message: "Technician not found" });

    const userId = rows[0].user_id;

    db.query("DELETE FROM technicians WHERE id = ?", [req.params.id], (techErr) => {
      if (techErr) return res.status(500).json({ message: techErr.sqlMessage || techErr.message });

      db.query("DELETE FROM users WHERE id = ?", [userId], (userErr) => {
        if (userErr) return res.status(500).json({ message: userErr.sqlMessage || userErr.message });
        res.json({ message: "Technician deleted" });
      });
    });
  });
};

/* STORES */
export const getAllStores = (req, res) => {
  db.query("SELECT * FROM stores ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
    res.json(rows || []);
  });
};

export const createStore = (req, res) => {
  const { name, owner_name, city, phone, address } = req.body;

  if (!name) return res.status(400).json({ message: "Store name is required" });

  db.query(
    `
    INSERT INTO stores (name, owner_name, city, phone, address)
    VALUES (?, ?, ?, ?, ?)
    `,
    [name, owner_name || null, city || null, phone || null, address || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
      res.status(201).json({ id: result.insertId, message: "Store created" });
    }
  );
};

export const deleteStore = (req, res) => {
  db.query("DELETE FROM stores WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
    if (!result.affectedRows) return res.status(404).json({ message: "Store not found" });
    res.json({ message: "Store deleted" });
  });
};

/* SERVICES */
export const getAllServices = (req, res) => {
  db.query(
    "SELECT id, name, image_url, created_at FROM services ORDER BY id DESC",
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
      res.json(rows || []);
    }
  );
};

export const createService = (req, res) => {
  const { name, image_url, image_base64 } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: "Service name is required" });
  }

  let finalImageUrl = image_url ? safeImagePath(String(image_url).trim()) : "";

  try {
    if (image_base64) {
      finalImageUrl = saveBase64ServiceImage(name, image_base64);
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  if (!finalImageUrl) {
    return res.status(400).json({ message: "Service image is required" });
  }

  db.query(
    "INSERT INTO services (name, image_url) VALUES (?, ?)",
    [String(name).trim(), finalImageUrl],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.sqlMessage || err.message });

      res.status(201).json({
        id: result.insertId,
        name: String(name).trim(),
        image_url: finalImageUrl,
      });
    }
  );
};

export const deleteService = (req, res) => {
  db.query("DELETE FROM services WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
    if (!result.affectedRows) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted" });
  });
};