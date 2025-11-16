# 🚀 Full Stack Deployment Checklist

## ✅ Current Status
- [x] Frontend deployed to Netlify: `https://interview-prep-karo.netlify.app`
- [x] Backend prepared for deployment
- [x] CORS configured for production
- [ ] Backend deployed
- [ ] Frontend connected to backend

## 📋 Next Steps

### 1. Deploy Backend (Choose One)

#### Option A: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Login with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repo → Choose `backend` folder
5. Add environment variables:
   ```
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-gemini-api-key
   FRONTEND_URL=https://interview-prep-karo.netlify.app
   ```

#### Option B: Render
1. Go to [Render.com](https://render.com)
2. "New" → "Web Service"
3. Connect GitHub repo
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add same environment variables

### 2. Get Backend URL
After deployment, you'll get a URL like:
- Railway: `https://your-app-name.railway.app`
- Render: `https://your-app-name.onrender.com`

### 3. Connect Frontend to Backend
1. Go to Netlify Dashboard
2. Site Settings → Environment Variables
3. Add: `VITE_API_BASE_URL = https://your-backend-url`
4. Trigger redeploy

### 4. Test Everything
- [ ] Backend health check: `https://your-backend-url/api/test`
- [ ] Frontend loads without CORS errors
- [ ] Login/Register works
- [ ] API calls successful

## 🔧 Environment Variables Needed

### Backend (.env)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/interview-prep
JWT_SECRET=super-secret-key-make-it-long-and-random
GEMINI_API_KEY=your-gemini-api-key-here
FRONTEND_URL=https://interview-prep-karo.netlify.app
```

### Frontend (Netlify Environment Variables)
```
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

## 🎯 Expected Result
After completing all steps:
- ✅ Frontend: `https://interview-prep-karo.netlify.app`
- ✅ Backend: `https://your-backend-url.railway.app`
- ✅ Full functionality with database and AI features

## 🐛 Common Issues & Solutions

### CORS Error
- Make sure `FRONTEND_URL` is set in backend environment variables
- Check backend CORS configuration includes your Netlify URL

### 500 Server Error
- Verify all environment variables are set correctly
- Check backend logs for specific error messages

### Build Failed
- Ensure `package.json` has correct scripts
- Check Node.js version compatibility

### Database Connection Failed
- Verify `MONGO_URI` is correct
- Make sure MongoDB allows connections from your hosting provider's IPs

## 📞 Need Help?
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
