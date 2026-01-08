import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
	"/github/callback",
	passport.authenticate("github", { 
		failureRedirect: (process.env.CLIENT_BASE_URL || "http://localhost:3000") + "/login" 
	}),
	function (req, res) {
		if (!req.user) {
			console.error("OAuth callback: No user in session");
			return res.redirect((process.env.CLIENT_BASE_URL || "http://localhost:3000") + "/login?error=auth_failed");
		}
		
		const redirectUrl = process.env.CLIENT_BASE_URL || "http://localhost:3000";
		console.log(`OAuth success! User: ${req.user.username}, Redirecting to: ${redirectUrl}`);
		
		// Save session before redirect to ensure it persists
		req.session.save((err) => {
			if (err) {
				console.error("Session save error:", err);
				return res.redirect(redirectUrl + "/login?error=session_error");
			}
			res.redirect(redirectUrl);
		});
	}
);

router.get("/check", (req, res) => {
	if (req.isAuthenticated()) {
		res.send({ user: req.user });
	} else {
		res.send({ user: null });
	}
});

// Debug endpoint to check OAuth configuration
router.get("/github/debug", (req, res) => {
	const config = {
		backendUrl: process.env.BACKEND_URL || "NOT SET",
		clientBaseUrl: process.env.CLIENT_BASE_URL || "NOT SET",
		githubClientId: process.env.GITHUB_CLIENT_ID ? "SET (hidden)" : "NOT SET",
		githubClientSecret: process.env.GITHUB_CLIENT_SECRET ? "SET (hidden)" : "NOT SET",
		expectedCallbackUrl: process.env.BACKEND_URL 
			? `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/auth/github/callback`
			: process.env.CLIENT_BASE_URL 
				? `${process.env.CLIENT_BASE_URL.replace(/\/$/, '')}/api/auth/github/callback`
				: "NOT SET - Using relative path",
		nodeEnv: process.env.NODE_ENV || "development",
	};
	
	res.json({
		message: "OAuth Configuration Debug",
		config,
		instructions: {
			step1: "Copy the 'expectedCallbackUrl' value above",
			step2: "Go to GitHub → Settings → Developer settings → OAuth Apps",
			step3: "Set 'Authorization callback URL' to match 'expectedCallbackUrl' exactly",
			step4: "Make sure BACKEND_URL is set in Render environment variables",
			step5: "Redeploy backend after setting BACKEND_URL",
		}
	});
});

router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		res.json({ message: "Logged out" });
	});
});

export default router;
