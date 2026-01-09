import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { API_URL } from "../config/env.js";

export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
	return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
	const [authUser, setAuthUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const checkUserLoggedIn = async () => {
		setLoading(true);
		try {
			// CRITICAL: credentials: "include" is required for cross-domain cookies
			const res = await fetch(`${API_URL}/api/auth/check`, { 
				credentials: "include", // REQUIRED for cookies to be sent
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				mode: 'cors', // Explicitly set CORS mode
			});
			const data = await res.json();
			if (data.user) {
				console.log('✅ User authenticated:', data.user.username);
				setAuthUser(data.user);
			} else {
				console.log('ℹ️  No user session found');
				setAuthUser(null);
			}
		} catch (error) {
			console.error('Auth check error:', error);
			setAuthUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Check immediately on mount
		checkUserLoggedIn();
		
		// Check again after a short delay (for OAuth redirect cases)
		const timeoutId = setTimeout(() => {
			checkUserLoggedIn();
		}, 1500);
		
		// Check on window focus (helps after OAuth redirect)
		const handleFocus = () => {
			checkUserLoggedIn();
		};
		window.addEventListener('focus', handleFocus);
		
		// Check if URL has oauth=success parameter (after GitHub redirect)
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('oauth') === 'success') {
			// Clear the parameter from URL
			window.history.replaceState({}, '', window.location.pathname);
			// Check auth status after a brief delay to allow cookie to be set
			setTimeout(() => {
				checkUserLoggedIn();
			}, 500);
		}
		
		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener('focus', handleFocus);
		};
	}, []);

	return <AuthContext.Provider value={{ authUser, setAuthUser, loading }}>{children}</AuthContext.Provider>;
};
