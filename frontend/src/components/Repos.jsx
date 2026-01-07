import Repo from "./Repo";

const Repos = ({ repos, alwaysFullWidth = false }) => {
	const className = "w-full";

	return (
		<div className={`${className} panel px-4 sm:px-6 py-5 border-white/10`}>
			<div className='flex items-center justify-between mb-3'>
				<div>
					<p className='text-[11px] uppercase tracking-[0.2em] text-white/50'>Repository stream</p>
					<h3 className='text-lg font-semibold'>Latest GitHub assets</h3>
				</div>
				<span className='chip bg-white/5 border border-white/10 text-white/80'>{repos.length} repos</span>
			</div>
			<div
				className='grid gap-3'
				style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
			>
				{repos.map((repo) => (
					<Repo key={repo.id} repo={repo} />
				))}
				{repos.length === 0 && <p className='flex items-center justify-center h-32 text-white/60'>No repos found</p>}
			</div>
		</div>
	);
};
export default Repos;
