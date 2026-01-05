import express from "express";
import * as tech from "../controllers/technicianController.js";
const router = express.Router();
router.get("/service/:service", tech.getTechniciansByService);
router.get("/:id/availability", tech.getAvailability);


export default router;
