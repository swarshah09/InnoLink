import passport from "passport";
import dotenv from "dotenv";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";

dotenv.config();

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		callbackURL: (() => {
			// Determine the correct callback URL
			let callbackURL;
			
			// In production, always use BACKEND_URL if available
			if (process.env.BACKEND_URL) {
				callbackURL = process.env.BACKEND_URL.replace(/\/$/, '') + '/api/auth/github/callback';
			} 
			// Fallback: construct from CLIENT_BASE_URL if BACKEND_URL not set (dev/local)
			else if (process.env.CLIENT_BASE_URL && process.env.NODE_ENV !== 'production') {
				callbackURL = process.env.CLIENT_BASE_URL.replace(/\/$/, '') + '/api/auth/github/callback';
			}
			// Last resort: relative path (only for local dev)
			else {
				callbackURL = "/api/auth/github/callback";
			}
			
			console.log('='.repeat(60));
			console.log('GitHub OAuth Configuration:');
			console.log(`BACKEND_URL: ${process.env.BACKEND_URL || 'NOT SET'}`);
			console.log(`CLIENT_BASE_URL: ${process.env.CLIENT_BASE_URL || 'NOT SET'}`);
			console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
			console.log(`Callback URL: ${callbackURL}`);
			console.log('='.repeat(60));
			console.log('⚠️  IMPORTANT: Make sure this callback URL matches EXACTLY in GitHub OAuth App settings!');
			console.log('='.repeat(60));
			
			return callbackURL;
		})(),
		},
		async function (accessToken, refreshToken, profile, done) {
			const user = await User.findOne({ username: profile.username });
			// signup
			if (!user) {
				const newUser = new User({
					name: profile.displayName,
					username: profile.username,
					profileUrl: profile.profileUrl,
					avatarUrl: profile.photos[0].value,
					likedProfiles: [],
					likedBy: [],
				});
				await newUser.save();
				done(null, newUser);
			} else {
				done(null, user);
			}
		}
	)
);
