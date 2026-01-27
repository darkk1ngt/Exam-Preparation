# T Level Digital Production, Design and Development
## Task 3B: Evaluating Feedback to Inform Future Development
### London Zoo Digital Platform

---

## Task Overview

Produce an evaluation of the effectiveness of the prototype digital solution you have developed for London Zoo.

You must evaluate your prototype based on:
- Evidence gathered in Task 3A (testing results, defect logs, user feedback)
- Original Task 1 requirements (functional, non-functional, KPIs, user acceptance criteria)
- Appropriateness of assets, content, and data handling
- Accessibility, security, and regulatory compliance
- Realistic future development opportunities

**This is a single supervised session (2 hours).**

You may access your own prior work (Task 1 design, Task 2 prototype, Task 3A testing evidence). You may not access the internet or receive tutor guidance during this evaluation.

---

## What You Must Evaluate

Your evaluation must address all three areas below. For each area, consider the evidence you gathered and form justified judgements. Support all claims with specific references to your requirements, test results, or feedback records.

### **1. Effectiveness of Your Solution in Meeting Requirements**

Evaluate how well your developed prototype meets the requirements you defined in Task 1 and tested in Task 3A.

Consider:

- **Functional Requirements:** To what extent does your prototype implement the intended features (user authentication, attraction directory, queue time estimation, alerts, staff dashboard, navigation, personalisation, accessibility)? Which features work as designed? Are there gaps or limitations?

- **Non-Functional Requirements:** How well does your prototype satisfy non-functional requirements such as usability, accessibility, reliability, and security? For example:
  - Is the user interface intuitive and easy to navigate for both visitor and staff users?
  - Does the system behave reliably when encountering error conditions (invalid input, missing data, network/mock failures)?
  - Are password storage and access control secure?
  - Does the prototype meet WCAG 2.1 AA accessibility intent (keyboard navigation, screen reader compatibility, colour contrast, text scaling)?

- **Key Performance Indicators (KPIs):** Were your agreed KPIs met or closely approached? For example:
  - Queue time estimates within acceptable tolerance?
  - Alerts triggering correctly and respecting user preferences?
  - Staff dashboard displaying accurate operational data?
  - Page/API response times acceptable for a prototype?
  - Task completion rates for key user journeys acceptable?

- **User Acceptance Criteria:** Did your prototype satisfy the acceptance criteria derived from your Task 1 analysis? Where not met, why? Was this a priority or a limitation accepted during development?

**Reference your test logs, defect lists, and feedback records to support your judgement.**

---

### **2. Appropriateness of Assets, Content, and Data Handling**

Evaluate the suitability and management of resources used in your solution.

Consider:

- **Third-Party Assets:** Are the libraries, frameworks, and tools you selected appropriate for the task? Do they meet your functional requirements? Are they well-maintained and supported? Did you verify licences and comply with licence terms?

- **Content Quality:** Is the content (zoo attraction descriptions, UI labels, error messages, help text) accurate, clear, and appropriate for your intended users? Are there gaps or misleading information?

- **Data Handling:** How do you handle and store data in your prototype? Is your approach suitable for the sensitivity of the data? For example:
  - Are user passwords hashed (not plaintext)?
  - Are sensitive fields (location, preferences) stored appropriately?
  - Do you have a mechanism for user data deletion (right to erasure)?
  - Is sample/test data clearly labelled and managed separately?

