import express from "express";
import { chatAI, getAIResponses } from "../controllers/aicontrollers.js";

const router = express.Router();

router.post("/chat", chatAI);
router.get("/:userId", getAIResponses);

export default router;