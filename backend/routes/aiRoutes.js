import express from "express";
import * as aiController from "../controllers/aicontrollers.js";
const router = express.Router();
export const chatAI = async (req, res) => {
router.post("/ai-chat", aiController.chatAI);
router.get("/ai-chat", aiController.chatAI);
};
export default router;
