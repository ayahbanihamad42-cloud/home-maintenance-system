import express from "express";
import {
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
  updateUserPhoto,
} from "../controllers/userController.js";
import auth from "../utils/authMiddleware.js";

const router = express.Router();

router.get("/:id", auth, getUserProfile);
router.patch("/:id", auth, updateUserProfile);
router.patch("/:id/photo", auth, updateUserPhoto);
router.patch("/:id/password", auth, updateUserPassword);

export default router;