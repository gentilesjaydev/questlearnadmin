# QuestLearn Admin - Project Knowledge

## 1. Project Overview

QuestLearn Admin is the administrative web application for the QuestLearn
gamified learning system.

The system supports teachers/administrators in managing learning content,
questions, student learning data, and analytics for Grade 6 English
competencies aligned with the NAT standardized assessment.

The application is designed to support a gamified learning environment
through structured learning content, difficulty classification, analytics,
and teacher-controlled content management.

---

## 2. Technology Stack

### Frontend
- PHP
- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js

### Backend / Services
- Firebase Authentication
- Firebase Realtime Database
- PHP API endpoints where required

### AI
- Groq API
- LLaMA 3.1
- Used for analyzing uploaded questions/resources and assisting with
  difficulty classification.

### File / Media Storage
- Cloudinary

### Development Tools
- Visual Studio Code
- Git
- GitHub

---

## 3. Project Structure

Current major directories:

- `assets/` - images, icons, and other static resources
- `css/` - application stylesheets
- `js/` - JavaScript functionality
- `pages/` - PHP pages/views
- `api/` - backend/API-related functionality
- `knowledge.md` - project knowledge and development context

Do not introduce unnecessary frameworks or dependencies when existing
project functionality can be implemented using the current stack.

---

## 4. Main System Purpose

The QuestLearn system is a gamified learning platform for Grade 6 English.

The Admin/Teacher side is responsible for:

1. Managing learning content.
2. Managing questions and assessment items.
3. Organizing questions according to English competencies.
4. Classifying question difficulty.
5. Reviewing AI-generated analysis.
6. Managing published learning materials.
7. Monitoring student learning performance.
8. Viewing analytics and learning patterns.

---

## 5. Learning Categories

QuestLearn organizes learning content into four major categories:

1. Grammar
2. Vocabulary
3. Reading Comprehension
4. Information Literacy

These categories are represented as game-oriented learning areas/dungeons
within the QuestLearn system.

---

## 6. Difficulty Classification

Questions should be categorized according to their difficulty level and
alignment with the Grade 6 English competencies.

AI-assisted analysis may be used to help determine question difficulty.

The AI output must not automatically be treated as final without appropriate
validation or review when teacher/admin approval is required.

---

## 7. AI Integration

The project uses Groq with LLaMA 3.1 for AI-assisted analysis.

AI functionality may be used for:

- Question analysis
- Difficulty classification
- Learning resource analysis
- Content assistance

AI-generated results should be treated as generated recommendations/data
that require validation before being used as authoritative learning content.

The system should validate AI responses before storing or publishing them.

---

## 8. Firebase

Firebase Authentication is used for authentication and user access.

Firebase Realtime Database is used for application data.

When working with Firebase:

- Preserve the existing database structure.
- Avoid changing existing keys without checking dependencies.
- Validate data before writing.
- Handle missing/null values safely.
- Avoid unnecessary database listeners.
- Properly remove listeners when they are no longer needed.
- Avoid duplicate database requests.
- Do not expose sensitive credentials or API keys in client-side code.

---

## 9. Cloudinary

Cloudinary is used for media/file management.

When handling uploaded media:

- Validate file type.
- Validate file size.
- Handle upload errors.
- Store only the required Cloudinary information.
- Avoid exposing sensitive Cloudinary credentials.

---

## 10. Authentication and Authorization

The application must distinguish between authenticated users and
unauthenticated visitors.

Protected pages and operations should verify authentication before allowing
access.

Administrative actions should not rely solely on hidden UI elements for
security.

Authorization must be enforced at the appropriate application/data level.

---

## 11. CRUD Operations

When implementing CRUD functionality:

### Create
- Validate required fields.
- Sanitize/validate user input.
- Confirm successful database writes.
- Handle errors clearly.

### Read
- Avoid unnecessary database requests.
- Handle empty datasets.
- Handle missing fields safely.

### Update
- Validate the updated data.
- Preserve fields that should not be modified.
- Confirm successful updates.

### Delete
- Confirm destructive actions when appropriate.
- Check related data before deleting.
- Avoid accidental cascading data loss.

---

## 12. Analytics

Chart.js is used for data visualization.

Analytics should present meaningful information such as:

- Student performance
- Question performance
- Learning progress
- Difficulty distribution
- Learning patterns

Charts should use actual database data rather than hard-coded values.

---

## 13. Content Workflow

A recommended content workflow is:

1. Create or upload content.
2. Analyze/classify the content.
3. Validate the generated result.
4. Review the content.
5. Edit when necessary.
6. Publish approved content.
7. Make published content available to the learning system.

AI-generated content or classifications should not bypass required review
and validation.

---

## 14. Coding Conventions

### PHP
- Keep PHP logic organized.
- Validate incoming data.
- Avoid directly trusting user input.
- Handle errors explicitly.
- Avoid duplicating business logic.

### JavaScript
- Use clear and descriptive variable/function names.
- Keep functions focused on a single responsibility.
- Avoid unnecessary global variables.
- Handle asynchronous Firebase operations properly.
- Handle loading, success, empty, and error states.

### HTML
- Use semantic HTML where practical.
- Keep markup readable.
- Avoid unnecessary duplication.

### CSS
- Reuse existing styles and components.
- Avoid overriding styles unnecessarily.
- Keep responsive behavior in mind.

---

## 15. Security Rules

Never commit:

- API keys
- Firebase private credentials
- Service account credentials
- Cloudinary secrets
- Passwords
- Tokens
- Private configuration files containing secrets

Use environment variables or the project's existing secure configuration
approach for sensitive values.

Never trust client-side validation alone.

---

## 16. Git Workflow

The project uses Git and GitHub.

Before making a significant change:

1. Make sure the correct branch is checked out.
2. Pull the latest changes when appropriate.
3. Make focused changes.
4. Test the changes.
5. Review the diff.
6. Commit using a clear commit message.
7. Push the branch.

Do not directly make development changes on `main` unless explicitly
required.

---

## 17. Development Principles

When modifying QuestLearn Admin:

- Understand existing code before changing it.
- Reuse existing components and functions when possible.
- Avoid unnecessary rewrites.
- Preserve existing functionality.
- Make the smallest reasonable change.
- Keep Firebase interactions efficient.
- Validate external/API responses.
- Handle errors gracefully.
- Keep the UI consistent with the existing application.
- Test affected functionality after changes.

---

## 18. AI Coding Assistant Guidelines

Before implementing a feature:

1. Inspect the relevant existing files.
2. Understand the current data flow.
3. Identify related Firebase structures.
4. Check existing functions/components.
5. Implement the smallest appropriate change.
6. Test the affected functionality.
7. Avoid changing unrelated files.

When uncertain about an existing behavior, inspect the code first rather than
assuming how the system works.

---

## 19. Important Project Constraint

QuestLearn Admin is an existing project.

Do not replace the current architecture with a different framework or stack
unless explicitly requested.

Prefer extending the existing PHP + Vanilla JavaScript + Firebase architecture.

---

## 20. Current Development Goal

The current setup task is to prepare QuestLearn Admin for AI-assisted
development by establishing:

- Project knowledge documentation
- Agent instructions
- Claude instructions
- Custom project-specific skills
- External/provider skills

These configuration files should help AI coding assistants understand the
QuestLearn Admin architecture and development rules before modifying code.