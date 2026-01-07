const SortRepos = ({ onSort, sortType }) => {
	const BUTTONS = [
		{ type: "recent", text: "Most Recent" },
		{ type: "stars", text: "Most Stars" },
		{ type: "forks", text: "Most Forks" },
	];

	return (
		<div className='mb-2 flex justify-center lg:justify-end flex-wrap gap-2'>
			{BUTTONS.map((button) => (
				<button
					key={button.type}
					type='button'
					className={`py-2.5 px-5 text-xs sm:text-sm font-medium focus:outline-none rounded-lg border transition ${
						button.type === sortType
							? "border-cyan-400/60 bg-cyan-400/10 text-white"
							: "border-white/10 bg-white/5 text-white/80 hover:border-cyan-400/40"
					}`}
					onClick={() => onSort(button.type)}
				>
					{button.text}
				</button>
			))}
		</div>
	);
};
export default SortRepos;
