# Git Workflow

## Overview
RentMate utilizes a standard Feature Branch workflow to ensure a clean commit history, facilitate code reviews, and protect the production environment.

## Branch Hierarchy
1. **`main`**: The production-ready branch. Code here is stable and deployable.
2. **`dev`**: The active development branch. All feature branches merge here for integration testing.
3. **Feature Branches**: Temporary branches created by developers for specific tasks.

## Naming Conventions
When creating a new branch, use the following format:
`<type>/<developer-name>/<feature-name>`

**Types:**
- `feature/` for new additions (e.g., `feature/priyanshu/expense-ui`)
- `fix/` for bug fixes (e.g., `fix/alokit/auth-middleware`)
- `docs/` for documentation updates (e.g., `docs/prakhar/api-specs`)

## Workflow Steps
1. **Sync with Dev:** Always start by pulling the latest changes from `dev`.
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. **Create Branch:** Create your isolated working branch.
   ```bash
   git checkout -b feature/yourname/task-name
   ```
3. **Commit Regularly:** Write clear, imperative commit messages.
   ```bash
   git commit -m "Add JWT validation to user routes"
   ```
4. **Push and PR:** Push your branch to the remote repository and open a Pull Request (PR) targeting the `dev` branch.
   ```bash
   git push origin feature/yourname/task-name
   ```
5. **Code Review:** At least one other team member must review the PR, checking for functionality, adherence to the DoD (Definition of Done), and security.
6. **Merge:** Once approved, merge the PR into `dev` and delete the feature branch.
