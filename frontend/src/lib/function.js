import { API_URL } from "../config/env.js";

export const handleLoginWithGithub = () => {
	window.open(`${API_URL}/api/auth/github`, "_self");
};
