# RentMate — MVP Implementation Plan
**For execution by an LLM coding agent (Claude Code, Gemini, ChatGPT, etc.)**

Source: `RentMate_PRD_v2_Final.pdf` (Team FantasticFour, Gryork TechPreneur Program)
Purpose of this document: translate the PRD into an unambiguous, sequenced build spec so any capable coding LLM can implement the MVP end-to-end with minimal back-and-forth.

---

## 0. How to use this document (instructions to the executing LLM)

1. Build in the **phase order** given in Section 6. Do not skip ahead — later phases assume earlier ones exist and are tested.
2. After each phase, run/verify the **Definition of Done** checklist before moving on.
3. Where the PRD was ambiguous, a decision has already been made for you in this doc — follow it, don't re-derive it.
4. Anything under **"Explicit Non-Goals"** (Section 2) must NOT be built, even if it seems easy to add. Scope creep is the main MVP risk.
5. Secrets (API keys, DB URIs, JWT secret) go in `.env`, never hardcoded, never committed. A `.env.example` must be created.
6. Every API endpoint must return JSON in the consistent envelope defined in Section 9.4.

---

## 1. Tech Stack (final, locked)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React.js (Vite) + Tailwind CSS | Framer Motion optional polish, add only after core flows work |
| Backend | Node.js + Express.js | REST API only |
| Database | MongoDB (Atlas free tier) | Mongoose ODM |
| Auth | JWT (access token only) | bcrypt for password hashing |
| AI Compatibility Scoring | **Google Gemini API** (`gemini-2.0-flash` or current equivalent) | Called server-side only, never from frontend |
| Maps | Google Maps Embed API / Maps JavaScript API | Free tier with API key restrictions |
| Image hosting | Cloudinary (free tier) | Property + profile images |
| Real-time / Notifications | **Dropped for MVP** — DB-backed notifications + polling (see 5.4) | Per your decision; Socket.io deferred to Phase 2 |
| Hosting (backend) | Render (free web service) | Cold-start delay acceptable for demo |
| Hosting (frontend) | Vercel | Auto-deploy from GitHub |
| Hosting (DB) | MongoDB Atlas free cluster (M0) | |
| Image storage | Cloudinary free tier | |

**Removed from PRD's original stack for MVP cost/complexity reasons:** Socket.io (real-time). This is a deliberate scope cut, not an oversight — see Section 2.2.

---

## 2. Scope

### 2.1 In Scope for MVP (build these)
- Student & Property Owner registration/login (JWT auth)
- Student profile with lifestyle/roommate preference fields
- Property listing CRUD (owner side)
- Search & filter properties (city, college, budget, type, amenities)
- Property detail page with image gallery + embedded map
- Wishlist (save properties)
- Roommate discovery list + **AI-generated compatibility score** (Gemini)
- Expense splitter (add expense, auto-calculate shares, show balances)
- Reviews & ratings (only by students marked "verified")
- Admin panel: verify listings, verify students, manage/remove users & listings, basic analytics counts
- DB-backed notifications (polling, not push)

### 2.2 Explicit Non-Goals (do NOT build, even if asked to "improve")
- Online payments / rent gateway / UPI / deposit collection
- Digital rental agreements / e-signatures
- AI fraud detection, AI property recommendation engine (only the roommate compatibility score uses AI)
- Voice/video calling, group chat
- Native mobile apps
- Community forums / social feed
- **Socket.io real-time push** (downgraded to polling per your decision)

If the person building this later wants any of the above, treat it as a Phase 2/3 request, not an MVP bug.

---

## 3. Data Models (MongoDB / Mongoose)

> Field names below are the authoritative contract used by both backend and frontend. Do not rename without updating both sides.

