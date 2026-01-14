import express from "express";
import * as rating from "../controllers/ratingController.js";
import auth from "../utils/authMiddleware.js";
// Create router for rating routes
const router = express.Router();

router.post("/", auth, rating.addRating);
router.get("/request/:requestId", auth, rating.getRatingByRequest);
router.get("/technician/:technicianId", rating.getTechnicianRatings);

export default router;
