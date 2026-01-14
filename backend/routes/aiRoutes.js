import express from "express";
import * as aiController from "../controllers/aicontrollers.js";

const router = express.Router();

router.post("/chat", aiController.chatAI);

export default router;
