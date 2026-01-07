import mongoose from "mongoose";

const chatConversationSchema = new mongoose.Schema(
	{
		members: {
			type: [String],
			required: true,
		},
		lastMessage: {
			type: String,
		},
	},
	{ timestamps: true }
);

const ChatConversation = mongoose.model("ChatConversation", chatConversationSchema);

export default ChatConversation;

