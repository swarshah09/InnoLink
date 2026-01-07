import { Link, NavLink } from "react-router-dom";
import { IoHomeSharp, IoChatboxEllipses } from "react-icons/io5";
import { FaHeart, FaCode } from "react-icons/fa";
import { MdOutlineExplore, MdEditDocument } from "react-icons/md";
import { PiSignInBold } from "react-icons/pi";
import Logout from "./Logout";
import { useAuthContext } from "../context/AuthContext";

const NavItem = ({ to, icon: Icon, label }) => (
	<NavLink
		to={to}
		className={({ isActive }) =>
			`group flex items-center gap-3 px-3 py-2 rounded-xl border transition hover:border-cyan-400/60 hover:bg-white/5 ${
				isActive ? "border-cyan-400/40 bg-white/5 shadow-lg shadow-cyan-900/30" : "border-white/10"
			}`
		}
	>
		<Icon size={20} className='text-white/80 group-hover:text-white' />
		<span className='hidden sm:block text-sm font-medium'>{label}</span>
	</NavLink>
);

const ExternalItem = ({ href, icon: Icon, label }) => (
	<a
		href={href}
		target='_blank'
		rel='noopener noreferrer'
		className='group flex items-center gap-3 px-3 py-2 rounded-xl border border-white/10 transition hover:border-cyan-400/60 hover:bg-white/5'
	>
		<Icon size={20} className='text-white/80 group-hover:text-white' />
		<span className='hidden sm:block text-sm font-medium'>{label}</span>
	</a>
);

const Sidebar = () => {
	const { authUser, loading } = useAuthContext();

	return (
		<aside className='sticky top-0 left-0 min-h-screen w-[76px] sm:w-64 border-r border-white/10 bg-black/30 backdrop-blur-2xl flex-shrink-0 flex flex-col px-3 py-6 gap-6 z-20'>
			<Link to='/' className='flex items-center gap-3 px-3'>
				<div className='h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-cyan-900/30'>
					<img className='h-6 w-6' src='/logo.png' alt='Logo' />
				</div>
				<div className='hidden sm:flex flex-col leading-tight'>
					<span className='text-xs uppercase tracking-[0.25em] text-white/60'>Innovation</span>
					<span className='text-sm font-semibold'>InnoLink</span>
				</div>
			</Link>

			{authUser && (
				<div className='flex flex-col gap-2'>
					<p className='hidden sm:block text-[11px] uppercase tracking-[0.2em] text-white/50 px-3'>workspace</p>
					<NavItem to='/' icon={IoHomeSharp} label='Home' />
					<NavItem to='/explore' icon={MdOutlineExplore} label='Explore' />
					<NavItem to='/likes' icon={FaHeart} label='Activity' />
					<NavItem to='/chat' icon={IoChatboxEllipses} label='Realtime chat' />
					<NavItem to='/code' icon={FaCode} label='Live code editor' />
				</div>
			)}

			<div className='flex flex-col gap-2'>
				<p className='hidden sm:block text-[11px] uppercase tracking-[0.2em] text-white/50 px-3'>auth</p>
				{loading && (
					<div className='px-3 py-2 text-xs text-white/50'>Checking session…</div>
				)}
				{!loading && !authUser && (
					<>
						<NavItem to='/login' icon={PiSignInBold} label='Sign in' />
						<NavItem to='/signup' icon={MdEditDocument} label='Create account' />
					</>
				)}
				{!loading && authUser && (
					<div className='px-1'>
						<Logout />
					</div>
				)}
			</div>

			<div className='mt-auto pb-2 px-1 hidden sm:block text-[11px] uppercase tracking-[0.2em] text-white/40'>
				built for teams
			</div>
		</aside>
	);
};
export default Sidebar;
