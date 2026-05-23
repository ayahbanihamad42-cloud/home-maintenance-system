import { db } from "../database/connection.js";

const normalizeTime = (time) => {
  if (!time) return null;
  const value = String(time).trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return value;
};

const timeToMinutes = (time) => {
  const [h, m] = String(time).slice(0, 5).split(":").map(Number);
  return h * 60 + (m || 0);
};

const addMinutes = (time, minutes) => {
  const [h, m] = String(time).slice(0, 5).split(":").map(Number);
  const date = new Date(2000, 0, 1, h, m || 0, 0);
  date.setMinutes(date.getMinutes() + Number(minutes));
  return date.toTimeString().slice(0, 8);
};

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const findMyTechnicianId = (userId, callback) => {
  db.query(
    "SELECT id FROM technicians WHERE user_id = ? LIMIT 1",
    [userId],
    (err, rows) => {
      if (err) return callback(err);
      callback(null, rows?.[0]?.id || null);
    }
  );
};

export const getTechniciansByService = (req, res) => {
  const service = decodeURIComponent(req.params.service || "").trim();

  db.query(
    `
    SELECT 
      t.id AS technicianId,
      t.id,
      t.user_id,
      t.service,
      t.experience,
      t.price_per_hour,
      u.name,
      u.email,
      u.phone,
      u.city,
      COALESCE(AVG(r.rating), 0) AS rating,
      COUNT(r.id) AS review_count
    FROM technicians t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN ratings r ON r.technician_id = t.id
    WHERE LOWER(TRIM(t.service)) = LOWER(TRIM(?))
    GROUP BY t.id, t.user_id, t.service, t.experience, t.price_per_hour,
             u.name, u.email, u.phone, u.city
    ORDER BY t.id DESC
    `,
    [service],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.sqlMessage || err.message });

      res.json(
        (rows || []).map((row) => ({
          ...row,
          rating: Number(row.rating || 0),
          review_count: Number(row.review_count || 0),
        }))
      );
    }
  );
};
function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeArabic(value) {
  return normalizeText(value)
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function localAnalyzeSearch(searchText) {
  const q = normalizeArabic(searchText);

  let sort = "none";

  if (
    q.includes("افضل") ||
    q.includes("احسن") ||
    q.includes("اعلى تقييم") ||
    q.includes("best") ||
    q.includes("top rated") ||
    q.includes("highest rating")
  ) {
    sort = "rating_desc";
  }

  if (
    q.includes("ارخص") ||
    q.includes("اقل سعر") ||
    q.includes("cheapest") ||
    q.includes("lowest price")
  ) {
    sort = "price_asc";
  }

  if (
    q.includes("اغلى") ||
    q.includes("اعلى سعر") ||
    q.includes("highest price") ||
    q.includes("most expensive")
  ) {
    sort = "price_desc";
  }

  return {
    keywords: q
      .replace(/اعطيني|اعطني|هات|بدي|اريد|كل|الفنيين|فنيين|الفني|فني|تكنيشان|تكنشن|الخدمة|خدمة|service|technician|technicians|show|give|me|all|the|in|for/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    sort,
    city: "",
    name: "",
    service: "",
  };
}

async function analyzeWithGemini(searchText, service) {
  if (!process.env.GEMINI_API_KEY) {
    return localAnalyzeSearch(searchText);
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    const prompt = `
You are a search parser for a home maintenance app.

User search text:
"${searchText}"

Current service page:
"${service}"

Return ONLY valid JSON. No markdown.

JSON format:
{
  "keywords": "important remaining search words only",
  "sort": "none | rating_desc | price_asc | price_desc",
  "city": "",
  "name": "",
  "service": ""
}

Rules:
- Understand Arabic, Arabizi, English, and casual text.
- If user asks for best/highest rated => sort rating_desc.
- If user asks for cheapest/lowest price => sort price_asc.
- If user asks for most expensive/highest price => sort price_desc.
- If user asks generally for technicians of the current service, keep keywords empty.
- Extract technician name if mentioned.
- Extract city if mentioned.
- Extract service if mentioned.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      keywords: parsed.keywords || "",
      sort: parsed.sort || "none",
      city: parsed.city || "",
      name: parsed.name || "",
      service: parsed.service || "",
    };
  } catch (err) {
    console.error("Gemini smart search fallback:", err.message);
    return localAnalyzeSearch(searchText);
  }
}

export const smartTechnicianSearch = async (req, res) => {
  const { searchText, service, userCity } = req.body;

  try {
    const analysis = await analyzeWithGemini(searchText || "", service || "");

    const safeService = String(service || "").trim();

    db.query(
      `
      SELECT 
        t.id AS technicianId,
        t.id,
        t.user_id,
        t.service,
        t.experience,
        t.price_per_hour,
        u.name,
        u.email,
        u.phone,
        u.city,
        COALESCE(AVG(r.rating), 0) AS rating,
        COUNT(r.id) AS review_count
      FROM technicians t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN ratings r ON r.technician_id = t.id
      WHERE LOWER(TRIM(t.service)) = LOWER(TRIM(?))
      GROUP BY t.id, t.user_id, t.service, t.experience, t.price_per_hour,
               u.name, u.email, u.phone, u.city
      `,
      [safeService],
      (err, rows) => {
        if (err) {
          console.error("smartTechnicianSearch query error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        let result = (rows || []).map((row) => ({
          ...row,
          rating: Number(row.rating || 0),
          review_count: Number(row.review_count || 0),
        }));

        const words = normalizeArabic(
          `${analysis.keywords || ""} ${analysis.name || ""} ${analysis.city || ""} ${analysis.service || ""}`
        )
          .split(" ")
          .filter((word) => word.length > 1);

        if (words.length) {
          result = result.filter((tech) => {
            const text = normalizeArabic(
              `${tech.name || ""} ${tech.service || ""} ${tech.city || ""}`
            );

            return words.some((word) => text.includes(word));
          });
        }

        if (analysis.city) {
          result = result.filter(
            (tech) => normalizeArabic(tech.city) === normalizeArabic(analysis.city)
          );
        }

        if (analysis.sort === "rating_desc") {
          result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        }

        if (analysis.sort === "price_asc") {
          result.sort(
            (a, b) => Number(a.price_per_hour || 0) - Number(b.price_per_hour || 0)
          );
        }

        if (analysis.sort === "price_desc") {
          result.sort(
            (a, b) => Number(b.price_per_hour || 0) - Number(a.price_per_hour || 0)
          );
        }

        if (normalizeArabic(searchText).includes("قريب") && userCity) {
          result.sort((a, b) => {
            const aSame = normalizeArabic(a.city) === normalizeArabic(userCity) ? 1 : 0;
            const bSame = normalizeArabic(b.city) === normalizeArabic(userCity) ? 1 : 0;
            return bSame - aSame;
          });
        }

        res.json({
          analysis,
          technicians: result,
        });
      }
    );
  } catch (err) {
    console.error("smartTechnicianSearch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getTechnicianById = (req, res) => {
  db.query(
    `
    SELECT 
      t.id AS technicianId,
      t.id,
      t.user_id,
      t.service,
      t.experience,
      t.price_per_hour,
      u.name,
      u.email,
      u.phone,
      u.city,
      COALESCE(AVG(r.rating), 0) AS rating
    FROM technicians t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN ratings r ON r.technician_id = t.id
    WHERE t.id = ?
    GROUP BY t.id, t.user_id, t.service, t.experience, t.price_per_hour,
             u.name, u.email, u.phone, u.city
    LIMIT 1
    `,
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
      if (!rows.length) return res.status(404).json({ message: "Technician not found" });
      res.json(rows[0]);
    }
  );
};

export const getTechnicianByUserId = (req, res) => {
  db.query(
    `
    SELECT 
      t.id AS technicianId,
      t.id,
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
    WHERE t.user_id = ?
    LIMIT 1
    `,
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
      if (!rows.length) return res.status(404).json({ message: "Technician not found" });
      res.json(rows[0]);
    }
  );
};

export const updateTechnicianPrice = (req, res) => {
  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician not found" });

    db.query(
      "UPDATE technicians SET price_per_hour = ? WHERE id = ?",
      [Number(req.body.price_per_hour || 0), technicianId],
      (err) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        res.json({ message: "Price updated" });
      }
    );
  });
};

export const getMyAvailability = (req, res) => {
  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician not found" });

    db.query(
      `
      SELECT id, technician_id, available_date, start_time, end_time, is_booked
      FROM technician_availability
      WHERE technician_id = ?
      ORDER BY available_date DESC, start_time
      `,
      [technicianId],
      (err, rows) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        res.json(rows || []);
      }
    );
  });
};

export const createAvailability = (req, res) => {
  const { available_date, start_time, end_time } = req.body;

  if (!available_date || !start_time || !end_time) {
    return res.status(400).json({ message: "Date, start time and end time are required" });
  }

  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician not found" });

    db.query(
      `
      INSERT INTO technician_availability
      (technician_id, available_date, start_time, end_time, is_booked)
      VALUES (?, ?, ?, ?, 0)
      `,
      [technicianId, available_date, normalizeTime(start_time), normalizeTime(end_time)],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });

        res.status(201).json({
          id: result.insertId,
          technician_id: technicianId,
          available_date,
          start_time: normalizeTime(start_time),
          end_time: normalizeTime(end_time),
        });
      }
    );
  });
};

export const deleteAvailability = (req, res) => {
  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician not found" });

    db.query(
      "DELETE FROM technician_availability WHERE id = ? AND technician_id = ?",
      [req.params.id, technicianId],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        if (!result.affectedRows) return res.status(404).json({ message: "Availability not found" });
        res.json({ message: "Availability deleted" });
      }
    );
  });
};

export const getMyRegularAvailability = (req, res) => {
  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician profile not found" });

    db.query(
      `
      SELECT *
      FROM technician_regular_availability
      WHERE technician_id = ?
      ORDER BY month_start DESC, day_of_week, start_time
      `,
      [technicianId],
      (err, rows) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        res.json(rows || []);
      }
    );
  });
};

export const createRegularAvailability = (req, res) => {
  const { month_start, month_end, day_of_week, start_time, end_time, slot_minutes } = req.body;

  const allowedDays = [
    "All",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  if (!month_start || !month_end || !day_of_week || !start_time || !end_time) {
    return res.status(400).json({
      message: "Month start, month end, day, start time and end time are required",
    });
  }

  if (!allowedDays.includes(day_of_week)) {
    return res.status(400).json({ message: "Invalid day" });
  }

  const slotMinutesNumber = Number(slot_minutes || 60);

  if (!slotMinutesNumber || slotMinutesNumber < 30) {
    return res.status(400).json({ message: "Slot duration must be 30 minutes or more" });
  }

  if (timeToMinutes(start_time) >= timeToMinutes(end_time)) {
    return res.status(400).json({ message: "End time must be after start time" });
  }

  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician profile not found" });

    db.query(
      `
      INSERT INTO technician_regular_availability
      (technician_id, month_start, month_end, day_of_week, start_time, end_time, slot_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        technicianId,
        month_start,
        month_end,
        day_of_week,
        normalizeTime(start_time),
        normalizeTime(end_time),
        slotMinutesNumber,
      ],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });

        res.status(201).json({
          id: result.insertId,
          technician_id: technicianId,
          month_start,
          month_end,
          day_of_week,
          start_time: normalizeTime(start_time),
          end_time: normalizeTime(end_time),
          slot_minutes: slotMinutesNumber,
        });
      }
    );
  });
};

