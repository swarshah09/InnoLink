import { useState, useRef, useEffect } from "react";
import { IoPaperPlane, IoCodeWorking } from "react-icons/io5";
import { FaUser, FaRobot } from "react-icons/fa";

const ChatPane = ({ roomId, code, socketRef, language = "javascript" }) => {
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content: "👋 Hi! I'm your AI coding assistant. I can help you debug code, explain concepts, refactor, and more. What would you like help with?",
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);
	const codeRef = useRef(code);

	// Keep code ref updated so we always have the latest code
	useEffect(() => {
		codeRef.current = code || "";
	}, [code]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (!socketRef?.current) return;

		const socket = socketRef.current;

		// Listen for AI responses
		const handleAIResponse = (data) => {
			if (data.roomId === roomId) {
				if (data.type === "chunk") {
					setMessages((prev) => {
						const lastMsg = prev[prev.length - 1];
						if (lastMsg?.role === "assistant" && lastMsg?.streaming) {
							return [
								...prev.slice(0, -1),
								{
									...lastMsg,
									content: lastMsg.content + data.content,
								},
							];
						}
						return [
							...prev,
							{
								role: "assistant",
								content: data.content,
								streaming: true,
							},
						];
					});
				} else if (data.type === "complete") {
					setMessages((prev) => {
						const lastMsg = prev[prev.length - 1];
						if (lastMsg?.role === "assistant") {
							return [
								...prev.slice(0, -1),
								{
									...lastMsg,
									content: data.content || lastMsg.content,
									streaming: false,
								},
							];
						}
						return prev;
					});
					setIsLoading(false);
				} else if (data.type === "error") {
					setMessages((prev) => [
						...prev,
						{
							role: "assistant",
							content: `❌ Error: ${data.error}`,
							streaming: false,
						},
					]);
					setIsLoading(false);
				}
			}
		};

		socket.on("ai:response", handleAIResponse);

		return () => {
			socket.off("ai:response", handleAIResponse);
		};
	}, [socketRef, roomId]);

	const handleSend = () => {
		if (!input.trim() || isLoading || !socketRef?.current) return;

		const userMessage = input.trim();
		// Use ref to ensure we get the absolute latest code, even if prop hasn't updated yet
		const currentCode = codeRef.current || code || "";
		setInput("");
		setIsLoading(true);

		// Add user message
		setMessages((prev) => [
			...prev,
			{
				role: "user",
				content: userMessage,
			},
		]);

		// Send to backend with code context - ensure we're sending the current code
		socketRef.current.emit("ai:ask", {
			roomId,
			message: userMessage,
			codeSnapshot: currentCode,
			language,
		});

		// Focus input again
		setTimeout(() => inputRef.current?.focus(), 100);
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className='surface border-white/5 rounded-xl p-3 flex flex-col h-[400px] mt-4'>
			<div className='flex items-center gap-2 mb-3 pb-2 border-b border-white/10'>
				<IoCodeWorking className='text-cyan-400' size={18} />
				<p className='text-xs text-white/70 font-medium'>AI Coding Assistant</p>
				{code && code.length > 0 && (
					<span className='text-[10px] text-white/50 ml-2 px-2 py-0.5 bg-white/5 rounded'>
						{code.length} chars
					</span>
				)}
				{isLoading && (
					<div className='ml-auto flex items-center gap-1 text-xs text-cyan-400'>
						<div className='w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse' />
						<span>Thinking...</span>
					</div>
				)}
			</div>

			<div className='flex-1 overflow-y-auto space-y-4 mb-3 pr-2'>
				{messages.map((msg, idx) => (
					<div
						key={idx}
						className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
					>
						<div
							className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
								msg.role === "user"
									? "bg-cyan-500/20 text-cyan-300"
									: "bg-purple-500/20 text-purple-300"
							}`}
						>
							{msg.role === "user" ? <FaUser size={12} /> : <FaRobot size={14} />}
						</div>
						<div
							className={`flex-1 rounded-lg px-3 py-2 ${
								msg.role === "user"
									? "bg-cyan-500/10 border border-cyan-500/20"
									: "bg-white/5 border border-white/10"
							}`}
						>
							<div className='text-sm text-white/90 whitespace-pre-wrap break-words'>
								{msg.content}
								{msg.streaming && (
									<span className='inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse' />
								)}
							</div>
						</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			<div className='flex gap-2'>
				<input
					ref={inputRef}
					type='text'
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder='Ask about your code, request help, or get suggestions...'
					disabled={isLoading}
					className='flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50'
				/>
				<button
					onClick={handleSend}
					disabled={!input.trim() || isLoading}
					className='px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2 text-sm font-medium'
				>
					<IoPaperPlane size={16} />
					<span className='hidden sm:inline'>Send</span>
				</button>
			</div>
		</div>
	);
};

export default ChatPane;

