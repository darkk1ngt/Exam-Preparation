# T Level Digital Production, Design and Development
## Task 2: Developing the Solution
### London Zoo Digital Platform

---

## **CLIENT BRIEF**

### **Background**

London Zoo is modernising its visitor experience with a new digital platform designed to streamline operations and enhance guest engagement. Following the completion of the design phase, the project now moves to development.

Your Task 1 submission identified the London Zoo's key operational needs:
- Real-time queue management and wait time estimation
- Navigation and wayfinding guidance throughout the zoo
- Live visitor alerts for attraction status and closures
- Staff performance analytics and operational dashboards
- User account personalisation and accessibility features

You now need to develop a **working prototype** that implements the core features defined in your Task 1 design, with a particular focus on:
- Functional back-end systems (queue algorithms, location tracking, alert logic)
- User-facing front-end interface (visitor and staff dashboards)
- Secure data handling and GDPR compliance
- Accessibility for all visitors (WCAG 2.1 AA standard)
- Iterative testing and documentation of development decisions

### **Scope**

This is a **functional prototype** for demonstration to stakeholders, not a production-ready system. The prototype should showcase:

1. **Core operational features** as defined in your Task 1
2. **Working algorithms** for queue time estimation, route calculation, and alert triggers
3. **Secure authentication** for user accounts
4. **Real-time or simulated data** to demonstrate functionality
5. **Responsive interface** for both visitor and staff user types
6. **Evidence of iterative refinement** through testing and adaptation

The system should be **ready to demonstrate** to non-technical stakeholders in a controlled environment. It does not need to handle unlimited concurrent users or support a production infrastructure.

---

## **ASSESSMENT OBJECTIVES**

By completing this task, you will demonstrate:

### **Technical Development**
- [ ] **Back-end Development:** Implement algorithms and business logic that support queue management, wait time estimation, location processing, alert generation, and staff analytics
- [ ] **Front-end Development:** Create a functional user interface for visitors and staff that clearly presents data, handles user input, and responds to system state changes
- [ ] **Data Integration:** Design and implement secure data handling that supports user accounts, preferences, queue states, location updates, and performance metrics
- [ ] **Security Implementation:** Authenticate users securely, protect sensitive data, and comply with GDPR requirements

### **Testing and Quality Assurance**
- [ ] **Functional Testing:** Verify that each feature works as designed; document test cases and results
- [ ] **Edge Case Testing:** Test boundary conditions (e.g., queue full, no route available, system failure scenarios)
- [ ] **Security Testing:** Validate authentication, data protection, and access control
- [ ] **Accessibility Testing:** Confirm that visitors with different needs can use the system (keyboard navigation, screen reader compatibility, text scaling, colour contrast)

### **Iterative Development**
- [ ] **Adapt and Refine:** Respond to test findings by improving code, fixing bugs, and enhancing user experience
- [ ] **Document Changes:** Keep a development log that shows what was tested, what failed, and how you addressed issues
- [ ] **Justify Decisions:** Explain trade-offs made during development (e.g., simulated data vs. live API, simplified algorithm vs. complex model)

### **Professional Practice**
- [ ] **Code Quality:** Write clear, maintainable code that can be understood and modified by other developers
- [ ] **Version Control:** Use git or similar to track changes and maintain a clear development history
- [ ] **Documentation:** Provide setup instructions, architecture notes, algorithm explanations, and user guides for the prototype

---

## **FEATURES TO IMPLEMENT**

Based on your Task 1 design, implement the following core features:

### **1. User Authentication & Accounts**
- **Feature:** User registration and secure login
  - Visitor and staff user types with different access levels
  - Password hashing (do not store plaintext passwords)
  - Session management
  - Account recovery mechanism (email verification or security questions)
- **Acceptance Criteria:**
  - Users can sign up with valid email and password
  - Login succeeds with correct credentials
  - Login fails gracefully with incorrect credentials
  - Staff users see a different dashboard than visitors
  - Sessions timeout after inactivity

