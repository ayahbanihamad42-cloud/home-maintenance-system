// backend/controllers/authController.js
import db from "../database/connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

/**
 * Gmail SMTP transporter
 * لازم EMAIL_USER و EMAIL_PASS (App Password) في .env
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * REGISTER
 * role  (افتراضي user)
 */
export const register = async (req, res) => {
  const { name, email, phone, dob, city, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      if (rows.length) return res.status(400).json({ message: "Email already registered" });

      const hash = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name, email, phone, dob, city, password, role, is_verified) VALUES (?,?,?,?,?,?,?,TRUE)",
        [name, email, phone || null, dob || null, city || null, hash, role || "user"],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Database error", error: err2 });
          return res.json({ message: "Registered successfully." });
        }
      );
    });
  } catch (e) {
    console.error("register error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * LOGIN
 */
export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Missing email/password" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (!rows.length) return res.status(401).json({ message: "Email not found" });

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.reset_token;
    delete safeUser.reset_token_expiry;

    return res.json({ token, user: safeUser });
  });
};

/**
 * FORGOT PASSWORD
 */
export const forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  db.query("SELECT id, name, email FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    const user = rows[0];

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    db.query(
      "UPDATE users SET reset_token=?, reset_token_expiry=? WHERE id=?",
      [token, expiry, user.id],
      async (err2) => {
        if (err2) return res.status(500).json({ message: "Database error", error: err2 });

        const resetUrl = `http://localhost:3001/reset-password/${token}`;

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            html: `
              <p>Hello ${user.name || ""},</p>
              <p>Click the link below to reset your password (valid for 30 minutes):</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>If you didn’t request this, ignore this email.</p>
            `,
          });

          return res.json({ message: "Reset link sent to your email" });
        } catch (mailErr) {
          console.error("Reset email failed:", mailErr?.message || mailErr);
          // حتى لو الايميل فشل، التوكن موجود
          return res.status(500).json({
            message: "Reset token created but email failed. Check EMAIL_USER/EMAIL_PASS (App Password).",
          });
        }
      }
    );
  });
};

/**
 * RESET PASSWORD
 * endpoint: POST /api/auth/reset-password/:token
 * body: { password }
 */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) return res.status(400).json({ message: "Token is required" });
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  db.query(
    "SELECT id, reset_token_expiry FROM users WHERE reset_token = ?",
    [token],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      if (!rows.length) return res.status(400).json({ message: "Invalid token" });

      const user = rows[0];

      if (!user.reset_token_expiry) {
        return res.status(400).json({ message: "Token expiry missing" });
      }

      const isExpired = new Date(user.reset_token_expiry).getTime() < Date.now();
      if (isExpired) {
        return res.status(400).json({ message: "Token expired" });
      }

      const hash = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE users SET password=?, reset_token=NULL, reset_token_expiry=NULL WHERE id=?",
        [hash, user.id],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Database error", error: err2 });
          return res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
};
