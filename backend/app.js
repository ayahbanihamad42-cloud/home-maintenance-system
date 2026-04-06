import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// Create the Express app
const app = express();
app.use(express.json());
// Enable CORS for the frontend
app.use(cors({
  origin: function (origin, callback) {

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",

      // Expo 
      "exp://192.168.1.30:8081",

      // Expo web
      "http://localhost:8081"
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(null, false);
    }
  },
  credentials: true
}));

app.use("/api/auth", authRoutes);

app.use("/api/ai", aiRoutes);
// Maintenance request routes
app.use("/api/maintenance", maintenanceRoutes);
// Technician routes
app.use("/api/technicians", technicianRoutes);
// Chat routes
app.use("/api/chat", chatRoutes);
// Notification routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

export default app;
