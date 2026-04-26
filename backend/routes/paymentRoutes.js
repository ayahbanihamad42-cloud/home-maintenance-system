import express from "express";
import { createMockPayment } from "../controllers/paymentController.js";
import auth from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/create-intent", auth, createMockPayment);

export default router;