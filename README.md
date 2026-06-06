# QuestLearn Administrative Dashboard

![QuestLearn](assets/images/logo.png)

## Overview
The **QuestLearn Administrative Dashboard** is a web-based portal designed for teachers and administrators to seamlessly manage the **QuestLearn** gamified educational platform. It bridges the gap between the mobile game client (Unity) and educational curriculum management by providing real-time data synchronization, AI-powered content creation, and deep student analytics.

## Key Features

### 🧠 AI-Powered Curriculum Generator
*   **PDF to Game Data:** Teachers can upload raw educational PDFs, and the system uses an advanced NLP Transformer model (LLaMA 3.1) to read, comprehend, and generate pedagogically sound multiple-choice questions.
*   **Schema Auto-Mapping:** The AI automatically categorizes questions (Grammar, Vocabulary, Reading) and determines appropriate HP penalties and XP rewards before injecting them into the game.

### 📊 Real-Time Performance Analytics
*   **Live Dashboards:** Visualize class-wide accuracy, participation, and health using Chart.js visualizations.
*   **Personalized Interventions:** The AI analyzes individual student metrics (HP, Level, XP, Accuracy) and generates deterministic, personalized teaching interventions for students who are struggling or falling behind.

### ⚡ Event-Driven Firebase Synchronization
*   **Zero Latency Updates:** Utilizing Firebase WebSockets, any change made in the dashboard instantly reflects in the Unity game client without the need for manual polling.
*   **Auto-Healing Database:** An embedded background algorithm continuously scans the NoSQL database to prevent structural corruption, ensuring that JSON collections remain strict Arrays compatible with the game's parser.

### 🛠️ Centralized Curriculum Management
*   **CRUD Operations:** Manage game nodes, edit existing questions, configure Boss Battles, and create daily challenges entirely from the browser.
*   **Authentication & Roles:** Secure Firebase Authentication ensures only authorized educators and super-admins can access sensitive student metrics and modify game states.

---

## Technology Stack

*   **Frontend:** HTML5, Vanilla JavaScript, CSS3, Bootstrap 5.3
*   **Visualization:** Chart.js, SweetAlert2
*   **Backend:** PHP 8.x
*   **Database & BaaS:** Firebase Realtime Database, Firebase Authentication
*   **AI Engine:** Groq API (LLaMA 3.1 8B)
*   **File Processing:** Cloudinary API

---

## Installation & Setup

### Prerequisites
*   A local server environment (XAMPP / WAMP / LAMP)
*   PHP 8.0 or higher
*   Firebase Project Credentials
*   Groq API Key

### Installation Steps
1. **Clone the Repository:**
   Place the project folder inside your local server's root directory (e.g., `htdocs` for XAMPP).
   
2. **Configure API Keys:**
   Update your Firebase configuration and API keys within the respective backend files:
   *   `backend/config/firebase.js`
   *   `backend/api/groq.php`
   *   `backend/api/groq_analytics.php`

3. **Database Rules:**
   Ensure your Firebase Realtime Database rules allow read/write access for authenticated users.

4. **Launch:**
   Start your Apache server and navigate to `http://localhost/questlearnadmin/index.php` to access the login portal.

---

## Project Structure
*   `/assets/` - Contains CSS styles, client-side JS controllers, and static images.
*   `/backend/` - PHP API endpoints for handling AI requests, file uploads, and configuration logic.
*   `/pages/admin/` - Super-admin views for managing system settings and teacher accounts.
*   `/pages/teacher/` - Core dashboard views (Students, Quests, Performance).
*   `/pages/auth/` - Login and profile management functionality.

---

*QuestLearn is dedicated to transforming traditional learning into an engaging, gamified RPG experience.*
