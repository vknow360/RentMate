# Troubleshooting Guide

## Overview
Common issues encountered during local development and deployment of RentMate, along with their solutions.

## Backend Issues

### 1. MongoDB Connection Timeout
**Error:** `MongoTimeoutError: Server selection timed out after 30000 ms`
**Solution:**
- Ensure your current IP address is whitelisted in your MongoDB Atlas Network Access panel.
- Verify that `MONGODB_URI` in your `.env` file is formatted correctly and contains the right username and password.

### 2. Cloudinary Upload Failing
**Error:** Images fail to save, or the API returns a 500 error during property creation.
**Solution:**
- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correct in your `.env` file.
- Ensure the `multer` middleware is correctly configured to use `memoryStorage()` and not disk storage.

### 3. Gemini API Returning Fallback Scores
**Issue:** The AI Roommate matching always returns rule-based fallback scores instead of AI reasoning.
**Solution:**
- Check if your `GEMINI_API_KEY` is valid.
- Ensure you have not exceeded your free-tier rate limits for the Google Generative AI API.

## Frontend Issues

### 1. CORS Errors on API Requests
**Error:** `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource.`
**Solution:**
- Ensure the backend `server.js` has the `cors()` middleware configured correctly before defining routes.
- Verify `VITE_API_BASE_URL` in the frontend `.env` points to the exact backend URL (including `http://`).

### 2. User Logged Out on Page Refresh
**Issue:** Authentication state is lost when the browser reloads.
**Solution:**
- Ensure the `AuthContext` initializes by checking for a valid token in `localStorage`.
- Verify the backend is returning a valid JWT format upon login.

## Deployment Issues

### Render Cold Starts
**Issue:** The API takes a long time to respond when accessed after a period of inactivity.
**Solution:** This is a known limitation of the Render free tier. The server spins down after 15 minutes of inactivity. To mitigate this during a demo, ping the API manually a few minutes beforehand.
