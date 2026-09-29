---
name: questlearn-ai-content
description: Analyze and prepare QuestLearn educational questions and learning resources using the project's Groq/LLaMA 3.1 AI workflow. Use this skill for question analysis, difficulty classification, competency alignment, educational-content validation, AI response handling, and teacher/admin review workflows.
---

# QuestLearn AI Content Skill

## Purpose

This skill provides project-specific guidance for using AI to assist with
educational content analysis in QuestLearn Admin.

The AI workflow supports teachers and administrators in analyzing questions
and learning resources for the Grade 6 English learning system.

The AI should assist with analysis and classification while preserving
teacher/admin control over final educational content.

---

# QuestLearn Learning Areas

QuestLearn contains four major learning categories:

1. Grammar
2. Vocabulary
3. Reading Comprehension
4. Information Literacy

AI-assisted content analysis should identify the appropriate category when
the available information is sufficient.

Do not force a category when the content does not provide enough evidence.

---

# AI Technology

The project uses:

- Groq API
- LLaMA 3.1

The AI may be used for:

- Question analysis
- Difficulty classification
- Competency alignment
- Learning resource analysis
- Content assistance
- Educational feedback

Do not replace the existing AI provider or model unless explicitly requested.

---

# Core Principle

AI-generated results are assistance, not unquestionable ground truth.

The system should:

1. Provide the relevant content to the AI.
2. Request structured analysis.
3. Validate the returned response.
4. Display or store the result according to the existing workflow.
5. Allow teacher/admin review when required.
6. Preserve the original educational content.

Never silently replace original content with an AI-generated result.

---

# Question Analysis Workflow

When analyzing a question:

1. Read the complete question.
2. Identify available answer choices.
3. Identify the correct answer if provided.
4. Identify the relevant English category.
5. Identify the likely competency.
6. Analyze the cognitive demand.
7. Determine the difficulty classification.
8. Generate a concise explanation or rationale when required.
9. Return structured output.
10. Validate the result before storing it.

The AI should not invent missing answer choices, competencies, or source
information.

---

# Difficulty Classification

QuestLearn uses difficulty classification to organize assessment questions.

When determining difficulty, consider factors such as:

- Cognitive demand
- Number of reasoning steps
- Vocabulary complexity
- Sentence complexity
- Required interpretation
- Distractor similarity
- Reading complexity
- Competency expectations
- Grade-level appropriateness

Do not determine difficulty based only on question length.

A short question can be difficult, while a long question can be easy.

---

# Difficulty Output

Use the difficulty levels already supported by the application.

If the application defines:

- Easy
- Moderate
- Difficult

then use those exact values.

Do not introduce alternative labels such as:

- Beginner
- Intermediate
- Advanced

unless the existing application explicitly supports them.

If the actual application uses different values, inspect the existing code and
follow those values instead.

---

# Competency Alignment

When aligning a question with a Grade 6 English competency:

1. Analyze what the learner is required to do.
2. Identify the relevant skill.
3. Compare it with the available competency list.
4. Select a competency only when there is sufficient evidence.
5. Do not invent competency identifiers.

If multiple competencies appear possible, return the uncertainty or provide
the alternatives for teacher/admin review instead of pretending there is only
one correct classification.

---

# Category Classification

Classify content into the existing QuestLearn categories when supported by
the question:

### Grammar

Examples include:

- Sentence structure
- Parts of speech
- Verb usage
- Subject-verb agreement
- Grammar rules

### Vocabulary

Examples include:

- Word meaning
- Synonyms
- Antonyms
- Context clues
- Word usage

### Reading Comprehension

Examples include:

- Main idea
- Supporting details
- Inference
- Sequence
- Author's purpose
- Interpretation of passages

### Information Literacy

Examples include:

- Identifying reliable information
- Evaluating sources
- Distinguishing fact and opinion
- Interpreting information
- Using information appropriately

These examples are guidelines.

Always follow the actual project requirements and available competency data.

---

# Structured AI Responses

Prefer structured JSON when the application expects machine-readable
responses.

A useful conceptual response structure is:

```json
{
  "category": "Vocabulary",
  "difficulty": "Moderate",x`
  "competency": "Example competency",
  "reasoning": "Brief explanation of the classification",
  "confidence": 0.85
}