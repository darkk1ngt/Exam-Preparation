// Task 1A — Simple Section Guide
// Band 3 Core Principle: Every section needs MEASUREMENT (a number, threshold or timeframe) and CROSS-REFERENCING (link every claim to an algorithm, table, field or NFR).

// One-Sentence Memory Anchors
// 1. Business Context: Why digital is needed
// 2. Industry Research: What already exists in the sector and why it matters
// 3. Proposed Solution: What kind of system it is
// 4. Functional Requirements: What it does — specifically and testably
// 5. Non-Functional Requirements: How well it does it — with measurable thresholds
// 6. System Decomposition: How it is structured — must include a diagram
// 7. KPIs & UACs: How success is measured numerically and task-by-task
// 8. Justification: Why these choices make sense over the alternatives — includes risks and regulations

// 1. Business Context
// "What problems exist before we design anything?"

// Show who the organisation is, what pressures it faces, and why a digital solution is necessary. Frame a problem — do not just describe the organisation.

// Sentence 1: What the organisation is and who it serves
// Sentence 2: How scale or complexity creates operational pressure
// Sentence 3: Why diverse users increase that pressure
// Sentence 4: Why a digital system is the appropriate response

// 2. Industry Research & Emerging Technologies
// "What already exists in the sector and how does it inform your design?"

// Four subsections: Hardware & Software, Emerging Technologies, Meeting User Needs, Guidelines & Regulations. Each point must explain its relevance to your proposed system — not just describe what exists.

// 2.4 Guidelines & Regulations — Format For Each Regulation
// a: What the regulation requires
// b: What risk or obligation it introduces for your system
// c: How your system specifically addresses it — name the feature, field or NFR

// Required regulations: UK GDPR, Cookie Regulations, WCAG 2.1 Level AA, Health and Safety at Work Act 1974.

// 3. Proposed Solution
// "What category of system solves the problem?"

// Explain what kind of system you are proposing — not how it works technically. Focus on who it supports, when, and the high-level organisational benefit.

// Sentence 1: What kind of system it is
// Sentence 2: Who it supports and when
// Sentence 3: What it broadly provides
// Sentence 4: High-level organisational benefit

// 4. Functional Requirements
// "What must the system actually do — specifically and testably?"

// Use "shall" not "should" — shall means mandatory. Each FR must reference a user type, mechanism, table and algorithm.

// FR Format
// FR[X] — [User type]: The system shall [specific action] by [mechanism], querying the [table] so that [measurable outcome]. This is delivered by the [Algorithm name].

// Before Writing Each FR, Ask
// Is this something the system does — not something it is?
// Is it specific and testable — could an examiner verify it passed or failed?
// Does it reference a user type, a table and an algorithm?

// 5. Non-Functional Requirements
// "How well must the system behave — and how do we verify it?"

// NFRs define quality standards not features. Every NFR must have all three of these:

// A specific standard or mechanism named — e.g. WCAG 2.1 Level AA, bcrypt, HTTPS/TLS
// A measurable threshold — e.g. 2 seconds, 500 users, 4.5:1 contrast ratio
// A testable condition — something you could actually verify

// 6. System Decomposition
// "How would a development team split this work up?"

// Text description of components AND a diagram showing how they connect. Text alone is Band 1. The diagram must show components as rectangles, database as a cylinder, and labelled arrows showing which table each component accesses.

// Five Components
// User Account Management → users table
// Navigation & Mapping → attractions table
// Queue & Notification System → queue_status, notifications tables
// Personalisation Engine → user_preferences table
// Staff Analytics Dashboard → staff_metrics table

// Authentication and Role Check sits at the top feeding all five components — every component relies on the user being authenticated with the correct role.

// 7. KPIs & User Acceptance Criteria
// "How is success measured — organisationally and from the user's perspective?"

// KPI Format
// [Metric Name]: At least [X]% of [users] should [action] within [timeframe], measured over [period].

// KPIs are organisational, measurable and numerical. Every KPI needs a bold label, a specific target percentage, and a timeframe.

// UAC Format
// Given [starting condition], when [user action], the system [expected response]. Pass: [observable success]. Fail: [observable failure].

// UACs are user-focused and task-based. Each UAC maps directly to one FR — rewrite the FR as a real-world scenario with a clear pass and fail condition.

// 8. Justification
// "Why is this solution appropriate for this organisation over the alternatives?"

// Three subsections — Solution Rationale, Risks & Mitigations, Regulatory Compliance. Reasoning not repetition — do not describe what the system does again, explain WHY those decisions were made.

// 8.1 Solution Rationale — Justification Formula
// [Feature X] was chosen over [alternative] because [specific reason], enabling [measurable benefit]. This is implemented through [algorithm / table / field].

// 8.2 Risks & Mitigations — Risk Table Format
// Risk: Specific attack vector or failure mode
// Likelihood: Low / Medium / High — with one sentence explaining why
// Impact: Low / Medium / High — with one sentence explaining why
// Mitigation: Specific technical measure — name the mechanism, table or algorithm

// Seven risks required: SQL Injection, XSS, Man-in-the-Middle, Data Breach, Malicious Input, Inaccurate Queue Data, System Downtime.

// 8.3 Regulatory Compliance — Format For Each Regulation
// a: What the regulation requires
// b: What risk or obligation it introduces
// c: How your system specifically addresses it — name the feature, field or NFR

// Required: UK GDPR (two paragraphs — security AND data minimisation/erasure), WCAG 2.1 Level AA, reference NFR 1 and interface design.

// The Core Principle — Never Forget
// Measurement + Cross-Referencing. Every claim needs a number and a named system feature. The examiner is always asking: "Does this student understand WHY their system works the way it does, or did they just build something?"