import express from "express";
import * as tech from "../controllers/technicianController.js";
import auth from "../utils/authMiddleware.js";
// Create router for technician routes
const router = express.Router();
router.get("/service/:service", tech.getTechniciansByService);
router.get("/user/:userId", tech.getTechnicianByUserId);
router.get("/:id/availability", tech.getAvailability);
// Create or update technician availability
router.post("/availability", auth, tech.createAvailability);
router.get("/:id", tech.getTechnicianProfile);
router.get("/:id/requests", auth, tech.getTechnicianRequests);


export default router;
