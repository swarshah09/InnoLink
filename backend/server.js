import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
// import path from "path";

// Terminal PTY support - dynamic load with graceful fallback
let pty = null;
let ptyAvailable = false;
let ptyInitError = null;

// Initialize PTY module
const initPTY = async () => {
	try {
		const ptyModule = await import("@homebridge/node-pty-prebuilt-multiarch");
		pty = ptyModule.default || ptyModule;
		
		// Test that PTY actually works by checking if spawn exists
		if (!pty || typeof pty.spawn !== 'function') {
			throw new Error("PTY module loaded but spawn function not available");
		}
		
		ptyAvailable = true;
		console.log("✅ Terminal PTY support enabled");
		return true;
	} catch (error) {
		ptyInitError = error;
		console.warn("⚠️  Terminal PTY support disabled:", error.message);
		if (error.stack) {
			console.warn("Full error:", error.stack);
		}
		return false;
	}
};

import "./passport/github.auth.js";

import userRoutes from "./routes/user.route.js";
import exploreRoutes from "./routes/explore.route.js";
import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
// const __dirname = path.resolve();

app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration - allow frontend origin from environment variable
const allowedOrigins = [
	process.env.CLIENT_BASE_URL,
	"http://localhost:3000", // Dev fallback
].filter(Boolean);

// Log allowed origins on startup for debugging
console.log("CORS Configuration:");
console.log("CLIENT_BASE_URL:", process.env.CLIENT_BASE_URL);
console.log("Allowed origins:", allowedOrigins);

// Normalize origins (remove trailing slashes and convert to lowercase for comparison)
const normalizedOrigins = allowedOrigins.map(origin => origin.replace(/\/$/, '').toLowerCase());

// Helper function to check if origin is allowed
const isOriginAllowed = (origin) => {
	if (!origin) return true; // Allow requests with no origin
	
	const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();
	
	// Check exact match
	if (normalizedOrigins.includes(normalizedOrigin)) {
		return true;
	}
	
	// Check if any allowed origin matches (handles subdomains)
	for (const allowed of normalizedOrigins) {
		if (normalizedOrigin === allowed || normalizedOrigin.endsWith(allowed)) {
			return true;
		}
	}
	
	return false;
};

