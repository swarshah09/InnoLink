import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
	{
		conversationId: {
			type: String,
			required: true,
		},
		senderId: {
			type: String,
			required: true,
		},
		receiverId: {
			type: String,
			required: true,
		},
		text: {
			type: String,
			trim: true,
		},
		type: {
			type: String,
			default: "text",
		},
	},
	{ timestamps: true }
);

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;

