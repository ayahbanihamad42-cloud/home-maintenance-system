import express from "express";
import * as store from "../controllers/storeController.js";


const router = express.Router();
router.get("/", store.getStoresByService);
export default router;
