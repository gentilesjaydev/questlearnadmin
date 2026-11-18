# QuestLearn Administrative Dashboard

![QuestLearn](assets/images/logo.png)

## Overview

The **QuestLearn Administrative Dashboard** is a web-based management portal for the **QuestLearn** gamified English learning platform — a Grade 6 RPG-style educational game targeting **NATG6 (National Achievement Test for Grade 6)** readiness aligned with **DepEd** standards.

The dashboard bridges the gap between the **Unity mobile game client** and curriculum management by providing role-based access control, real-time Firebase synchronization, AI-powered content generation, and deep student performance analytics.

---

## 🔐 Role-Based Access Control (RBAC)

The system enforces two distinct user roles with strict Firebase Authentication scoping:

| Role | Access Level |
|------|-------------|
| **Super Admin** | Global multi-campus visibility — manages teachers, schools, sections, and system settings |
| **Teacher** | Scoped to their assigned Grade 6 section only — views student roster, analytics, and curriculum for their class |

- Login triggers a **SweetAlert2 "Welcome back" greeting** that dynamically reflects the user's role
- Teachers are **automatically migrated and activated** on first login from legacy accounts
- Firebase email verification is handled gracefully with `verifyBeforeUpdateEmail` fallback

---

## ✨ Key Features

### 🧠 AI-Powered Curriculum Generator
- Teachers upload raw educational **PDFs** (or paste text)
- The system uses **Groq API** with an advanced LLM to:
  - **Parse mode:** Extract and categorize existing questions from a document
  - **Generate mode:** Create brand-new RPG-style questions from module text
- Questions are automatically tagged with:
  - **Bloom's Taxonomy level** (Remembering → Creating)
  - **Difficulty level** (1–4: Easy, Medium, Hard, Boss/Very Hard)
  - **XP Reward** and **Gold Reward** values
- Output is a **strict JSON schema** auto-mapped to the Unity game engine

### 📊 Performance Analytics & Reporting
- **Analytics Dashboard** (`performance.php`) — class-wide accuracy, HP, XP, and participation charts via Chart.js
- **Competency Tracking** — domain-level breakdown across the 5 NATG6 English competency areas
- **Assessment Reporting** — official printable DepEd-aligned reports
- **Learning Pattern Methodology** — explains the diagnostic pipeline with visual flowcharts and DepEd proficiency tier benchmarks
- **AI Insights** — generates rich HTML diagnostic reports via Groq API, structured into professional academic sections

### 🏆 DepEd NATG6 Proficiency Tiers
| Tier | Accuracy Range | Label |
|------|---------------|-------|
| Mastered | ≥ 75% | 🟢 Mastered |
| Proficient | 60–74% | 🔵 Proficient |
| Developing | 50–59% | 🟡 Developing |
| Needs Support | < 50% | 🔴 Needs Immediate Support |

Minimum Proficiency Level (MPL) benchmark: **60%** (DepEd standard)

### ⚡ Real-Time Firebase Synchronization
- Utilizes **Firebase WebSocket connections** — zero-latency updates to the Unity game client
- **Auto-healing database algorithm** continuously scans NoSQL collections to prevent structural corruption and ensure JSON arrays stay game-parser compatible
- **Firebase Admin SDK** (pure PHP, no Node.js or Composer required) — works on XAMPP and shared hosting (InfinityFree)

### 🏫 School & Section Management (Super Admin)
- Full CRUD for **schools** and **sections**
- Teachers are assigned to a specific **school + section scope** at registration
- **Campus Deployment Matrix** in the Super Admin Hub shows all schools, their divisions, and faculty count
- Seed Defaults button with error handling for initial school/section setup

### 👩‍🏫 Teacher Management (Super Admin)
- Register new teachers with: name, email, password, assigned school, grade, and section
- **Server-side password reset** via Google Cloud Identity Toolkit REST API (pure PHP)
- Faculty roster with sticky headers and scrollable table
- Edit teacher profiles, school assignment, and section scoping

