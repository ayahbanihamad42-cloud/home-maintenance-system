import { db } from "../database/connection.js";

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

const getTechnicianIdByUserId = async (userId) => {
  const rows = await query(
    "SELECT id FROM technicians WHERE user_id = ? LIMIT 1",
    [userId]
  );

  return rows[0]?.id || null;
};

export const getMyPaymentInfo = async (req, res) => {
  try {
    const technicianId = await getTechnicianIdByUserId(req.user.id);

    if (!technicianId) {
      return res.status(404).json({ message: "Technician profile not found." });
    }

    const rows = await query(
      `
      SELECT *
      FROM technician_payment_info
      WHERE technician_id = ?
      LIMIT 1
      `,
      [technicianId]
    );

    return res.json(rows[0] || null);
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage || err.message });
  }
};

export const saveMyPaymentInfo = async (req, res) => {
  try {
    const technicianId = await getTechnicianIdByUserId(req.user.id);

    if (!technicianId) {
      return res.status(404).json({ message: "Technician profile not found." });
    }

    const {
      account_holder,
      wallet_name,
      wallet_number,
      mock_account_number,
    } = req.body;

    const existing = await query(
      `
      SELECT id
      FROM technician_payment_info
      WHERE technician_id = ?
      LIMIT 1
      `,
      [technicianId]
    );

    if (existing.length) {
      await query(
        `
        UPDATE technician_payment_info
        SET account_holder = ?,
            wallet_name = ?,
            wallet_number = ?,
            mock_account_number = ?
        WHERE technician_id = ?
        `,
        [
          account_holder || null,
          wallet_name || null,
          wallet_number || null,
          mock_account_number || null,
          technicianId,
        ]
      );
    } else {
      await query(
        `
        INSERT INTO technician_payment_info
        (technician_id, account_holder, wallet_name, wallet_number, mock_account_number)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          technicianId,
          account_holder || null,
          wallet_name || null,
          wallet_number || null,
          mock_account_number || null,
        ]
      );
    }

    return res.json({ message: "Payment info saved successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage || err.message });
  }
};

export const getMyBalance = async (req, res) => {
  try {
    const technicianId = await getTechnicianIdByUserId(req.user.id);

    if (!technicianId) {
      return res.status(404).json({ message: "Technician profile not found." });
    }

    const paymentInfoRows = await query(
      `
      SELECT *
      FROM technician_payment_info
      WHERE technician_id = ?
      LIMIT 1
      `,
      [technicianId]
    );

    const balanceRows = await query(
      `
      SELECT 
        COALESCE(SUM(amount), 0) AS total_earnings,
        COUNT(*) AS total_payments
      FROM payments
      WHERE technician_id = ?
        AND status = 'paid'
      `,
      [technicianId]
    );

    const lastRows = await query(
      `
      SELECT *
      FROM payments
      WHERE technician_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [technicianId]
    );

    return res.json({
      paymentInfo: paymentInfoRows[0] || null,
      totalEarnings: Number(balanceRows[0]?.total_earnings || 0),
      totalPayments: Number(balanceRows[0]?.total_payments || 0),
      lastTransaction: lastRows[0] || null,
    });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage || err.message });
  }
};

export const createPaymentIntent = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid amount is required.",
      });
    }

    return res.json({
      message: "Payment intent created successfully in demo mode.",
      clientSecret: `demo_client_secret_${Date.now()}`,
      amount,
      currency: "JOD",
      mode: "demo",
    });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage || err.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.body.request_id || req.body.requestId || req.body.id;
    const amount = Number(req.body.amount);

    if (!requestId) {
      return res.status(400).json({
        message: "Request id is required.",
      });
    }

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
      return res.status(404).json({
        message: "Request not found.",
      });
    }

    const request = rows[0];
    const finalAmount = amount || Number(request.total_price || 0);

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        message: "Valid amount is required.",
      });
    }

    const transactionId = `mock_txn_${Date.now()}`;

    await query(
      `
      INSERT INTO payments
      (request_id, user_id, technician_id, amount, transaction_id, status)
      VALUES (?, ?, ?, ?, ?, 'paid')
      `,
      [
        requestId,
        userId,
        request.technician_id,
        finalAmount,
        transactionId,
      ]
    );

    return res.json({
      message: "Payment confirmed successfully.",
      transactionId,
      amount: finalAmount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage || err.message });
  }
};