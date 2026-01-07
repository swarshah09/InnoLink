import { useState } from "react";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import Repos from "../components/Repos";

const LANGUAGES = [
	{ value: "javascript", label: "JavaScript", icon: "/javascript.svg" },
	{ value: "typescript", label: "TypeScript", icon: "/typescript.svg" },
	{ value: "c++", label: "C++", icon: "/c++.svg" },
	{ value: "python", label: "Python", icon: "/python.svg" },
	{ value: "java", label: "Java", icon: "/java.svg" },
	{ value: "go", label: "Go", icon: "/go.svg" },
	{ value: "csharp", label: "C#", icon: "/csharp.svg" },
	{ value: "swift", label: "Swift", icon: "/swift.svg" },
	{ value: "html", label: "HTML", icon: "/html.svg" },
	{ value: "css", label: "CSS", icon: "/css.svg" },
];

const ExplorePage = () => {
	const [loading, setLoading] = useState(false);
	const [repos, setRepos] = useState([]);
	const [selectedLanguage, setSelectedLanguage] = useState("");

	const exploreRepos = async (language) => {
		setLoading(true);
		setRepos([]);
		try {
			const res = await fetch("/api/explore/repos/" + language);
			const { repos } = await res.json();
			setRepos(repos);

			setSelectedLanguage(language);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};
	return (
		<div className='space-y-4'>
			<section className='panel card-gradient p-5 glow'>
				<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
					<div>
						<p className='pill bg-indigo-500/10 text-indigo-100 border border-indigo-500/30 mb-2'>
							Trending GitHub repos
						</p>
						<h1 className='text-2xl font-semibold'>Explore languages and spike ideas</h1>
						<p className='text-white/70 text-sm'>
							Tap a language to fetch the most starred public repositories and jump into a review.
						</p>
					</div>
					<div className='chip bg-white/5 border border-white/10 text-white/70'>
						Live data • Filter by language
					</div>
				</div>
			</section>

			<section className='panel p-4 space-y-4'>
				<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
					{LANGUAGES.map((lang) => (
						<button
							key={lang.value}
							type='button'
							onClick={() => exploreRepos(lang.value)}
							className={`surface border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-cyan-400/50 transition ${
								selectedLanguage === lang.value ? "border-cyan-400/50 bg-cyan-500/10" : ""
							}`}
						>
							<img src={lang.icon} alt={`${lang.label} logo`} className='h-8 w-8' />
							<div className='text-left'>
								<p className='font-semibold'>{lang.label}</p>
								<p className='text-xs text-white/60'>Tap to fetch starred repos</p>
							</div>
						</button>
					))}
				</div>

				{repos.length > 0 && (
					<h2 className='text-lg font-semibold text-center my-2'>
						<span className='chip bg-cyan-500/10 border border-cyan-400/40 text-cyan-50'>
							{selectedLanguage.toUpperCase()}
						</span>{" "}
						Repositories
					</h2>
				)}

				{!loading && repos.length > 0 && <Repos repos={repos} alwaysFullWidth />}
				{loading && <Spinner />}
			</section>
		</div>
	);
};
export default ExplorePage;
