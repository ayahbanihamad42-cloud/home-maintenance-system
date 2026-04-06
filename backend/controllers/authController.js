import { db } from "../database/connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const register = async (req, res) => {
  const { name, email, phone, dob, city, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
      if (err) {
        console.error("register check error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (rows.length) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hash = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name, email, phone, dob, city, password, role) VALUES (?,?,?,?,?,?,?)",
        [name, email, phone || null, dob || null, city || null, hash, "user"],
        (insertErr) => {
          if (insertErr) {
            console.error("register insert error:", insertErr);
            return res.status(500).json({ message: "Server error" });
          }

          return res.json({ message: "Registered successfully." });
        }
      );
    });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) {
      console.error("login query error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        city: user.city,
        role: user.role,
      },
    });
  });
};

export const forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  db.query("SELECT id, name, email FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) {
      console.error("forgotPassword query error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!rows.length) {
      return res.json({ message: "If the email exists, a reset link has been sent." });
    }

    const user = rows[0];

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 30);

    db.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [hashedToken, expiry, user.id],
      async (updateErr) => {
        if (updateErr) {
          console.error("forgotPassword update error:", updateErr);
          return res.status(500).json({ message: "Server error" });
        }

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            html: `
              <p>Hello ${user.name || ""},</p>
              <p>Click the link below to reset your password:</p>
              <a href="${resetUrl}">${resetUrl}</a>
              <p>This link will expire in 30 minutes.</p>
            `,
          });

          return res.json({ message: "If the email exists, a reset link has been sent." });
        } catch (mailErr) {
          console.error("forgotPassword email error:", mailErr);
          return res.status(500).json({ message: "Server error" });
        }
      }
    );
  });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  db.query(
    "SELECT id, reset_token_expiry FROM users WHERE reset_token = ?",
    [hashedToken],
    async (err, rows) => {
      if (err) {
        console.error("resetPassword query error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!rows.length) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const user = rows[0];

      if (!user.reset_token_expiry || new Date(user.reset_token_expiry).getTime() < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const hash = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
        [hash, user.id],
        (updateErr) => {
          if (updateErr) {
            console.error("resetPassword update error:", updateErr);
            return res.status(500).json({ message: "Server error" });
          }

          return res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
};