import express from "express";
import { forgotPassword, login, register, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgotPassword", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
