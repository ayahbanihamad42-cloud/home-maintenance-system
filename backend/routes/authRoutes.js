import express from "express";
import { forgotPassword, login, register } from "../controllers/authController.js";
// Create router for auth routes
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgotPassword", forgotPassword);
export default router;
