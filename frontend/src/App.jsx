import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import LikesPage from "./pages/LikesPage";
import ReposGridPage from "./pages/ReposGridPage";
import ChatPage from "./pages/ChatPage";
import CodeLobbyPage from "./pages/CodeLobbyPage";
import CodeEditorPage from "./pages/CodeEditorPage";
import Sidebar from "./components/Sidebar";
import { useAuthContext } from "./context/AuthContext";

const StatusPill = ({ label, tone = "cyan" }) => {
	const tones = {
		cyan: "bg-cyan-500/10 text-cyan-200 border border-cyan-400/30",
		emerald: "bg-emerald-500/10 text-emerald-200 border border-emerald-400/30",
		amber: "bg-amber-500/10 text-amber-100 border border-amber-400/30",
	};

	return <span className={`pill ${tones[tone]}`}>{label}</span>;
};

const ShellOverlay = () => (
	<>
		<div className='pointer-events-none absolute -top-20 left-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-[110px]' />
		<div className='pointer-events-none absolute top-1/3 -right-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-[110px]' />
	</>
);

function App() {
	const { authUser, loading } = useAuthContext();

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center text-white/60'>
				<div className='panel px-6 py-4 border-white/10 flex items-center gap-3'>
					<div className='h-3 w-3 rounded-full bg-cyan-400 animate-pulse' />
					<span>Booting up the workspace…</span>
				</div>
			</div>
		);
	}

	if (!authUser) {
		return (
			<div className='min-h-screen relative overflow-hidden text-white'>
				<Routes>
					<Route path='/' element={<LandingPage />} />
					<Route path='/login' element={
						<div className='min-h-screen relative overflow-hidden'>
							<ShellOverlay />
							<div className='relative z-10 flex min-h-screen'>
								<Sidebar />
								<main className='flex-1 flex items-center justify-center px-4 sm:px-8 py-10'>
									<div className='w-full max-w-xl panel p-6 border-white/10'>
										<LoginPage />
									</div>
								</main>
							</div>
						</div>
					} />
					<Route path='/signup' element={
						<div className='min-h-screen relative overflow-hidden'>
							<ShellOverlay />
							<div className='relative z-10 flex min-h-screen'>
								<Sidebar />
								<main className='flex-1 flex items-center justify-center px-4 sm:px-8 py-10'>
									<div className='w-full max-w-xl panel p-6 border-white/10'>
										<SignUpPage />
									</div>
								</main>
							</div>
						</div>
					} />
					<Route path='*' element={<Navigate to={"/"} replace />} />
				</Routes>
				<Toaster position='top-right' toastOptions={{ style: { background: "#0B1224", color: "#f8fafc" } }} />
			</div>
		);
	}

	return (
		<div className='min-h-screen relative overflow-hidden text-white'>
			<ShellOverlay />
			<div className='relative z-10 flex min-h-screen'>
				<Sidebar />
				<div className='flex-1 flex flex-col'>
					<header className='sticky top-0 z-20 border-b border-white/5 bg-black/30 backdrop-blur-xl px-6 py-4 flex items-center justify-between'>
						<div className='space-y-1'>
							<p className='text-[11px] uppercase tracking-[0.2em] text-white/60'>collaboration fabric</p>
							<h1 className='text-lg sm:text-xl font-semibold'>InnoLink</h1>
							<p className='text-sm text-white/60'>
								Integrate GitHub repos, review code live, and keep chat close by.
							</p>
						</div>
						<div className='flex flex-wrap gap-2 justify-end'>
							<StatusPill label='WebSockets Live' tone='emerald' />
							<StatusPill label='GitHub Connected' tone='cyan' />
							<StatusPill label='MERN stack' tone='amber' />
						</div>
					</header>

					<main className='flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto space-y-6'>
						<Routes>
							<Route path='/' element={<HomePage />} />
							<Route path='/login' element={<Navigate to={"/"} />} />
							<Route path='/signup' element={<Navigate to={"/"} />} />
							<Route path='/explore' element={<ExplorePage />} />
							<Route path='/likes' element={<LikesPage />} />
							<Route path='/chat' element={<ChatPage />} />
							<Route path='/code' element={<CodeLobbyPage />} />
							<Route path='/code/:roomId' element={<CodeEditorPage />} />
							<Route path='/repos' element={<ReposGridPage />} />
							<Route path='*' element={<Navigate to={"/"} replace />} />
						</Routes>
					</main>
				</div>
			</div>
			<Toaster position='top-right' toastOptions={{ style: { background: "#0B1224", color: "#f8fafc" } }} />
		</div>
	);
}

export default App;
