# Testing Strategy

## Overview
The testing strategy for RentMate ensures that the core features of the MVP—specifically authentication, property creation, AI matching, and expense calculations—are reliable and secure.

## Testing Layers

### 1. Unit Testing
- **Scope:** Utility functions, specifically the deterministic fallback algorithm for Roommate Matching, and expense splitting mathematical logic.
- **Goal:** Ensure isolated logic functions correctly under various edge cases.

### 2. API Integration Testing
- **Scope:** Express.js REST API endpoints.
- **Tools:** Postman / Insomnia collections.
- **Goal:** Verify that the API correctly handles data validation, role-based access control (RBAC), and returns the expected standard JSON envelopes. Tests include ensuring an unverified student receives a `403 Forbidden` when attempting to submit a review.

### 3. Manual End-to-End (E2E) Testing
- **Scope:** Complete user journeys simulated through the React UI.
- **Goal:** Validate the integration between the Client, Backend, and Database.
- **Key E2E Flows Tested:**
  - **Student Journey:** Register -> Profile setup -> Wishlist a property -> Add expense -> Find roommate.
  - **Owner Journey:** Register -> Wait for admin verification -> Add property -> Upload images -> Respond to inquiry.
  - **Admin Journey:** Login -> Verify pending property -> Verify student.

## MVP Limitations
- Automated E2E testing tools (like Cypress or Playwright) are not configured for the MVP.
- Automated API test suites (like Jest/Supertest) are not currently enforced in a CI pipeline.

## Future Work
- **CI/CD Integration:** Implementing GitHub Actions to run automated tests on every Pull Request against the `dev` branch.
- **Frontend Component Testing:** Utilizing React Testing Library to test individual UI components (e.g., verifying that the ProtectedRoute component properly redirects unauthenticated users).
