# QuestLearn Admin - Claude Instructions

## Project Overview

QuestLearn Admin is the administrative web application for the QuestLearn
gamified learning platform.

The application supports teachers and administrators in managing:

- Grade 6 English learning content
- Questions and assessment items
- English competencies
- Question difficulty classification
- Student learning data
- Learning analytics

The main learning categories are:

1. Grammar
2. Vocabulary
3. Reading Comprehension
4. Information Literacy

---

## Technology Stack

Use the existing project technology stack:

- PHP
- HTML5
- CSS3
- Vanilla JavaScript
- Firebase Authentication
- Firebase Realtime Database
- Groq API
- LLaMA 3.1
- Cloudinary
- Chart.js

Do not migrate the project to another framework or architecture unless
explicitly requested.

---

## Development Approach

Before modifying code:

1. Inspect the relevant existing files.
2. Understand the current implementation.
3. Identify related functions and dependencies.
4. Check relevant Firebase database structures.
5. Search for existing functionality before creating new functionality.
6. Reuse existing code where appropriate.
7. Make the smallest reasonable change.
8. Avoid modifying unrelated files.
9. Test the affected functionality.
10. Review the final Git diff.

Do not rewrite working functionality unnecessarily.

---

## PHP Guidelines

When modifying PHP:

- Validate incoming data.
- Sanitize user-controlled input where appropriate.
- Do not trust client-side validation.
- Handle errors explicitly.
- Keep backend logic organized.
- Avoid unnecessary duplication.
- Preserve existing application behavior.

---

## JavaScript Guidelines

When modifying JavaScript:

- Use descriptive variable and function names.
- Keep functions focused.
- Avoid unnecessary global variables.
- Reuse existing functions when possible.
- Handle asynchronous operations correctly.
- Handle loading, success, empty, and error states.
- Avoid duplicate Firebase listeners.
- Handle Firebase errors gracefully.

---

## Firebase Guidelines

Firebase Authentication is used for user authentication.

Firebase Realtime Database is used for application data.

When working with Firebase:

- Preserve existing database paths and keys.
- Inspect existing references before changing database structures.
- Validate data before writing.
- Handle missing or null values.
- Avoid unnecessary database reads.
- Avoid duplicate listeners.
- Properly manage realtime listeners.
- Preserve existing data unless deletion is explicitly requested.

Do not change the database schema casually.

---

## AI Integration

The project uses Groq and LLaMA 3.1 for AI-assisted content analysis.

AI functionality may be used for:

- Question analysis
- Difficulty classification
- Learning resource analysis
- Content assistance

AI-generated results should be treated as generated recommendations or
analysis and should be validated before being used as authoritative learning
content when teacher/admin approval is required.

When working with the AI integration:

- Validate API responses.
- Handle invalid responses.
- Handle API failures.
- Handle unavailable services.
- Do not hard-code generated responses.
- Do not expose private API keys.
- Do not place secret credentials in frontend code.

---

## Cloudinary

Cloudinary is used for media and file management.

When handling uploads:

- Validate file types.
- Validate file sizes.
- Handle upload failures.
- Store only necessary media information.
- Never expose private credentials.

---

## UI/UX Guidelines

When modifying the interface:

- Preserve the existing QuestLearn visual style.
- Reuse existing components and styles.
- Keep pages responsive.
- Maintain consistency between pages.
- Avoid unnecessary redesigns.
- Provide appropriate loading states.
- Provide useful empty states.
- Provide clear success and error feedback.

Do not modify unrelated UI elements when implementing a specific feature.

---

## Security

Never commit or expose:

- API keys
- Passwords
- Firebase private credentials
- Service account credentials
- Cloudinary secrets
- Authentication tokens
- Other sensitive credentials

Do not rely solely on frontend validation for security-sensitive operations.

Always validate important data at the appropriate application/data layer.

---

## Code Quality

Prefer:

- Clear naming
- Small focused functions
- Reusable logic
- Minimal duplication
- Explicit error handling
- Maintainable code
- Simple solutions
- Existing project patterns

Avoid:

- Large unnecessary rewrites
- Unused dependencies
- Duplicate functionality
- Hard-coded production data
- Unnecessary architecture changes
- Changes unrelated to the requested task

---

## Git Workflow

Development should be performed on a feature or task branch rather than
directly on `main`.

Before committing:

1. Check the current branch.
2. Review changed files.
3. Review the Git diff.
4. Test affected functionality.
5. Use a clear commit message.

Example commit messages:

```text
feat: add question difficulty analysis
fix: resolve Firebase question loading
docs: update QuestLearn instructions
refactor: simplify question management