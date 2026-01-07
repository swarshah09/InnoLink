import { MdLogout } from "react-icons/md";
import { API_URL } from "../config/env.js";
import { useAuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";
// TODO Implement Logout functionality

const Logout = () => {
	const { authUser, setAuthUser } = useAuthContext();

	const handleLogout = async () => {
		try {
			const res = await fetch(`${API_URL}/api/auth/logout`, { credentials: "include" });
			const data = await res.json();
			if (!res.ok || data?.error) {
				throw new Error(data?.error || "Logout failed");
			}
			setAuthUser(null);
			toast.success("Logged out");
		} catch (error) {
			toast.error(error.message);
		}
	};

	const avatar = authUser?.avatarUrl || authUser?.avatar_url;

	return (
		<div className='panel flex items-center gap-3 px-3 py-2 border-white/10'>
			<div className='h-10 w-10 rounded-full border border-white/10 overflow-hidden bg-white/5'>
				{avatar ? (
					<img src={avatar} alt='Avatar' className='h-full w-full object-cover' />
				) : (
					<div className='h-full w-full flex items-center justify-center text-xs text-white/70'>User</div>
				)}
			</div>
			<div className='hidden sm:block'>
				<p className='text-sm font-semibold'>{authUser?.name || "Signed in"}</p>
				<p className='text-xs text-white/60'>{authUser?.username || authUser?.login || "Collaborator"}</p>
			</div>
			<button
				className='ml-auto inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs hover:border-rose-400/60 hover:bg-rose-500/10 transition'
				onClick={handleLogout}
			>
				<MdLogout size={16} />
				Logout
			</button>
		</div>
	);
};

export default Logout;
