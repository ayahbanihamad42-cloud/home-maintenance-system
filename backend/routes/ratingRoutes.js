import express from "express";
import * as  rating from "../controllers/ratingController.js";

const router = express.Router();
router.post("/", rating.addRating);
router.get("/technician/:id", rating.getTechnicianRatings);

export default router;
