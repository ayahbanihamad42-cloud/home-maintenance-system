import express from "express";
import * as ctrl from "../controllers/maintenanceController.js";
import auth from "../utils/authMiddleware.js";

// Create router for maintenance routes
const router = express.Router();
// User
router.post("/", auth, ctrl.createRequest);
router.get("/my", auth, ctrl.getHistory);
router.get("/:id", auth, ctrl.getRequestById);
router.patch("/:id/status", auth, ctrl.updateRequestStatus);



export default router;
