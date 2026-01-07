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

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Edit your OAuth App:
   - **Homepage URL**: `https://your-frontend.vercel.app`
   - **Authorization callback URL**: `https://your-backend.onrender.com/api/auth/github/callback`

**Important**: The callback URL must point to your **backend URL**, not the frontend URL.

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

- Ensure `CLIENT_BASE_URL` in Render matches your Vercel URL exactly
- Check that both URLs use HTTPS in production

### Socket.IO Connection Issues

- Verify `VITE_SOCKET_URL` in Vercel matches your Render backend URL
- Ensure WebSocket support is enabled on Render (it should be by default)

### Authentication Issues

- Verify GitHub OAuth callback URL matches exactly
- Check that `CLIENT_BASE_URL` includes the protocol (`https://`)

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

