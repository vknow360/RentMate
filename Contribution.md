# Contribution & Task Allocation

## Team Roles & Feature Distribution

**Student 1 (Full Stack & AI) - [@github_handle1]**
- **Features:** AI Roommate Matching integration (Gemini), overall system architecture, Admin panel.
- **Responsibilities:** Backend services, third-party API integration, ensuring DoD compliance across phases.

**Student 2 (Frontend Developer) - [@github_handle2]**
- **Features:** Authentication UI, Property Search & Filtering UI, Property Details.
- **Responsibilities:** Tailwind CSS v4 setup, responsive design, non-gradient solid color UI adherence, Context API state management.

**Student 3 (Backend Developer) - [@github_handle3]**
- **Features:** Authentication API, Property CRUD endpoints, Cloudinary integration, Database modeling.
- **Responsibilities:** Express routing, Mongoose schemas, data validation, security (Helmet/CORS).

**Student 4 (UI/UX & Features) - [@github_handle4]**
- **Features:** Expense Splitter logic, Notifications system, Wishlist & Inquiries, Reviews & Ratings.
- **Responsibilities:** Testing edge cases, UI polish, ensuring user flows are intuitive.

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