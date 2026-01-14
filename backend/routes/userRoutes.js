import express from "express";
import { getUserProfile, updateUserPassword, updateUserProfile } from "../controllers/userController.js";
import auth from "../utils/authMiddleware.js";
// Create router for user routes
const router = express.Router();
// Fetch user profile
router.get("/:id", auth, getUserProfile);
// Update user profile data
router.patch("/:id", auth, updateUserProfile);
// Update password
router.patch("/:id/password", auth, updateUserPassword);

export default router;
