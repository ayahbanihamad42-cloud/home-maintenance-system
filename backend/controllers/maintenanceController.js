import { db } from "../database/connection.js";

const normalizeDate = (date) => {
  if (!date) return null;

  const value = String(date).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value.slice(0, 10);
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
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
    } = req.body;

    const finalTechnicianId = technician_id || technicianId;
    const finalService = service || service_type;
    const cleanDate = normalizeDate(scheduled_date);
    const cleanTime = normalizeTime(scheduled_time);
    const cleanPaymentMethod = String(payment_method || "cash").toLowerCase();

    if (
      !user_id ||
      !finalTechnicianId ||
      !finalService ||
      !description ||
      !cleanDate ||
      !cleanTime
    ) {
      return res.status(400).json({
        message: "Missing required request data.",
      });
    }

    if (!["cash", "online"].includes(cleanPaymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method.",
      });
    }

    const exists = await query(
      `
      SELECT id
      FROM maintenance_requests
      WHERE technician_id = ?
        AND DATE(scheduled_date) = DATE(?)
        AND scheduled_time = ?
        AND status NOT IN ('cancelled', 'rejected')
      LIMIT 1
      `,
      [finalTechnicianId, cleanDate, cleanTime]
    );

    if (exists.length > 0) {
      return res.status(409).json({
        message:
          "This time slot is no longer available. Please choose another time.",
      });
    }

    const result = await query(
      `
      INSERT INTO maintenance_requests
      (
        user_id,
        technician_id,
        service,
        description,
        city,
        location_note,
        scheduled_date,
        scheduled_time,
        estimated_hours,
        payment_method,
        total_price,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        user_id,
        finalTechnicianId,
        finalService,
        description,
        city || location_note || "",
        location_note || city || "",
        cleanDate,
        cleanTime,
        Number(estimated_hours || 1),
        cleanPaymentMethod,
        Number(total_price || 0),
      ]
    );

    await query(
      `
      UPDATE technician_availability
      SET is_booked = 1
      WHERE technician_id = ?
        AND DATE(available_date) = DATE(?)
        AND start_time = ?
      `,
      [finalTechnicianId, cleanDate, cleanTime]
    ).catch(() => null);

    return res.status(201).json({
      id: result.insertId,
      requestId: result.insertId,
      message: "Maintenance request created successfully.",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message:
          "This time slot is no longer available. Please choose another time.",
      });
    }

    return res.status(500).json({
      message: err.sqlMessage || err.message || "Failed to create request.",
    });
  }
};

export const getUserMaintenanceRequests = async (req, res) => {
  try {
    const requestedUserId = Number(req.params.user_id);
    const loggedUserId = Number(req.user?.id);
    const role = getRole(req);

    if (!requestedUserId) {
      return res.status(400).json({ message: "User id is required." });
    }

    if (role !== "admin" && requestedUserId !== loggedUserId) {
      return res.status(403).json({
        message: "You are not allowed to view another user's history.",
      });
    }

    const rows = await query(
      `
      SELECT 
        mr.*,
        DATE_FORMAT(mr.scheduled_date, '%Y-%m-%d') AS scheduled_date,
        TIME_FORMAT(mr.scheduled_time, '%H:%i:%s') AS scheduled_time,
        DATE_FORMAT(mr.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        u.name AS technician_name,
        u.phone AS technician_phone
      FROM maintenance_requests mr
      LEFT JOIN technicians t ON t.id = mr.technician_id
      LEFT JOIN users u ON u.id = t.user_id
      WHERE mr.user_id = ?
      ORDER BY mr.id DESC
      `,
      [requestedUserId]
    );

    return res.json(rows || []);
  } catch (err) {
    return res.status(500).json({
      message: err.sqlMessage || err.message,
    });
  }
};

export const getMyMaintenanceRequests = async (req, res) => {
  req.params.user_id = req.user.id;
  return getUserMaintenanceRequests(req, res);
};

export const getMaintenanceRequestById = async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const loggedUserId = Number(req.user?.id);
    const role = getRole(req);

    const rows = await query(
      `
      SELECT 
        mr.*,
        DATE_FORMAT(mr.scheduled_date, '%Y-%m-%d') AS scheduled_date,
        TIME_FORMAT(mr.scheduled_time, '%H:%i:%s') AS scheduled_time,
        DATE_FORMAT(mr.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        tu.name AS technician_name,
        tu.phone AS technician_phone,
        t.user_id AS technician_user_id,
        uu.name AS user_name,
        uu.phone AS user_phone
      FROM maintenance_requests mr
      LEFT JOIN technicians t ON t.id = mr.technician_id
      LEFT JOIN users tu ON tu.id = t.user_id
      LEFT JOIN users uu ON uu.id = mr.user_id
      WHERE mr.id = ?
      LIMIT 1
      `,
      [requestId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Request not found." });
    }

    const request = rows[0];

    const isOwner = Number(request.user_id) === loggedUserId;
    const isAssignedTechnician =
      request.technician_user_id &&
      Number(request.technician_user_id) === loggedUserId;
    const isAdmin = role === "admin";

    if (!isOwner && !isAssignedTechnician && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to view this request.",
      });
    }

    return res.json(request);
  } catch (err) {
    return res.status(500).json({
      message: err.sqlMessage || err.message,
    });
  }
};

export const updateMaintenanceRequestStatus = async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const loggedUserId = Number(req.user?.id);
    const role = getRole(req);
    const cleanStatus = String(req.body.status || "").toLowerCase();

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

    if (!allowed.includes(cleanStatus)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const rows = await query(
      `
      SELECT 
        mr.id,
        mr.user_id,
        mr.technician_id,
        t.user_id AS technician_user_id
      FROM maintenance_requests mr
      LEFT JOIN technicians t ON t.id = mr.technician_id
      WHERE mr.id = ?
      LIMIT 1
      `,
      [requestId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Request not found." });
    }

    const request = rows[0];

    const isAdmin = role === "admin";
    const isAssignedTechnician =
      request.technician_user_id &&
      Number(request.technician_user_id) === loggedUserId;

    if (!isAdmin && !isAssignedTechnician) {
      return res.status(403).json({
        message: "Only the assigned technician or admin can update this status.",
      });
    }

    await query(
      `
      UPDATE maintenance_requests
      SET status = ?
      WHERE id = ?
      `,
      [cleanStatus, requestId]
    );

    return res.json({
      message: "Request status updated successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.sqlMessage || err.message,
    });
  }
};

export const cancelMaintenanceRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user?.id;

    const rows = await query(
      `
      SELECT *
      FROM maintenance_requests
      WHERE id = ? AND user_id = ?
      LIMIT 1
      `,
      [requestId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Request not found." });
    }

    const request = rows[0];

    if (String(request.status || "").toLowerCase() !== "pending") {
      return res.status(409).json({
        message:
          "This request cannot be cancelled because the technician already accepted or started it.",
      });
    }

    await query(
      "UPDATE maintenance_requests SET status = 'cancelled' WHERE id = ?",
      [requestId]
    );

    await query(
      `
      UPDATE technician_availability
      SET is_booked = 0
      WHERE technician_id = ?
        AND DATE(available_date) = DATE(?)
        AND start_time = ?
      `,
      [
        request.technician_id,
        normalizeDate(request.scheduled_date),
        normalizeTime(request.scheduled_time),
      ]
    ).catch(() => null);

    const isOnline =
      String(request.payment_method || "").toLowerCase() === "online";

    if (isOnline) {
      await query(
        `
        UPDATE payments
        SET status = 'refunded'
        WHERE request_id = ?
        `,
        [requestId]
      ).catch(() => null);

      await query(
        `
        INSERT INTO notifications (user_id, title, message, is_read)
        VALUES (?, ?, ?, 0)
        `,
        [
          userId,
          "Refund Processed",
          `Your mock online payment for request #${requestId} was refunded successfully.`,
        ]
      ).catch(() => null);
    }

    return res.json({
      message: isOnline
        ? "Request cancelled successfully. Your online payment refund has been processed."
        : "Request cancelled successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.sqlMessage || err.message,
    });
  }
};

