---
name: questlearn-firebase
description: Safely develop and modify QuestLearn Admin features that use Firebase Authentication and Firebase Realtime Database. Use this skill when working with QuestLearn users, authentication, questions, learning content, student data, CRUD operations, realtime listeners, database reads/writes, or Firebase-related bugs.
---

# QuestLearn Firebase Skill

## Purpose

This skill provides project-specific guidance for working with Firebase
Authentication and Firebase Realtime Database in QuestLearn Admin.

The goal is to preserve the existing Firebase architecture, prevent accidental
data loss, and ensure that new features integrate with the current application
instead of creating conflicting database structures.

---

## Before Modifying Firebase Code

Always inspect the existing implementation before making changes.

Follow this order:

1. Identify the page or feature being modified.
2. Find its JavaScript/PHP files.
3. Search for existing Firebase imports and initialization.
4. Identify the existing database references and paths.
5. Identify the data fields currently being read or written.
6. Identify related authentication logic.
7. Check whether another page already implements similar functionality.
8. Reuse the existing implementation when possible.
9. Make the smallest required change.
10. Test the affected functionality.

Never assume a database path or field name without checking the project code.

---

# Firebase Authentication

Firebase Authentication is responsible for user authentication.

When working with authentication:

- Preserve the existing authentication flow.
- Reuse the existing Firebase configuration.
- Do not create a second Firebase app unnecessarily.
- Do not duplicate authentication initialization.
- Check the current authenticated user before performing protected actions.
- Handle unauthenticated states gracefully.
- Handle authentication errors clearly.
- Do not expose credentials or private configuration.

Typical authentication operations may include:

- Sign in
- Sign out
- Account creation
- Session/current-user checks
- Authentication state listeners

---

# Firebase Realtime Database

Firebase Realtime Database stores application data.

Before creating or modifying database operations:

1. Inspect the existing database references.
2. Determine the current path.
3. Determine the existing object structure.
4. Identify required fields.
5. Check which pages depend on that structure.
6. Preserve backward compatibility whenever possible.

Do not invent a new database hierarchy if an existing structure already supports
the required feature.

---

# Reading Data

When reading data:

- Use the smallest appropriate database scope.
- Avoid downloading unnecessary data.
- Handle empty results.
- Handle missing fields.
- Handle null values.
- Handle Firebase errors.
- Avoid duplicate reads.

Example pattern:

```javascript
const snapshot = await get(reference);

if (!snapshot.exists()) {
    // Handle empty result
}