- **Legal and Ethical Implications:** Consider GDPR, data protection, and user privacy:
  - Does your data handling comply with data minimisation principles (collect only what's needed)?
  - Are users informed about data collection and use?
  - Is consent collected where required (e.g., for notifications)?
  - Have you identified any ethical concerns in your data or content choices?

**Reference your asset log, development notes, and code to support your judgement.**

---

### **3. Opportunities for Future Development**

Identify realistic improvements that would increase the value of the solution. Base recommendations on your testing evidence and user feedback.

Consider:

- **High-Priority Defects or Limitations:** Were there defects or gaps discovered in testing that would significantly improve the system if fixed? What would be the effort and benefit?

- **User Feedback Themes:** Did your technical and non-technical users identify common pain points, feature requests, or areas of confusion? How would addressing these improve user satisfaction or system reliability?

- **Scalability and Performance:** Your prototype may use simulated data or simplified algorithms. Where would optimisations be needed to support a larger user base or more complex scenarios?

- **Accessibility Enhancements:** Did your testing reveal accessibility gaps (keyboard navigation issues, screen reader problems, etc.)? How would you address these?

- **New Capabilities:** Are there logical extensions to your current features that would enhance value? For example:
  - Integration with real-time location services (currently simulated)
  - Social sharing of favourites or wait times
  - Predictive queue management (learning historical patterns)
  - Mobile app notifications (if currently web-only)
  - Staff training or admin interfaces

- **Infrastructure and Operations:** What systems or processes would be needed to move from prototype to production?

**Each recommendation should be:**
- Justified by evidence (reference specific test results, feedback comments, or defects)
- Realistic for the next development phase (not a complete redesign)
- Prioritised by impact and effort (do the high-value improvements first)
- Constrained by scope (avoid suggesting features beyond your Task 1 requirements)

---

## How to Structure Your Evaluation

Your evaluation should be presented as a **professional report** with clear sections addressing the three evaluation areas above.

**Suggested Structure:**
1. **Introduction** (brief): Recap of what your prototype aims to achieve; summary of testing scope (features tested, user types, testing approach)
2. **Section 1: Effectiveness in Meeting Requirements** (detailed): Address functional, non-functional, KPIs, and user acceptance criteria with evidence
3. **Section 2: Assets, Content, and Data Handling** (detailed): Evaluate appropriateness and compliance
4. **Section 3: Future Development Opportunities** (detailed): Identify and prioritise improvements with justification
5. **Conclusion** (brief): Overall assessment of solution readiness and next steps

**Format:**
- Length: 1500–2500 words (approximately)
- Use clear headings and subheadings
- Include specific references to test results, feedback records, and design decisions (e.g., "As shown in TestLog entry T024, the queue time algorithm...")
- Support all judgements with evidence; avoid unsupported claims
- Use professional language appropriate for a technical stakeholder

---

## What Evidence You Should Reference

During your evaluation, refer to:

- **Task 1 Design Documents:** Your original functional and non-functional requirements, KPIs, user acceptance criteria, data requirements, and risk mitigation strategies
- **Task 2 Development Notes:** Architecture decisions, algorithm explanations, security measures, accessibility approach, trade-offs, and known limitations
- **Task 3A Test Results:** Test log entries, pass/fail status, defect descriptions, severity levels
- **Task 3A Defect List:** Issues discovered, their priority, and resolution status (fixed/deferred)
- **Task 3A User Feedback:** Comments from technical and non-functional users, themes, priorities
- **Task 3A Findings Summary:** Your own summary of coverage and key risks

Do not include code or lengthy technical logs in your evaluation report; reference them by ID or section where appropriate.

---

## Constraints and Guidance

- **Scope:** Evaluate only the features and design decisions you made in Tasks 1–2. Do not propose entirely new systems or out-of-scope capabilities.
- **Evidence-Based:** Every claim must be supported by evidence from your own work. Avoid general statements like "the system is good" without supporting reference.
- **Realistic Future Development:** Improvements should be feasible increments based on your current design and codebase. Prioritise high-value, achievable enhancements.
- **No New Implementation:** This task is evaluation and reflection only. Do not implement additional features or fixes during this session.
- **Professional Tone:** Write for a technical stakeholder (e.g., project manager, client representative) who will decide next steps based on your evaluation.

---

## Key Considerations

### **Accessibility and Compliance**
In your evaluation, reflect on:
- How well your prototype supports users with different abilities (visual, motor, cognitive, auditory)
- Your approach to WCAG 2.1 AA compliance and any gaps identified in testing
- Data protection measures in place and any areas of concern

### **Security**
Address:
- How user authentication is implemented and any vulnerabilities identified
- Data protection measures (encryption, hashing, access control)
- Any security concerns raised in testing or feedback

### **Business Value**
Consider:
- Does your prototype deliver on the original client need (London Zoo's operational and visitor experience improvements)?
- Are the KPIs you defined met or on track?
- What would be the impact of proposed improvements on business value?

---

## Submission Requirements

Submit your evaluation as a **single PDF file** named:

```
Task3B_Evaluation_[YourSchoolNumber]_[YourSurname]_[FirstLetterOfFirstName].pdf
```

Example: `Task3B_Evaluation_12345_Smith_J.pdf`

**File Requirements:**
- PDF format (not Word, not Markdown)
- Your name, school, and date on the first page
- Clear section headings and page numbers
- Professional formatting (consistent fonts, spacing, margins)
- References to evidence are clear and specific (e.g., "TestLog entry T015", "Feedback_Technical_User_1.pdf", "Task 1 requirement R3.2")

**Do not submit:**
- Code files or technical logs
- Task 2 prototype code
- Raw test data (reference it instead)
- Attachments beyond the PDF itself (unless explicitly referenced within)

---

## Assessment Focus

Your evaluation will be assessed on:

| Focus Area | What We're Looking For |
|---|---|
| **Comprehensive Coverage** | All three evaluation areas addressed; all requirements/KPIs considered |
| **Evidence-Based Judgement** | Claims supported by specific references to test logs, defect lists, feedback, and design documents |
| **Realism and Honesty** | Balanced assessment (not overstating success or dismissing all results); acknowledgement of limitations and constraints |
| **Regulatory Awareness** | Consideration of GDPR, accessibility, security, and user consent in evaluation |
| **Constructive Future Planning** | Realistic, prioritised improvements grounded in evidence and user needs |
| **Professional Communication** | Clear writing, logical structure, appropriate tone, suitable for technical stakeholders |

---

## Example Evaluation Statements (for illustration only—do not copy)

*Good evaluation statements reference evidence and justify judgement:*

- "The queue time algorithm estimates waits to within 5 minutes for 80% of test cases (TestLog T008–T015), exceeding our KPI of 75% accuracy. However, edge cases with capacity constraints show a 12-minute error (TestLog T019), suggesting the model needs refinement for scenarios approaching max capacity."

- "The staff dashboard displays ticket counts correctly but lacks a timestamp showing when data was last refreshed. This was noted in both the technical feedback (Feedback_Technical_User_1, comment 3) and a defect (DefectList D012, severity high), indicating this should be prioritised in the next iteration."

- "While password hashing is implemented (verified in DevelopmentNotes, section 4.2), no automated mechanism for user data deletion was provided. This creates a compliance gap under GDPR Article 17. A 'delete account' feature should be added before production deployment."

- "Accessibility testing identified that the staff dashboard is not keyboard navigable to alert tables (DefectList D018, severity medium). Recommendation: implement tab-stop ordering and ARIA-label attributes in the next development cycle."

*Avoid:*

- "The system is good" (no evidence)
- "We should add a booking system" (outside scope of Task 1)
- "Everything works perfectly" (not credible given any real testing)
- "It would be nice to have..." (unsupported by evidence)

---

## Timing

- **Duration:** 2 hours (single supervised session)
- **Conditions:** Work independently; access only your own prior work and this brief
- **No internet access, no tutor guidance, no peer collaboration** during this session

---

## Final Notes

This evaluation is an opportunity to **demonstrate your critical thinking and professional judgment** as a developer. You've designed, built, and tested a system. Now reflect honestly on what worked, what didn't, and what's next.

Your evaluation should convince a stakeholder that you understand:
- Whether your solution solves the original problem
- What evidence supports that understanding
- What steps would improve the solution
- How to prioritise limited development resources

Write with that audience in mind.

---

**End of Task 3B Brief**

**Assessment Duration:** 2 hours (supervised)  
**Assessment Weight:** 15 marks (12.5% of overall T Level grade)  
**Session Type:** Supervised assessment condition (exam-style single session)