export const deleteRegularAvailability = (req, res) => {
  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician profile not found" });

    db.query(
      `
      DELETE FROM technician_regular_availability
      WHERE id = ? AND technician_id = ?
      `,
      [req.params.id, technicianId],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        if (!result.affectedRows) return res.status(404).json({ message: "Regular schedule not found" });
        res.json({ message: "Regular schedule deleted" });
      }
    );
  });
};

export const getAvailabilityByTechnician = (req, res) => {
  const { id } = req.params;
  const selectedDate = req.query.date ? String(req.query.date).slice(0, 10) : "";

  const bookedQuery = `
    SELECT 
      DATE_FORMAT(scheduled_date, '%Y-%m-%d') AS scheduled_date,
      TIME_FORMAT(scheduled_time, '%H:%i:%s') AS scheduled_time
    FROM maintenance_requests
    WHERE technician_id = ?
      AND status NOT IN ('rejected', 'cancelled')
  `;

  db.query(bookedQuery, [id], (bookedErr, bookedRows) => {
    if (bookedErr) {
      return res.status(500).json({ message: bookedErr.sqlMessage || bookedErr.message });
    }

    const bookedSet = new Set(
      (bookedRows || []).map(
        (b) => `${b.scheduled_date}_${String(b.scheduled_time).slice(0, 8)}`
      )
    );

    const oneTimeQuery = `
      SELECT 
        id,
        technician_id,
        DATE_FORMAT(available_date, '%Y-%m-%d') AS available_date,
        TIME_FORMAT(start_time, '%H:%i:%s') AS start_time,
        TIME_FORMAT(end_time, '%H:%i:%s') AS end_time
      FROM technician_availability
      WHERE technician_id = ?
        AND available_date >= CURDATE()
        AND COALESCE(is_booked, 0) = 0
      ORDER BY available_date ASC, start_time ASC
    `;

    db.query(oneTimeQuery, [id], (oneErr, oneRows) => {
      if (oneErr) {
        return res.status(500).json({ message: oneErr.sqlMessage || oneErr.message });
      }

      const regularQuery = `
        SELECT *
        FROM technician_regular_availability
        WHERE technician_id = ?
          AND month_end >= CURDATE()
      `;

      db.query(regularQuery, [id], (regErr, regRows) => {
        const result = [];

        for (const item of oneRows || []) {
          const date = item.available_date;
          const start = String(item.start_time).slice(0, 8);

          if (!selectedDate || date === selectedDate) {
            if (!bookedSet.has(`${date}_${start}`)) {
              result.push({
                id: item.id,
                technician_id: item.technician_id,
                available_date: date,
                start_time: item.start_time,
                end_time: item.end_time,
                source_type: "one-time",
              });
            }
          }
        }

        if (!regErr) {
          for (const rule of regRows || []) {
            const startDate = new Date(rule.month_start);
            const endDate = new Date(rule.month_end);

            for (
              let d = new Date(startDate);
              d <= endDate;
              d.setDate(d.getDate() + 1)
            ) {
              const dateText = formatDate(d);
              if (selectedDate && dateText !== selectedDate) continue;

              const dayName = d.toLocaleDateString("en-US", { weekday: "long" });

              if (rule.day_of_week !== "All" && rule.day_of_week !== dayName) {
                continue;
              }

              let current = String(rule.start_time).slice(0, 8);
              const end = String(rule.end_time).slice(0, 8);
              const slotMinutes = Number(rule.slot_minutes || 60);

              while (timeToMinutes(addMinutes(current, slotMinutes)) <= timeToMinutes(end)) {
                const slotEnd = addMinutes(current, slotMinutes);

                if (!bookedSet.has(`${dateText}_${current}`)) {
                  result.push({
                    id: `${rule.id}-${dateText}-${current}`,
                    technician_id: Number(id),
                    available_date: dateText,
                    start_time: current,
                    end_time: slotEnd,
                    source_type: "regular",
                  });
                }

                current = slotEnd;
              }
            }
          }
        }

        result.sort((a, b) =>
          `${a.available_date} ${a.start_time}`.localeCompare(
            `${b.available_date} ${b.start_time}`
          )
        );

        return res.json(result);
      });
    });
  });
};

