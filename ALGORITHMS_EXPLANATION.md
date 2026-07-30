# QuestLearn Admin Dashboard: Algorithmic Architecture & System Logic

This document details the advanced computational processes, algorithms, and logic systems implemented within the QuestLearn Administrative Web Panel. It is designed to serve as a technical reference during panel defenses or architectural reviews.

---

## 1. Natural Language Processing (NLP) & AI Parsing Algorithm

The core feature of the QuestLearn Admin Panel is the ability to generate gamified educational content from unstructured PDF documents. This is achieved using a **Transformer-based Large Language Model (LLM) Algorithm** (specifically Meta's LLaMA 3.1 8B via the Groq API).

### How the Algorithm Works:
1. **Text Extraction (Parsing):** When a teacher uploads a PDF, the system's parsing algorithm strips away binary formatting and visual elements to extract pure, unstructured text data.
2. **Semantic Analysis:** The raw text is passed to the NLP model. The Transformer algorithm analyzes the semantics (meaning) of the text to identify key facts, vocabulary definitions, and core concepts.
3. **Question Formulation:** Based on the semantic analysis, the model algorithmically formulates pedagogically sound questions. It also generates plausible "distractors" (incorrect options) to ensure the questions properly challenge the student.

---

## 2. Deterministic Schema-Mapping Algorithm (Prompt Constraint)

Because generative AI can be unpredictable, the raw output must be strictly controlled to interact with the Unity game client seamlessly.

### How the Algorithm Works:
*   We implemented a **Prompt-Constraint Algorithm**. This is a hardcoded set of strict system instructions injected into the AI's generation pipeline.
*   The algorithm forces the LLM to skip conversational text and output data *only* as a strict JSON object.
*   It automatically maps the generated questions to specific database fields, such as dynamically assigning `hpPenalty` (based on difficulty) and `xpReward`, ensuring the data is instantly ready for the game's engine.

---

## 3. Data Sanitization & Self-Healing Database Algorithm

A critical challenge with NoSQL databases (like Firebase Realtime Database) is maintaining structural integrity. If a single random string key is added to a sequential list, the database converts the Array into a Dictionary. This causes the Unity game client's JSON parser to crash or fail to load levels.

### How the Algorithm Works:
*   We developed an **Auto-Healing Algorithm** embedded within the dashboard's data fetcher (`quests.js`).
*   Every time the curriculum page is loaded, the algorithm scans the NoSQL nodes. 
*   If it detects structural corruption (e.g., string-based IDs mixed with integer IDs), it triggers the sanitization process.
*   It automatically filters out the corrupted string keys, reconstructs the data into a pure sequential JavaScript Array (`[0, 1, 2...]`), and silently writes the repaired array back to Firebase in real-time, preventing game client crashes without manual intervention.

---

## 4. Real-Time Data Aggregation & Predictive Analytics

The Performance Analytics page does not simply display static database numbers; it actively computes them on the fly to provide teachers with actionable insights.

### How the Algorithm Works:
*   The system uses an **O(n) Data Aggregation Algorithm** that iterates through the entire student user base in real-time.
*   **Metric Calculation:** It dynamically computes mathematical averages, such as the *Accuracy Rate* `(Total Correct Answers / Total Questions Answered * 100)`.
*   **Threshold Flagging:** The algorithm identifies "at-risk" students by filtering those whose Health Points (HP) drop below a critical threshold (e.g., HP <= 20).
*   **Data Visualization Piping:** This aggregated data payload is seamlessly piped into Chart.js to render visual distributions (like the Class Accuracy Bar Chart and the Correct vs. Incorrect Donut Chart).

---

## 5. Event-Driven Synchronization Architecture (WebSockets)

Traditional dashboards use "polling"—an algorithm that continuously asks the server for updates every few seconds, which is slow and wastes bandwidth. 

### How the Algorithm Works:
*   The QuestLearn panel relies on an **Event-Driven Algorithmic Architecture**. 
*   It establishes a persistent WebSocket connection directly to the Firebase Realtime Database.
*   Instead of repeatedly asking for data, the UI passively listens for `on('value')` state changes. When a student answers a question in the game, the event triggers instantly, and the dashboard algorithm dynamically re-renders *only* the specific HTML components that changed. This results in zero-latency synchronization between the student's mobile game and the teacher's dashboard.

---

## 6. First-Attempt Official Benchmark & Retry History Persistence Algorithm

To maintain diagnostic accuracy while encouraging gamified learning and student mastery, QuestLearn enforces a strict **Dual-Record Attempt Architecture**.

### How the Algorithm Works:
*   **Immutable Official Record (First Attempt):** When a student completes a quest level for the first time, the initial attempt data (`score`, `totalCorrect`, `totalWrong`, `categoryBreakdown`, `timestamp`) is saved under `users/{uid}/firstAttempts/{levelId}`. This first-attempt record is **immutable** and will never be overwritten by subsequent practice runs.
*   **Official Diagnostic Analytics:** All administrative dashboards, roster accuracy rates, class-wide average stats, category struggle indicators, and AI Insights generate report metrics strictly using **First Attempts**. This allows educators to identify where students *initially* struggled before practicing.
*   **Practice Retry History Persistence:** Students are free to retry levels as many times as necessary to earn rewards or unlock prerequisite nodes. Every retry is logged sequentially in the database under `users/{uid}/attempts/{attemptId}` as a learning record.
*   **Dual View in Teacher Dashboard:** The teacher panel displays both the **Official First-Attempt Benchmark** (for diagnostic reporting) and the **Practice Retry Progress Count** (showing student effort and learning persistence).

---

## 7. Categorical & Game-Mode Student Segmentation Algorithm

To provide teachers with clear visibility into student mastery across distinct curriculum subjects and gamified game modes, QuestLearn executes an **O(n) Categorical & Mode Segmentation Algorithm**.

### How the Algorithm Works:
*   **Dual Dimension Indexing:** The algorithm segments performance data across two distinct axes:
    1. **Subject Topics:** Grammar, Vocabulary, Reading, Spelling, and Information Literacy.
    2. **RPG Game Modes:** Boss Battles, Daily Challenges, Timed Mode, and Story Chapters.
*   **Threshold-Based Performance Classification:** For each topic and mode, the algorithm dynamically sorts active students into two actionable tiers:
    *   ⭐ **Excelling Students Tier ($\ge$75% Accuracy):** Students demonstrating domain mastery who are candidates for peer tutoring or higher-level quest unlocks.
    *   ⚠️ **Struggling Students Tier ($<$60% Accuracy):** Students flagged for immediate targeted intervention and quest parameter adjustments.
*   **Real-Time Class Average Calculation:** Computes the exact class-wide mean score per domain and pipes the result into interactive visualization cards and action modals.
