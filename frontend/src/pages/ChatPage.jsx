import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import { FaPaperPlane, FaCircle, FaVideo, FaPhoneAlt } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import toast from "react-hot-toast";
import { API_URL, SOCKET_URL } from "../config/env.js";

const api = async (path, options = {}) => {
	const fullPath = path.startsWith("http") ? path : `${API_URL}${path}`;
	const res = await fetch(fullPath, {
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		...options,
	});
	const data = await res.json();
	if (!res.ok || data?.error) throw new Error(data?.error || "Request failed");
	return data;
};

const ChatPage = () => {
	const { authUser } = useAuthContext();
	const [users, setUsers] = useState([]);
	const [filtered, setFiltered] = useState([]);
	const [search, setSearch] = useState("");
	const [selectedUser, setSelectedUser] = useState(null);
	const [conversationId, setConversationId] = useState(null);
	const [messages, setMessages] = useState([]);
	const [messageText, setMessageText] = useState("");
	const [loading, setLoading] = useState(true);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [callMode, setCallMode] = useState(null); // "voice" | "video"
	const [remoteRinging, setRemoteRinging] = useState(false);
	const [inCall, setInCall] = useState(false);
	const [remoteUser, setRemoteUser] = useState(null);
	const [incomingCall, setIncomingCall] = useState(null); // { from, mode }
	const [isMuted, setIsMuted] = useState(false);
	const [isCameraOff, setIsCameraOff] = useState(false);

	const socket = useMemo(() => io(SOCKET_URL, { withCredentials: true }), []);
	const pcRef = useRef(null);
	const localStreamRef = useRef(null);
	const remoteStreamRef = useRef(new MediaStream());
	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);
	const ringtoneRef = useRef(null);
	const RINGTONE_URL = "https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3";

	useEffect(() => {
		if (!authUser) return;
		(async () => {
			try {
				await api("/api/chat/me", {
					method: "POST",
					body: JSON.stringify({
						username: authUser.username,
						name: authUser.name,
						avatarUrl: authUser.avatarUrl,
					}),
				});
				const list = await api(`/api/chat/users?exclude=${authUser.username}`);
				setUsers(list);
				setFiltered(list);
				setLoading(false);
				socket.emit("join", authUser.username);
			} catch (error) {
				toast.error(error.message);
				setLoading(false);
			}
		})();
	}, [authUser, socket]);

	useEffect(() => {
		if (!search) {
			setFiltered(users);
		} else {
			const term = search.toLowerCase();
			setFiltered(users.filter((u) => u.username.toLowerCase().includes(term) || u.name?.toLowerCase().includes(term)));
		}
	}, [search, users]);

	useEffect(() => {
		socket.on("getMessage", (data) => {
			if (data?.conversationId === conversationId) {
				setMessages((prev) => [...prev, { ...data, createdAt: new Date().toISOString() }]);
			}
		});
		socket.on("call:offer", async ({ offer, from, mode }) => {
			setIncomingCall({ from, offer, mode });
			if (!ringtoneRef.current) {
				ringtoneRef.current = new Audio(RINGTONE_URL);
				ringtoneRef.current.loop = true;
			}
			try {
				await ringtoneRef.current.play();
			} catch (e) {
				// ignore autoplay rejection
			}
		});

		socket.on("call:answer", async ({ answer }) => {
			if (!pcRef.current) return;
			await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
			setInCall(true);
			setRemoteRinging(false);
		});

		socket.on("call:ice-candidate", async ({ candidate }) => {
			if (pcRef.current && candidate) {
				try {
					await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
				} catch (err) {
					console.error(err);
				}
			}
		});

		socket.on("call:end", () => {
			endCall(true);
		});

		return () => {
			socket.off("getMessage");
			socket.off("call:offer");
			socket.off("call:answer");
			socket.off("call:ice-candidate");
			socket.off("call:end");
		};
	}, [socket, conversationId, authUser?.username]);

	const selectUserHandler = async (user) => {
		setSelectedUser(user);
		setLoadingMessages(true);
		try {
			const convo = await api("/api/chat/conversation", {
				method: "POST",
				body: JSON.stringify({ senderId: authUser.username, receiverId: user.username }),
			});
			setConversationId(convo._id);
			const msgs = await api(`/api/chat/message/${convo._id}`);
			setMessages(msgs);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoadingMessages(false);
		}
	};

	const sendMessage = async () => {
		if (!messageText.trim() || !conversationId || !selectedUser) return;
		const payload = {
			conversationId,
			senderId: authUser.username,
			receiverId: selectedUser.username,
			text: messageText.trim(),
			type: "text",
		};
		setMessageText("");
		try {
			const saved = await api("/api/chat/message", {
				method: "POST",
				body: JSON.stringify(payload),
			});
			setMessages((prev) => [...prev, saved]);
			socket.emit("sendMessage", { ...payload, createdAt: saved.createdAt });
		} catch (error) {
			toast.error(error.message);
		}
	};

	const preparePeerConnection = async (mode = "voice") => {
		const constraints = mode === "video" ? { audio: true, video: true } : { audio: true, video: false };
		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		localStreamRef.current = stream;
		if (localVideoRef.current) {
			localVideoRef.current.srcObject = stream;
		}
		pcRef.current = new RTCPeerConnection({
			iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
		});
		stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
		pcRef.current.onicecandidate = (event) => {
			if (event.candidate && remoteUser) {
				socket.emit("call:ice-candidate", {
					to: remoteUser,
					from: authUser.username,
					candidate: event.candidate,
				});
			}
		};
		pcRef.current.ontrack = (event) => {
			event.streams[0].getTracks().forEach((t) => remoteStreamRef.current.addTrack(t));
			if (remoteVideoRef.current) {
				remoteVideoRef.current.srcObject = remoteStreamRef.current;
			}
		};
	};

	const startCall = async (mode) => {
		if (!selectedUser) return toast.error("Pick a teammate to start a call");
		try {
			setRemoteUser(selectedUser.username);
			setCallMode(mode);
			setRemoteRinging(true);
			await preparePeerConnection(mode);
			const offer = await pcRef.current.createOffer();
			await pcRef.current.setLocalDescription(offer);
			socket.emit("call:offer", {
				to: selectedUser.username,
				from: authUser.username,
				offer,
				mode,
			});
		} catch (error) {
			toast.error(error.message || "Call failed");
			endCall();
		}
	};

	const startVoiceCall = () => startCall("voice");
	const startVideoCall = () => startCall("video");

	const endCall = (remote = false) => {
		if (pcRef.current) {
			pcRef.current.close();
			pcRef.current = null;
		}
		if (localStreamRef.current) {
			localStreamRef.current.getTracks().forEach((t) => t.stop());
			localStreamRef.current = null;
		}
		remoteStreamRef.current = new MediaStream();
		if (localVideoRef.current) localVideoRef.current.srcObject = null;
		if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
		setInCall(false);
		setRemoteRinging(false);
		setCallMode(null);
		setIncomingCall(null);
		setIsMuted(false);
		setIsCameraOff(false);
		if (ringtoneRef.current) {
			ringtoneRef.current.pause();
			ringtoneRef.current.currentTime = 0;
		}
		if (!remote && remoteUser) {
			socket.emit("call:end", { to: remoteUser, from: authUser.username });
		}
	};

	const acceptCall = async () => {
		if (!incomingCall) return;
		const { from, offer, mode } = incomingCall;
		try {
			if (ringtoneRef.current) {
				ringtoneRef.current.pause();
				ringtoneRef.current.currentTime = 0;
			}
			setIncomingCall(null);
			setRemoteUser(from);
			setCallMode(mode || "voice");
			await preparePeerConnection(mode || "voice");
			await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
			const answer = await pcRef.current.createAnswer();
			await pcRef.current.setLocalDescription(answer);
			socket.emit("call:answer", { to: from, answer, from: authUser.username });
			setInCall(true);
		} catch (error) {
			toast.error(error.message || "Could not accept call");
			endCall();
		}
	};

	const declineCall = () => {
		if (ringtoneRef.current) {
			ringtoneRef.current.pause();
			ringtoneRef.current.currentTime = 0;
		}
		if (incomingCall?.from) {
			socket.emit("call:end", { to: incomingCall.from, from: authUser.username });
		}
		setIncomingCall(null);
	};

	const toggleMute = () => {
		if (!localStreamRef.current) return;
		localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
		setIsMuted((m) => !m);
	};

	const toggleCamera = () => {
		if (!localStreamRef.current) return;
		localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
		setIsCameraOff((c) => !c);
	};

	if (loading) {
		return (
			<div className='min-h-[60vh] flex items-center justify-center'>
				<Spinner />
			</div>
		);
	}

	return (
		<div className='panel p-4 border-white/10 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4 h-[calc(100vh-160px)]'>
			<div className='surface border-white/5 rounded-xl p-3 flex flex-col'>
				<div className='flex items-center gap-2 mb-3 px-1'>
					<IoSearch className='text-white/60' />
					<input
						className='bg-transparent w-full text-sm focus:outline-none placeholder:text-white/40'
						placeholder='Search teammates'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className='flex-1 overflow-y-auto space-y-2'>
					{filtered.map((u) => (
						<button
							key={u.username}
							className={`w-full text-left surface border border-white/5 rounded-lg px-3 py-2 flex items-center gap-3 hover:border-cyan-400/40 transition ${
								selectedUser?.username === u.username ? "border-cyan-400/60 bg-cyan-500/10" : ""
							}`}
							onClick={() => selectUserHandler(u)}
						>
							<img src={u.avatarUrl} alt='' className='h-10 w-10 rounded-full object-cover border border-white/10' />
							<div className='flex-1 min-w-0'>
								<p className='font-semibold truncate'>{u.name || u.username}</p>
								<p className='text-xs text-white/60 truncate'>@{u.username}</p>
							</div>
						</button>
					))}
					{filtered.length === 0 && <p className='text-center text-white/60 py-6'>No teammates found.</p>}
				</div>
			</div>

			<div className='surface border-white/5 rounded-xl flex flex-col h-full'>
				<div className='border-b border-white/5 px-4 py-3 flex items-center gap-3'>
					{selectedUser ? (
						<>
							<img src={selectedUser.avatarUrl} alt='' className='h-10 w-10 rounded-full border border-white/10' />
							<div className='flex-1'>
								<p className='font-semibold'>{selectedUser.name || selectedUser.username}</p>
								<p className='text-xs text-white/60'>@{selectedUser.username}</p>
							</div>
							<div className='chip bg-emerald-500/10 border border-emerald-400/30 text-emerald-100 text-xs'>
								<FaCircle className='text-emerald-300' size={8} /> Live
							</div>
							<div className='flex items-center gap-2'>
								<button
									type='button'
									className='btn-ghost text-xs h-10 px-3'
									onClick={startVoiceCall}
									title='Start voice call'
								>
									<FaPhoneAlt size={14} />
									Voice
								</button>
								<button
									type='button'
									className='btn-ghost text-xs h-10 px-3'
									onClick={startVideoCall}
									title='Start video call'
								>
									<FaVideo size={14} />
									Video
								</button>
								{(inCall || remoteRinging) && (
									<button type='button' className='btn-ghost text-xs h-10 px-3' onClick={() => endCall()}>
										End
									</button>
								)}
								{inCall && (
									<>
										<button type='button' className='btn-ghost text-xs h-10 px-3' onClick={toggleMute}>
											{isMuted ? "Unmute" : "Mute"}
										</button>
										{callMode === "video" && (
											<button type='button' className='btn-ghost text-xs h-10 px-3' onClick={toggleCamera}>
												{isCameraOff ? "Camera On" : "Camera Off"}
											</button>
										)}
									</>
								)}
							</div>
						</>
					) : (
						<p className='text-white/60 text-sm'>Select a teammate to start chatting.</p>
					)}
				</div>
				<div className='flex-1 overflow-y-auto px-4 py-3 space-y-3'>
					{loadingMessages && <p className='text-white/60 text-sm'>Loading messages…</p>}
					{!loadingMessages && selectedUser && messages.length === 0 && (
						<p className='text-white/60 text-sm'>No messages yet. Say hello 👋</p>
					)}
					{messages.map((msg) => {
						const isMine = msg.senderId === authUser.username;
						return (
							<div key={msg._id || msg.createdAt + msg.senderId} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
								<div
									className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
										isMine ? "bg-cyan-500/20 border border-cyan-400/30" : "bg-white/5 border border-white/10"
									}`}
								>
									<p className='text-white'>{msg.text}</p>
								</div>
							</div>
						);
					})}
				</div>
				{callMode && (
					<div className='border-t border-white/5 px-4 py-3 grid grid-cols-2 gap-3'>
						<div>
							<p className='text-xs text-white/60 mb-1'>You</p>
							{callMode === "video" ? (
								<video ref={localVideoRef} autoPlay muted playsInline className='w-full rounded-lg bg-black/40 h-32 object-cover' />
							) : (
								<div className='surface rounded-lg h-32 flex items-center justify-center text-white/70'>Voice call</div>
							)}
						</div>
						<div>
							<p className='text-xs text-white/60 mb-1'>{selectedUser?.name || selectedUser?.username || "Peer"}</p>
							{callMode === "video" ? (
								<video ref={remoteVideoRef} autoPlay playsInline className='w-full rounded-lg bg-black/40 h-32 object-cover' />
							) : (
								<div className='surface rounded-lg h-32 flex items-center justify-center text-white/70'>
									{remoteRinging ? "Ringing…" : inCall ? "Connected" : "Voice call"}
								</div>
							)}
						</div>
					</div>
				)}
				{incomingCall && (
					<div className='border-t border-emerald-500/40 bg-emerald-500/10 px-4 py-3 flex items-center gap-3'>
						<div className='flex-1'>
							<p className='font-semibold'>Incoming {incomingCall.mode === "video" ? "video" : "voice"} call</p>
							<p className='text-xs text-white/70'>From @{incomingCall.from}</p>
						</div>
						<div className='flex gap-2'>
							<button className='btn-primary h-10 px-3' onClick={acceptCall}>
								Accept
							</button>
							<button className='btn-ghost h-10 px-3' onClick={declineCall}>
								Decline
							</button>
						</div>
					</div>
				)}
				<div className='border-t border-white/5 px-4 py-3 flex items-center gap-2'>
					<input
						type='text'
						className='field flex-1 h-10'
						placeholder='Type a message'
						value={messageText}
						onChange={(e) => setMessageText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						}}
						disabled={!selectedUser}
					/>
					<button className='btn-primary h-10 px-3' onClick={sendMessage} disabled={!selectedUser}>
						<FaPaperPlane size={14} />
						Send
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChatPage;

