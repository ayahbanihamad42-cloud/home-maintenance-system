import express from "express";
import * as store from "../controllers/storeController.js";

// Create router for store routes
const router = express.Router();
// Fetch stores by service
router.get("/", store.getStoresByService);
export default router;
