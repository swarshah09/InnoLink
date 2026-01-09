import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGithub, FaCode, FaRobot, FaComments, FaSync, FaRocket, FaChevronDown, FaInstagram } from "react-icons/fa";
import { IoCodeWorking, IoFlashSharp } from "react-icons/io5";
import { handleLoginWithGithub } from "../lib/function";

const LandingPage = () => {
	const navigate = useNavigate();
	const [isVisible, setIsVisible] = useState(false);
	const [scrollY, setScrollY] = useState(0);
	const [featureVisibility, setFeatureVisibility] = useState({});
	const heroRef = useRef(null);
	const featuresRef = useRef(null);

	useEffect(() => {
		setIsVisible(true);
		
		const handleScroll = () => {
			setScrollY(window.scrollY);
			
			// Check if features section is in view
			if (featuresRef.current) {
				const rect = featuresRef.current.getBoundingClientRect();
				const inView = rect.top < window.innerHeight && rect.bottom > 0;
				if (inView) {
					setFeatureVisibility({ visible: true });
				}
			}
		};
		
		handleScroll(); // Check initial state
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const scrollToFeatures = () => {
		featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const features = [
		{
			icon: FaCode,
			title: "Real-Time Code Collaboration",
			description: "Code together in real-time with our Monaco Editor. See changes instantly as your team types, just like Google Docs for code.",
			color: "from-cyan-500 to-blue-500",
			delay: "0"
		},
		{
			icon: FaRobot,
			title: "AI Coding Assistant",
			description: "Get instant help from our AI assistant powered by Google Gemini. Debug, explain, refactor, and optimize your code with natural language.",
			color: "from-purple-500 to-pink-500",
			delay: "100"
		},
		{
			icon: FaComments,
			title: "Team Chat",
			description: "Keep conversations close to your code. Real-time messaging with WebSocket technology for seamless team communication.",
			color: "from-emerald-500 to-teal-500",
			delay: "200"
		},
		{
			icon: FaSync,
			title: "GitHub Integration",
			description: "Seamlessly sync with your GitHub repositories. Explore profiles, manage repos, and collaborate on your existing projects.",
			color: "from-orange-500 to-red-500",
			delay: "300"
		},
		{
			icon: IoCodeWorking,
			title: "Live Code Review",
			description: "Review code changes in real-time with your team. Multiple developers can work on the same codebase simultaneously.",
			color: "from-indigo-500 to-purple-500",
			delay: "400"
		},
		{
			icon: IoFlashSharp,
			title: "Lightning Fast",
			description: "Built with WebSockets for instant updates. Experience zero-lag collaboration powered by modern MERN stack technology.",
			color: "from-yellow-500 to-amber-500",
			delay: "500"
		}
	];

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Animated background gradients */}
			<div className="fixed inset-0 -z-10">
				<div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
				<div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
				<div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
			</div>

			{/* Navigation */}
			<nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-900/30 flex-shrink-0">
								<img className="h-5 w-5 sm:h-6 sm:w-6" src="/logo.png" alt="InnoLink Logo" />
							</div>
							<div className="flex flex-col leading-tight">
								<span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/60 hidden xs:block">Innovation</span>
								<span className="text-xs sm:text-sm font-semibold">InnoLink</span>
							</div>
						</div>
						<div className="flex items-center gap-2 sm:gap-3">
							<button
								onClick={() => navigate('/login')}
								className="btn-ghost text-xs sm:text-sm px-3 py-1.5 sm:px-3 sm:py-2"
							>
								<span className="hidden sm:inline">Sign In</span>
								<span className="sm:hidden">Login</span>
							</button>
							<button
								onClick={handleLoginWithGithub}
								className="btn-primary text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2"
							>
								<FaGithub size={14} className="sm:w-4 sm:h-4" />
								<span className="hidden xs:inline">Get Started</span>
								<span className="xs:hidden">Start</span>
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section 
				ref={heroRef}
				className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-32"
			>
				<div className="max-w-5xl mx-auto text-center space-y-8">
					<div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6 animate-pulse hover:scale-105 transition-transform cursor-default">
							<div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
							<span className="text-sm font-medium text-cyan-300">Live & Ready</span>
						</div>
						
						<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent leading-tight animate-fade-in">
							Code Together.
							<br />
							<span className="text-white">Build Faster.</span>
						</h1>
						
						<p className="text-xl sm:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
							The ultimate platform for real-time code collaboration, AI-powered assistance, and seamless team communication.
							<br />
							<span className="text-lg text-white/60 mt-2 block">Everything you need to code better, together.</span>
						</p>

						<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12 w-full sm:w-auto">
							<button
								onClick={handleLoginWithGithub}
								className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 group w-full sm:w-auto"
							>
								<FaGithub size={18} className="sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
								<span className="whitespace-nowrap">Continue with GitHub</span>
								<FaRocket size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform hidden sm:block" />
							</button>
							<button
								onClick={scrollToFeatures}
								className="btn-ghost text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 w-full sm:w-auto"
							>
								<span>Learn More</span>
								<FaChevronDown size={14} className="sm:w-4 sm:h-4 animate-bounce" />
							</button>
						</div>
					</div>

					{/* Stats */}
					<div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
						<div className="panel p-6 hover:scale-105 transition-transform">
							<div className="text-3xl font-bold text-cyan-400 mb-2">Real-Time</div>
							<div className="text-white/60">Zero-lag collaboration</div>
						</div>
						<div className="panel p-6 hover:scale-105 transition-transform">
							<div className="text-3xl font-bold text-purple-400 mb-2">AI-Powered</div>
							<div className="text-white/60">Smart coding assistant</div>
						</div>
						<div className="panel p-6 hover:scale-105 transition-transform">
							<div className="text-3xl font-bold text-emerald-400 mb-2">Team Ready</div>
							<div className="text-white/60">Built for collaboration</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section 
				id="features"
				ref={featuresRef}
				className="min-h-screen py-32 px-4 sm:px-6 lg:px-8"
			>
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-4xl sm:text-5xl font-bold mb-4">
							Everything You Need to <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Code Better</span>
						</h2>
						<p className="text-xl text-white/60 max-w-2xl mx-auto">
							Powerful features designed to supercharge your development workflow
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							const isVisible = featureVisibility.visible;
							return (
								<div
									key={index}
									className="panel p-8 hover:scale-105 transition-all duration-300 hover:border-cyan-400/30 group cursor-pointer"
									style={{
										opacity: isVisible ? 1 : 0,
										transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
										transition: `all 0.6s ease-out ${index * 0.1}s`
									}}
								>
									<div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
										<Icon size={24} className="text-white" />
									</div>
									<h3 className="text-xl font-bold mb-3 group-hover:text-cyan-300 transition-colors">
										{feature.title}
									</h3>
									<p className="text-white/60 leading-relaxed">
										{feature.description}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-black/20">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-4xl sm:text-5xl font-bold mb-4">
							How It <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Works</span>
						</h2>
						<p className="text-xl text-white/60">
							Get started in three simple steps
						</p>
					</div>

					<div className="space-y-12">
						{[
							{
								step: "01",
								title: "Sign In with GitHub",
								description: "Authenticate using your GitHub account. No separate account needed - we integrate directly with your existing repos.",
								color: "border-cyan-500/30 bg-cyan-500/10"
							},
							{
								step: "02",
								title: "Start a Collaboration Room",
								description: "Create a new room or join an existing one. Share the room link with your team members for instant access.",
								color: "border-purple-500/30 bg-purple-500/10"
							},
							{
								step: "03",
								title: "Code, Chat & Collaborate",
								description: "Write code together in real-time, get AI assistance, and chat with your team - all in one powerful interface.",
								color: "border-emerald-500/30 bg-emerald-500/10"
							}
						].map((item, index) => (
							<div
								key={index}
								className={`panel p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 ${item.color} hover:scale-[1.02] transition-all`}
							>
								<div className="text-6xl font-bold text-white/20 flex-shrink-0">
									{item.step}
								</div>
								<div className="flex-1">
									<h3 className="text-2xl font-bold mb-2">{item.title}</h3>
									<p className="text-white/60 text-lg">{item.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-32 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					<div className="panel card-gradient glow p-12 text-center">
						<h2 className="text-4xl sm:text-5xl font-bold mb-6">
							Ready to Transform Your <br />
							<span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Development Workflow?</span>
						</h2>
						<p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
							Join developers worldwide who are already building better code together with InnoLink.
						</p>
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
							<button
								onClick={handleLoginWithGithub}
								className="btn-primary text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 group w-full sm:w-auto"
							>
								<FaGithub size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
								<span className="whitespace-nowrap">Get Started Free</span>
								<FaRocket size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform hidden sm:block" />
							</button>
							<Link
								to="/login"
								className="btn-ghost text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 text-center w-full sm:w-auto"
							>
								Sign In
							</Link>
						</div>
						<p className="text-sm text-white/50 mt-6">
							No credit card required • Free forever
						</p>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					{/* Main Footer Content */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
						{/* Brand Section */}
						<div className="space-y-4">
							<div className="flex items-center gap-3 mb-4">
								<div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
									<img className="h-6 w-6" src="/logo.png" alt="InnoLink Logo" />
								</div>
								<div className="flex flex-col leading-tight">
									<span className="text-xs uppercase tracking-[0.25em] text-white/60">Innovation</span>
									<span className="text-base font-semibold">InnoLink</span>
								</div>
							</div>
							<p className="text-sm text-white/60 leading-relaxed">
								The ultimate platform for real-time code collaboration and AI-powered development. Build better code, together.
							</p>
							<div className="flex items-center gap-4 pt-2">
								<a
									href="https://github.com/swarshah09"
									target="_blank"
									rel="noopener noreferrer"
									className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all group"
									aria-label="GitHub"
								>
									<FaGithub size={18} className="text-white/70 group-hover:text-cyan-300 transition-colors" />
								</a>
								<a
									href="https://www.linkedin.com/in/swar-shah-190a84218/"
									target="_blank"
									rel="noopener noreferrer"
									className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:border-blue-400/60 hover:bg-blue-500/10 transition-all group"
									aria-label="LinkedIn"
								>
									<svg className="w-5 h-5 text-white/70 group-hover:text-blue-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
										<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
									</svg>
								</a>
								<a
									href="https://www.instagram.com/swarshahhh/"
									target="_blank"
									rel="noopener noreferrer"
									className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:border-pink-400/60 hover:bg-pink-500/10 transition-all group"
									aria-label="Instagram"
								>
									<FaInstagram size={18} className="text-white/70 group-hover:text-pink-300 transition-colors" />
								</a>
							</div>
						</div>

						{/* Product Links */}
						<div>
							<h3 className="text-sm font-semibold uppercase tracking-wider text-white/90 mb-4">Product</h3>
							<ul className="space-y-3">
								<li>
									<a href="#features" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Features
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Pricing
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Documentation
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Changelog
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Roadmap
									</a>
								</li>
							</ul>
						</div>

						{/* Resources Links */}
						<div>
							<h3 className="text-sm font-semibold uppercase tracking-wider text-white/90 mb-4">Resources</h3>
							<ul className="space-y-3">
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Blog
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Help Center
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Community
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										API Reference
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Tutorials
									</a>
								</li>
							</ul>
						</div>

						{/* Company & Legal Links */}
						<div>
							<h3 className="text-sm font-semibold uppercase tracking-wider text-white/90 mb-4">Company</h3>
							<ul className="space-y-3">
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										About Us
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Contact
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Careers
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Privacy Policy
									</a>
								</li>
								<li>
									<a href="#" className="text-sm text-white/60 hover:text-cyan-300 transition-colors">
										Terms of Service
									</a>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className="pt-8 border-t border-white/10">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<p className="text-sm text-white/50">
								© {new Date().getFullYear()} InnoLink. All rights reserved.
							</p>
							<div className="flex items-center gap-6 text-sm text-white/50">
								<span className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
									<span>All systems operational</span>
								</span>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;

