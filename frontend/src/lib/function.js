import { API_URL } from "../config/env.js";

export const handleLoginWithGithub = () => {
	// Direct navigation - no async, no fetch, no preventDefault needed
	window.location.href = `${API_URL}/api/auth/github`;
};
