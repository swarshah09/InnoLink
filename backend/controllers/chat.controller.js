import ChatConversation from "../models/chatConversation.model.js";
import ChatMessage from "../models/chatMessage.model.js";
import User from "../models/user.model.js";

export const ensureChatUser = async (req, res) => {
	try {
		const { username, avatarUrl = "", name = "" } = req.body;
		if (!username) return res.status(400).json({ error: "username required" });
		const existing = await User.findOne({ username });
		if (!existing) {
			return res.status(404).json({ error: "user not found" });
		}
		return res.status(200).json({ ok: true });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

export const getChatUsers = async (req, res) => {
	try {
		const exclude = req.query.exclude;
		const query = exclude ? { username: { $ne: exclude } } : {};
		const users = await User.find(query).select("username name avatarUrl");
		return res.status(200).json(users);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

export const createOrGetConversation = async (req, res) => {
	try {
		const { senderId, receiverId } = req.body;
		if (!senderId || !receiverId) return res.status(400).json({ error: "senderId and receiverId required" });
		let conversation = await ChatConversation.findOne({ members: { $all: [senderId, receiverId] } });
		if (!conversation) {
			conversation = await ChatConversation.create({ members: [senderId, receiverId] });
		}
		return res.status(200).json(conversation);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

export const getConversation = async (req, res) => {
	try {
		const { senderId, receiverId } = req.body;
		const conversation = await ChatConversation.findOne({ members: { $all: [senderId, receiverId] } });
		if (!conversation) return res.status(404).json({ error: "conversation not found" });
		return res.status(200).json(conversation);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

export const addMessage = async (req, res) => {
	try {
		const { conversationId, senderId, receiverId, text, type = "text" } = req.body;
		if (!conversationId || !senderId || !receiverId) {
			return res.status(400).json({ error: "conversationId, senderId, receiverId required" });
		}
		const message = await ChatMessage.create({ conversationId, senderId, receiverId, text, type });
		await ChatConversation.findByIdAndUpdate(conversationId, { lastMessage: text });
		return res.status(200).json(message);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const messages = await ChatMessage.find({ conversationId }).sort({ createdAt: 1 });
		return res.status(200).json(messages);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

