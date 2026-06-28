# Deployment Guide

## Overview
RentMate is designed to deploy on modern, lightweight Platform-as-a-Service (PaaS) providers. The MVP utilizes free-tier services to minimize initial operating costs.

## Infrastructure Stack
- **Frontend:** Vercel
- **Backend:** Render (Web Service)
- **Database:** MongoDB Atlas (M0 Shared Cluster)
- **Media Storage:** Cloudinary

## Environment Variables

### Backend (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rentmate
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com/api
```

## Deployment Steps

1. **Database:**
   - Create a free cluster on MongoDB Atlas.
   - Whitelist IP addresses (use `0.0.0.0/0` for Render).
   - Obtain connection string.
2. **Backend (Render):**
   - Connect the GitHub repository to Render.
   - Set Build Command: `npm install`
   - Set Start Command: `npm start` (or `node server.js`).
   - Input all Backend environment variables in the Render dashboard.
3. **Frontend (Vercel):**
   - Connect the GitHub repository to Vercel.
   - Set Framework Preset to `Vite`.
   - Input the `VITE_API_BASE_URL` environment variable.
   - Deploy.

## MVP Limitations
- Render free-tier services sleep after 15 minutes of inactivity, causing a 30-60 second "cold start" delay for the first request.
- Ephemeral disk space on Render prevents local file storage, which is why Cloudinary streams are mandatory.

## Future Work
- **Containerization:** Dockerizing the frontend and backend for deployment on AWS ECS or DigitalOcean App Platform for consistent performance without cold starts.
- **CI/CD Pipelines:** Implementing GitHub Actions for automated testing and linting before deployment.
