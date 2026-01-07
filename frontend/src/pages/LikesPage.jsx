import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { formatDate } from "../utils/functions";

const LikesPage = () => {
	const [likes, setLikes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const fetchLikes = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/users/likes", { credentials: "include" });
			const data = await res.json();
			if (!res.ok || data.error) {
				throw new Error(data.error || "Unable to load activity");
			}
			setLikes(data.likedBy || []);
		} catch (err) {
			setError(err.message);
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLikes();
	}, []);

	return (
		<div className='panel p-4 border-white/10'>
			<div className='flex items-center justify-between mb-3'>
				<div>
					<p className='text-[11px] uppercase tracking-[0.2em] text-white/50'>Peer feedback</p>
					<h3 className='text-lg font-semibold'>Developers who liked your profile</h3>
				</div>
				<span className='chip bg-white/5 border border-white/10 text-white/70'>{likes.length} received</span>
			</div>
			<div className='overflow-x-auto'>
				{loading ? (
					<div className='py-8 text-center text-white/60'>Loading activity…</div>
				) : error ? (
					<div className='py-8 text-center text-rose-200'>
						{error}
						<div className='mt-3'>
							<button className='btn-ghost text-sm' onClick={fetchLikes}>
								Retry
							</button>
						</div>
					</div>
				) : (
					<table className='w-full text-sm text-left bg-white/5 border border-white/10 rounded-lg overflow-hidden'>
						<thead className='bg-white/5 text-white/60 uppercase text-xs tracking-[0.2em]'>
							<tr>
								<th scope='col' className='px-4 py-3'>
									#
								</th>
								<th scope='col' className='px-4 py-3'>
									Username
								</th>
								<th scope='col' className='px-4 py-3'>
									Date
								</th>
								<th scope='col' className='px-4 py-3'>
									Action
								</th>
							</tr>
						</thead>
						<tbody>
							{likes.length > 0 ? (
								likes.map((user, idx) => (
									<tr className='border-t border-white/5 hover:bg-white/5 transition' key={user.username}>
										<td className='px-4 py-3 text-white/70'>{idx + 1}</td>
										<th scope='row' className='px-4 py-3 flex items-center gap-3 whitespace-nowrap '>
											<img className='w-10 h-10 rounded-full border border-white/10' src={user.avatarUrl} alt='User Avatar' />
											<div className='ps-1'>
												<div className='text-base font-semibold'>{user.username}</div>
											</div>
										</th>
										<td className='px-4 py-3 text-white/70'>{formatDate(user.likedDate)}</td>
										<td className='px-4 py-3'>
											<div className='inline-flex items-center gap-2 chip bg-rose-500/10 border border-rose-400/30 text-rose-100'>
												<FaHeart size={18} />
												Liked your profile
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="4" className='text-center py-6 text-white/60'>
										No likes yet.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default LikesPage;