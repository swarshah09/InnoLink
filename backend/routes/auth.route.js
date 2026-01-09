import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
	"/github/callback",
	passport.authenticate("github", { 
		failureRedirect: (process.env.CLIENT_BASE_URL || "http://localhost:3000") + "/login?error=auth_failed" 
	}),
	function (req, res) {
		if (!req.user) {
			console.error("[OAUTH CALLBACK] No user in session");
			// Clear any existing session before redirect
			req.session.destroy(() => {
				res.redirect((process.env.CLIENT_BASE_URL || "http://localhost:3000") + "/login?error=auth_failed");
			});
			return;
		}
		
		if (!req.isAuthenticated()) {
			console.error("[OAUTH CALLBACK] User not authenticated after passport.authenticate");
			req.session.destroy(() => {
				res.redirect((process.env.CLIENT_BASE_URL || "http://localhost:3000") + "/login?error=not_authenticated");
			});
			return;
		}
		
		const redirectUrl = process.env.CLIENT_BASE_URL || "http://localhost:3000";
		console.log(`[OAUTH CALLBACK] Success! User: ${req.user.username}, Session ID: ${req.sessionID}`);
		
		// Regenerate session to avoid fixation attacks and clear old cookies
		req.session.regenerate((regenErr) => {
			if (regenErr) {
				console.error("[OAUTH CALLBACK] Session regenerate error:", regenErr);
				return res.redirect(redirectUrl + "/login?error=session_error");
			}
			
			// Log user in again after regeneration
			req.login(req.user, (loginErr) => {
				if (loginErr) {
					console.error("[OAUTH CALLBACK] req.login error after regenerate:", loginErr);
					return res.redirect(redirectUrl + "/login?error=login_error");
				}
				
				// Mark session as modified and save
				req.session.touch();
				req.session.save((saveErr) => {
					if (saveErr) {
						console.error("[OAUTH CALLBACK] Session save error:", saveErr);
						return res.redirect(redirectUrl + "/login?error=session_error");
					}
					
					console.log(`[OAUTH CALLBACK] Session regenerated and saved. New Session ID: ${req.sessionID}`);
					// Redirect - express-session will set cookie with new session ID
					res.redirect(302, redirectUrl + "?oauth=success");
				});
			});
		});
	}
);

router.get("/check", (req, res) => {
	// Log incoming cookies for debugging
	const cookies = req.headers.cookie || 'NO COOKIES';
	console.log(`[AUTH CHECK] Session ID: ${req.sessionID}`);
	console.log(`[AUTH CHECK] Cookies received: ${cookies.substring(0, 100)}...`);
	console.log(`[AUTH CHECK] Is authenticated: ${req.isAuthenticated()}`);
	console.log(`[AUTH CHECK] User: ${req.user ? req.user.username : 'null'}`);
	
	// Check if session exists in store
	if (req.session && Object.keys(req.session).length > 0) {
		console.log(`[AUTH CHECK] Session data exists: ${JSON.stringify(Object.keys(req.session))}`);
	}
	
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
