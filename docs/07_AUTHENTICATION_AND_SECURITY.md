# Authentication and Security

## Overview
Security in RentMate is handled at multiple layers, prioritizing stateless authentication, password security, and role-based access control (RBAC).

## Authentication Flow
RentMate uses JSON Web Tokens (JWT) for stateless authentication.
1. User provides credentials to `/api/auth/login`.
2. The server verifies the password using `bcryptjs`.
3. A JWT is signed using `process.env.JWT_SECRET` containing the `userId` and `role`. The token is set to expire in 7 days.
4. The client stores the JWT in `localStorage` and attaches it to the `Authorization: Bearer <token>` header of subsequent requests.

## Role-Based Access Control (RBAC)
Middleware enforces access rules based on the user's role:
- **Student:** Can search properties, find roommates, post reviews (if verified), and manage expenses.
- **Owner:** Can create, edit, and delete their own property listings and respond to inquiries.
- **Admin:** Can verify users, verify listings, and access analytics.

## Data Security
- **Password Hashing:** All passwords are one-way hashed using `bcrypt` with a salt round of 10 before being stored in the database.
- **Injection Protection:** Mongoose ODM inherently prevents NoSQL injection attacks by casting types and sanitizing inputs.
- **HTTP Headers:** `helmet` middleware is used to set secure HTTP headers (e.g., XSS filter, frameguard, HSTS).

## MVP Limitations
- Manual Admin verification is used in place of OTP/SMS or automated document verification to reduce API costs.
- The JWT is stored in `localStorage`, which is susceptible to Cross-Site Scripting (XSS).

## Future Work
- **HttpOnly Cookies:** Migrating JWT storage from `localStorage` to `HttpOnly` cookies to mitigate XSS vulnerabilities.
- **Refresh Tokens:** Implementing short-lived access tokens combined with long-lived refresh tokens.
- **Automated KYC:** Integrating third-party identity verification services (e.g., Digilocker or OCR services) for automated student/owner verification.
