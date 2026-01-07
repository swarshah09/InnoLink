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
				// Prioritize BACKEND_URL, fallback to CLIENT_BASE_URL, then relative path
				if (process.env.BACKEND_URL) {
					const url = process.env.BACKEND_URL.replace(/\/$/, '') + '/api/auth/github/callback';
					console.log(`GitHub OAuth callback URL: ${url}`);
					return url;
				}
				if (process.env.CLIENT_BASE_URL) {
					const url = process.env.CLIENT_BASE_URL.replace(/\/$/, '') + '/api/auth/github/callback';
					console.log(`GitHub OAuth callback URL (using CLIENT_BASE_URL): ${url}`);
					return url;
				}
				console.log('GitHub OAuth callback URL: /api/auth/github/callback (relative)');
				return "/api/auth/github/callback";
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
