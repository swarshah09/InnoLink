import { FaCodeBranch, FaCopy, FaRegStar } from "react-icons/fa";
import { FaCodeFork } from "react-icons/fa6";
import { formatDate } from "../utils/functions";
import { PROGRAMMING_LANGUAGES } from "../utils/constants";
import toast from "react-hot-toast";

const Repo = ({ repo }) => {
	const formattedDate = formatDate(repo.created_at);

	const handleCloneClick = async (repo) => {
		try {
			await navigator.clipboard.writeText(repo.clone_url);
			toast.success("Repo URL cloned to clipboard");
		} catch (error) {
			toast.error("Clipboard write failed. ");
		}
	};

	return (
		<div className='surface rounded-xl border-white/10 p-4 hover:border-cyan-400/40 transition h-full flex flex-col'>
			<div className='flex flex-wrap items-start gap-3 justify-between'>
				<div className='flex items-center gap-3 flex-1 min-w-[200px]'>
					<div className='h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center'>
						<FaCodeBranch className='w-5 h-5 text-cyan-300' />
					</div>
					<div>
						<a
							href={repo.html_url}
							target='_blank'
							rel='noreferrer'
							className='text-lg font-semibold hover:text-cyan-200 transition'
						>
							{repo.name}
						</a>
						<time className='block text-xs text-white/50'>Created {formattedDate}</time>
					</div>
				</div>

				<div className='flex flex-wrap gap-2'>
					<span className='chip bg-white/5 border border-white/10 text-white/80'>
						<FaRegStar /> {repo.stargazers_count}
					</span>
					<span className='chip bg-white/5 border border-white/10 text-white/80'>
						<FaCodeFork /> {repo.forks_count}
					</span>
					<button
						onClick={() => handleCloneClick(repo)}
						className='chip bg-cyan-500/10 border border-cyan-400/40 text-cyan-50 hover:bg-cyan-500/20 transition'
						type='button'
					>
						<FaCopy /> Clone URL
					</button>
				</div>
			</div>

			<p className='mt-3 text-sm text-white/80 flex-1'>
				{repo.description ? repo.description.slice(0, 500) : "No description provided"}
			</p>

			<div className='mt-4 flex items-center gap-3 flex-wrap'>
				{PROGRAMMING_LANGUAGES[repo.language] ? (
					<span className='chip bg-white/5 border border-white/10 text-white/80'>
						<img src={PROGRAMMING_LANGUAGES[repo.language]} alt='Programming language icon' className='h-5 w-5' />
						{repo.language}
					</span>
				) : null}
				{repo.topics?.slice(0, 3).map((topic) => (
					<span key={topic} className='chip bg-white/5 border border-white/10 text-white/70'>
						#{topic}
					</span>
				))}
			</div>
		</div>
	);
};
export default Repo;
