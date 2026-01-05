import db from "../database/connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// إعداد مرسل الإيميلات باستخدام بيانات من .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // إيميل المرسل (ثابت)
    pass: process.env.EMAIL_PASS    // App Password من جوجل
  }
});

export const register = async (req, res) => {
  const { name, email, phone, dob, city, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      if (result.length) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hash = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString("hex");

      db.query(
        // حذف التحقق من البريد مؤقتًا
        "INSERT INTO users (name, email, phone, dob, city, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, email, phone, dob, city, hash, role || "user"],
        async (err, result) => {
          if (err) return res.status(500).json({ message: "Database error", error: err });

          // تعليق إرسال الإيميل والتحقق
          /*
          const url = `http://localhost:3000/verify/${verificationToken}`;
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Verify Your Account",
              html: `<h3>Welcome ${name}!</h3><p>Please click <a href="${url}">here</a> to verify your email.</p>`
            });
            res.json({ message: "Registered successfully. Please check your email to verify account." });
          } catch (mailErr) {
            console.error("Email send failed:", mailErr.message);
            res.json({ message: "Registered successfully, but email not sent. Contact support." });
          }
          */

          // الرد المباشر بدون تحقق
          res.json({ message: "Registered successfully." });
        }
      );
    });
  } catch (error) {
  console.error("Unexpected error in register:", error);
  res.status(500).json({ message: "Server error", error });
}

};

/*// VERIFY EMAIL
export const verifyEmail = (req, res) => {
  const { token } = req.params;

  db.query("UPDATE users SET is_verified = TRUE WHERE verification_token = ?", [token], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (result.affectedRows === 0) return res.status(400).json({ message: "Invalid or expired token" });

    res.json({ message: "Email verified successfully. You can now login." });
  });
};*/

// LOGIN
export const login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (!result.length) return res.status(401).json({ message: "Email not found" });

    const user = result[0];

   // if (!user.is_verified) return res.status(403).json({ message: "Please verify your email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
  });
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(20).toString("hex");

  db.query("UPDATE users SET reset_token = ? WHERE email = ?", [token, email], async (err, result) => {
    if (err || result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    const url = `http://localhost:3000/reset-password/${token}`;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email, // إيميل المستخدم اللي طلب الاسترجاع
        subject: "Password Reset Request",
        html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`
      });
      res.json({ message: "Reset link sent to your email" });
    } catch (mailErr) {
      console.error("Reset email failed:", mailErr.message);
      res.json({ message: "Reset token generated, but email not sent. Contact support." });
    }
  });
};
