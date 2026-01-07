import { IoLocationOutline } from "react-icons/io5";
import { RiGitRepositoryFill, RiUserFollowFill, RiUserFollowLine } from "react-icons/ri";
import { FaXTwitter } from "react-icons/fa6";
import { TfiThought } from "react-icons/tfi";
import { FaEye } from "react-icons/fa";
import { formatMemberSince } from "../utils/functions";
import LikeProfile from "./LikeProfile";

const ProfileInfo = ({ userProfile }) => {
	const memberSince = formatMemberSince(userProfile?.created_at);

	return (
		<div className='w-full flex flex-col lg:sticky lg:top-10'>
			<div className='panel p-6 border-white/10 space-y-5 overflow-hidden h-full flex flex-col gap-5'>
				<div className='relative rounded-2xl border border-white/5 overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent pointer-events-none' />
					<div className='flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5'>
						<div className='relative shrink-0'>
							<div className='absolute -inset-1 rounded-2xl bg-cyan-500/10 blur-xl' />
							<a href={userProfile?.html_url} target='_blank' rel='noreferrer' className='relative block'>
								<img
									src={userProfile?.avatar_url}
									className='rounded-2xl w-28 h-28 object-cover border border-white/10 shadow-xl shadow-cyan-900/30'
									alt=''
								/>
							</a>
						</div>
						<div className='flex-1 space-y-2 min-w-0'>
							<div className='flex items-center gap-2'>
								<h3 className='text-xl font-semibold truncate'>{userProfile?.name || userProfile?.login}</h3>
								<LikeProfile userProfile={userProfile} />
							</div>
							<p className='text-sm text-white/60 truncate'>{userProfile?.login}</p>
							<div className='flex flex-wrap gap-3 mt-2'>
								<a
									href={userProfile?.html_url}
									target='_blank'
									rel='noreferrer'
									className='btn-ghost w-fit text-xs px-3 py-1'
								>
									<FaEye size={14} />
									View on GitHub
								</a>
								{userProfile?.email && (
									<span className='chip bg-white/5 border border-white/10 text-white/70 text-xs'>
										{userProfile.email}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>

				{userProfile?.bio ? (
					<div className='surface p-4 rounded-lg border-white/5 flex gap-3 items-start'>
						<TfiThought className='mt-0.5 text-cyan-300' />
						<p className='text-sm text-white/80 leading-relaxed'>{userProfile?.bio}</p>
					</div>
				) : null}

				<div className='grid grid-cols-2 gap-3 text-sm'>
					<div className='surface rounded-lg p-4 border-white/5'>
						<p className='text-white/60 text-xs uppercase tracking-[0.2em]'>Member since</p>
						<p className='font-semibold'>{memberSince}</p>
					</div>
					<div className='surface rounded-lg p-4 border-white/5'>
						<p className='text-white/60 text-xs uppercase tracking-[0.2em]'>Visibility</p>
						<p className='font-semibold break-words'>{userProfile?.type || "Developer"}</p>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-2 gap-3'>
				<div className='surface rounded-lg p-4 border-white/5 flex items-center gap-3'>
					<RiUserFollowFill className='w-5 h-5 text-cyan-300' />
					<div>
						<p className='text-[11px] uppercase tracking-[0.2em] text-white/50'>Followers</p>
						<p className='font-semibold'>{userProfile?.followers}</p>
					</div>
				</div>
				<div className='surface rounded-lg p-4 border-white/5 flex items-center gap-3'>
					<RiUserFollowLine className='w-5 h-5 text-cyan-300' />
					<div>
						<p className='text-[11px] uppercase tracking-[0.2em] text-white/50'>Following</p>
						<p className='font-semibold'>{userProfile?.following}</p>
					</div>
				</div>
				<div className='surface rounded-lg p-4 border-white/5 flex items-center gap-3'>
					<RiGitRepositoryFill className='w-5 h-5 text-cyan-300' />
					<div>
						<p className='text-[11px] uppercase tracking-[0.2em] text-white/50'>Public repos</p>
						<p className='font-semibold'>{userProfile?.public_repos}</p>
					</div>
				</div>
				<div className='surface rounded-lg p-4 border-white/5 flex items-center gap-3'>
					<RiGitRepositoryFill className='w-5 h-5 text-cyan-300' />
					<div>
						<p className='text-[11px] uppercase tracking-[0.2em] text-white/50'>Public gists</p>
						<p className='font-semibold'>{userProfile?.public_gists}</p>
					</div>
				</div>
			</div>
		</div>
	);
};
export default ProfileInfo;
