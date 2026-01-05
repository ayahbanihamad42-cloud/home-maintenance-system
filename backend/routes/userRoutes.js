import express from "express";
import { getUserProfile } from "../controllers/userController.js";
import auth from "../utils/authMiddleware.js";

const router = express.Router();

router.get("/:id", auth, getUserProfile);

export default router;