### **2. User Preferences & Personalisation**
- **Feature:** Customisable user settings
  - Language selection (at least English + 1 other language if feasible)
  - Accessibility options (text size, high contrast, audio descriptions)
  - Favourite attractions list
  - Notification preferences (opt-in/opt-out)
- **Acceptance Criteria:**
  - Users can update preferences from a settings page
  - Preferences persist across sessions
  - Language setting changes the UI language
  - Accessibility options apply to all pages
  - Users can select/deselect notification categories

### **3. Attraction Directory & Navigation**
- **Feature:** View available attractions with live status
  - List all zoo attractions (rides, exhibits, facilities) with descriptions
  - Display current operational status (open, closed, delayed)
  - Show attraction location on a map or coordinate display
  - Display max capacity and current queue length (estimated)
- **Acceptance Criteria:**
  - Attractions load on page open
  - Status updates reflect changes (e.g., when an attraction closes)
  - Users can filter attractions by type or status
  - Coordinates or visual map shows relative locations
  - Information is readable and navigable

### **4. Queue Management & Wait Time Estimation**
- **Feature:** Display queue times and estimated waits
  - Algorithm: Calculate estimated wait based on current queue length and average service time
  - Display estimated wait time for each attraction
  - Show queue status (short, medium, long) with visual indicators
  - Update queue data at regular intervals (e.g., every 5 minutes) or on user refresh
- **Acceptance Criteria:**
  - Algorithm correctly estimates wait times (justification of approach required in documentation)
  - Wait times display prominently on attraction pages
  - Visitors can see which attractions have shortest waits
  - Queue data refreshes automatically or on demand
  - Edge cases handled: empty queues, over-capacity, closed attractions

### **5. Real-Time Alerts & Notifications**
- **Feature:** Notify users of status changes and system alerts
  - Types: Queue updates (long waits), attraction status changes (closed/delayed), wait time thresholds exceeded
  - Delivery: In-app alerts, email notifications (optional), push notifications (if feasible)
  - User preferences: Visitors can opt-in/out of specific alert types
- **Acceptance Criteria:**
  - Alerts appear in-app when triggered
  - Alerts include relevant information (which attraction, what changed, recommended action)
  - Users can mark alerts as read
  - Users can configure which alerts they receive
  - Alerts do not spam or overwhelm users

### **6. Staff Dashboard & Performance Analytics**
- **Feature:** Staff view for operational insights
  - View attraction performance: ticket sales, operational uptime, current queue status
  - Generate simple reports: daily summaries, peak hours, performance trends
  - Manually update attraction status (open/closed/delayed) with reason
- **Acceptance Criteria:**
  - Staff can log in and see a different dashboard than visitors
  - Dashboard displays key metrics clearly (ticket count, % uptime, current queue)
  - Staff can update attraction status with a reason/note
  - Simple daily or weekly report summarising activity
  - Data is read-only except for status updates (staff cannot modify user data)

### **7. Location Tracking (Visitor or Simulated)**
- **Feature:** Track visitor location and suggest navigation
  - If implementing real location: GPS or simulated location updates via mobile app
  - Route suggestion: Calculate simple path from current location to destination attraction
  - ETA: Estimate time to reach destination based on walking speed
  - Alternative: Simulated data (e.g., visitor enters "current location" manually for demonstration)
- **Acceptance Criteria:**
  - System accepts location data (real or simulated)
  - Route is visually displayed or described clearly
  - ETA is reasonable and updates as visitor moves
  - System handles "no route available" gracefully
  - Accuracy is acknowledged (e.g., "±50 meters")

