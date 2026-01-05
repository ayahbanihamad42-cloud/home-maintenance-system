import express from "express";
import * as ctrl from "../controllers/maintenanceController.js";
import auth from "../utils/authMiddleware.js";

const router = express.Router();
// User
router.post("/", auth, ctrl.createRequest);
router.get("/my", auth, ctrl.getHistory);



export default router;