export const getMyRequests = (req, res) => {
  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician not found" });

    db.query(
      `
      SELECT 
        mr.*,
        u.name AS user_name,
        u.phone AS user_phone
      FROM maintenance_requests mr
      JOIN users u ON u.id = mr.user_id
      WHERE mr.technician_id = ?
      ORDER BY mr.id DESC
      `,
      [technicianId],
      (err, rows) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        res.json(rows || []);
      }
    );
  });
};

export const updateRequestStatus = (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  const allowed = [
    "pending",
    "accepted",
    "confirmed",
    "on_the_way",
    "in_progress",
    "completed",
    "rejected",
    "cancelled",
  ];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician not found" });

    db.query(
      `
      UPDATE maintenance_requests
      SET status = ?
      WHERE id = ? AND technician_id = ?
      `,
      [status, requestId, technicianId],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        if (!result.affectedRows) return res.status(404).json({ message: "Request not found" });
        res.json({ message: "Status updated" });
      }
    );
  });
};

export const getTechnicianGallery = (req, res) => {
  db.query(
    `
    SELECT *
    FROM technician_work_posts
    WHERE technician_id = ?
    ORDER BY id DESC
    `,
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
      res.json(rows || []);
    }
  );
};

export const getMyGallery = (req, res) => {
  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician not found" });

    db.query(
      `
      SELECT *
      FROM technician_work_posts
      WHERE technician_id = ?
      ORDER BY id DESC
      `,
      [technicianId],
      (err, rows) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        res.json(rows || []);
      }
    );
  });
};

