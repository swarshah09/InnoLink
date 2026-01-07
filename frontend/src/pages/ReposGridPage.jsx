import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCodeFork } from "react-icons/fa6";
import { FaCodeBranch, FaExternalLinkAlt, FaRegStar } from "react-icons/fa";
import { PROGRAMMING_LANGUAGES } from "../utils/constants";
import { formatDate } from "../utils/functions";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

const RepoGridCard = ({ repo }) => {
	return (
		<div className='surface border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:border-cyan-400/40 transition'>
			<div className='flex items-start gap-3 justify-between'>
				<div className='flex items-center gap-3'>
					<div className='h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center'>
						<FaCodeBranch className='text-cyan-300' />
					</div>
					<div>
						<a
							href={repo.html_url}
							target='_blank'
							rel='noreferrer'
							className='text-base font-semibold hover:text-cyan-200 transition'
						>
							{repo.name}
						</a>
						<p className='text-xs text-white/60'>Created {formatDate(repo.created_at)}</p>
					</div>
				</div>
				<a
					href={repo.html_url}
					target='_blank'
					rel='noreferrer'
					className='btn-ghost text-xs px-2 py-1'
				>
					Open <FaExternalLinkAlt size={10} />
				</a>
			</div>

			<p className='text-sm text-white/80'>
				{repo.description ? repo.description.slice(0, 240) : "No description provided"}
			</p>

			<div className='flex flex-wrap gap-2'>
				<span className='chip bg-white/5 border border-white/10 text-white/80'>
					<FaRegStar /> {repo.stargazers_count}
				</span>
				<span className='chip bg-white/5 border border-white/10 text-white/80'>
					<FaCodeFork /> {repo.forks_count}
				</span>
				{PROGRAMMING_LANGUAGES[repo.language] ? (
					<span className='chip bg-white/5 border border-white/10 text-white/80'>
						<img src={PROGRAMMING_LANGUAGES[repo.language]} alt='Programming language icon' className='h-5 w-5' />
						{repo.language}
					</span>
				) : null}
				{repo.topics?.slice(0, 4).map((topic) => (
					<span key={topic} className='chip bg-white/5 border border-white/10 text-white/70'>
						#{topic}
					</span>
				))}
			</div>
		</div>
	);
};

const ReposGridPage = () => {
	const { state } = useLocation();
	const navigate = useNavigate();
	const [repos, setRepos] = useState(state?.repos || []);
	const [username, setUsername] = useState(state?.username || "swarshah09");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchRepos = async () => {
			// If repos were passed in navigation state, skip fetching
			if (state?.repos?.length) return;
			setLoading(true);
			try {
				const res = await fetch(`${API_URL}/api/users/profile/${username}`);
				const data = await res.json();
				setRepos(data.repos || []);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoading(false);
			}
		};
		fetchRepos();
	}, [state, username]);

	return (
		<div className='space-y-4'>
			<section className='panel card-gradient glow p-5'>
				<div className='flex items-start justify-between gap-3 flex-wrap'>
					<div>
						<p className='pill bg-cyan-500/10 text-cyan-100 border border-cyan-500/30 mb-2'>All repositories</p>
						<h1 className='text-2xl font-semibold'>Repository grid for {username}</h1>
						<p className='text-white/70 text-sm max-w-2xl'>
							Every repository you fetched on the home view, now organized in a clean grid with quick access to stars,
							forks, topics, and links.
						</p>
					</div>
					<button type='button' className='btn-ghost text-sm' onClick={() => navigate(-1)}>
						← Back to overview
					</button>
				</div>
			</section>

			<section className='panel p-4 border-white/10'>
				{loading ? (
					<div className='flex justify-center py-10'>
						<Spinner />
					</div>
				) : (
					<div
						className='grid gap-4'
						style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
					>
						{repos.map((repo) => (
							<RepoGridCard key={repo.id} repo={repo} />
						))}
						{repos.length === 0 && (
							<p className='col-span-full text-center text-white/60 py-10'>No repositories available.</p>
						)}
					</div>
				)}
			</section>
		</div>
	);
};

export default ReposGridPage;

