import { db } from "../database/connection.js";

/* ================= HELPERS ================= */

const normalizeDate = (date) => {
  if (!date) return null;
  const value = String(date).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const normalizeTime = (time) => {
  if (!time) return null;
  const value = String(time).trim();

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;

  return value;
};

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

const getRole = (req) => String(req.user?.role || "").toLowerCase();

const buildUserLocationUrl = (lat, lng, existingUrl) => {
  const cleanLat = Number(lat);
  const cleanLng = Number(lng);

  if (Number.isFinite(cleanLat) && Number.isFinite(cleanLng)) {
    return `https://www.google.com/maps?q=${cleanLat},${cleanLng}`;
  }

  return existingUrl || null;
};

/* ================= CREATE ================= */

export const createMaintenanceRequest = async (req, res) => {
  try {
    const user_id = req.user?.id;

    const {
      technician_id,
      technicianId,
      service,
      service_type,
      description,
      city,
      location_note,
      scheduled_date,
      scheduled_time,
      estimated_hours,
      payment_method,
      total_price,
      user_location_lat,
      user_location_lng,
      user_location_url,
    } = req.body;

    const finalTechnicianId = technician_id || technicianId;
    const finalService = service || service_type;
    const cleanDate = normalizeDate(scheduled_date);
    const cleanTime = normalizeTime(scheduled_time);

    const exists = await query(
      `SELECT id FROM maintenance_requests
       WHERE technician_id = ?
       AND DATE(scheduled_date) = DATE(?)
       AND scheduled_time = ?
       AND status NOT IN ('cancelled','rejected')
       LIMIT 1`,
      [finalTechnicianId, cleanDate, cleanTime]
    );

    if (exists.length) {
      return res.status(409).json({ message: "Time not available" });
    }

    const result = await query(
      `INSERT INTO maintenance_requests
      (user_id, technician_id, service, description, city, location_note,
       scheduled_date, scheduled_time, estimated_hours, payment_method,
       total_price, user_location_lat, user_location_lng, user_location_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        user_id,
        finalTechnicianId,
        finalService,
        description,
        city || "",
        location_note || "",
        cleanDate,
        cleanTime,
        Number(estimated_hours || 1),
        payment_method || "cash",
        Number(total_price || 0),
        user_location_lat || null,
        user_location_lng || null,
        user_location_url || null,
      ]
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Created",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= GET ================= */

export const getUserMaintenanceRequests = async (req, res) => {
  try {
    const userId = Number(req.params.user_id);

    const rows = await query(
      `SELECT * FROM maintenance_requests WHERE user_id=? ORDER BY id DESC`,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyMaintenanceRequests = (req, res) => {
  req.params.user_id = req.user.id;
  return getUserMaintenanceRequests(req, res);
};

export const getMaintenanceRequestById = async (req, res) => {
  try {
    const id = req.params.id;

    const rows = await query(
      `SELECT * FROM maintenance_requests WHERE id=? LIMIT 1`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */

export const updateMaintenanceRequestStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    await query(
      `UPDATE maintenance_requests SET status=? WHERE id=?`,
      [status, id]
    );

    return res.json({ message: "Updated" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= CANCEL ================= */

export const cancelMaintenanceRequest = async (req, res) => {
  try {
    const id = req.params.id;

    await query(
      `UPDATE maintenance_requests SET status='cancelled' WHERE id=?`,
      [id]
    );

    return res.json({ message: "Cancelled" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= PAYMENT ================= */

export const confirmOnlinePayment = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const rows = await query(
      `SELECT * FROM maintenance_requests WHERE id=? AND user_id=?`,
      [requestId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    const request = rows[0];
    const amount = Number(req.body.amount || request.total_price || 0);

    const transactionId = `txn_${Date.now()}`;

    await query(
      `INSERT INTO payments
      (request_id, user_id, technician_id, amount, transaction_id, status)
      VALUES (?, ?, ?, ?, ?, 'paid')`,
      [requestId, userId, request.technician_id, amount, transactionId]
    );

    return res.json({
      message: "Payment success",
      transactionId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};