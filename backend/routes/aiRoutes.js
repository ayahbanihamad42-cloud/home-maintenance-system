import express from "express";
import { chatAI, getAIResponses } from "../controllers/aicontrollers.js";
import auth from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/chat", auth, chatAI);
router.get("/:userId", auth, getAIResponses);

export default router;