# Contribution & Task Allocation

## Team Roles & Feature Distribution

**Priyanshu Singh (Frontend Development & UI/UX)**
- **Features:** Authentication UI, Property Search & Filtering UI, Property Details, Expense Splitter logic UI.
- **Responsibilities:** Tailwind CSS v4 setup, responsive design, non-gradient solid color UI adherence, Context API state management, UI polish.

**Alokit Mishra (Backend Development)**
- **Features:** Authentication API, Property CRUD endpoints, overall system architecture, Admin panel.
- **Responsibilities:** Backend services, Express routing, security (Helmet/CORS).

**Sunny Kumar Gupta (Database & API Development)**
- **Features:** Cloudinary integration, Database modeling, AI Roommate Matching integration (Gemini).
- **Responsibilities:** Mongoose schemas, data validation, third-party API integration.

**Prakhar Pandey (Project Coordination, Testing & Documentation)**
- **Features:** Notifications system, Wishlist & Inquiries, Reviews & Ratings.
- **Responsibilities:** Project coordination, testing edge cases, ensuring user flows are intuitive, ensuring DoD compliance across phases, documentation.

## Git Branching Strategy

We follow a feature-branch workflow to ensure clean commit history and active participation from all members:

1. **`main` branch:** Represents the stable, production-ready code.
2. **`dev` branch:** The active development branch where features are integrated.
3. **Feature branches:** 
   - Naming convention: `feature/<developer-name>/<feature-name>` (e.g., `feature/student1/ai-matching`)
   - Bug fixes: `fix/<developer-name>/<bug-name>`

## Workflow Instructions
1. Create a branch from `dev`: `git checkout -b feature/yourname/task`
2. Commit your changes regularly with descriptive messages.
3. Push your branch: `git push origin feature/yourname/task`
4. Open a Pull Request against the `dev` branch.
5. At least one other team member must review the PR before merging.
6. Once `dev` is stable, a PR will be made to `main`.