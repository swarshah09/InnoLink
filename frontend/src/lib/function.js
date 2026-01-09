import { API_URL } from "../config/env.js";

export const handleLoginWithGithub = () => {
	// Clear any existing stale cookies before starting OAuth
	// This prevents cookie conflicts that cause login issues
	document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.onrender.com; SameSite=None; Secure';
	document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure';
	
	// Small delay to ensure cookies are cleared, then redirect
	setTimeout(() => {
		window.location.href = `${API_URL}/api/auth/github`;
	}, 100);
};
