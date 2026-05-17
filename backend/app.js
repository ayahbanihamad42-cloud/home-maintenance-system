import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8081",
      "exp://192.168.1.27:8081",
      "http://192.168.1.27:8081",
    ],
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve service images from: backend/images/services
// URL example: http://192.168.1.27:5000/images/services/plumbing.png
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Home Maintenance API is running");
});

export default app;