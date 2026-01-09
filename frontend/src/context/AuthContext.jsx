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
		const urlParams = new URLSearchParams(window.location.search);
		const oauthSuccess = urlParams.get('oauth') === 'success';
		const oauthError = urlParams.get('error');
		
		// Clear URL parameters
		if (oauthSuccess || oauthError) {
			window.history.replaceState({}, '', window.location.pathname);
		}
		
		// If OAuth error, clear any stale cookies and try fresh login
		if (oauthError) {
			console.log('OAuth error detected, clearing cookies and retrying...');
			// Clear cookies for the backend domain
			document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.onrender.com; SameSite=None; Secure';
			document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure';
			setTimeout(() => checkUserLoggedIn(), 1000);
		} else {
			// Normal flow - check immediately
			checkUserLoggedIn();
			
			// Check again after delay for OAuth success
			if (oauthSuccess) {
				setTimeout(() => checkUserLoggedIn(), 1000);
			}
		}
		
		// Check on window focus
		const handleFocus = () => {
			checkUserLoggedIn();
		};
		window.addEventListener('focus', handleFocus);
		
		return () => {
			window.removeEventListener('focus', handleFocus);
		};
	}, []);

	return <AuthContext.Provider value={{ authUser, setAuthUser, loading }}>{children}</AuthContext.Provider>;
};
