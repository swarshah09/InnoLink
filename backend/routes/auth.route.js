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
			console.error("[OAUTH CALLBACK] No user in session");
			return res.redirect((process.env.CLIENT_BASE_URL || "http://localhost:3000") + "/login?error=auth_failed");
		}
		
		if (!req.isAuthenticated()) {
			console.error("[OAUTH CALLBACK] User not authenticated after passport.authenticate");
			return res.redirect((process.env.CLIENT_BASE_URL || "http://localhost:3000") + "/login?error=not_authenticated");
		}
		
		const redirectUrl = process.env.CLIENT_BASE_URL || "http://localhost:3000";
		console.log(`[OAUTH CALLBACK] Success! User: ${req.user.username}, Session ID: ${req.sessionID}`);
		
		// Mark session as modified to ensure it's saved
		req.session.userId = req.user._id || req.user.id;
		req.session.touch();
		
		// Save session explicitly before redirect - CRITICAL for cross-domain
		req.session.save((err) => {
			if (err) {
				console.error("[OAUTH CALLBACK] Session save error:", err);
				return res.redirect(redirectUrl + "/login?error=session_error");
			}
			
			console.log(`[OAUTH CALLBACK] Session saved. Cookie will be set. Redirecting to: ${redirectUrl}`);
			// Redirect with success flag so frontend can re-check auth
			res.redirect(redirectUrl + "?oauth=success");
		});
	}
);

router.get("/check", (req, res) => {
	console.log(`[AUTH CHECK] Session ID: ${req.sessionID}`);
	console.log(`[AUTH CHECK] Is authenticated: ${req.isAuthenticated()}`);
	console.log(`[AUTH CHECK] User: ${req.user ? req.user.username : 'null'}`);
	
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
