import { FaGithub } from "react-icons/fa";
import { handleLoginWithGithub } from "../lib/function";

const LoginPage = () => {
	return (
		<div className='min-h-[70vh] flex flex-col items-center justify-center px-6 py-10'>
			<div className='panel w-full sm:max-w-md p-6 border-white/10 space-y-6'>
				<div className='space-y-2 text-center'>
					<p className='pill bg-cyan-500/10 text-cyan-100 border border-cyan-500/30 inline-flex'>
						Connect with GitHub
					</p>
					<h1 className='text-2xl font-semibold'>Sign in or create account</h1>
					<p className='text-white/60 text-sm'>
						One secure GitHub flow handles both login and new account creation.
					</p>
				</div>
				<button
					type='button'
					className='btn-primary w-full justify-center'
					onClick={handleLoginWithGithub}
				>
					<FaGithub className='w-5 h-5' />
					Continue with GitHub
				</button>
			</div>
		</div>
	);
};
export default LoginPage;
