# API Documentation

## Overview
The RentMate backend provides a RESTful API. All endpoints are prefixed with `/api`.

## Standard Response Format
To ensure predictable client parsing, all API responses adhere to a consistent JSON envelope:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Human-readable error description"
}
```

## Endpoint Categories

### Authentication (`/api/auth`)
- `POST /register`: Register a new user (Student or Owner).
- `POST /login`: Authenticate and receive a JWT.
- `POST /logout`: Client-side token invalidation.

### Users (`/api/users`)
- `GET /me`: Retrieve current user profile.
- `PUT /me`: Update profile and roommate preferences.
- `POST /me/avatar`: Upload profile image (multipart/form-data).

### Properties (`/api/properties`)
- `GET /`: Search properties with query params (`city`, `nearestCollege`, `minRent`, `maxRent`, `amenities`). Returns verified properties only, unless `owner=me` is passed by an authenticated owner.
- `GET /:id`: Retrieve property details.
- `POST /`: Create a new property listing (Owner only).
- `PUT /:id`: Edit listing (Owner only).
- `DELETE /:id`: Delete listing (Owner/Admin).
- `POST /:id/images`: Upload property images.

### Roommates (`/api/roommates`)
- `GET /`: List students seeking roommates.
- `GET /matches`: Retrieve cached AI compatibility scores.
- `POST /matches/:targetUserId/compute`: Force AI score computation.

### Expenses (`/api/expenses`)
- `POST /`: Add shared expense.
- `GET /?groupId=`: List expenses for a group.
- `GET /balances?groupId=`: Compute net balances per user.

### Inquiries & Reviews
- `POST /api/inquiries`: Contact property owner.
- `POST /api/reviews`: Submit property review (Verified Students only).

### Admin (`/api/admin`)
- `GET /listings/pending`: View unverified properties.
- `PUT /listings/:id/verify`: Approve listing.
- `PUT /users/:id/verify`: Approve student/owner verification.

## Future Work
- Endpoint versioning (e.g., `/api/v1/...`).
- Pagination metadata in the standard response envelope.
- GraphQL API gateway for complex student dashboard queries.
