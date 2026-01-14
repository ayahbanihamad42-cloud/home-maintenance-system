import express from "express";
import * as notif from "../controllers/notificationController.js";
import auth from "../utils/authMiddleware.js";
// Create router for notification routes
const router = express.Router();

router.get("/", auth, notif.getUserNotifications);
router.get("/feed", auth, notif.getNotificationFeed);

router.put("/:id", auth, notif.markAsRead);

export default router;
