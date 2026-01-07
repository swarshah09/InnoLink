import express from "express";
import {
	ensureChatUser,
	getChatUsers,
	getConversation,
	createOrGetConversation,
	addMessage,
	getMessages,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Ensure the current user exists as a chat participant
router.post("/me", ensureChatUser);
// List available chat users (optionally exclude current user via ?exclude=username)
router.get("/users", getChatUsers);

// Conversations
router.post("/conversation", createOrGetConversation);
router.post("/conversation/get", getConversation);

// Messages
router.post("/message", addMessage);
router.get("/message/:conversationId", getMessages);

export default router;