### **8. Responsive & Accessible User Interface**
- **Feature:** Front-end design for multiple device types and abilities
  - Responsive design: Works on desktop, tablet, and mobile (at minimum, readable and functional)
  - Keyboard navigation: All features accessible via keyboard (no mouse required)
  - Screen reader compatible: Proper use of semantic HTML, ARIA labels where needed
  - Colour contrast: Text meets WCAG AA standard (4.5:1 for body text)
  - Text scaling: UI remains usable when text is enlarged to 200%
- **Acceptance Criteria:**
  - UI adapts to different screen sizes without losing functionality
  - All interactive elements are keyboard accessible
  - Screen reader announces key information correctly
  - Colour contrast meets WCAG AA guidelines
  - No information is conveyed by colour alone

---

## **REQUIRED DELIVERABLES**

### **1. Working Prototype**
- **What:** A functional application demonstrating the features listed above
- **Format:** 
  - Front-end: Web application (HTML/CSS/JavaScript) or native mobile app (if feasible)
  - Back-end: API or server logic (Node.js, Python Flask/Django, C#, Java, PHP, etc.)
  - Data: Local database (SQLite, MySQL, PostgreSQL) or in-memory data structure (for demo purposes)
- **Submission:** Compressed folder (ZIP) containing:
  - All source code files with clear folder structure
  - README file with setup and run instructions
  - Database schema or data structure documentation
  - Any configuration files needed to run the prototype

### **2. Asset Log**
- **What:** Record of all third-party assets used (libraries, frameworks, images, icons, fonts)
- **Format:** Table with columns:
  | Asset Name | Type (library/framework/font/image) | Source | Licence | Justification |
  |---|---|---|---|---|
  | Example: Bootstrap 5 | Framework | https://getbootstrap.com | MIT | Responsive grid layout |
  - Include only assets you actively use; exclude dev dependencies unless critical
- **File:** `AssetLog.md` or `AssetLog.xlsx` in submission folder

### **3. Development Documentation**
- **What:** Explanation of design decisions, implementation approach, and justification
- **Sections to include:**
  - Architecture overview: High-level description of back-end and front-end components
  - Algorithm explanations: How queue time estimation, route calculation, and alerts are implemented
  - Data model: Tables/entities used and key relationships
  - Security measures: How authentication, passwords, and GDPR compliance are implemented
  - Accessibility approach: How WCAG compliance was achieved
  - Trade-offs: What was simplified or deferred due to time/scope constraints
  - Known limitations: Features not yet implemented or areas needing refinement
- **File:** `DevelopmentNotes.md` (1500–2500 words)

### **4. Test Log (Evidence of Testing)**
- **What:** Record of functional tests, security tests, and accessibility tests performed
- **Format:** Table for each test phase:
  | Test ID | Feature | Test Case | Steps | Expected Result | Actual Result | Status (Pass/Fail) | Notes |
  |---|---|---|---|---|---|---|---|
  - Include minimum 20 test cases covering:
    - Happy path (feature works as designed)
    - Edge cases (boundary conditions, error states)
    - Security (authentication, data protection)
    - Accessibility (keyboard nav, screen reader, colour contrast)
- **File:** `TestLog.md` or `TestLog.xlsx` in submission folder

### **5. Iterative Development Evidence**
- **What:** Evidence of testing → refinement → re-testing cycle
- **Format:**
  - Git commit history (if using version control) showing multiple updates over time
  - OR: Screenshots/logs showing test failures and subsequent fixes
  - OR: Written summary of 3–5 iteration cycles with descriptions of what was tested, what failed, and how it was fixed
- **File:** Embedded in `DevelopmentNotes.md` or separate `IterationLog.md`

### **6. Setup Instructions**
- **What:** Step-by-step guide for running the prototype
- **Include:**
  - System requirements (OS, Node version, Python version, browser, etc.)
  - Installation steps (git clone, npm install, database setup, etc.)
  - How to start the application (command to run)
  - Sample login credentials (demo user account)
  - Expected output or first screen to see
  - Troubleshooting tips
- **File:** `README.md` or `SETUP.md` in submission folder

---

## **EXPECTATIONS & GUIDANCE**

### **Code Quality**
- Code should be readable and follow consistent naming conventions
- Functions/methods should be single-purpose and clearly documented
- Magic numbers and complex logic should be commented
- Avoid duplicate code; use functions/modules to avoid repetition
- **Good indicator:** Another developer could understand your code without asking questions

### **Implementation Language Choice**
You must use **at least 2 different programming languages** to develop the prototype:
- **Front-end:** HTML/CSS + JavaScript (or TypeScript, or a framework like React/Vue/Angular)
- **Back-end:** Your choice (Node.js/JavaScript, Python, C#, Java, PHP, Go, Rust, etc.)
- **Rationale:** Both front-end and back-end logic contribute to the solution; using one language for both (e.g., Node.js everywhere) is acceptable but demonstrate diversity in approach where feasible

### **Testing Approach**
- **Functional Testing:** Verify each feature works as designed from a user perspective
- **Security Testing:** Confirm passwords are hashed, unauthorised access is blocked, and data is not exposed
- **Accessibility Testing:** Use keyboard navigation, browser zoom, and a screen reader (e.g., NVDA, JAWS trial) to verify usability
- **Performance Testing (optional):** Document response times and note any bottlenecks observed
- **Testing Tools:** Built-in browser tools (DevTools), automated testing frameworks (Jest, Pytest), accessibility checkers (axe, WAVE), or manual walkthroughs are all acceptable

### **Iterative Development**
The prototype should show evidence of **multiple rounds of testing and refinement**:
1. **Initial implementation:** Code a feature
2. **Test:** Run test cases and identify issues
3. **Refine:** Fix bugs, improve code, or enhance UX based on findings
4. **Re-test:** Verify the fix works and hasn't broken anything else
5. **Document:** Log what was tested, what failed, and what changed

Aim for at least **3 iterations** covering different features or aspects of the system.

### **GDPR & Data Protection**
- Store passwords using a secure hashing algorithm (bcrypt, Argon2, PBKDF2) — never plaintext
- User location data should be treated as sensitive; document retention policies
- Implement a simple "right to erasure" mechanism (e.g., button to delete account and all associated data)
- Avoid storing unnecessary personal data; only collect what is needed for functionality
- If using third-party services or libraries, verify their privacy policies

### **Accessibility (WCAG 2.1 AA)**
Your prototype must be usable by people with disabilities:
- **Visual:** High contrast, readable fonts, alt text for images, text scaling support
- **Motor:** Keyboard-only navigation, large touch targets (if mobile), no time-dependent interactions
- **Cognitive:** Clear language, logical structure, consistent navigation
- **Auditory:** Captions for audio (if any), transcripts, visual indicators for alerts

Test with:
- Keyboard only (no mouse)
- Browser zoom at 200%
- High contrast mode (browser or OS setting)
- A free screen reader (NVDA for Windows, VoiceOver for Mac)
- An accessibility checker (axe, WAVE, Lighthouse in Chrome DevTools)

### **Scope Realism**
- Focus on **core features** from your Task 1 that demonstrate the most value
- **Simplify where needed:** Use simulated data instead of real-time APIs; mock third-party services; use a local database instead of cloud infrastructure
- **Do not attempt:** Complex machine learning, real-time multiplayer systems, advanced AR/VR, or highly optimised infrastructure
- **Do prioritise:** Clean code, complete feature implementation, thorough testing, and clear documentation

### **Documentation Style**
- Write for a technical reader (not your teacher) who will maintain or extend the code
- Include diagrams where helpful (architecture diagrams, flowcharts for algorithms, database schema diagrams)
- Use clear section headings and bullet points for readability
- Avoid jargon where simple language works; define terms if used

---

## **SUBMISSION FORMAT & NAMING**

### **Folder Structure**
```
London_Zoo_Task2_Submission/
├── README.md                           # Setup and run instructions
├── DevelopmentNotes.md                 # Architecture, decisions, algorithms, security, accessibility
├── TestLog.md (or .xlsx)               # All test cases and results
├── IterationLog.md (or embedded)       # Evidence of iterative refinement
├── AssetLog.md (or .xlsx)              # Third-party libraries and assets
├── /src or /code                       # All source code files
│   ├── /frontend                       # Front-end code (HTML, CSS, JS, etc.)
│   ├── /backend                        # Back-end code (server, API, business logic)
│   └── /data                           # Database schema, sample data, or data structure docs
├── /tests                              # Test files, test data, or testing documentation
├── /docs                               # Any additional diagrams or reference docs
└── database.sqlite (or equivalent)     # Database file (if applicable) or instructions to set it up
```

### **File Naming Convention**
- All files: Use descriptive names with hyphens or underscores (not spaces)
  - Good: `user-authentication.js`, `queue_algorithm.py`, `test_log.md`
  - Avoid: `My Code.js`, `stuff.py`, `final final FINAL.md`

### **Compressed Submission**
- Create a single `.zip` file named: `London_Zoo_Task2_Submission.zip`
- Unzipping should immediately show the folder structure above
- Test the ZIP by extracting it on another machine before submitting

### **Evidence of Version Control (Optional but Recommended)**
- If using Git:
  - Include a `.git` folder (or provide a link to a repository)
  - Commit messages should be clear and descriptive (e.g., "Implement queue algorithm and tests", not "wip" or "stuff")
  - Minimum 15–20 commits over the development period (shows iterative work)

---

## **ASSESSMENT CRITERIA**

Your submission will be evaluated on:

| Criterion | Marks | What We're Looking For |
|---|---|---|
| **Feature Implementation** | 12 | All core features from Task 1 are coded and functional; features work as designed |
| **Code Quality & Structure** | 8 | Code is readable, maintainable, and follows good practices; clear separation of concerns |
| **Back-end & Algorithms** | 8 | Business logic is correct; queue time estimation, alerts, and data processing work properly |
| **Front-end & UX** | 6 | UI is intuitive, responsive, and accessible; users can complete tasks without confusion |
| **Testing & Evidence** | 6 | Comprehensive test log shows functional, security, and accessibility testing; tests are realistic and thorough |
| **Security & Data Protection** | 4 | Passwords are hashed; user data is protected; GDPR compliance measures evident |
| **Accessibility** | 2 | UI meets WCAG AA standards; keyboard navigation works; screen reader compatible |
| **Documentation** | 2 | Development notes clearly explain architecture, algorithms, and decisions; setup instructions are clear |
| **Iterative Refinement** | 2 | Evidence of testing → bug fixing → re-testing cycle; improvements documented |

**Total: 48 marks** (equivalent to 40% of the overall T Level grade)

---

## **WHAT "GOOD" LOOKS LIKE**

### **Excellent Submission (40–48 marks)**
- All features implemented, tested, and working reliably
- Code is professional quality: well-structured, documented, and maintainable
- Algorithms are correct and handle edge cases gracefully
- UI is intuitive, responsive, and fully accessible
- Test log shows 25+ diverse test cases with detailed results and evidence of iteration
- Security measures properly implemented (password hashing, GDPR compliance)
- Documentation is thorough and clearly explains decisions and trade-offs
- Evidence of multiple development cycles with refinements based on testing
- Prototype is ready to demonstrate to non-technical stakeholders

### **Competent Submission (32–39 marks)**
- Most features implemented and working; 1–2 minor features incomplete or with small bugs
- Code is clear and generally well-structured; some opportunities for improvement
- Algorithms work for common cases; edge cases may have minor issues
- UI is functional and accessible; some usability improvements possible
- Test log shows 15–24 test cases; some evidence of iteration and refinement
- Security measures mostly in place; minor gaps noted
- Documentation covers main points; some areas could be more detailed
- Prototype demonstrates the system concept effectively

### **Developing Submission (24–31 marks)**
- Several features implemented; some incomplete or buggy
- Code is understandable but has some quality issues (duplication, unclear structure)
- Algorithms work but may have limitations in edge cases
- UI is functional but has usability or accessibility gaps
- Test log shows 10–14 test cases; limited evidence of iteration
- Security measures partially implemented; some gaps in GDPR compliance
- Documentation covers basics; limited technical depth
- Prototype demonstrates some core features but with noticeable limitations

### **Early Development Submission (0–23 marks)**
- Few features implemented or working reliably
- Code has significant quality issues; hard to follow
- Algorithms incomplete or non-functional
- UI is difficult to use or not accessible
- Test log minimal or missing; little evidence of testing or iteration
- Security measures largely absent
- Documentation minimal or unclear
- Prototype does not adequately demonstrate the system

---

## **SUBMISSION CHECKLIST**

Before submitting, verify:

- [ ] Prototype runs successfully with provided setup instructions
- [ ] All core features from Task 1 are implemented and working
- [ ] Code is clean, commented, and well-structured
- [ ] Test log includes 20+ test cases covering features, security, and accessibility
- [ ] Security measures implemented: password hashing, GDPR compliance, access control
- [ ] UI is responsive and passes WCAG AA accessibility tests
- [ ] Development notes document architecture, algorithms, decisions, and trade-offs
- [ ] Iteration log or commit history shows 3+ cycles of testing and refinement
- [ ] Asset log includes all third-party libraries and assets with licences
- [ ] README provides clear setup and run instructions
- [ ] Submission folder structure is organised and logical
- [ ] ZIP file is created and tested (unzips successfully)
- [ ] All file names follow naming convention (no spaces, descriptive)
- [ ] Version control history (if applicable) shows meaningful commits

---

## **KEY DIFFERENCES FROM PRODUCTION SYSTEMS**

This is a **prototype for demonstration**, not a production system:

| Aspect | Prototype | Production |
|---|---|---|
| **Scale** | Handles demonstration scenarios | Supports 1000s of concurrent users |
| **Data** | Simulated or small sample dataset | Real, continuously growing data |
| **Infrastructure** | Local machine or simple hosting | Cloud infrastructure, load balancing, redundancy |
| **Performance** | Fast enough for demo (~few seconds per action) | Sub-second response times, optimised queries |
| **Monitoring** | Basic logging and error handling | Advanced monitoring, alerting, analytics |
| **Deployment** | Manual setup; single machine | Automated CI/CD, rolling updates, rollback procedures |

Your focus is on **demonstrating the concept and core logic**, not building a scalable production system.

---

## **SUPPORT & CLARIFICATION**

If you need clarification on any aspect of this brief:
- Refer back to your Task 1 design document for the definitive list of requirements
- Consult the WCAG 2.1 guidelines for accessibility best practices
- Use the Pearson assessment criteria framework for expectations on code quality and documentation
- Seek guidance from your tutor if requirements conflict or seem ambiguous

---

## **FINAL NOTES**

This task tests your ability to **translate design into working code**, with an emphasis on:
- **Practical problem-solving:** Implementing algorithms and handling real-world scenarios
- **Quality and maintainability:** Writing code that others can understand and build on
- **Testing and validation:** Ensuring the system works as designed and is secure
- **Accessibility:** Building systems usable by people with different abilities
- **Professional communication:** Documenting decisions and justifying trade-offs

The prototype is your evidence of these competencies. Focus on **depth over breadth**: a few well-implemented, well-tested features are better than many half-finished features.

Good luck with your development!

---

**Assessment Duration:** 30 hours (approximately 2–3 weeks)  
**Assessment Weight:** 48 marks (40% of overall T Level grade)  
**Submission Deadline:** [To be set by your school]

