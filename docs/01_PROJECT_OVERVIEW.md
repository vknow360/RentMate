# RentMate Overview

## Project Introduction
RentMate is a student-centric accommodation discovery platform designed to help students find verified Paying Guests (PGs), hostels, shared apartments, and compatible roommates. The platform provides a centralized, trustworthy ecosystem that bridges the gap between students seeking safe housing and property owners looking to rent out their spaces.

## Problem Statement
Students relocating for education face significant difficulties finding affordable, safe, and reliable accommodation. Current methods heavily rely on unverified social media groups, local brokers, and word-of-mouth. This leads to issues such as fraudulent listings, hidden charges, poor roommate matching, lack of identity/property verification, and time-consuming manual searches.

## Vision
To provide students with a reliable, transparent, and technology-driven platform for discovering accommodation and compatible roommates while simplifying the overall relocation process.

## Project Goals
- Improve transparency in student accommodation
- Reduce dependency on brokers
- Digitize roommate matching
- Centralize student housing information
- Improve overall renting experience

## Key Features Currently Implemented
- **Smart Accommodation Search:** Search properties by city, area, college name, budget, property type, and sharing type.
- **Verified Property Listings:** Admin-verified listings displaying owner details, rent, amenities, and location.
- **Smart Roommate Matching:** AI-driven compatibility scoring (via Google Gemini) based on sleep schedule, study hours, food preferences, cleanliness, and noise tolerance.
- **Expense Splitter:** Built-in tool to track shared household expenses, calculate per-person shares, and view outstanding balances between roommates.
- **Interactive Maps:** Google Maps Embed API integration on property details for local neighborhood context.
- **Wishlist & Inquiries:** Students can save favorite properties and send inquiries directly to owners.
- **Reviews & Ratings:** Verified students can submit ratings for food quality, safety, internet, and cleanliness.
- **Role-based Dashboards:** Dedicated interfaces for Students, Property Owners, and Admins.

*(Note: Real-time push notifications are currently implemented via database polling as per MVP constraints.)*

## Target Users
- **Students (Primary):** Undergraduate, postgraduate, and internship students relocating for studies.
- **Property Owners (Secondary):** PG owners, hostel owners, and property managers seeking to reach the student market.
- **Administrators:** Platform moderators responsible for verifying users and property listings.

## High-level System Overview
RentMate operates on a three-tier client-server architecture:
1. **Client Tier:** A responsive Single Page Application (SPA) built with React and Tailwind CSS, tailored for a mobile-first, student-friendly experience. The frontend communicates exclusively with the REST API.
2. **Backend API Tier:** A Node.js/Express RESTful API. The backend manages authentication, authorization, business logic, AI integrations, and database operations. External services such as Cloudinary and Gemini are accessed only through the backend to prevent exposing credentials on the client side.
3. **Data Tier:** MongoDB storing user data, property listings, roommate preferences, expenses, and reviews.

```mermaid
architecture-beta
    group client(cloud)[Client Tier]
    group backend(server)[Backend API Tier]
    group db(database)[Data Tier]
    
    service browser(internet)[React Web App] in client
    service api(server)[Node/Express Server] in backend
    service mongo(database)[MongoDB Atlas] in db
    
    service gemini(cloud)[Google Gemini API]
    service cloudinary(cloud)[Cloudinary Storage]
    
    browser:R --> L:api
    api:B --> T:mongo
    api:R --> L:gemini
    api:R --> L:cloudinary
```

## Technology Stack
- **Frontend:** React (via Vite), React Router v7, Tailwind CSS v4, Context API.
- **Backend:** Node.js, Express.js, JWT (Authentication), bcryptjs.
- **Database:** MongoDB, Mongoose ODM.
- **External Services:** 
  - Google Generative AI (Gemini 2.0 Flash) for Roommate Matching.
  - Cloudinary (via Multer memory storage) for image hosting.
  - Google Maps Embed API for interactive maps.

## Project Structure Overview
The project is built as a monorepo containing two main directories:
- `/backend`: Contains the Node.js API server.
- `/frontend`: Contains the React.js Vite application.

## Current Development Status

RentMate is currently in the MVP implementation stage. Core user workflows—including authentication, property discovery, wishlist management, AI-powered roommate matching, expense splitting, property management, and administrative moderation—have been implemented and are functional.

Additional features such as real-time notifications, online payments, and native mobile applications remain planned for future releases.

## Repository Organization
```text
RentMate/
├── backend/                  # Express.js REST API
│   ├── src/
│   │   ├── config/           # Database configurations
│   │   ├── controllers/      # Route logic and handlers
│   │   ├── middleware/       # JWT auth, authorization, etc.
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express route definitions
│   │   └── services/         # Third-party integrations (Gemini, Cloudinary)
│   ├── .env.example          # Environment variables template
│   ├── package.json
│   ├── seedAdmin.js          # Script to bootstrap admin user
│   ├── seedData.js           # Database seeding utility
│   └── server.js             # Application entry point
├── frontend/                 # React.js SPA
│   ├── src/
│   │   ├── api/              # Axios API client setup
│   │   ├── assets/           # Static assets (images, icons)
│   │   ├── components/       # Reusable UI components (Navbar, ProtectedRoute)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── pages/            # Page-level components (Home, Login, AdminDashboard)
│   │   ├── App.jsx           # Main routing configuration
│   │   └── main.jsx          # React entry point
│   ├── .env.example          # Environment variables template
│   ├── eslint.config.js      # ESLint configuration
│   ├── index.html            # Vite HTML template
│   ├── package.json
│   └── vite.config.js        # Vite bundler configuration
├── docs/                     # Project documentation
├── Contribution.md           # Team roles and Git workflow
├── PRD.md                    # Product Requirements Document
├── README.md                 # Primary project setup instructions
└── RentMate_MVP_Implementation_Plan.md # Technical implementation blueprint
```

## Team Responsibilities
Based on `Contribution.md`, the Gryork TechPreneur Training Program team (FantasticFour) is divided as follows:
- **Priyanshu Singh:** Frontend Development & UI/UX (Authentication, Property Search, Details, Expense Splitter UI).
- **Alokit Mishra:** Backend Development (Auth API, Property CRUD, Admin panel, System Architecture).
- **Sunny Kumar Gupta:** Database & API Development (Mongoose models, Cloudinary integration, Gemini AI integration).
- **Prakhar Pandey:** Project Coordination, Testing & Documentation (Notifications, Wishlist, Reviews/Ratings).

## Future Direction
*The following features are explicitly defined as **Future Work** and are not included in the current scope:*
- Online payments and rent gateway integration (UPI, deposit collection).
- Digital rental agreements and e-signatures.
- Real-time WebSockets (Socket.io) for chat and push notifications.
- Native mobile applications (Android/iOS).
- Advanced AI for fraud detection and property recommendations.
- Community forums and student social feeds.
