import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8081",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "exp://192.168.1.27:8081",
      "exp://192.168.1.30:8081",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// IMPORTANT: your real service images are in backend/images/services
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Home Maintenance System API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Public service list for Home page
app.use("/api/services", serviceRoutes);

// Admin protected routes
app.use("/api/admin", adminRoutes);

app.use("/api/technicians", technicianRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("Global server error:", err);
  res.status(500).json({
    message: err.message || "Server error",
  });
});

export default app;