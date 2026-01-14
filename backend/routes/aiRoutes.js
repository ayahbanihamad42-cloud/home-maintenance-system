import express from "express";
import * as aiController from "../controllers/aicontrollers.js";

// Create router for AI routes
const router = express.Router();
// Send a message to the AI model
router.post("/chat", aiController.chatAI);

export default router;
