# Development Workflow

## Overview
This document outlines the standard operating procedures for developers contributing to the RentMate repository.

## Local Environment Setup
1. **Prerequisites:** 
   - Node.js v18+
   - Git
   - MongoDB (Local instance or Atlas URI)
   - Cloudinary Account
   - Google Gemini API Key
2. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd RentMate
   ```
3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Populate .env with necessary keys
   npm run dev
   ```
4. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Ensure VITE_API_BASE_URL points to http://localhost:5000/api
   npm run dev
   ```
5. **Database Seeding (Optional):**
   Run `node src/scripts/seedAdmin.js` in the backend folder to create the initial admin account.

## Coding Standards
- **Frontend:** Strict adherence to Tailwind CSS utility classes. Avoid inline styles. UI components must avoid gradients to maintain the established design philosophy.
- **Backend:** All routes must return the standard JSON response envelope `{ success, data, message }` or `{ success, error }`.
- **Secrets:** Never hardcode API keys, JWT secrets, or database URIs. Always use `process.env`.

## Branching & Pull Requests
Follow the guidelines outlined in `15_GIT_WORKFLOW.md`. Features should be developed on dedicated branches and merged into the `dev` branch via Pull Requests.
