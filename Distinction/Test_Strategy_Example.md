# Test Strategy Example - Distinction Quality

## Important: Strategy vs Plan

> "The section is not a test plan... lower-marked students tended to create test plans without any consideration of the strategy"

**Test Strategy** = WHAT types of testing, WHEN, and WHY
**Test Plan** = Specific test cases (comes later in Task 2)

---

## Example Test Strategy

### Project: Health Information System for Rolsa Technologies

---

## 1. Testing Objectives

The testing strategy aims to ensure the health information system:
- Meets all functional requirements specified in the client brief
- Provides a reliable, secure, and user-friendly experience
- Complies with data protection regulations (GDPR, Data Protection Act 2018)
- Performs consistently across different browsers and devices

---

## 2. Testing Levels & Timing

### Development Phase Testing

| Testing Type | When Used | Purpose | Justification |
|--------------|-----------|---------|---------------|
| **Unit Testing** | During coding of each function/module | Test individual components in isolation | Identifies bugs early when they're cheapest to fix. Ensures each building block works before integration. |
| **Integration Testing** | After completing related modules | Test components work together correctly | Verifies data flows correctly between frontend and backend. Catches interface mismatches early. |

### Post-Development Testing

| Testing Type | When Used | Purpose | Justification |
|--------------|-----------|---------|---------------|
| **System Testing** | After all components integrated | Test complete system end-to-end | Validates all functional requirements are met. Tests real user workflows. |
| **User Acceptance Testing (UAT)** | Before final deployment | Confirm system meets user needs | Gathers feedback from actual target users. Ensures usability from non-technical perspective. |

---

## 3. Testing Approaches

### 3.1 White-Box Testing

**What it is:** Testing with knowledge of internal code structure

**When I will use it:**
- During unit testing of Python/PHP functions
- When testing database queries
- For validating calculation logic

**Justification:** 
As the developer, I have access to the source code and can test specific code paths. This is essential for ensuring all branches of conditional statements are tested and edge cases are covered.

**Examples of what I'll test:**
- All paths through login validation function
- Error handling for database connection failures
- Boundary conditions in age calculation

---

### 3.2 Black-Box Testing

**What it is:** Testing without knowledge of internal code (input → output focus)

**When I will use it:**
- During system testing
- During UAT with non-technical testers
- For testing user interface functionality

**Justification:**
Black-box testing simulates how real users will interact with the system. Users don't know (or care) about internal code - they just want features to work. This approach tests the system from their perspective.

**Examples of what I'll test:**
- Login form accepts valid credentials
- Registration rejects invalid email formats
- Search returns relevant results

---

## 4. Test Data Strategy

### 4.1 Types of Test Data

| Data Type | Purpose | Example |
|-----------|---------|---------|
| **Normal Data** | Verify system works under typical conditions | Valid email: user@domain.com |
| **Erroneous Data** | Verify system handles invalid input gracefully | Invalid email: notanemail |
| **Extreme/Boundary Data** | Verify system handles edge cases | Empty field, maximum length input, special characters |

**Justification:** Using all three types ensures comprehensive coverage. Normal data confirms basic functionality, erroneous data tests error handling, and extreme data reveals edge-case bugs that could cause system failures.

### 4.2 Test Data Considerations

- **Personal Data:** Will use fictional test data, not real personal data (GDPR compliance)
- **Database:** Separate test database to avoid affecting production data
- **Reproducibility:** All test data documented for repeatable testing

---

## 5. Testing Categories

### 5.1 Functional Testing

Tests that the system performs required functions correctly.

| Area | What Will Be Tested |
|------|---------------------|
| **User Authentication** | Login, logout, password reset, session management |
| **Data Entry** | Form validation, data storage, error messages |
| **Calculations** | Health metrics, BMI calculations, goal tracking |
| **Navigation** | Links work, pages load, routing correct |
| **CRUD Operations** | Create, Read, Update, Delete user data |

---

### 5.2 Non-Functional Testing

Tests system quality attributes beyond features.

