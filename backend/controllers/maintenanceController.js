import { db } from "../database/connection.js";

export const createRequest = (req, res) => {
  const {
    technician_id,
    description,
    scheduled_date,
    scheduled_time,
    city = null,
    service,
    location_note = null
  } = req.body;

  const qWithLocation = `
    INSERT INTO maintenance_requests
    (user_id, technician_id, description, scheduled_date, scheduled_time, city, service, location_note)
    VALUES (?,?,?,?,?,?,?,?)
  `;

  const qWithoutLocation = `
    INSERT INTO maintenance_requests
    (user_id, technician_id, description, scheduled_date, scheduled_time, city, service)
    VALUES (?,?,?,?,?,?,?)
  `;

  const finalizeRequest = (result) => {
    db.query(
      "UPDATE technician_availability SET is_booked = TRUE WHERE technician_id = ? AND available_date = ? AND start_time = ?",
      [technician_id, scheduled_date, scheduled_time],
      () => {}
    );

    res.json({ message: "Request created", id: result.insertId });
  };

  db.query(
    qWithLocation,
    [req.user.id, technician_id, description, scheduled_date, scheduled_time, city, service, location_note],
    (err, result) => {
      if (err && err.code === "ER_BAD_FIELD_ERROR") {
        return db.query(
          qWithoutLocation,
          [req.user.id, technician_id, description, scheduled_date, scheduled_time, city, service],
          (fallbackErr, fallbackResult) => {
            if (fallbackErr) {
              console.error("createRequest fallback error:", fallbackErr);
              return res.status(500).json({ message: "Server error" });
            }

            return finalizeRequest(fallbackResult);
          }
        );
      }

      if (err) {
        console.error("createRequest error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      finalizeRequest(result);
    }
  );
};

export const getHistory = (req, res) => {
  db.query(
    "SELECT * FROM maintenance_requests WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error("getHistory error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json(rows || []);
    }
  );
};

export const getRequestById = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM maintenance_requests WHERE id = ? AND user_id = ?",
    [id, req.user.id],
    (err, rows) => {
      if (err) {
        console.error("getRequestById error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!rows.length) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(rows[0]);
    }
  );
};

export const updateRequestStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query("SELECT * FROM maintenance_requests WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("updateRequestStatus select error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!rows.length) {
      return res.status(404).json({ message: "Request not found" });
    }

    const request = rows[0];
    const isOwner = Number(request.user_id) === Number(req.user.id);
    const isAdmin = req.user.role === "admin";

    const checkTechnician = (callback) => {
      if (req.user.role !== "technician") {
        return callback(false);
      }

      db.query(
        "SELECT id FROM technicians WHERE user_id = ?",
        [req.user.id],
        (techErr, techRows) => {
          if (techErr) {
            console.error("updateRequestStatus technician lookup error:", techErr);
            return res.status(500).json({ message: "Server error" });
          }

          const isAssignedTech =
            techRows.length > 0 &&
            Number(techRows[0].id) === Number(request.technician_id);

          callback(isAssignedTech);
        }
      );
    };

    checkTechnician((isAssignedTech) => {
      if (!isOwner && !isAdmin && !isAssignedTech) {
        return res.status(403).json({ message: "Not authorized" });
      }

      db.query(
        "UPDATE maintenance_requests SET status = ? WHERE id = ?",
        [status, id],
        (updateErr, result) => {
          if (updateErr) {
            console.error("updateRequestStatus update error:", updateErr);
            return res.status(500).json({ message: "Server error" });
          }

          if (!result.affectedRows) {
            return res.status(404).json({ message: "Request not found" });
          }

          res.json({ message: "Status updated" });
        }
      );
    });
  });
};   