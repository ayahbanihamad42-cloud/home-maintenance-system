import express from "express";
import auth from "../utils/authMiddleware.js";

import {
  createMaintenanceRequest,
  getUserMaintenanceRequests,
  getMyMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequestStatus,
  cancelMaintenanceRequest,
  confirmOnlinePayment,
} from "../controllers/maintenanceController.js";

const router = express.Router();

router.post("/", auth, createMaintenanceRequest);

router.get("/my", auth, getMyMaintenanceRequests);
router.get("/user/:user_id", auth, getUserMaintenanceRequests);
router.get("/:id", auth, getMaintenanceRequestById);

router.put("/:id/status", auth, updateMaintenanceRequestStatus);
router.delete("/:id", auth, cancelMaintenanceRequest);
router.post("/:id/online-payment", auth, confirmOnlinePayment);

export default router;