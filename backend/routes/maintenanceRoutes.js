import express from "express";
import auth from "../utils/authMiddleware.js";

import {
  createMaintenanceRequest,
  getUserMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequestStatus,
  cancelMaintenanceRequest,
  confirmOnlinePayment,
} from "../controllers/maintenanceController.js";

const router = express.Router();

router.post("/", auth, createMaintenanceRequest);

router.get("/my", auth, (req, res) => {
  req.params.user_id = req.user.id;
  return getUserMaintenanceRequests(req, res);
});

router.get("/user/:user_id", auth, getUserMaintenanceRequests);

router.get("/:id", auth, getMaintenanceRequestById);

router.put("/:id/status", auth, updateMaintenanceRequestStatus);

router.post("/:id/online-payment", auth, confirmOnlinePayment);

router.delete("/:id", auth, cancelMaintenanceRequest);

export default router;