### 📚 Modules Library
- Teachers upload educational PDF modules to **Cloudinary**
- Modules are listed, previewed, and can be proxied for download
- Cloudinary integration via `get_cloudinary_modules.php`, `delete_cloudinary_module.php`, and `proxy_download.php`

### 🗡️ Quest Curriculum Management
- Manage game nodes: edit questions, configure **Boss Battles**, create daily challenges
- Full CRUD operations on quest data stored in Firebase Realtime Database

### 👨‍🎓 Student Account Management
- View and manage student accounts scoped to the teacher's assigned section
- Students loaded from Firebase `sections/` path
- Section dropdown uses Firebase `sections/` structure (not static)
- Edit student profiles using select inputs for section assignment

---

## 🤖 AI Engine Details

Both AI endpoints now use **Groq API** with the following model and configuration:

| Setting | Value |
|---------|-------|
| **Model** | `openai/gpt-oss-20b` |
| **Provider** | Groq API (`https://api.groq.com/openai/v1/chat/completions`) |
| **Reasoning Effort** | `low` (hidden reasoning format for speed) |
| **Max Completion Tokens** | `8192` |
| **Temperature** | `0.2` (generator) / `0.4` (analytics) |

> **Note:** The model was updated from the original LLaMA 3.1 8B to `openai/gpt-oss-20b` via Groq's API for improved reasoning quality on structured JSON generation and academic analytics output.

Two separate API endpoints handle different roles:
- **`groq.php`** — Curriculum generation (parse existing questions or generate new ones from module text)
- **`groq_analytics.php`** — NATG6 performance analytics (individual student diagnostics or class-wide cohort evaluation)

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, Vanilla JavaScript, CSS3, Bootstrap 5.3 |
| **UI Components** | SweetAlert2, Font Awesome 6.4 |
| **Data Visualization** | Chart.js |
| **Backend** | PHP 8.x (pure PHP, no frameworks) |
| **Database & BaaS** | Firebase Realtime Database, Firebase Authentication |
| **AI Engine** | Groq API — `openai/gpt-oss-20b` |
| **File Storage** | Cloudinary API |
| **Admin Auth** | Google Cloud Identity Toolkit REST API (JWT/OAuth2 via PHP) |
| **Local Server** | XAMPP / WAMP / LAMP (Apache + PHP) |

---

## 📁 Project Structure

