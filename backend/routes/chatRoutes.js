import express from "express";
import {
  sendMessage,
  getMessages,
  getConversations,
} from "../controllers/chatController.js";
import auth from "../utils/authMiddleware.js";

const router = express.Router();

router.get("/conversations", auth, getConversations);
router.get("/:userId", auth, getMessages);
router.post("/", auth, sendMessage);

export default router;