export const createGalleryPost = (req, res) => {
  const { description, images, location_note } = req.body;

  if (!description || !images) {
    return res.status(400).json({ message: "Description and images are required" });
  }

  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician not found" });

    db.query(
      `
      INSERT INTO technician_work_posts
      (technician_id, description, images, location_note)
      VALUES (?, ?, ?, ?)
      `,
      [
        technicianId,
        description,
        typeof images === "string" ? images : JSON.stringify(images),
        location_note || null,
      ],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });

        res.status(201).json({
          id: result.insertId,
          technician_id: technicianId,
          description,
          images,
          location_note,
        });
      }
    );
  });
};

export const updateGalleryPost = (req, res) => {
  const { postId } = req.params;
  const { description, images, location_note } = req.body;

  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician not found" });

    db.query(
      `
      UPDATE technician_work_posts
      SET description = ?, images = ?, location_note = ?
      WHERE id = ? AND technician_id = ?
      `,
      [
        description || "",
        typeof images === "string" ? images : JSON.stringify(images || []),
        location_note || null,
        postId,
        technicianId,
      ],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        if (!result.affectedRows) return res.status(404).json({ message: "Post not found" });
        res.json({ message: "Post updated" });
      }
    );
  });
};

export const deleteGalleryPost = (req, res) => {
  const { postId } = req.params;

  findMyTechnicianId(req.user.id, (lookupErr, technicianId) => {
    if (lookupErr) return res.status(500).json({ message: "Server error" });
    if (!technicianId) return res.status(404).json({ message: "Technician not found" });

    db.query(
      "DELETE FROM technician_work_posts WHERE id = ? AND technician_id = ?",
      [postId, technicianId],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || err.message });
        if (!result.affectedRows) return res.status(404).json({ message: "Post not found" });
        res.json({ message: "Post deleted" });
      }
    );
  });
};