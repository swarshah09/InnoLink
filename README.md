# InnoLink - Collaborative Development Platform

A modern MERN stack application for collaborative code development with real-time editing, AI-powered code assistance, and GitHub integration.

## Features

-   ⚙️ **Tech stack**: MERN + TailwindCSS + GitHub API
-   🔑 **Authentication**: GitHub OAuth with Passport.js
-   👾 **GitHub Integration**: Fetch user profiles and repositories
-   💬 **Real-time Chat**: WebSocket-based messaging
-   💻 **Live Code Editor**: Collaborative code editing with Monaco Editor
-   🤖 **AI Assistant**: Google Gemini-powered coding assistant
-   🚀 **Code Review**: Real-time collaborative code review rooms
-   🐛 **Error handling**: Comprehensive error handling on both client and server

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Complete deployment guide for Vercel (Frontend) + Render (Backend)

### Setup .env file

Create a `.env` file in the `backend/` folder:

```js
PORT=5000
MONGO_URI=
GITHUB_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
CLIENT_BASE_URL=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-pro
```

### Install Dependencies

```shell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (from root)
cd ../frontend
npm install
```

### Start the app

```shell
# From backend folder
cd backend
npm start
```

### Development

```shell
# From backend folder
cd backend
npm run dev
```
