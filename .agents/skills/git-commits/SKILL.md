---
name: git-commits
description: >
  Standardizes Git commit messages for the project. Enforces Conventional Commits with concise, implementation-focused messaging.
  Trigger: When making a commit or asking to commit changes.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Executing `git commit`.
- Writing commit messages.

## Critical Patterns

### 1. Conventional Commits
All commits MUST follow the Conventional Commits specification.

Format:
`type(scope): subject`

Allowed types:
- `feat`: A new feature (UI or backend).
- `fix`: A bug fix.
- `chore`: Maintenance, dependencies, or configuration changes (e.g., removing logs).
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `style`: Formatting, missing semi-colons, etc (no code changes).
- `docs`: Documentation only changes.
- `perf`: Code change that improves performance.
- `test`: Adding missing tests or correcting existing ones.

### 2. Concise Messaging (No Storytelling)
- The subject line must be 50 characters or less.
- Use imperative mood in the subject line (e.g., "add", not "added" or "adds").
- **Do not tell a story.** Focus strictly on *what* was implemented or changed.
- If a body is necessary, keep it as bullet points of the technical implementations, avoiding lengthy explanations of the "why" unless it's a non-obvious security fix or architectural decision.

**Bad:**
`feat(auth): i changed the layout to look better and then i also removed the console logs because they were leaking data to hackers which is very bad for production`

**Good:**
`feat(auth): unify auth UI layout and remove sensitive logs`

### 3. Commit Grouping
If multiple unrelated changes are made, split them into multiple atomic commits when possible, or group them logically under the correct scope if they belong to the same task.