### 3.1 `User`
```js
{
  name: String, required,
  email: String, required, unique, lowercase,
  password: String, required, // bcrypt hashed
  role: { type: String, enum: ['student', 'owner', 'admin'], required: true },
  phone: String,
  college: String, // required if role === 'student'
  isVerified: { type: Boolean, default: false }, // student college-ID/email verification OR owner badge
  verificationDocUrl: String, // optional, Cloudinary URL of ID proof
  profileImage: String, // Cloudinary URL
  // Roommate preference fields — only relevant if role === 'student'
  preferences: {
    sleepSchedule: { type: String, enum: ['early_bird', 'night_owl', 'flexible'] },
    studyHabits: { type: String, enum: ['quiet_focused', 'group_study', 'flexible'] },
    foodPreference: { type: String, enum: ['veg', 'non_veg', 'vegan', 'eggetarian'] },
    smoking: { type: Boolean, default: false },
    cleanliness: { type: Number, min: 1, max: 5 }, // 1 = relaxed, 5 = very tidy
    socialType: { type: String, enum: ['introvert', 'extrovert', 'balanced'] },
    noiseTolerance: { type: Number, min: 1, max: 5 },
    budget: Number,
    moveInDate: Date,
    bio: String
  },
  isLookingForRoommate: { type: Boolean, default: false },
  createdAt: Date, default now
}
```

### 3.2 `Property`
```js
{
  ownerId: { type: ObjectId, ref: 'User', required: true },
  title: String, required,
  description: String,
  rent: Number, required,
  deposit: Number,
  city: String, required,
  locality: String,
  nearestCollege: String, // for college-based search
  latitude: Number,
  longitude: Number,
  propertyType: { type: String, enum: ['PG', 'Hostel', 'Apartment', 'Shared Room'] },
  sharingType: { type: String, enum: ['single', 'double', 'triple', 'dormitory'] },
  amenities: [String], // e.g. ['wifi','ac','laundry','mess','cctv','gym','parking','power_backup']
  images: [String], // Cloudinary URLs
  vacancyStatus: { type: String, enum: ['available', 'full'], default: 'available' },
  isVerified: { type: Boolean, default: false }, // admin-approved
  createdAt: Date, default now
}
```

### 3.3 `Wishlist`
```js
{
  studentId: { type: ObjectId, ref: 'User', required: true },
  propertyId: { type: ObjectId, ref: 'Property' },
  createdAt: Date, default now
}
```
*(unique compound index on studentId+propertyId to prevent duplicate saves)*

### 3.4 `RoommateMatch` (stores computed AI scores so they aren't recomputed every page load)
```js
{
  studentA: { type: ObjectId, ref: 'User', required: true },
  studentB: { type: ObjectId, ref: 'User', required: true },
  compatibilityScore: Number, // 0-100, from Gemini
  reasons: [String], // short explanatory bullet strings, from Gemini
  computedAt: Date, default now
}
```
*(unique compound index on studentA+studentB, normalized so A.id < B.id to avoid duplicate pairs)*

### 3.5 `Expense`
```js
{
  groupId: String, // identifies a shared "household" — see 5.5 for how this is assigned
  createdBy: { type: ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['Rent','Electricity','Water','Internet','Groceries','Other'] },
  amount: Number, required,
  description: String,
  splitBetween: [{ type: ObjectId, ref: 'User' }], // who shares this expense
  paidBy: { type: ObjectId, ref: 'User' },
  createdAt: Date, default now
}
```

### 3.6 `Review`
```js
{
  propertyId: { type: ObjectId, ref: 'Property', required: true },
  studentId: { type: ObjectId, ref: 'User', required: true },
  ratings: {
    foodQuality: Number, // 1-5, optional if not a mess-included property
    safety: Number,
    internet: Number,
    cleanliness: Number
  },
  overallRating: Number, // computed average
  comment: String,
  createdAt: Date, default now
}
```

### 3.7 `Notification`
```js
{
  userId: { type: ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['new_listing','price_drop','vacancy','roommate_match','inquiry'] },
  message: String,
  isRead: { type: Boolean, default: false },
  relatedId: ObjectId, // propertyId or matchId, etc.
  createdAt: Date, default now
}
```

### 3.8 `Inquiry` (student contacting owner — not in PRD's explicit data model but required by FR-9/FR-18)
```js
{
  studentId: { type: ObjectId, ref: 'User', required: true },
  propertyId: { type: ObjectId, ref: 'Property', required: true },
  ownerId: { type: ObjectId, ref: 'User', required: true },
  message: String,
  status: { type: String, enum: ['pending','responded','closed'], default: 'pending' },
  createdAt: Date, default now
}
```

