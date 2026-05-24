import express from "express";
import { getPublicServices } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getPublicServices);

export default router;