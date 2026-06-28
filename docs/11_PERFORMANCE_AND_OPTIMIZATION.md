# Performance and Optimization

## Overview
RentMate is designed to perform efficiently on a lightweight, free-tier tech stack while maintaining a smooth user experience. The Non-Functional Requirements (NFR) dictate that search queries resolve in under 2 seconds.

## Database Optimizations
- **Indexing:** Mongoose schemas heavily utilize indexes on frequently queried fields. The `Property` collection is indexed on `city`, `nearestCollege`, and `rent` to accelerate the core search functionality.
- **Compound Indexes:** Used on collections like `Wishlist` (studentId + propertyId) and `RoommateMatch` (studentA + studentB) to enforce uniqueness at the database level, preventing costly application-layer checks.

## Backend Optimizations
- **AI Result Caching:** The Gemini AI roommate compatibility scores are cached in the `RoommateMatch` collection. Subsequent views of the same roommate pair pull the cached score, drastically reducing API latency and saving Gemini API quotas.
- **Memory Streaming:** Image uploads bypass the local disk entirely. Using `multer.memoryStorage()`, image buffers are streamed directly to Cloudinary. This eliminates disk I/O bottlenecks and prevents issues on ephemeral deployment environments like Render.

## Frontend Optimizations
- **Polling Management:** Database polling for notifications is wrapped in React `useEffect` hooks with strict cleanup functions (`clearInterval`) to prevent memory leaks.
- **Cloudinary Image Optimization:** Images are served via Cloudinary, which dynamically optimizes image formats (e.g., serving WebP where supported) and compresses them without losing visible quality.

## MVP Limitations
- The React application is currently bundled as a single large file by Vite.
- Real-time updates rely on HTTP polling, which is inherently less efficient than persistent WebSocket connections.

## Future Work
- **Code Splitting:** Implementing `React.lazy` and `Suspense` in the routing layer to lazy-load routes, reducing the initial JavaScript payload size.
- **WebSockets:** Replacing the HTTP polling mechanism with Socket.io to reduce unnecessary network traffic and database queries.
