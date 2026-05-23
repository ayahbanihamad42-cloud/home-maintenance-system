import express from "express";
import auth from "../utils/authMiddleware.js";
import {
  getMyPaymentInfo,
  saveMyPaymentInfo,
  getMyBalance,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/my-info", auth, getMyPaymentInfo);
router.post("/my-info", auth, saveMyPaymentInfo);
router.get("/my-balance", auth, getMyBalance);

export default router;