---

## 4. API Contract (expanded from PRD's endpoint list)

All responses use this envelope:
```json
{ "success": true, "data": { ... }, "message": "optional" }
{ "success": false, "error": "human-readable message" }
```
All protected routes require `Authorization: Bearer <token>` header. Role-gated routes check `req.user.role`.

| Group | Method | Endpoint | Auth | Notes |
|---|---|---|---|---|
| Auth | POST | `/api/auth/register` | none | body: name,email,password,role,college?,phone |
| Auth | POST | `/api/auth/login` | none | returns JWT + user object (no password) |
| Auth | POST | `/api/auth/logout` | student/owner/admin | stateless — frontend just deletes token; endpoint exists for parity |
| Users | GET | `/api/users/me` | any | current profile |
| Users | PUT | `/api/users/me` | any | update profile + preferences |
| Users | POST | `/api/users/me/avatar` | any | Cloudinary upload, multipart |
| Properties | GET | `/api/properties` | none | query params: city, college, minRent, maxRent, type, sharingType, amenities, page, limit |
| Properties | GET | `/api/properties/:id` | none | full detail |
| Properties | POST | `/api/properties` | owner | create listing (defaults isVerified=false) |
| Properties | PUT | `/api/properties/:id` | owner (own listing) | edit |
| Properties | DELETE | `/api/properties/:id` | owner (own listing) or admin | |
| Properties | POST | `/api/properties/:id/images` | owner | Cloudinary multi-upload |
| Wishlist | GET | `/api/wishlist` | student | |
| Wishlist | POST | `/api/wishlist/:propertyId` | student | toggle add |
| Wishlist | DELETE | `/api/wishlist/:propertyId` | student | |
| Roommates | GET | `/api/roommates` | student | list other students with `isLookingForRoommate=true`, excluding self |
| Roommates | POST | `/api/roommates/preferences` | student | update `preferences` block (alias of PUT /users/me, kept for PRD parity) |
| Roommates | GET | `/api/roommates/matches` | student | returns list with cached/computed compatibility scores (see 5.3) |
| Roommates | POST | `/api/roommates/matches/:targetUserId/compute` | student | force (re)compute one pair via Gemini |
| Expenses | POST | `/api/expenses` | student | |
| Expenses | GET | `/api/expenses?groupId=` | student | |
| Expenses | GET | `/api/expenses/balances?groupId=` | student | computed net balances per person |
| Expenses | PUT | `/api/expenses/:id` | student (creator) | |
| Expenses | DELETE | `/api/expenses/:id` | student (creator) | |
| Reviews | POST | `/api/reviews` | student (isVerified=true only) | |
| Reviews | GET | `/api/reviews/:propertyId` | none | |
| Inquiries | POST | `/api/inquiries` | student | creates inquiry, also creates a Notification for owner |
| Inquiries | GET | `/api/inquiries/owner` | owner | inquiries on owner's listings |
| Notifications | GET | `/api/notifications` | any | most recent first |
| Notifications | PUT | `/api/notifications/:id/read` | any | |
| Admin | GET | `/api/admin/listings/pending` | admin | unverified properties |
| Admin | PUT | `/api/admin/listings/:id/verify` | admin | |
| Admin | GET | `/api/admin/users` | admin | |
| Admin | PUT | `/api/admin/users/:id/verify` | admin | verify student/owner |
| Admin | DELETE | `/api/admin/users/:id` | admin | |
| Admin | GET | `/api/admin/analytics` | admin | counts: total users, students, owners, listings, verified listings, pending verifications |

---

## 5. Key Logic Specs (the parts an LLM is most likely to get wrong if unspecified)

### 5.1 Auth
- Password hashed with `bcrypt`, salt rounds = 10.
- JWT payload: `{ userId, role }`, expiry 7 days, signed with `process.env.JWT_SECRET`.
- Middleware `authenticate` verifies token and attaches `req.user`.
- Middleware `authorize(...roles)` checks `req.user.role` is in the allowed list.
- "Verification" (college ID / email / phone, per PRD Section 6 "Verification System") is simplified for MVP to: **email format check + admin manual approval toggle** (`isVerified` flag flipped by admin). Do not build OTP/SMS verification for MVP — out of scope/cost.

