import { db } from "../database/connection.js";

const parseGalleryImages = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeGalleryPost = (post) => ({
  ...post,
  images: parseGalleryImages(post.images),
});

const findMyTechnicianId = (userId, callback) => {
  db.query(
    "SELECT id FROM technicians WHERE user_id = ?",
    [userId],
    (err, rows) => {
      if (err) return callback(err);
      if (!rows.length) return callback(null, null);
      callback(null, rows[0].id);
    }
  );
};

// Fetch technicians by service
export const getTechniciansByService = (req, res) => {
  const { service } = req.params;

  const q = `
    SELECT 
      t.id AS technicianId,
      t.user_id,
      u.name,
      u.city,
      u.phone,
      t.service,
      t.experience,
      t.price_per_hour,
      COALESCE(AVG(r.rating), 0) AS rating
    FROM technicians t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN ratings r ON r.technician_id = t.id
    WHERE LOWER(t.service) = LOWER(?)
    GROUP BY 
      t.id,
      t.user_id,
      u.name,
      u.city,
      u.phone,
      t.service,
      t.experience,
      t.price_per_hour
    ORDER BY rating DESC
  `;

  db.query(q, [service], (err, rows) => {
    if (err) {
      console.error("getTechniciansByService error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(rows || []);
  });
};
// Fetch technician availability
export const getAvailability = (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  const q = `
    SELECT id, start_time
    FROM technician_availability
    WHERE technician_id = ?
      AND available_date = ?
      AND is_booked = FALSE
    ORDER BY start_time ASC
  `;

  db.query(q, [id, date], (err, result) => {
    if (err) {
      console.error("getAvailability error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(result || []);
  });
};

// Create technician availability
export const createAvailability = (req, res) => {
  const { day, start_time, end_time } = req.body;

  if (req.user.role !== "technician" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only technician/admin can manage availability" });
  }

  db.query(
    "SELECT id FROM technicians WHERE user_id = ?",
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error("createAvailability lookup error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!rows.length) {
        return res.status(404).json({ message: "Technician profile not found" });
      }

      const technicianId = rows[0].id;

      db.query(
        `INSERT INTO technician_availability (technician_id, available_date, start_time, end_time)
         VALUES (?,?,?,?)`,
        [technicianId, day, start_time, end_time],
        (insertErr, result) => {
          if (insertErr) {
            console.error("createAvailability insert error:", insertErr);
            return res.status(500).json({ message: "Server error" });
          }

          res.json({ message: "Availability saved", id: result.insertId });
        }
      );
    }
  );
};

// Fetch technician profile with rating
export const getTechnicianProfile = (req, res) => {
  const { id } = req.params;

  const q = `
    SELECT
      t.id AS technicianId,
      t.user_id,
      u.name,
      u.email,
      u.phone,
      u.city,
      t.service,
      t.experience,
      t.price_per_hour,
      COALESCE(AVG(r.rating), 0) AS rating
    FROM technicians t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN ratings r ON r.technician_id = t.id
    WHERE t.id = ?
    GROUP BY 
      t.id,
      t.user_id,
      u.name,
      u.email,
      u.phone,
      u.city,
      t.service,
      t.experience,
      t.price_per_hour
  `;

  db.query(q, [id], (err, rows) => {
    if (err) {
      console.error("getTechnicianProfile error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.json(rows[0]);
  });
};

// Fetch technician by user ID
export const getTechnicianByUserId = (req, res) => {
  const { userId } = req.params;

  const q = `
    SELECT 
      t.id AS technicianId,
      t.user_id,
      u.name,
      t.service,
      t.experience,
      t.price_per_hour
    FROM technicians t
    JOIN users u ON t.user_id = u.id
    WHERE t.user_id = ?
  `;

  db.query(q, [userId], (err, rows) => {
    if (err) {
      console.error("getTechnicianByUserId error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "Technician not found" });
    }

    res.json(rows[0]);
  });
};

// Update technician price per hour
export const updateTechnicianPrice = (req, res) => {
  const { price_per_hour } = req.body;
  const parsedPrice = Number(price_per_hour);

  if (req.user.role !== "technician" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: "Invalid price_per_hour" });
  }

  db.query(
    "UPDATE technicians SET price_per_hour = ? WHERE user_id = ?",
    [parsedPrice, req.user.id],
    (err, result) => {
      if (err) {
        console.error("updateTechnicianPrice error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!result.affectedRows) {
        return res.status(404).json({ message: "Technician profile not found" });
      }

      res.json({
        message: "Technician price updated",
        price_per_hour: parsedPrice,
      });
    }
  );
};

// Fetch maintenance requests for technician
export const getTechnicianRequests = (req, res) => {
  const { id } = req.params;

  if (req.user.role === "admin") {
    return db.query(
      "SELECT * FROM maintenance_requests WHERE technician_id = ? ORDER BY created_at DESC",
      [id],
      (err, rows) => {
        if (err) {
          console.error("getTechnicianRequests admin error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        res.json(rows || []);
      }
    );
  }

  if (req.user.role !== "technician") {
    return res.status(403).json({ message: "Not authorized" });
  }

  db.query(
    "SELECT id FROM technicians WHERE user_id = ?",
    [req.user.id],
    (err, techRows) => {
      if (err) {
        console.error("getTechnicianRequests lookup error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!techRows.length || Number(techRows[0].id) !== Number(id)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      db.query(
        "SELECT * FROM maintenance_requests WHERE technician_id = ? ORDER BY created_at DESC",
        [id],
        (err2, rows) => {
          if (err2) {
            console.error("getTechnicianRequests fetch error:", err2);
            return res.status(500).json({ message: "Server error" });
          }

          res.json(rows || []);
        }
      );
    }
  );
};

// Public: fetch gallery posts for technician profile
export const getTechnicianGallery = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT id, technician_id, description, images, created_at
     FROM technician_work_posts
     WHERE technician_id = ?
     ORDER BY created_at DESC`,
    [id],
    (err, rows) => {
      if (err) {
        console.error("getTechnicianGallery error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json((rows || []).map(normalizeGalleryPost));
    }
  );
};

// Technician: fetch own gallery posts
export const getMyGallery = (req, res) => {
  if (req.user.role !== "technician" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) {
      console.error("getMyGallery lookup error:", lookupErr);
      return res.status(500).json({ message: "Server error" });
    }

    if (!technicianId) {
      return res.status(404).json({ message: "Technician profile not found" });
    }

    db.query(
      `SELECT id, technician_id, description, images, created_at
       FROM technician_work_posts
       WHERE technician_id = ?
       ORDER BY created_at DESC`,
      [technicianId],
      (err, rows) => {
        if (err) {
          console.error("getMyGallery error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        res.json((rows || []).map(normalizeGalleryPost));
      }
    );
  });
};

// Technician: create gallery post with multiple images
export const createGalleryPost = (req, res) => {
  const { description, images } = req.body;

  if (req.user.role !== "technician" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only technicians can create posts" });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({ message: "Description is required" });
  }

  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ message: "At least one image is required" });
  }

  if (images.length > 6) {
    return res.status(400).json({ message: "Maximum 6 images per post" });
  }

  const safeImages = images.filter(
    (img) => typeof img === "string" && img.startsWith("data:image/")
  );

  if (!safeImages.length) {
    return res.status(400).json({ message: "Invalid image format" });
  }

  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) {
      console.error("createGalleryPost lookup error:", lookupErr);
      return res.status(500).json({ message: "Server error" });
    }

    if (!technicianId) {
      return res.status(404).json({ message: "Technician profile not found" });
    }

    db.query(
      `INSERT INTO technician_work_posts (technician_id, description, images)
       VALUES (?, ?, ?)`,
      [technicianId, description.trim(), JSON.stringify(safeImages)],
      (err, result) => {
        if (err) {
          console.error("createGalleryPost insert error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        res.status(201).json({
          message: "Post created",
          id: result.insertId,
          technician_id: technicianId,
          description: description.trim(),
          images: safeImages,
        });
      }
    );
  });
};

// Technician: delete own gallery post
export const deleteGalleryPost = (req, res) => {
  const { postId } = req.params;

  if (req.user.role !== "technician" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) {
      console.error("deleteGalleryPost lookup error:", lookupErr);
      return res.status(500).json({ message: "Server error" });
    }

    if (!technicianId) {
      return res.status(404).json({ message: "Technician profile not found" });
    }

    const q =
      req.user.role === "admin"
        ? "DELETE FROM technician_work_posts WHERE id = ?"
        : "DELETE FROM technician_work_posts WHERE id = ? AND technician_id = ?";

    const params = req.user.role === "admin" ? [postId] : [postId, technicianId];

    db.query(q, params, (err, result) => {
      if (err) {
        console.error("deleteGalleryPost error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!result.affectedRows) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json({ message: "Post deleted" });
    });
  });
};