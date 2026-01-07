import { useState } from "react";
import { IoSearch } from "react-icons/io5";

const Search = ({ onSearch }) => {
	const [username, setUsername] = useState("");

	return (
		<form className='w-full' onSubmit={(e) => onSearch(e, username)}>
			<div className='relative flex flex-col sm:flex-row gap-3 sm:items-center'>
				<div className='flex-1 relative'>
					<div className='absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/50'>
						<IoSearch className='w-5 h-5' />
					</div>
					<input
						type='search'
						id='default-search'
						className='field pl-10 pr-4 h-12'
						placeholder='Search a GitHub teammate (e.g. johndoe)'
						required
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</div>
				<button type='submit' className='btn-primary h-12 sm:w-auto w-full'>
					Run fetch
				</button>
			</div>
		</form>
	);
};
export default Search;