app.use(
	cors({
		origin: (origin, callback) => {
			if (isOriginAllowed(origin)) {
				callback(null, true);
			} else {
				// Log for debugging
				console.log(`CORS: Rejected origin: ${origin}`);
				console.log(`CORS: Allowed origins: ${normalizedOrigins.join(', ')}`);
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// socket.io for realtime chat + editor + terminal
const io = new SocketIOServer(server, {
	cors: {
		origin: (origin, callback) => {
			if (isOriginAllowed(origin)) {
				callback(null, true);
			} else {
				console.log(`Socket.IO CORS: Rejected origin: ${origin}`);
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ['GET', 'POST'],
	},
});

let onlineUsers = [];
const addUser = (userId, socketId) => {
	if (!onlineUsers.some((u) => u.userId === userId)) {
		onlineUsers.push({ userId, socketId });
	}
};
const removeUser = (socketId) => {
	onlineUsers = onlineUsers.filter((u) => u.socketId !== socketId);
};
const getUser = (userId) => onlineUsers.find((u) => u.userId === userId);

// Realtime code editor maps
const codeUserSocketMap = {};
const codeRoomCreation = {};
const CODE_ACTIONS = {
	JOIN: "code:join",
	JOINED: "code:joined",
	DISCONNECTED: "code:disconnected",
	CODE_CHANGE: "code:change",
	SYNC_CODE: "code:sync",
	TYPING: "code:typing",
};

const getCodeRoomClients = (roomId) => {
	return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
		socketId,
		username: codeUserSocketMap[socketId],
	}));
};

// Terminal PTY sessions - room-based
const terminals = new Map(); // roomId -> { term: pty, sessionId: string, attachedSockets: Set<string> }
const terminalSessionMap = new Map(); // sessionId -> roomId

const createTerminal = () => {
	if (!pty || !ptyAvailable) {
		throw new Error("PTY module not available");
	}
	const shell = process.platform === "win32" ? "powershell.exe" : "bash";
	return pty.spawn(shell, [], {
		name: "xterm-color",
		cols: 80,
		rows: 24,
		cwd: process.cwd(),
		env: process.env,
	});
};

// REST endpoint to create or get a terminal session for a room
app.post("/api/terminal/session", async (req, res) => {
	// Try to initialize PTY if not already available
	if (!ptyAvailable) {
		await initPTY();
	}
	
	if (!ptyAvailable) {
		const errorMsg = ptyInitError 
			? `Terminal support not available: ${ptyInitError.message}` 
			: "Terminal support not available. The PTY module failed to load.";
		return res.status(503).json({ 
			error: errorMsg,
			details: ptyInitError?.message || "PTY module initialization failed"
		});
	}
	try {
		const { roomId } = req.body;
		if (!roomId) {
			return res.status(400).json({ error: "roomId is required" });
		}

		// Check if terminal already exists for this room
		let terminalData = terminals.get(roomId);
		if (!terminalData) {
			// Create new terminal for this room
			const term = createTerminal();
			const sessionId = `room-${roomId}-${Date.now().toString(36)}`;
			terminalData = {
				term,
				sessionId,
				attachedSockets: new Set(),
			};
			terminals.set(roomId, terminalData);
			terminalSessionMap.set(sessionId, roomId);
			console.log(`✅ Created terminal session ${sessionId} for room ${roomId}`);
		}

		res.json({ sessionId: terminalData.sessionId });
	} catch (error) {
		console.error("Failed to create terminal", error);
		res.status(500).json({ error: "Failed to create terminal session" });
	}
});

io.on("connection", (socket) => {
	socket.on("join", (userId) => {
		if (userId) {
			addUser(userId, socket.id);
			io.emit("onlineUsers", onlineUsers);
		}
	});

	socket.on("sendMessage", (data) => {
		const { receiverId } = data || {};
		const user = getUser(receiverId);
		if (user) {
			io.to(user.socketId).emit("getMessage", data);
		}
	});

	// WebRTC signaling
	socket.on("call:offer", ({ to, offer, from, mode }) => {
		const user = getUser(to);
		if (user) {
			io.to(user.socketId).emit("call:offer", { offer, from, mode });
		}
	});

	socket.on("call:answer", ({ to, answer, from }) => {
		const user = getUser(to);
		if (user) {
			io.to(user.socketId).emit("call:answer", { answer, from });
		}
	});

	socket.on("call:ice-candidate", ({ to, candidate, from }) => {
		const user = getUser(to);
		if (user) {
			io.to(user.socketId).emit("call:ice-candidate", { candidate, from });
		}
	});

	socket.on("call:end", ({ to, from }) => {
		const user = getUser(to);
		if (user) {
			io.to(user.socketId).emit("call:end", { from });
		}
	});

	socket.on("disconnect", () => {
		removeUser(socket.id);
		io.emit("onlineUsers", onlineUsers);
	});

	// Realtime code editor events
	socket.on(CODE_ACTIONS.JOIN, ({ roomId, username }) => {
		if (!roomId || !username) return;
		codeUserSocketMap[socket.id] = username;
		socket.join(roomId);

		if (!codeRoomCreation[roomId]) {
			codeRoomCreation[roomId] = new Date().toISOString();
		}

		const clients = getCodeRoomClients(roomId);
		clients.forEach(({ socketId }) => {
			io.to(socketId).emit(CODE_ACTIONS.JOINED, {
				clients,
				username,
				socketId: socket.id,
				roomCreationTime: codeRoomCreation[roomId],
			});
		});
	});

	socket.on(CODE_ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
		socket.to(roomId).emit(CODE_ACTIONS.CODE_CHANGE, { code });
	});

	socket.on(CODE_ACTIONS.SYNC_CODE, ({ socketId, code }) => {
		io.to(socketId).emit(CODE_ACTIONS.CODE_CHANGE, { code });
	});

	socket.on(CODE_ACTIONS.TYPING, ({ roomId, username }) => {
		socket.to(roomId).emit(CODE_ACTIONS.TYPING, { username });
	});

	// AI Chat Assistant (Google Gemini - Free Tier)
	socket.on("ai:ask", async ({ roomId, message, codeSnapshot, language }) => {
		try {

			// Import AI modules dynamically
			const { processAIRequest } = await import("./ai/orchestrator.js");
			const { createChatCompletionStream } = await import("./ai/openai.js");
			
			// Get system and user prompts from orchestrator
			const agentType = (await import("./ai/orchestrator.js")).routeAgent(message);
			let systemPrompt, userPrompt;

			// Build concise prompts based on agent type - optimized for speed
			if (agentType === "debugger") {
				systemPrompt = `You're a debugging expert. Be brief and direct.`;
				userPrompt = codeSnapshot
					? `Code:\n\`\`\`${language}\n${codeSnapshot}\n\`\`\`\n\nIssue: ${message}\nFix:`
					: `Issue: ${message}\nHelp:`;
			} else if (agentType === "explainer") {
				systemPrompt = `You're a code educator. Be concise.`;
				userPrompt = codeSnapshot
					? `Code:\n\`\`\`${language}\n${codeSnapshot}\n\`\`\`\n\n${message}`
					: `${message}`;
			} else if (agentType === "refactor") {
				systemPrompt = `You're a refactoring expert. Be brief.`;
				userPrompt = codeSnapshot
					? `Code:\n\`\`\`${language}\n${codeSnapshot}\n\`\`\`\n\n${message}`
					: `Need code to refactor.`;
			} else {
				systemPrompt = `You're an expert programmer. Be concise and helpful.`;
				userPrompt = codeSnapshot
					? `Code:\n\`\`\`${language}\n${codeSnapshot}\n\`\`\`\n\n${message}`
					: `${message}`;
			}

			// Stream response to all clients in the room
			const stream = createChatCompletionStream({ systemPrompt, userPrompt });
			
			for await (const chunk of stream) {
				io.to(roomId).emit("ai:response", {
					roomId,
					type: "chunk",
					content: chunk,
				});
			}

			// Send completion signal
			io.to(roomId).emit("ai:response", {
				roomId,
				type: "complete",
			});
		} catch (error) {
			console.error("AI Chat Error:", error);
			
			// Send error to all clients in the room
			io.to(roomId).emit("ai:response", {
				roomId,
				type: "error",
				error: error.message || "Failed to get AI response. Please try again.",
			});
		}
	});

	socket.on("disconnecting", () => {
		const rooms = [...socket.rooms];
		rooms.forEach((roomId) => {
			socket.to(roomId).emit(CODE_ACTIONS.DISCONNECTED, {
				socketId: socket.id,
				username: codeUserSocketMap[socket.id],
			});
		});
	});

	socket.on("disconnect", () => {
		delete codeUserSocketMap[socket.id];
	});
});

// Terminal namespace - enabled when PTY is available
const termIo = io.of("/terminal");
const terminalSockets = new Map(); // socketId -> socket object

termIo.on("connection", (socket) => {
	// Track this socket
	terminalSockets.set(socket.id, socket);
	
	if (!ptyAvailable) {
		socket.emit("term:error", "Terminal support not available");
		return;
	}

	let term = null;
	let currentRoomId = null;

	socket.on("term:attach", ({ sessionId }) => {
		// Find room by sessionId
		const roomId = terminalSessionMap.get(sessionId);
		if (!roomId) {
			socket.emit("term:error", "Invalid terminal session");
			return;
		}

		const terminalData = terminals.get(roomId);
		if (!terminalData || !terminalData.term) {
			socket.emit("term:error", "Terminal session expired");
			return;
		}

		term = terminalData.term;
		currentRoomId = roomId;
		
		// Track this socket as attached to this terminal
		terminalData.attachedSockets.add(socket.id);
		console.log(`🔗 Socket ${socket.id} attached to terminal for room ${roomId} (${terminalData.attachedSockets.size} total)`);

		// Set up data handler if not already set up
		if (!terminalData.dataHandler) {
			terminalData.dataHandler = (data) => {
				// Broadcast output to all attached sockets
				terminalData.attachedSockets.forEach((socketId) => {
					const clientSocket = terminalSockets.get(socketId);
					if (clientSocket && clientSocket.connected) {
						clientSocket.emit("term:output", data);
					}
				});
			};
			term.onData(terminalData.dataHandler);
		}

		socket.emit("term:attached", { sessionId });
	});

	socket.on("term:input", (data) => {
		if (term) {
			term.write(data);
		}
	});

	socket.on("term:resize", ({ cols, rows }) => {
		if (term && cols && rows) {
			term.resize(cols, rows);
		}
	});

	socket.on("disconnect", () => {
		// Remove socket from tracking
		terminalSockets.delete(socket.id);
		
		if (currentRoomId) {
			const terminalData = terminals.get(currentRoomId);
			if (terminalData) {
				terminalData.attachedSockets.delete(socket.id);
				console.log(`🔌 Socket ${socket.id} detached from terminal for room ${currentRoomId} (${terminalData.attachedSockets.size} remaining)`);

				// Only kill terminal if no sockets are attached
				if (terminalData.attachedSockets.size === 0) {
					try {
						terminalData.term.kill();
					} catch (e) {
						// ignore
					}
					terminals.delete(currentRoomId);
					terminalSessionMap.delete(terminalData.sessionId);
					console.log(`🗑️  Terminated terminal session for room ${currentRoomId} (no active connections)`);
				}
			}
		}
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/chat", chatRoutes);

// Initialize PTY and start server
(async () => {
	// Initialize PTY before starting server
	await initPTY();
	
	server.listen(PORT, () => {
		console.log(`Server started on http://localhost:${PORT}`);
		if (ptyAvailable) {
			console.log("✅ Terminal feature is available");
		} else {
			console.log("⚠️  Terminal feature is disabled (other features will work normally)");
		}
		connectMongoDB();
	});
})();