### 5.2 Search & Filtering (`GET /api/properties`)
- Build a dynamic Mongoose query from query params.
- `city` and `nearestCollege`: case-insensitive partial match (`$regex`, `$options: 'i'`).
- `minRent`/`maxRent`: `rent: { $gte, $lte }`.
- `amenities`: comma-separated string from frontend → `$all` array match.
- Only return `isVerified: true` properties to non-admin/non-owner callers, **unless** the caller is the owner viewing their own listings (use a separate "my listings" path: `GET /api/properties?owner=me`).
- Pagination: default `limit=12`, `page=1`.
- Target response time per PRD NFR: <2s — index `city`, `nearestCollege`, `rent`, `isVerified` in Mongoose schema.

### 5.3 AI Roommate Compatibility Scoring (Gemini)
This is the one PRD feature that needs the most precision since it's the AI-novel part.

**Flow:**
1. `GET /api/roommates/matches` first checks the `RoommateMatch` collection for existing cached scores between the current user and each candidate.
2. For any pair with no cached score (or older than e.g. 30 days), call Gemini synchronously (acceptable for MVP scale) and cache the result.
3. Sort the final list by `compatibilityScore` descending.

**Gemini call — server-side only**, via `@google/generative-ai` SDK or REST:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY
```

**Prompt template (construct server-side, never let frontend pass free text into this prompt):**
```
You are a roommate-compatibility evaluator for a student housing app.
Compare these two student profiles and return ONLY valid JSON, no markdown, no preamble.

Student A: {
  sleepSchedule, studyHabits, foodPreference, smoking, cleanliness (1-5),
  socialType, noiseTolerance (1-5)
}
Student B: { ...same fields... }

Return exactly this JSON shape:
{
  "compatibilityScore": <integer 0-100>,
  "reasons": ["short reason 1", "short reason 2", "short reason 3"]
}

Scoring guidance: heavily reward matching sleep schedules and food preferences
(deal-relevant for shared kitchens), moderately reward similar cleanliness and
noise tolerance, lightly reward similar study habits/social type. Penalize
smoking mismatch. Reasons must be short (under 8 words each), specific, and
human-readable — they will be shown directly to students.
```

**Backend MUST:**
- Validate Gemini's response is parseable JSON before saving; if parsing fails, retry once, then fall back to a deterministic rule-based score (see 5.3.1) rather than failing the request.
- Never expose the raw prompt or API key to the frontend.
- Rate-limit/cache aggressively — never call Gemini twice for the same pair within the cache window.

**5.3.1 Fallback rule-based scorer** (used only if Gemini call/parse fails, so the feature never hard-breaks):
```
score = 100
if sleepSchedule differs: score -= 25
if foodPreference differs: score -= 20
if smoking A != smoking B: score -= 20
score -= abs(cleanliness_A - cleanliness_B) * 5
score -= abs(noiseTolerance_A - noiseTolerance_B) * 5
if studyHabits differs: score -= 10
clamp(score, 0, 100)
reasons = generate from whichever factors matched closely
```

### 5.4 Notifications (no Socket.io — per your decision)
- Notifications are pure DB records created by backend logic at key events:
  - New property created in student's saved-search city/college → notify students with matching wishlist/search history (MVP simplification: notify all students who saved a property from the same owner, or skip "new listing" trigger entirely if no saved-search tracking exists — recommend: **only implement `inquiry` and `roommate_match` triggers for MVP**, drop `price_drop`/`new_listing`/`vacancy` triggers as nice-to-have Phase 2 since they need saved-search infra not in MVP scope).
  - Frontend polls `GET /api/notifications` every 30–60s while the tab is active (simple `setInterval` in a top-level layout component, cleared on unmount).
- This satisfies PRD's notification *requirement* (FR list, US stories) without the infra cost of Socket.io.

### 5.5 Expense Splitter — "groupId" logic
The PRD doesn't define how roommates get grouped for expense-splitting. Decision for MVP:
- A `groupId` is simply a string the student sets manually (e.g. the property's `_id`, or a self-chosen household name) when creating an expense.
- All expenses with the same `groupId` are considered one household.
- `splitBetween` is an explicit array of user IDs chosen by the creator each time an expense is added (simplest correct approach — no need to build a separate "household" entity for MVP).
- `GET /api/expenses/balances?groupId=` computes: for each user, `totalPaid - totalOwed`, where `totalOwed` = sum over expenses of `amount / splitBetween.length` for each expense they're included in.

### 5.6 Reviews
- Only allowed if `req.user.isVerified === true` and `req.user.role === 'student'`.
- `overallRating` computed server-side as average of the four sub-ratings provided (skip nulls).
- Property detail page shows average `overallRating` across all reviews + review list.

### 5.7 Maps
- Use Google Maps **Embed API** (`https://www.google.com/maps/embed/v1/place?key=...&q=lat,lng`) for property detail page — far simpler than full JS API, no need for client-side map library, fits "interactive map" requirement at MVP cost/effort.
- Store `latitude`/`longitude` on Property at creation (owner can drop a pin or paste coordinates manually for MVP — full geocoding-from-address is a nice-to-have, not required).

