# RentMate

## Project Theme Selection
**Theme:** Smart Student Housing & Roommate Discovery Platform  
**Project Name:** RentMate

## Team Details
**Team Name:** [Insert Team Name]

| Name | Role | TECH ID |
| :--- | :--- | :--- |
| Priyanshu Singh | Frontend Development & UI/UX | [C15E1A] |
| Alokit Mishra | Backend Development | [C15E2E] |
| Sunny Kumar Gupta | Database & API Development | [57548E] |
| Prakhar Pandey | Project Coordination, Testing & Documentation | [BEC1DA] |

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS v4, React Router, Context API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **File Storage:** Cloudinary (via Multer memory storage)
- **AI Integration:** Google Generative AI (Gemini 2.0 Flash) for Roommate Matching

## Setup & Run Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI
- Cloudinary Account (for image uploads)
- Gemini API Key (for AI roommate matching)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd RentMate
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create a .env file based on .env.example
cp .env.example .env
# Edit .env with your MongoDB URI, JWT Secret, Cloudinary credentials, and Gemini API key

# Run the backend development server
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 4. Admin Setup (Optional)
To bootstrap the initial admin user, run the following command in the backend folder:
```bash
node seedAdmin.js
```
*Default Admin Credentials:* `admin@rentmate.com` / `adminpassword123`

The application should now be accessible at `http://localhost:5173`.
