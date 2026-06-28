# Project Structure

## Overview
RentMate is structured as a monorepo containing both the backend API and the frontend client application.

## Directory Tree

```text
RentMate/
├── backend/                  # Express.js REST API
│   ├── src/
│   │   ├── config/           # DB connection and env configurations
│   │   ├── controllers/      # Route handlers and business logic
│   │   ├── middleware/       # Custom Express middlewares (auth, validation)
│   │   ├── models/           # Mongoose schemas (Data layer)
│   │   ├── routes/           # API route definitions
│   │   └── services/         # Third-party integrations (Gemini, Cloudinary)
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Backend dependencies
│   ├── seedAdmin.js          # Script to bootstrap admin user
│   ├── seedData.js           # Database seeding utility
│   └── server.js             # Application entry point
├── frontend/                 # React.js SPA (Vite)
│   ├── src/
│   │   ├── api/              # Axios configuration and API wrappers
│   │   ├── assets/           # Static assets (images, icons)
│   │   ├── components/       # Reusable UI components (Navbar, ProtectedRoute)
│   │   ├── context/          # React Context providers (AuthContext)
│   │   ├── pages/            # View-level components mapped to routes
│   │   ├── App.jsx           # Main routing configuration
│   │   └── main.jsx          # React entry point
│   ├── .env.example          # Environment variables template
│   ├── eslint.config.js      # ESLint configuration
│   ├── index.html            # Vite HTML template
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite bundler configuration
├── docs/                     # Comprehensive project documentation
├── Contribution.md           # Team roles and Git workflow
├── PRD.md                    # Product Requirements Document
├── README.md                 # Primary project setup instructions
└── RentMate_MVP_Implementation_Plan.md # Technical implementation blueprint
```

## Architectural Significance
- **Separation of Concerns:** The backend isolates database schemas (`models/`), business logic (`controllers/`), and third-party integrations (`services/`).
- **Reusable Frontend:** The frontend isolates generic components (`components/`) from distinct screen layouts (`pages/`). State management is centralized in `context/`.
