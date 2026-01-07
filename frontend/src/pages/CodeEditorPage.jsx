import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { EDITOR_ACTIONS } from "../utils/editorActions";
import Spinner from "../components/Spinner";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";
import ChatPane from "../components/ChatPane";
import { SOCKET_URL } from "../config/env.js";

const CodeEditorPage = () => {
	const { roomId } = useParams();
	const navigate = useNavigate();
	const { authUser } = useAuthContext();
	const [clients, setClients] = useState([]);
	const [code, setCode] = useState("// Start collaborating...\n");
	const [typingUser, setTypingUser] = useState("");
	const [loading, setLoading] = useState(true);

	const socketRef = useRef(null);
	const editorRef = useRef(null);

	useEffect(() => {
		socketRef.current = io(SOCKET_URL, { withCredentials: true });
		const socket = socketRef.current;

		socket.on("connect_error", () => {
			toast.error("Socket connection failed");
		});

		socket.emit(EDITOR_ACTIONS.JOIN, { roomId, username: authUser?.username || "guest" });

		socket.on(EDITOR_ACTIONS.JOINED, ({ clients, socketId }) => {
			setClients(clients);
			// sync code to the newly joined client
			if (socket.id !== socketId) {
				socket.emit(EDITOR_ACTIONS.SYNC_CODE, { socketId, code });
			}
			setLoading(false);
		});

		socket.on(EDITOR_ACTIONS.CODE_CHANGE, ({ code }) => {
			if (code !== undefined) setCode(code);
		});

		socket.on(EDITOR_ACTIONS.TYPING, ({ username }) => {
			setTypingUser(username);
			setTimeout(() => setTypingUser(""), 1200);
		});

		socket.on(EDITOR_ACTIONS.DISCONNECTED, ({ socketId }) => {
			setClients((prev) => prev.filter((c) => c.socketId !== socketId));
		});

		return () => {
			socket.disconnect();
		};
	}, [roomId, authUser?.username, code]);

	const handleEditorDidMount = (editorInstance) => {
		editorRef.current = editorInstance;
		editorInstance.focus();
	};

	const onCodeChange = (value) => {
		const newValue = value ?? "";
		setCode(newValue);
		setCode(value);
		socketRef.current.emit(EDITOR_ACTIONS.CODE_CHANGE, { roomId, code: value });
		socketRef.current.emit(EDITOR_ACTIONS.TYPING, { roomId, username: authUser?.username || "guest" });
	};

	if (loading) {
		return (
			<div className='min-h-[60vh] flex items-center justify-center'>
				<Spinner />
			</div>
		);
	}

	return (
		<div className='panel p-4 border-white/10 space-y-4 min-h-[calc(100vh-160px)]'>
			<div className='flex items-center justify-between gap-3 flex-wrap'>
				<div>
					<p className='pill bg-cyan-500/10 text-cyan-100 border border-cyan-500/30 inline-flex'>Room {roomId}</p>
					<h2 className='text-xl font-semibold'>Realtime Code Review</h2>
					<p className='text-white/60 text-sm'>Live updates, typing indicators, and shared editing.</p>
				</div>
				<div className='flex items-center gap-2 flex-wrap'>
					<div className='chip bg-white/5 border border-white/10 text-white/70'>Editors: {clients.length}</div>
					<button className='btn-ghost text-sm' onClick={() => navigate("/code")}>
						Leave room
					</button>
				</div>
			</div>

			<div className='grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)] min-h-[500px]'>
				<div className='surface border-white/5 rounded-xl p-3 flex flex-col min-h-[500px]'>
					<p className='text-xs uppercase tracking-[0.2em] text-white/60 mb-2'>Participants</p>
					<div className='space-y-2 overflow-y-auto flex-1'>
						{clients.map((c) => (
							<div key={c.socketId} className='surface border-white/10 rounded-lg px-3 py-2 text-sm flex items-center gap-2'>
								<div className='h-2 w-2 rounded-full bg-emerald-400' />
								<span className='truncate'>{c.username}</span>
							</div>
						))}
						{clients.length === 0 && <p className='text-white/60 text-sm'>No other collaborators yet.</p>}
					</div>
					{typingUser && <p className='mt-3 text-xs text-emerald-200'>{typingUser} is typing…</p>}
				</div>

				<div className='surface border-white/5 rounded-xl p-3 min-h-[500px] flex flex-col'>
					<div className='flex items-center justify-between text-xs text-white/60 mb-2'>
						<span>Live editor</span>
						<span className='text-[10px] text-white/40'>Monaco powered</span>
					</div>
					<div className='flex-1 min-h-[400px] rounded-lg overflow-hidden border border-white/10 bg-black/60'>
						<Editor
							height='100%'
							defaultLanguage='javascript'
							theme='vs-dark'
							value={code}
							onChange={onCodeChange}
							onMount={handleEditorDidMount}
							options={{
								fontSize: 14,
								minimap: { enabled: false },
								scrollBeyondLastLine: false,
								automaticLayout: true,
								wordWrap: "on",
							}}
						/>
					</div>
				</div>
			</div>
			<ChatPane roomId={roomId} code={code} socketRef={socketRef} language='javascript' />
		</div>
	);
};

export default CodeEditorPage;