| Type | What Will Be Tested | Justification |
|------|---------------------|---------------|
| **Performance** | Page load times, response times | Client requirement: pages load within 3 seconds |
| **Usability** | Ease of use, intuitive navigation | Target users include non-technical individuals |
| **Security** | SQL injection, XSS, authentication bypass | GDPR requires appropriate security measures |
| **Accessibility** | Screen reader compatibility, keyboard navigation | Equality Act 2010 compliance |
| **Compatibility** | Chrome, Firefox, Safari, Edge, mobile browsers | Client requirement: cross-browser support |

---

## 6. Security Testing Approach

Given the sensitive nature of health data, security testing is critical.

| Security Test | Method | Justification |
|---------------|--------|---------------|
| **SQL Injection** | Attempt malicious SQL in input fields | Protects database from unauthorised access |
| **XSS (Cross-Site Scripting)** | Inject script tags in user inputs | Prevents malicious code execution |
| **Authentication Testing** | Test brute force protection, session handling | Ensures only authorised access |
| **Data Transmission** | Verify HTTPS encryption | Protects data in transit (GDPR requirement) |
| **Password Storage** | Confirm hashing, no plain text | Legal requirement under Data Protection Act |

---

## 7. Browser & Device Testing

| Browser | Versions | Priority |
|---------|----------|----------|
| Google Chrome | Latest, Latest-1 | High |
| Mozilla Firefox | Latest, Latest-1 | High |
| Microsoft Edge | Latest | Medium |
| Safari | Latest (Mac/iOS) | Medium |
| Mobile Chrome | Latest (Android) | High |
| Mobile Safari | Latest (iOS) | High |

**Justification:** Based on UK browser market share data, Chrome and Firefox cover approximately 70% of users. Mobile testing is essential as client research indicates 60% of target users access via smartphone.

---

## 8. Regression Testing

**What:** Re-running previous tests after changes to ensure nothing is broken

**When:** 
- After every bug fix
- After adding new features
- Before final submission

**Justification:** Changes to one part of the system can unexpectedly affect other parts. Regression testing ensures that fixes and new features don't introduce new problems.

---

## 9. Defect Management Process

When defects are found:

1. **Log** - Document in test log with description, steps to reproduce
2. **Classify** - Assign severity (Critical/High/Medium/Low)
3. **Fix** - Modify code to resolve issue
4. **Retest** - Verify fix works
5. **Regression** - Check fix hasn't broken other functionality

### Severity Classification

| Severity | Definition | Example |
|----------|------------|---------|
| **Critical** | System unusable, data loss | Database not saving user data |
| **High** | Major feature not working | Login always fails |
| **Medium** | Feature works but incorrectly | Calculation gives wrong result |
| **Low** | Cosmetic/minor issue | Alignment slightly off |

---

## 10. Testing Tools

| Tool | Purpose | Justification |
|------|---------|---------------|
| **Browser DevTools** | Debugging, network analysis | Built into all browsers, no installation needed |
| **W3C Validator** | HTML/CSS validation | Industry standard, ensures code compliance |
| **Manual Testing** | Functional verification | Essential for UX and business logic testing |
| **Python unittest** | Unit testing for Python code | Built into Python, no dependencies |

---

## 11. Test Documentation

All testing will be documented in:

1. **Test Strategy** (this document) - Overall approach
2. **Test Log** (Task 2) - Individual test cases, results, fixes
3. **Defect Log** - Issues found and resolution status

---

## 12. Success Criteria

Testing will be considered successful when:

- [ ] All critical and high-severity defects are resolved
- [ ] All functional requirements pass testing
- [ ] System performs within acceptable response times
- [ ] No security vulnerabilities identified
- [ ] W3C validation passes with no errors
- [ ] System works on all target browsers

---

## Summary

This testing strategy ensures systematic coverage of all aspects of the health information system. By applying both white-box and black-box approaches at appropriate stages, using comprehensive test data types, and maintaining thorough documentation, defects will be identified and resolved before deployment.

**Key Points:**
- Strategy first, specific tests later
- Multiple testing types at different stages
- Normal, erroneous AND extreme test data
- Security testing is essential for health data
- Document everything for evidence

---

*This is a TEST STRATEGY, not a test plan. Specific test cases will be documented in the Test Log during Task 2.*
