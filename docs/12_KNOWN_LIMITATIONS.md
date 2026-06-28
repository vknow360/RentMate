# Known Limitations

## Overview
As a Minimum Viable Product (MVP), RentMate intentionally scopes down certain features to validate the core business logic and maintain a rapid development cycle. The following are known limitations in the current implementation.

## System & Infrastructure Limitations
1. **Cold Starts:** The backend is deployed on Render's free tier. If the server receives no traffic for 15 minutes, it spins down. The first subsequent request will experience a "cold start" delay of up to 60 seconds.
2. **Polling for Real-Time Data:** Due to the infrastructure costs and complexity of WebSockets in free-tier PaaS environments, real-time notifications are currently implemented via a frontend HTTP polling interval.
3. **Load Testing:** The platform NFR defines support for 1,000+ concurrent users; however, the free-tier MongoDB Atlas (M0) and Render instances have not been stress-tested to guarantee this throughput.

## Feature Limitations
1. **Manual User Verification:** Verification of students and property owners is currently a manual toggle operated by an Administrator. There is no automated OTP/SMS, email magic link, or document OCR verification implemented.
2. **Roommate Matching Scope:** The AI compatibility scoring currently only evaluates 1-to-1 pairings. It does not calculate aggregate compatibility for households of three or more people.
3. **No Payment Gateway:** The application facilitates expense calculation and tracking but does not process actual financial transactions (e.g., UPI, Stripe). Rent payment and deposit collection remain offline actions.
4. **Static Interactive Maps:** Property locations are displayed using the Google Maps Embed API (static iframes) rather than the dynamic Maps JavaScript API, limiting advanced map interactions like route plotting.

All limitations above are documented and acknowledged as acceptable constraints for the MVP phase.