---

## 6. Build Phases (sequenced — follow in order)

### Phase 0 — Project Setup
- Initialize repo structure:
  ```
  /backend
    /src
      /models
      /routes
      /controllers
      /middleware
      /services   (gemini.js, cloudinary.js)
      /config     (db.js)
      server.js
    .env.example
    package.json
  /frontend
    (Vite React app)
    .env.example
  README.md
  ```
- Backend deps: `express mongoose bcryptjs jsonwebtoken dotenv cors multer cloudinary @google/generative-ai express-validator`
- Frontend deps: `react react-router-dom axios tailwindcss`
- `.env.example` (backend):
  ```
  PORT=5000
  MONGODB_URI=
  JWT_SECRET=
  GEMINI_API_KEY=
  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
  CLIENT_URL=
  ```
- **DoD:** server boots, connects to MongoDB Atlas, returns 200 on a `/api/health` route. Frontend boots and renders a placeholder home page.

### Phase 1 — Auth & User Profiles
- Implement `User` model, register/login/me endpoints, JWT middleware.
- Frontend: register/login forms (role selector: student/owner), protected route wrapper, profile edit page including the `preferences` block for students.
- **DoD:** can register as student and as owner, log in, get/update own profile, token persists across refresh (store in localStorage, attach via axios interceptor).

### Phase 2 — Property Listings (Owner side) + Search (Student side)
- `Property` model, CRUD endpoints, Cloudinary image upload.
- Frontend: owner "Add/Edit/Delete Listing" pages; student search page with filters; property card grid; property detail page with image gallery + embedded map.
- **DoD:** owner can create a listing with images; it's invisible to students until admin verifies it (test by temporarily hand-flipping `isVerified` in DB or building Phase 5's admin panel slightly early if needed); search/filter returns correct results; detail page renders map.

### Phase 3 — Wishlist + Inquiries
- Wishlist model/endpoints + heart/save button on property cards and detail page.
- Inquiry model/endpoints; "Contact Owner" form on detail page; owner inquiry inbox page.
- **DoD:** student can save/unsave properties, see a wishlist page; student can send an inquiry; owner sees it in their inbox.

### Phase 4 — Roommate Matching (AI)
- Implement Gemini service (`services/gemini.js`) with the prompt from 5.3, including JSON-parse validation and the rule-based fallback.
- `RoommateMatch` model + caching logic.
- Frontend: roommate discovery page (list of students looking for roommates, sorted by score), match card showing score % + reasons as bullet chips.
- **DoD:** two test student accounts with different preference profiles produce a sensible score and 2–3 specific reasons; a forced Gemini-failure (e.g. temporarily bad API key) falls back to rule-based score without crashing the endpoint.

