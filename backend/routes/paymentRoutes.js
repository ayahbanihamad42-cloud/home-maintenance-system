import express from "express";
import auth from "../utils/authMiddleware.js";
import {
  getMyPaymentInfo,
  saveMyPaymentInfo,
  getMyBalance,
  createPaymentIntent,
  confirmPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.use(auth);

router.get("/my-info", getMyPaymentInfo);
router.post("/my-info", saveMyPaymentInfo);
router.get("/my-balance", getMyBalance);
router.post("/create-intent", createPaymentIntent);
router.post("/confirm", confirmPayment);

export default router;