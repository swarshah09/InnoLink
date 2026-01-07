import { FaGithub, FaUnlockAlt } from "react-icons/fa";
import { handleLoginWithGithub } from "../lib/function";

const SignUpPage = () => {
	return (
		<div className='min-h-[70vh] flex flex-col items-center justify-center px-6 py-10'>
			<div className='panel w-full sm:max-w-md p-6 border-white/10 space-y-6'>
				<div className='space-y-2 text-center'>
					<p className='pill bg-emerald-500/10 text-emerald-100 border border-emerald-500/30 inline-flex'>
						Unified GitHub flow
					</p>
					<h1 className='text-2xl font-semibold'>Sign in or create account</h1>
					<p className='text-white/60 text-sm'>
						Use GitHub once—new users are provisioned automatically; returning users sign in instantly.
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

				<p className='text-white/70 text-sm text-center'>
					By signing up, you enable cross-repo collaboration & notifications.
					<FaUnlockAlt className='w-4 h-4 inline mx-2 text-emerald-200' />
				</p>
			</div>
		</div>
	);
};
export default SignUpPage;
