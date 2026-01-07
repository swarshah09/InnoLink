# Deployment Guide

This guide walks you through deploying InnoLink to production:
- **Frontend**: Vercel
- **Backend**: Render

## Prerequisites

- GitHub account
- MongoDB Atlas account (or MongoDB database)
- Google AI Studio account (for Gemini API key)
- GitHub OAuth App configured

---

## Part 1: Backend Deployment (Render)

### Step 1: Prepare Backend

1. Ensure all backend code is in the `backend/` folder
2. Verify `backend/package.json` has correct scripts:
   ```json
   {
     "scripts": {
       "start": "node server.js"
     }
   }
   ```

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `innolink-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier is fine for testing

### Step 3: Environment Variables (Render)

Add these environment variables in Render Dashboard → Environment:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
GITHUB_API_KEY=your_github_personal_access_token
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
CLIENT_BASE_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.onrender.com
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro
```

**Important**: 
- `CLIENT_BASE_URL`: Your Vercel frontend URL (set after deploying frontend)
- `BACKEND_URL`: Your Render backend URL (set after deploying backend)

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically deploy
3. Wait for deployment to complete
4. Copy your backend URL (e.g., `https://innolink-backend.onrender.com`)

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Create `frontend/.env.example` (already created)
2. Ensure `frontend/vercel.json` exists (already created)

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Step 3: Environment Variables (Vercel)

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

**Important**: Replace with your actual Render backend URL.

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will automatically build and deploy
3. Wait for deployment to complete
4. Copy your frontend URL (e.g., `https://innolink.vercel.app`)

---

## Part 3: Update Configuration

### Step 1: Update Backend CORS

After getting your Vercel frontend URL:

1. Go back to Render Dashboard
2. Update `CLIENT_BASE_URL` environment variable:
   ```
   CLIENT_BASE_URL=https://your-frontend.vercel.app
   ```
3. Render will automatically redeploy

### Step 2: Update GitHub OAuth App

**This step is CRITICAL - the OAuth callback URL must match exactly!**

1. Go to [GitHub.com](https://github.com) → Click your profile picture (top right) → **Settings**
2. Scroll down to **Developer settings** (bottom left sidebar)
3. Click **OAuth Apps** → Click on your OAuth App (or create a new one if needed)
4. Update the following fields:
   - **Homepage URL**: `https://your-frontend.vercel.app`
     - Example: `https://inno-link-gamma.vercel.app`
   - **Authorization callback URL**: `https://your-backend.onrender.com/api/auth/github/callback`
     - Example: `https://innolink.onrender.com/api/auth/github/callback`
     - ⚠️ **Must match exactly** - no trailing slashes, exact path `/api/auth/github/callback`
5. Click **Update application**
6. **Wait a few seconds** for GitHub to process the changes

**Important Notes**:
- The callback URL must point to your **backend URL** (Render), not the frontend URL
- The URL must be exactly: `https://your-backend-url/api/auth/github/callback`
- Make sure `BACKEND_URL` environment variable in Render matches your actual Render URL
- If you see "redirect_uri is not associated with this application", the callback URL in GitHub doesn't match what's in your code

---

## Part 4: Testing

1. Visit your Vercel frontend URL
2. Try logging in with GitHub
3. Test all features:
   - Profile viewing
   - Repository browsing
   - Real-time chat
   - Code editor collaboration
   - AI assistant

---

## Troubleshooting

### CORS Errors

- Ensure `CLIENT_BASE_URL` in Render matches your Vercel URL exactly (e.g., `https://inno-link-gamma.vercel.app`)
- Check that both URLs use HTTPS in production
- **Important**: Do NOT include a trailing slash in `CLIENT_BASE_URL` (e.g., use `https://inno-link-gamma.vercel.app` not `https://inno-link-gamma.vercel.app/`)
- Check Render logs to see what origin is being blocked
- The CORS configuration normalizes origins (removes trailing slashes) for comparison

### Socket.IO Connection Issues

- Verify `VITE_SOCKET_URL` in Vercel matches your Render backend URL
- Ensure WebSocket support is enabled on Render (it should be by default)

### Authentication Issues

#### "redirect_uri is not associated with this application" Error

This error means the callback URL in your GitHub OAuth App doesn't match what your backend is sending.

**Fix Steps:**
1. **Check your Render backend URL**: Go to Render Dashboard → Your Service → Copy the URL
   - Example: `https://innolink.onrender.com`

2. **Check Render environment variable**: 
   - Go to Render → Environment → Verify `BACKEND_URL` is set
   - Should be: `https://innolink.onrender.com` (no trailing slash)

3. **Update GitHub OAuth App**:
   - Go to GitHub → Settings → Developer settings → OAuth Apps → Your App
   - Set **Authorization callback URL** to: `https://innolink.onrender.com/api/auth/github/callback`
   - Click **Update application**
   - Wait 10-30 seconds for changes to propagate

4. **Verify the callback URL** in your code matches:
   - The callback URL should be: `${BACKEND_URL}/api/auth/github/callback`
   - Check Render logs to see what callback URL is being used

5. **Clear browser cache** and try again

**Common Mistakes:**
- ❌ Adding trailing slash: `https://innolink.onrender.com/`
- ❌ Wrong path: `/callback` instead of `/api/auth/github/callback`
- ❌ Using frontend URL instead of backend URL
- ❌ Not waiting for GitHub to update the OAuth app settings

**Other Authentication Issues:**
- Verify `CLIENT_BASE_URL` includes the protocol (`https://`)
- Ensure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct in Render
- Check Render logs for authentication errors

### API Connection Issues

- Verify `VITE_API_URL` in Vercel points to your Render backend
- Check that Render service is running (not sleeping on free tier)

---

## Free Tier Limitations

### Render (Free Tier)
- Services sleep after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds
- Consider upgrading for production use

### Vercel (Free Tier)
- Generous limits for most use cases
- Automatic deployments on git push
- Global CDN

---

## Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] All environment variables set
- [ ] GitHub OAuth callback URL updated
- [ ] CORS configured correctly
- [ ] Socket.IO connections working
- [ ] AI assistant (Gemini) configured
- [ ] MongoDB connection established
- [ ] All features tested end-to-end

---

## Support

For issues, check:
- Render logs: Dashboard → Your Service → Logs
- Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
- Browser console for frontend errors
- Network tab for API errors