export const confirmOnlinePayment = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const rows = await query(
      `
      SELECT *
      FROM maintenance_requests
      WHERE id = ? AND user_id = ?
      LIMIT 1
      `,
      [requestId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Request not found." });
    }

    const request = rows[0];
    const amount = Number(req.body.amount || request.total_price || 0);
    const transactionId = `mock_txn_${Date.now()}`;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required." });
    }

    await query(
      `
      INSERT INTO payments
      (request_id, user_id, technician_id, amount, transaction_id, status)
      VALUES (?, ?, ?, ?, ?, 'paid')
      `,
      [requestId, userId, request.technician_id, amount, transactionId]
    );

    const techRows = await query(
      `
      SELECT u.id AS technician_user_id
      FROM technicians t
      JOIN users u ON u.id = t.user_id
      WHERE t.id = ?
      LIMIT 1
      `,
      [request.technician_id]
    );

    const technicianUserId = techRows[0]?.technician_user_id;

    if (technicianUserId) {
      await query(
        `
        INSERT INTO notifications (user_id, title, message, is_read)
        VALUES (?, ?, ?, 0)
        `,
        [
          technicianUserId,
          "Online Payment Received",
          `A mock online payment of ${amount.toFixed(
            2
          )} JOD was deposited for request #${requestId}.`,
        ]
      ).catch(() => null);
    }

    return res.json({
      message: "Payment confirmed successfully.",
      transactionId,
      amount,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.sqlMessage || err.message,
    });
  }
};