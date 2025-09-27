# Backend Deployment Guide

## 🚀 Quick Deploy to Railway (Recommended)

### Step 1: Prepare Your Code
1. Make sure all files are committed to Git
2. Push your backend code to GitHub

### Step 2: Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `backend` folder (or root if backend is in root)

### Step 3: Set Environment Variables
In Railway dashboard, go to Variables tab and add:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/interview-prep
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
GEMINI_API_KEY=your-gemini-api-key-here
FRONTEND_URL=https://interview-prep-karo.netlify.app
```

### Step 4: Update Frontend
After deployment, Railway will give you a URL like:
`https://your-app-name.railway.app`

Update your frontend's Netlify environment variables:
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add: `VITE_API_BASE_URL = https://your-app-name.railway.app`
3. Redeploy frontend

## 🔧 Alternative: Deploy to Render

### Step 1: Go to Render.com
1. Sign up/Login with GitHub
2. Click "New" → "Web Service"
3. Connect your GitHub repo

### Step 2: Configure
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node

### Step 3: Add Environment Variables
Same as Railway above.

## 📋 Environment Variables Needed

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `super-secret-key-123` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `FRONTEND_URL` | Your frontend URL | `https://interview-prep-karo.netlify.app` |

## ✅ After Deployment

1. Test your backend URL in browser: `https://your-backend-url.com/api/test`
2. Update frontend environment variables
3. Redeploy frontend
4. Test the full application

## 🐛 Troubleshooting

- **CORS Error**: Make sure `FRONTEND_URL` is set correctly
- **Database Error**: Check `MONGO_URI` is correct
- **500 Error**: Check all environment variables are set
- **Build Failed**: Make sure `package.json` has correct start script
