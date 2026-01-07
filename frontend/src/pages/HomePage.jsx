import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import ProfileInfo from "../components/ProfileInfo";
import Repos from "../components/Repos";
import Spinner from "../components/Spinner";
import { API_URL } from "../config/env.js";

const HomePage = () => {
	const { authUser } = useAuthContext();
	const [userProfile, setUserProfile] = useState(null);
	const [repos, setRepos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [sortType, setSortType] = useState("recent");

	const getUserProfileAndRepos = useCallback(async () => {
		if (!authUser?.username) return;
		setLoading(true);
		try {
			const res = await fetch(`${API_URL}/api/users/profile/${authUser.username}`);
			const { repos, userProfile } = await res.json();

			repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); //descending, recent first

			setRepos(repos);
			setUserProfile(userProfile);

			return { userProfile, repos };
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		getUserProfileAndRepos();
	}, [getUserProfileAndRepos]);

	const onSort = (sortType) => {
		if (sortType === "recent") {
			repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); //descending, recent first
		} else if (sortType === "stars") {
			repos.sort((a, b) => b.stargazers_count - a.stargazers_count); //descending, most stars first
		} else if (sortType === "forks") {
			repos.sort((a, b) => b.forks_count - a.forks_count); //descending, most forks first
		}
		setSortType(sortType);
		setRepos([...repos]);
	};

	const visibleRepos = repos.slice(0, 3);

	return (
		<div className='space-y-6'>
			<section className='panel card-gradient glow px-5 py-6'>
				<div className='flex flex-col md:flex-row gap-6 md:items-center md:justify-between'>
					<div className='space-y-3 max-w-xl'>
						<div className='flex flex-wrap gap-2'>
							<span className='pill bg-emerald-500/10 text-emerald-100 border border-emerald-500/30'>
								Live collaboration
							</span>
							<span className='pill bg-cyan-500/10 text-cyan-100 border border-cyan-500/30'>
								GitHub repos synced
							</span>
							<span className='pill bg-indigo-500/10 text-indigo-100 border border-indigo-500/30'>
								WebSocket ready
							</span>
						</div>
						<h2 className='text-2xl sm:text-3xl font-semibold leading-tight'>
							A collaborative cockpit for developers.
						</h2>
						<p className='text-white/70'>
							Search GitHub profiles, surface repos, spin up real-time review rooms, and keep conversations
							anchored next to the code.
						</p>
						<div className='flex flex-wrap gap-3'>
							<Link
								to='/code'
								className='btn-primary'
							>
								Start live review
							</Link>
							<Link
								to='/chat'
								className='btn-ghost'
							>
								Open team chat
							</Link>
						</div>
					</div>
					<div className='grid grid-cols-2 gap-3 w-full md:w-auto'>
						<div className='surface p-3 rounded-xl border-white/10'>
							<p className='text-xs uppercase tracking-[0.2em] text-white/50'>Repositories</p>
							<p className='text-2xl font-semibold'>{repos?.length || "—"}</p>
						</div>
						<div className='surface p-3 rounded-xl border-white/10'>
							<p className='text-xs uppercase tracking-[0.2em] text-white/50'>Profile</p>
							<p className='text-sm font-semibold truncate'>{userProfile?.login || "Loading"}</p>
						</div>
						<div className='surface p-3 rounded-xl border-white/10 col-span-2'>
							<p className='text-xs uppercase tracking-[0.2em] text-white/50'>Workflow</p>
							<p className='text-sm text-white/70'>Code review • Repo management • Live messaging</p>
						</div>
					</div>
				</div>
			</section>

			<section className='panel p-4 space-y-4'>
				<div className='text-white/70 text-sm'>
					Showing your GitHub profile and repositories. Sign out to switch accounts.
				</div>
				<div className='grid gap-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] items-start'>
					{userProfile && !loading && <ProfileInfo userProfile={userProfile} />}
					{!loading && <Repos repos={visibleRepos} />}
					{loading && (
						<div className='flex justify-center py-10 col-span-full'>
							<Spinner />
						</div>
					)}
				</div>
			</section>
		</div>
	);
};
export default HomePage;
