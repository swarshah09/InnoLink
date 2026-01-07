import { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CodeLobbyPage = () => {
	const navigate = useNavigate();
	const [roomId, setRoomId] = useState("");

	const createRoom = () => {
		const id = uuidV4();
		setRoomId(id);
		toast.success("Room created");
	};

	const copyRoom = async () => {
		if (!roomId.trim()) {
			toast.error("No room ID to copy");
			return;
		}
		try {
			await navigator.clipboard.writeText(roomId);
			toast.success("Room ID copied");
		} catch (error) {
			toast.error("Copy failed");
		}
	};

	const joinRoom = () => {
		if (!roomId.trim()) {
			toast.error("Room ID required");
			return;
		}
		navigate(`/code/${roomId}`);
	};

	return (
		<div className='min-h-[70vh] flex items-center justify-center px-4'>
			<div className='panel max-w-xl w-full p-6 border-white/10 space-y-5'>
				<div>
					<p className='pill bg-indigo-500/10 text-indigo-100 border border-indigo-500/30 inline-flex'>Live code rooms</p>
					<h1 className='text-2xl font-semibold mt-2'>Collaborative Editor</h1>
					<p className='text-white/70 text-sm'>
						Create a room and share the ID, or join an existing one to pair program with live cursors and code sync.
					</p>
				</div>
				<div className='space-y-3'>
					<div className='flex flex-col sm:flex-row gap-3'>
						<input
							type='text'
							className='field flex-1 h-12'
							placeholder='Enter room ID'
							value={roomId}
							onChange={(e) => setRoomId(e.target.value)}
						/>
						<div className='flex gap-2'>
							<button className='btn-primary h-12' onClick={joinRoom}>
								Join room
							</button>
							<button className='btn-ghost h-12 px-3' onClick={copyRoom}>
								Copy
							</button>
						</div>
					</div>
					<div className='flex items-center gap-2 text-white/60 text-sm'>
						<span>Need one?</span>
						<button className='btn-ghost text-sm px-2 py-1' onClick={createRoom}>
							Create room
						</button>
					</div>
				</div>
				<div className='surface border-white/5 rounded-lg p-4 text-sm text-white/70 space-y-1'>
					<p>How it works:</p>
					<ul className='list-disc list-inside space-y-1'>
						<li>Open or create a room ID.</li>
						<li>Share the ID; everyone sees edits instantly.</li>
						<li>Typing indicators and sync keep the code aligned.</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default CodeLobbyPage;

