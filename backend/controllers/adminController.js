import { db } from "../database/connection.js";
import bcrypt from "bcryptjs";

/* =========================
   USERS
========================= */

export const getAllUsers = (req, res) => {
  db.query(
    "SELECT id, name, email, phone, city, role FROM users ORDER BY id DESC",
    (err, rows) => {
      if (err) {
        console.error("getAllUsers error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json(rows || []);
    }
  );
};

export const createUser = async (req, res) => {
  const { name, email, phone, city, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
      if (err) {
        console.error("createUser check error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (rows.length) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hash = await bcrypt.hash(password, 10);

      db.query(
        `
        INSERT INTO users (name, email, phone, city, password, role)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [name, email, phone || null, city || null, hash, role || "user"],
        (insertErr, result) => {
          if (insertErr) {
            console.error("createUser insert error:", insertErr);
            return res.status(500).json({ message: "Server error" });
          }

          res.json({ message: "User created", id: result.insertId });
        }
      );
    });
  } catch (error) {
    console.error("createUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("deleteUser error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!result.affectedRows) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  });
};

/* =========================
   TECHNICIANS
========================= */

export const getAllTechnicians = (req, res) => {
  const q = `
    SELECT 
      t.id AS technicianId,
      u.id AS userId,
      u.name,
      u.email,
      u.phone,
      u.city,
      t.service_id,
      COALESCE(s.name, t.service) AS service,
      s.image_url AS service_image,
      t.experience
    FROM users u
    JOIN technicians t ON u.id = t.user_id
    LEFT JOIN services s ON t.service_id = s.id
    ORDER BY t.id DESC
  `;

  db.query(q, (err, rows) => {
    if (err) {
      console.error("getAllTechnicians error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(rows || []);
  });
};

export const createTechnician = async (req, res) => {
  const { name, email, phone, city, password, service_id, experience } = req.body;

  if (!name || !email || !password || !service_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
      if (err) {
        console.error("createTechnician check email error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (rows.length) {
        return res.status(400).json({ message: "Email already registered" });
      }

      db.query("SELECT id, name FROM services WHERE id = ?", [service_id], async (serviceErr, serviceRows) => {
        if (serviceErr) {
          console.error("createTechnician check service error:", serviceErr);
          return res.status(500).json({ message: "Server error" });
        }

        if (!serviceRows.length) {
          return res.status(404).json({ message: "Service not found" });
        }

        const serviceName = serviceRows[0].name;
        const hash = await bcrypt.hash(password, 10);

        db.query(
          `
          INSERT INTO users (name, email, phone, city, password, role)
          VALUES (?, ?, ?, ?, ?, 'technician')
          `,
          [name, email, phone || null, city || null, hash],
          (insertErr, userResult) => {
            if (insertErr) {
              console.error("createTechnician user insert error:", insertErr);
              return res.status(500).json({ message: "Server error" });
            }

            db.query(
              `
              INSERT INTO technicians (user_id, service, service_id, experience)
              VALUES (?, ?, ?, ?)
              `,
              [userResult.insertId, serviceName, service_id, experience || 0],
              (techErr, techResult) => {
                if (techErr) {
                  console.error("createTechnician tech insert error:", techErr);
                  return res.status(500).json({ message: "Server error" });
                }

                res.json({
                  message: "Technician created",
                  id: techResult.insertId,
                });
              }
            );
          }
        );
      });
    });
  } catch (error) {
    console.error("createTechnician error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTechnician = (req, res) => {
  const { id } = req.params;

  db.query("SELECT user_id FROM technicians WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("deleteTechnician select error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "Technician not found" });
    }

    const userId = rows[0].user_id;

    db.query("DELETE FROM technician_availability WHERE technician_id = ?", [id], (availabilityErr) => {
      if (availabilityErr) {
        console.error("deleteTechnician availability error:", availabilityErr);
        return res.status(500).json({ message: "Server error" });
      }

      db.query("DELETE FROM technicians WHERE id = ?", [id], (techErr) => {
        if (techErr) {
          console.error("deleteTechnician delete tech error:", techErr);
          return res.status(500).json({ message: "Server error" });
        }

        db.query("DELETE FROM users WHERE id = ?", [userId], (userErr) => {
          if (userErr) {
            console.error("deleteTechnician delete user error:", userErr);
            return res.status(500).json({ message: "Server error" });
          }

          res.json({ message: "Technician deleted" });
        });
      });
    });
  });
};

/* =========================
   STORES
========================= */

export const getAllStores = (req, res) => {
  const q = `
    SELECT 
      s.id,
      s.store_name,
      s.category,
      s.city,
      s.address,
      s.owner_id,
      u.name AS owner_name,
      u.email AS owner_email
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    ORDER BY s.id DESC
  `;

  db.query(q, (err, rows) => {
    if (err) {
      console.error("getAllStores error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(rows || []);
  });
};

export const createStore = (req, res) => {
  const { store_name, category, city, address, owner_id } = req.body;

  if (!store_name || !category || !city) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  db.query(
    `
    INSERT INTO stores (store_name, category, city, address, owner_id)
    VALUES (?, ?, ?, ?, ?)
    `,
    [store_name, category, city, address || null, owner_id || null],
    (err, result) => {
      if (err) {
        console.error("createStore error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ message: "Store created", id: result.insertId });
    }
  );
};

export const deleteStore = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM stores WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("deleteStore error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({ message: "Store deleted" });
  });
};

/* =========================
   SERVICES
========================= */

export const getAllServices = (req, res) => {
  db.query(
    "SELECT id, name, image_url FROM services ORDER BY id DESC",
    (err, rows) => {
      if (err) {
        console.error("getAllServices error:", err);
        return res.status(500).json({
          message: err.sqlMessage || err.message || "Server error",
        });
      }

      res.json(rows || []);
    }
  );
};

export const createService = (req, res) => {
  const { name, image_url } = req.body;

  if (!name || !image_url) {
    return res.status(400).json({ message: "Service name and image are required" });
  }

  db.query(
    "INSERT INTO services (name, image_url) VALUES (?, ?)",
    [name, image_url],
    (err, result) => {
      if (err) {
        console.error("createService error:", err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Service already exists" });
        }

        return res.status(500).json({ message: "Server error" });
      }

      res.json({ message: "Service created", id: result.insertId });
    }
  );
};

export const deleteService = (req, res) => {
  const { id } = req.params;

  db.query("SELECT id FROM technicians WHERE service_id = ?", [id], (checkErr, rows) => {
    if (checkErr) {
      console.error("deleteService check error:", checkErr);
      return res.status(500).json({ message: "Server error" });
    }

    if (rows.length) {
      return res.status(400).json({
        message: "Cannot delete service because technicians are using it",
      });
    }

    db.query("DELETE FROM services WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("deleteService error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!result.affectedRows) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json({ message: "Service deleted" });
    });
  });
};