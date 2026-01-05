import express from "express"; 
import * as chat from "../controllers/chatController.js";

const router = express.Router();
router.get("/:userId", chat.getMessages);
router.post("/", chat.sendMessage);

export default router;