```
questlearnadmin/
├── index.php                        # Entry point & login router
├── secrets.php                      # API keys (gitignored)
├── .htaccess                        # URL rewriting rules
├── README.md
├── ALGORITHMS_EXPLANATION.md        # Technical algorithm deep-dive
│
├── assets/
│   ├── css/
│   │   ├── style.css                # Main dashboard styles
│   │   └── auth.css                 # Login page styles
│   ├── js/
│   │   ├── auth.js                  # Firebase login/logout logic
│   │   ├── main.js                  # Shared utilities, RBAC sidebar control
│   │   ├── dashboard.js             # Dashboard Overview charts & stats
│   │   ├── admin_dashboard.js       # Super Admin Hub — telemetry & faculty roster
│   │   ├── admin_modules.js         # Modules Library — Cloudinary upload & list
│   │   ├── ai_generator.js          # AI Curriculum Generator logic
│   │   ├── performance.js           # Analytics Dashboard charts & AI Insights
│   │   ├── assessment_reporting.js  # Assessment report generation
│   │   ├── competency_tracking.js   # Competency domain tracking
│   │   ├── quests.js                # Quest CRUD operations
│   │   ├── students.js              # Student account management
│   │   ├── teachers.js              # Teacher management & registration
│   │   └── schools.js               # School & Section management
│   └── images/
│       ├── logo.png
│       └── login_bg.png
│
├── backend/
│   ├── config/
│   │   ├── firebase.js              # Firebase SDK initialization config
│   │   └── serviceAccountKey.json  # Firebase service account (gitignored)
│   └── api/
│       ├── groq.php                 # AI curriculum generation endpoint
│       ├── groq_analytics.php       # AI analytics/diagnostic endpoint
│       ├── admin_reset_password.php # Server-side Firebase password reset
│       ├── firebase_admin.php       # Pure PHP Firebase Admin helper (JWT/OAuth2)
│       ├── get_cloudinary_modules.php
│       ├── delete_cloudinary_module.php
│       ├── proxy_download.php       # Secure Cloudinary file proxy
│       └── proxy_pdf.php            # PDF preview proxy
│
├── includes/
│   └── components/
│       ├── sidebar.php              # Shared sidebar with role-aware nav
│       └── navbar.php               # Top navigation bar
│
└── pages/
    ├── auth/
    │   ├── login.php                # Login page
    │   └── profile.php             # Editable profile (name, email, password)
    ├── teacher/
    │   ├── students.php             # Student Account Management
    │   ├── performance.php          # Analytics Dashboard (main hub)
    │   ├── competency-tracking.php  # Domain competency breakdown
    │   ├── assessment-reporting.php # Printable official reports
    │   ├── learning-pattern-methodology.php  # Methodology explainer & flowcharts
    │   ├── quests.php               # Quest Curriculum CRUD
    │   └── modules.php              # Modules Library (Cloudinary)
    └── admin/
        ├── dashboard.php            # Super Admin Hub
        ├── teachers.php             # Manage Teachers
        ├── schools.php              # Manage Schools & Sections
        └── settings.php            # System Settings
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Local server: **XAMPP / WAMP / LAMP**
- **PHP 8.0** or higher (with `curl` and `openssl` extensions enabled)
- A **Firebase Project** with:
  - Firebase Realtime Database enabled
  - Firebase Authentication enabled (Email/Password provider)
  - A downloaded `serviceAccountKey.json`
- A **Groq API Key** (from [console.groq.com](https://console.groq.com))
- A **Cloudinary Account** (for Modules Library)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/gentilesjaydev/questlearnadmin.git
   ```
   Place the `questlearnadmin/` folder inside your server root (e.g., `C:/xampp/htdocs/`).

2. **Configure `secrets.php`** *(create this file — it is gitignored)*
   ```php
   <?php
   define('GROQ_API_KEY_MAIN', 'your_groq_api_key_for_generator');
   define('GROQ_API_KEY_ANALYTICS', 'your_groq_api_key_for_analytics');
   ```

3. **Place Firebase Credentials**
   - Copy your `serviceAccountKey.json` to `backend/config/serviceAccountKey.json`
   - Update `backend/config/firebase.js` with your Firebase project config

4. **Enable PHP Extensions**
   In your `php.ini`, ensure these are enabled:
   ```
   extension=curl
   extension=openssl
   ```

5. **Firebase Database Rules**
   Ensure authenticated users can read/write:
   ```json
   {
     "rules": {
       ".read": "auth != null",
       ".write": "auth != null"
     }
   }
   ```

6. **Launch**
   Start Apache in XAMPP and navigate to:
   ```
   http://localhost/questlearnadmin/
   ```

---

## 🔒 Security Notes

- `secrets.php` and `serviceAccountKey.json` are **gitignored** — never commit them
- The `questlearn-82dc3-firebase-adminsdk-*.json` file should also be gitignored — verify your `.gitignore`
- The PHP Firebase Admin helper signs JWTs locally using `openssl_sign()` — no third-party packages needed
- Teachers are strictly scoped to their assigned section; they cannot access other teachers' student data

---

## 🧪 Algorithm Architecture

See [`ALGORITHMS_EXPLANATION.md`](ALGORITHMS_EXPLANATION.md) for a full technical breakdown of:
- NLP Transformer pipeline (prompt-constraint schema mapping)
- Deterministic Bloom's Taxonomy classification
- Auto-healing Firebase database algorithm
- NATG6 proficiency tier scoring logic

---

*QuestLearn is dedicated to transforming traditional Grade 6 English learning into an engaging, gamified RPG experience — with real-time analytics to help every child reach DepEd's Minimum Proficiency Level.*
