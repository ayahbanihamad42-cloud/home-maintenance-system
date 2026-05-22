import { db } from "../database/connection.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const sendProfileUpdateEmail = async (to, data) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email env missing. Skipping real email send.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Maintenance System" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Profile Updated Successfully",
    html: `
      <h2>Your profile was updated successfully</h2>
      <p><b>Email:</b> ${data.email || "-"}</p>
      <p><b>Phone:</b> ${data.phone || "-"}</p>
      <p><b>City:</b> ${data.city || "-"}</p>
      <p><b>Birth Date:</b> ${data.dob || "-"}</p>
    `,
  });
};

export const getUserProfile = (req, res) => {
  const { id } = req.params;

  if (Number(req.user.id) !== Number(id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  db.query(
    "SELECT id, name, email, phone, city, dob, role FROM users WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("getUserProfile error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!rows.length) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(rows[0]);
    }
  );
};

export const updateUserPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (Number(id) !== Number(req.user.id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query("UPDATE users SET password = ? WHERE id = ?", [hash, id], (err, result) => {
      if (err) {
        console.error("updateUserPassword error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!result.affectedRows) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Password updated" });
    });
  } catch (error) {
    console.error("updateUserPassword exception:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserProfile = (req, res) => {
  const { id } = req.params;
  const { email, phone, city, dob } = req.body;

  if (Number(id) !== Number(req.user.id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  db.query("SELECT id FROM users WHERE email = ? AND id != ?", [email, id], (checkErr, rows) => {
    if (checkErr) {
      console.error("updateUserProfile check error:", checkErr);
      return res.status(500).json({ message: "Server error" });
    }

    if (rows.length) {
      return res.status(400).json({ message: "Email already in use." });
    }

    db.query(
      "UPDATE users SET email = ?, phone = ?, city = ?, dob = ? WHERE id = ?",
      [email, phone || null, city || null, dob || null, id],
      async (err, result) => {
        if (err) {
          console.error("updateUserProfile update error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        if (!result.affectedRows) {
          return res.status(404).json({ message: "User not found" });
        }

        try {
          await sendProfileUpdateEmail(email, { email, phone, city, dob });
        } catch (mailErr) {
          console.error("profile email send error:", mailErr);
        }

        res.json({
          message: "Profile updated successfully. Email sent with updated information.",
        });
      }
    );
  });
};

export const updateUserPhoto = (req, res) => {
  const { id } = req.params;
  const { profile_image } = req.body;

  if (Number(id) !== Number(req.user.id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  db.query(
    "UPDATE users SET profile_image = ? WHERE id = ?",
    [profile_image || null, id],
    (err, result) => {
      if (err) {
        console.error("updateUserPhoto error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!result.affectedRows) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Profile photo updated" });
    }
  );
};