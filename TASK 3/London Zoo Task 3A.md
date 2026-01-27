# T Level Digital Production, Design and Development
## Task 3A: Testing and Feedback
### London Zoo Digital Platform

---

## Client Scenario (Recap)
London Zoo is piloting a digital platform to enhance visitor experience and support staff operations. Your Task 1 design and Task 2 prototype cover:
- User accounts and preferences (visitor and staff)
- Attraction directory with live status and queue time estimates
- Queue monitoring and alerts for attraction changes
- Visitor navigation/location tracking (real or simulated)
- Staff dashboard for ticket counts and attraction performance
- Responsive, accessible UI with language and accessibility options

You must now plan and carry out testing of the developed solution and gather feedback from users.

---

## Task Overview
Plan, execute, and evidence testing of your London Zoo prototype. Gather feedback from both technical and non-technical users. Record all testing and feedback in appropriate formats. Do not add new features beyond those defined in Task 1.

---

## What You Must Do
1) **Test Planning**
- Derive test scenarios from the Task 1 functional requirements and agreed KPIs.
- Cover both functional and non-functional aspects (usability, accessibility, performance, reliability).
- Define test data, preconditions, expected outcomes, and acceptance criteria.
- Prepare a test schedule that fits the allocated time.

2) **Functional Testing**
- Execute tests for each core feature:
  - Authentication (visitor/staff), preferences, language/accessibility options
  - Attraction directory: status, queue times, filtering/search
  - Queue time estimation and status updates
  - Alerts/notifications: triggers, delivery, user preferences
  - Staff dashboard: ticket counts, uptime, status updates with reasons
  - Navigation/location (real or simulated input): route/ETA display and error handling
- Record results, defects, and evidence (screenshots/logs).

3) **Non-Functional Testing**
- **Usability:** task completion, clarity of labels, navigation flow, error messaging.
- **Accessibility:** keyboard-only use, screen reader checks, colour contrast, text scaling (aim for WCAG 2.1 AA intent).
- **Performance (prototype scope):** basic page/API response observations and queue/alert refresh responsiveness.
- **Reliability:** behaviour under simple error conditions (e.g., no network/mock failure, empty data).

4) **User Feedback Collection**
- Gather feedback from at least one technical user and one non-technical user.
- Use structured feedback forms or interview notes aligned to the functional requirements and KPIs.
- Capture severity/priority, user role, scenario tested, and suggested improvements.

5) **Analysis and Actions**
- Summarise defects and feedback; group by severity and impact on requirements/KPIs.
- Identify retest items; note whether fixes were applied (if time allows) or deferred.
- Update test evidence to show any re-tests (if performed).

---

## Evidence You Must Produce
- **Test Plan**: objectives, scope, scenarios linked to requirements/KPIs, schedule, roles, environments, data.
- **Test Log**: executed test cases with steps, expected vs actual, status, evidence reference, defect IDs.
- **Defect/Issue List**: ID, title, severity, requirement/KPI link, owner, status (open/fixed/deferred), notes.
- **User Feedback Records**: technical and non-technical feedback forms/interview notes; include context, scenarios, and priorities.
- **Summary of Findings**: brief overview of coverage, pass/fail counts, key risks, accessibility outcomes, and recommended next actions.

Keep evidence concise, clear, and in formats suitable for assessors (tables, numbered items, short paragraphs). Do not include solution code in these documents.

---

## Expectations and Constraints
- **Scope**: Test only the features defined in Task 1 and built in your Task 2 prototype.
- **Languages/Tech**: Work with the existing prototype; no new frameworks or major feature additions.
- **Environment**: Use your test environment or simulated data appropriate for a prototype.
- **Accessibility Focus**: Demonstrate intent toward WCAG 2.1 AA through testing evidence (keyboard, contrast, text scaling, screen reader checks).
- **Security Focus**: Validate authentication, password handling (hashed), and basic access control for staff vs visitor views.
- **Performance Focus**: Prototype-level observations (no load testing required); note any latency affecting usability.
- **KPIs/Acceptance Examples** (adapt to your Task 1 design):
  - Login success/failure handling
  - Queue time estimate displays within your defined tolerance
  - Alert triggers on status change and respect user opt-in settings
  - Staff status update applies and is visible to visitors
  - Navigation/ETA handles missing or invalid location inputs gracefully
  - Accessibility checks: keyboard-only completion of key tasks; acceptable contrast; screen reader announces key UI elements

---

## Submission Requirements
Provide a single zipped folder containing:
- `TestPlan.{docx|pdf|md}`
- `TestLog.{xlsx|md}` with linked evidence references
- `DefectList.{xlsx|md}`
- `Feedback_Technical.{pdf|md}` and `Feedback_NonTechnical.{pdf|md}` (or consolidated with clear roles)
- `Findings_Summary.{pdf|md}`
- Any evidence images/logs referenced (labelled with IDs used in logs)

Folder name example: `LondonZoo_Task3A_Testing_Feedback.zip`

---

## Timing and Conditions
- **Suggested duration:** 8–10 hours total (in supervised conditions if assessed).
- Work independently; all testing and feedback records must be your own.
- You may reuse your Task 2 prototype and assets. Do not introduce new features.

---

## Assessment Focus (Style Aligned to Pearson)
- Coverage of functional and non-functional requirements
- Quality and clarity of test planning and execution
- Appropriateness and completeness of evidence (logs, defects, feedback)
- Linking tests to requirements/KPIs
- Consideration of accessibility, security, and basic performance within prototype scope
- Professional presentation of documentation

---

**End of Task 3A Brief**