### Phase 5 — Expense Splitter
- `Expense` model + endpoints, balance calculation logic from 5.5.
- Frontend: add-expense form (category, amount, split-between multi-select of known roommates), expense list, balances summary view ("You owe X ₹500", "Y owes you ₹200").
- **DoD:** adding 3+ expenses across 2-3 users produces correct net balances.

### Phase 6 — Reviews & Ratings
- `Review` model + endpoints with the verified-student gate.
- Frontend: review form on property detail page (hidden/disabled if `!user.isVerified`), review list, average rating display.
- **DoD:** unverified student cannot submit a review (graceful UI message, not just a silent 403); verified student can; average updates correctly.

### Phase 7 — Admin Panel
- Admin-only routes from Section 4.
- Frontend: simple admin dashboard — pending listings table with "Verify" button, users table with "Verify"/"Remove" actions, analytics counts as cards.
- Seed one admin user via a one-off script (`backend/src/scripts/seedAdmin.js`) — do not expose admin registration through the public `/register` endpoint.
- **DoD:** admin can verify a pending listing, after which it appears in public search; admin can verify a student, after which that student can post reviews; analytics counts match DB reality.

### Phase 8 — Notifications (polling)
- `Notification` model; creation hooks on Inquiry-create and RoommateMatch-create (per 5.4 scope cut).
- Frontend: notification bell with unread count, dropdown list, mark-as-read; polling interval.
- **DoD:** sending an inquiry creates a notification visible to the owner within the poll interval; marking as read persists.

### Phase 9 — Polish, NFRs, Deploy
- Add loading states, empty states, basic error boundaries.
- Confirm response envelope consistency across all routes (Section 9.4 pattern... see note below, this doc calls it 4.x but kept here for clarity — the JSON envelope defined at the top of Section 4).
- Add indexes per 5.2.
- Deploy backend to Render (free web service, env vars set in dashboard), frontend to Vercel, DB on Atlas M0, images on Cloudinary free tier.
- Update `CLIENT_URL`/CORS config to the deployed frontend origin.
- **DoD:** full user journey (register → verify via admin → search → wishlist → inquiry → roommate match → expense → review) works end-to-end on the deployed URLs, not just localhost.

---

## 7. Non-Functional Requirements — concrete implementation notes
| PRD Requirement | Concrete MVP implementation |
|---|---|
| Search <2s | Mongoose indexes on city, nearestCollege, rent, isVerified; pagination limit 12 |
| 99% uptime | Not realistically testable on free-tier MVP — acknowledge in docs as aspirational, not a build task |
| 1,000+ concurrent users | Not load-tested for MVP; Express + MongoDB Atlas free tier won't actually sustain this — note as a known MVP limitation in README, not something to "build" |
| JWT auth + secure REST | bcrypt + JWT as specified in 5.1; `helmet` + `cors` middleware; never log tokens/passwords |
| Mobile/tablet/desktop support | Tailwind responsive utility classes; test at 375px/768px/1280px breakpoints |

---

## 8. Known MVP Limitations (be upfront about these in the demo/submission)
- Verification is manual/admin-toggle, not real document/OTP verification.
- Roommate matching only considers two-person pairs, not group compatibility.
- Notifications are polled, not real-time push.
- Maps use static embed, not full interactive JS Maps SDK.
- No payment flow — "Move In" step in PRD's user flow (Section 13, step 11) is explicitly an **offline** action, matching PRD's own non-goal on payments.
- Not load-tested; concurrency/uptime NFRs are aspirational for a training-program MVP, not verified.

---

## 9. Quick-start prompt block (paste-ready for a coding LLM)

> Use this as the opening instruction if handing this whole document to Claude Code / Gemini CLI / ChatGPT with code execution:

```
Build the RentMate MVP described in this document. Follow the Build Phases
in Section 6 in exact order, completing and verifying the Definition of Done
for each phase before starting the next. Use the exact data models (Section 3)
and API contract (Section 4) as the source of truth — do not rename fields or
routes. Do not implement anything listed under Explicit Non-Goals (Section 2.2)
even if it seems straightforward. Ask me before making any architectural
decision not already specified here.
```

---

*Prepared for Team FantasticFour — Gryork TechPreneur Training Program. Based on RentMate PRD v2.0 (June 2026).*
