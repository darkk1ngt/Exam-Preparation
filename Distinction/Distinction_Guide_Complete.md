# T-Level Digital Production, Design & Development
## Complete Distinction Guide

---

# OVERVIEW

This guide is based on analysis of examiner reports (2022-2024) and task papers (2022-2025) for the T-Level Digital Occupational Specialism assessment.

## Assessment Structure

| Task | Focus | Time | Marks |
|------|-------|------|-------|
| **Task 1** | Proposal & Design Documentation | 20 supervised hours (3-week window) | 58 marks |
| **Task 2** | Development & Testing | 30 supervised hours | 48 marks |
| **Task 3A** | Feedback & Optimisation | 3-week window | ~20 marks |
| **Task 3B** | Evaluation | 2 hours supervised | ~19 marks |

**Total: 145 marks**

---

# TASK 1: PROPOSAL & DESIGN DOCUMENTATION
## (58 Marks | 20 Supervised Hours)

### What You Must Produce:
1. A detailed **proposal** for a digital solution (saved as PDF)
2. A set of **design documents** (saved as PDF)

---

## SECTION 1A: PROPOSAL

### Required Elements:

#### 1. Problem Decomposition
**What examiners want:**
> "The learner needs to consider the solution and provide a proposal illustrating the solution to the clients and users"

**DISTINCTION APPROACH:**
- ✅ Break the problem into smaller subsystems using a **visual diagram**
- ✅ Use **stepwise refinement** or other accepted notations
- ✅ Select ONE subsystem and break it down further
- ✅ Show how each sub-problem meets client AND user needs

**WEAK APPROACH:**
- ❌ Describing what functional requirements are instead of applying them
- ❌ Defining legislation instead of applying it to the scenario
- ❌ Superficial coverage without depth

---

#### 2. Functional & Non-Functional Requirements

**DISTINCTION APPROACH:**
- ✅ List requirements that are **relevant to the specific scenario**
- ✅ Add **justification for EACH requirement** - explain WHY it's needed
- ✅ Consider both client needs AND user needs
- ✅ Link requirements to the problem being solved

**Example Structure:**
```
FUNCTIONAL REQUIREMENT: User login system
JUSTIFICATION: The client specified that customer data must be protected. 
A login system ensures only authorised users can access personal 
information, meeting GDPR requirements for data protection.
```

**WEAK APPROACH:**
- ❌ Generic requirements not linked to scenario
- ❌ No justification provided
- ❌ Explaining what requirements ARE rather than what they SHOULD BE

---

#### 3. User Acceptance Criteria

**DISTINCTION APPROACH:**
- ✅ Provide **sensible, measurable criteria**
- ✅ Include **justification** for why each criterion matters
- ✅ Link criteria to user needs identified in research
- ✅ Make criteria testable

**Example:**
```
CRITERION: The website must load within 3 seconds on mobile devices
JUSTIFICATION: Research shows 53% of users abandon sites taking longer 
than 3 seconds. Given the target audience uses mobile devices primarily, 
fast loading is essential for user retention.
```

---

#### 4. Risk Identification

**DISTINCTION APPROACH:**
- ✅ Identify risks **associated with the development phase**
- ✅ Connect risks to **legal aspects** of the scenario
- ✅ Include **risk mitigation strategies**
- ✅ Show understanding of how risks interconnect

**Key Risks to Consider:**
- Data protection (GDPR compliance)
- Accessibility (Equality Act 2010)
- Copyright and intellectual property
- Security vulnerabilities
- Technical failures
- Timeline/resource constraints

---

#### 5. Legal & Regulatory Requirements

**DISTINCTION APPROACH:**
> "Weighed the implications of legal requirements on the organization... displayed adeptness in perceiving the larger context"

- ✅ Apply legislation to YOUR specific scenario
- ✅ Explain HOW you will comply, not WHAT the law is
- ✅ Consider implications for both client and users

**Key Legislation:**
- GDPR / Data Protection Act 2018
- Computer Misuse Act 1990
- Copyright, Designs and Patents Act 1988
- Equality Act 2010 (Accessibility)
- Consumer Rights Act 2015

---

## SECTION 1B: DESIGN DOCUMENTATION

### Required Elements:

#### 1. Data Dictionary

**DISTINCTION APPROACH:**
> "Meticulous structure encompassing each data element... precisely defined including attributes such as data types, size"

| Field Name | Data Type | Size | Validation | Purpose |
|------------|-----------|------|------------|---------|
| userID | INT | 11 | Primary Key, Auto-increment | Unique identifier for each user |
| email | VARCHAR | 255 | Must contain @ and domain | User contact and login |
| password | VARCHAR | 255 | Hashed, min 8 chars | Secure authentication |

**Include:**
- ✅ Every data element
- ✅ Data types and sizes
- ✅ Validation rules
- ✅ Constraints (Primary/Foreign keys)
- ✅ Purpose/description

---

#### 2. Visual Designs (Wireframes/Mockups)

**DISTINCTION APPROACH:**
> "Comprehensive and meticulously detailed, providing sufficient guidance for a third party to replicate the artefact from scratch completely"

**Must Include:**
- ✅ **Background colours** (hex codes)
- ✅ **Text sizes** (px or rem)
- ✅ **Font types**
- ✅ **Clear layouts** with visual hierarchy
- ✅ **Standard conventions** (navigation, footer, etc.)
- ✅ Multiple page specifications

**WEAK APPROACH:**
> "Poor visual designs with little consideration of typical conventions... How would the Web developer build the website?"

- ❌ Vague sketches without specifications
- ❌ Missing colours, fonts, sizes
- ❌ Ignoring web conventions

---

#### 3. Algorithm Designs (Pseudocode/Flowcharts)

**DISTINCTION APPROACH:**
> "Demonstrated ability to decompose the problem into smaller subsystems... well-structured pseudocode reflecting solid understanding"

**Requirements:**
- ✅ Maximum of **5 complex problems**
- ✅ Show key inputs, processes, and outputs
- ✅ Use **accepted conventions**
- ✅ Make it **efficient** and logical

**Example Structure:**
```
ALGORITHM: ValidateUserLogin

INPUT: username, password
PROCESS:
    1. Check if username exists in database
    2. IF username NOT found THEN
        RETURN "Invalid credentials"
    3. ENDIF
    4. Retrieve hashed password from database
    5. Hash input password
    6. IF hashes match THEN
        Create session token
        RETURN "Login successful"
    7. ELSE
        Increment failed attempts
        RETURN "Invalid credentials"
    8. ENDIF
OUTPUT: Authentication result, session token (if successful)
```

---

#### 4. Test Strategy

**DISTINCTION APPROACH:**
> "Explained the test strategy for the testing phase... consider which test is used at what stage of development"

**This is NOT a Test Plan!** The strategy outlines:
- ✅ **Types of testing** you will use (unit, integration, system, UAT)
- ✅ **When** each type will be used during development
- ✅ **Why** you chose these approaches
- ✅ **Whitebox and Blackbox** testing considerations

**WEAK APPROACH:**
> "Lower-marked students tended to create test plans without any consideration of the strategy"

- ❌ Jumping straight to test cases
- ❌ No consideration of testing stages
- ❌ Developing tests AFTER testing has begun

---

## Task 1 Checklist:

- [ ] Proposal clearly relates to the scenario
- [ ] Decomposition shows subsystems visually
- [ ] Requirements have justifications
- [ ] User acceptance criteria are measurable
- [ ] Risks linked to legal requirements
- [ ] Data dictionary is complete with all attributes
- [ ] Designs detailed enough for third-party replication
- [ ] Algorithms use accepted conventions
- [ ] Test strategy explains WHEN and WHY (not just what)

---

# TASK 2: DEVELOPMENT & TESTING
## (48 Marks | 30 Supervised Hours)

### What You Must Produce:
1. **Development documentation** (PDF)
2. **Content and assets log** (PDF)
3. **Test log** using template provided
4. **Source code** for prototype (original format, NOT PDF)

---

## SECTION 2A: CODING & DEVELOPMENT

### Language Requirements

**You MUST use at least TWO programming languages:**

Popular combinations from examiner reports:
- Python + SQL
- PHP + SQL
- JavaScript + SQL
- Python + PHP
- HTML/CSS + JavaScript + SQL (front-end + back-end)

---

### Code Quality Criteria

**DISTINCTION APPROACH:**
> "Demonstrated efficient functional code using two languages... well-organised code that includes naming conventions and comments"

#### 1. Efficiency
- ✅ Select the **most appropriate language** for each aspect
- ✅ Code is **optimised** and avoids redundancy
- ✅ Functions/modules are reusable

#### 2. Logic & Structure
> "Precise logic and programming structures... consistently correct outcomes"

- ✅ Code produces **correct results** under various conditions
- ✅ Clear logical flow
- ✅ Proper error handling

#### 3. Maintainability
> "Consistent use of appropriate naming conventions... logical organization"

- ✅ **Meaningful variable/function names** (e.g., `calculateTotal` not `x`)
- ✅ **Logical organisation** - easy for third party to navigate
- ✅ **Informative comments** explaining purpose and function

**Example of Good Commenting:**
```python
def validate_email(email):
    """
    Validates email format using regex pattern.
    
    Args:
        email (str): The email address to validate
        
    Returns:
        bool: True if valid format, False otherwise
        
    Ensures compliance with data quality requirements
    specified in the client brief.
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
```

**WEAK APPROACH:**
> "Code was linear in structure with lots of errors... tended not to add comments"

- ❌ No comments
- ❌ Poor variable names
- ❌ Disorganised structure
- ❌ Many errors

---

### Justifications

**DISTINCTION APPROACH:**
> "Justifications and depth are essential... justify the decisions by adding comments on the code"

For every significant decision, explain:
- **WHY** you chose this approach
- **HOW** it meets the requirements
- **WHY** you chose this language for this task

**In-Code Justification Example:**
```javascript
// Using localStorage for session management rather than cookies
// JUSTIFICATION: Provides 5MB storage vs 4KB for cookies,
// and is not sent with every HTTP request, improving performance.
// Meets client requirement for fast-loading pages.
```

---

### Standards & Guidelines

**DISTINCTION APPROACH:**
> "Demonstrate how the website would be viewed in different browsers... validate the code on the W3C website"

**Required Evidence:**
- ✅ **W3C Validation** - screenshot showing code passes validation
- ✅ **Cross-browser testing** - evidence of testing in multiple browsers
- ✅ **Accessibility** - WCAG compliance considerations

---

### Security Controls

**DISTINCTION APPROACH:**
> "Security controls we are looking for: username and password, cookie notification, two-way authentication"

**Include evidence of:**
- ✅ User authentication (login system)
- ✅ Password hashing (never store plain text!)
- ✅ Cookie consent/notification
- ✅ Two-factor authentication (if appropriate)
- ✅ Input validation (prevent SQL injection, XSS)
- ✅ HTTPS/secure connections

---

## SECTION 2B: TESTING

### Test Documentation Requirements

**Use the provided template** (Task2_Test_Log_Template)

**DISTINCTION APPROACH:**
> "Thorough and detailed understanding of effectively testing inputs, calculations, validations, and processes"

#### Test Data Types (ALL THREE REQUIRED):

| Type | Purpose | Example |
|------|---------|---------|
| **Normal** | System works under usual conditions | Valid email: user@domain.com |
| **Erroneous** | System handles invalid input gracefully | Invalid email: not-an-email |
| **Extreme/Boundary** | System handles edge cases | Empty field, max length input |

---

### Testing Areas to Cover:

1. **Inputs** - Does it accept valid data? Reject invalid?
2. **Calculations** - Are results accurate?
3. **Validation** - Does it check data integrity?
4. **Processes** - Does it follow intended operational flow?

---

### Iterative Development Evidence

**DISTINCTION APPROACH:**
> "Evidence of an effective iterative development process... incremental development cycle, testing each change"

**Show:**
- ✅ Testing after **each significant change**
- ✅ Bug identification
- ✅ How bugs were **fixed**
- ✅ Retesting to confirm fix

**Document Format:**
```
TEST ID: T001
DESCRIPTION: Validate login with correct credentials
TEST DATA: username="testuser", password="Valid123!"
EXPECTED: Redirect to dashboard
ACTUAL: Redirect to dashboard
RESULT: PASS

---

TEST ID: T002
DESCRIPTION: Validate login with incorrect password
TEST DATA: username="testuser", password="wrong"
EXPECTED: Error message "Invalid credentials"
ACTUAL: System crashed with 500 error
RESULT: FAIL

ISSUE: No error handling for invalid password
FIX: Added try-catch block and validation
RETEST: PASS (after fix)
```

---

### Common Weak Approaches:

> "Students relied heavily on the IDE to identify syntactic errors but their efforts often halted at this point"

- ❌ Only testing for syntax errors
- ❌ Not testing inputs and outputs
- ❌ Ignoring validation and verification
- ❌ No evidence of fixing issues

---

## SECTION 2C: Content & Assets Log

**Document ALL assets used:**
- Images
- Icons
- Fonts
- Libraries/frameworks
- Any third-party code

**For each asset, record:**
- Source URL
- License type
- Copyright status
- Justification for use

---

## Task 2 Checklist:

- [ ] Code uses at least TWO languages
- [ ] Meaningful variable/function names
- [ ] Comprehensive comments explaining purpose
- [ ] Justifications for key decisions
- [ ] W3C validation evidence
- [ ] Cross-browser testing evidence
- [ ] Security controls implemented
- [ ] Normal, erroneous, AND extreme test data
- [ ] Tests cover inputs, calculations, validation, processes
- [ ] Evidence of iterative development (fix → retest)
- [ ] All assets logged with sources and licenses

---

# TASK 3A: FEEDBACK & OPTIMISATION
## (~20 Marks | 3-Week Window)

### What You Must Produce:
1. Evidence of **feedback gathering** using at least 2 techniques
2. **Analysis** of feedback data
3. Evidence of **optimisation** based on feedback

---

## Feedback Gathering

**DISTINCTION APPROACH:**
> "Deployed various tools to collect high-quality feedback on different system elements... constructive feedback loop"

### Required: TWO Different Techniques

**Options:**
1. **Surveys/Questionnaires** - Written responses
2. **Observations** - Watching users interact
3. **Interviews** - Direct questioning
4. **Think-aloud protocols** - Users verbalise thoughts
5. **A/B Testing** - Comparing versions

---

### Feedback Targets

**You must gather feedback from BOTH:**
- ✅ **Technical testers** - Other developers, IT specialists
- ✅ **Non-technical testers** - End users, client representatives

---

### Question Quality

**DISTINCTION APPROACH:**
> "Questions should be appropriate so that data drawn from it can be used to benefit the artefact and the user"

**Good Questions:**
- ✅ Specific and actionable
- ✅ Focused on user experience
- ✅ Can inform improvements

**Example Good Questions:**
- "On a scale of 1-5, how easy was it to find the login button?"
- "What would make the checkout process faster for you?"
- "Did you encounter any errors? If so, describe what happened."

**Bad Questions:**
- ❌ "Did you like the website?" (too vague)
- ❌ Leading questions
- ❌ Yes/No questions with no follow-up

---

### Data Visualisation

**DISTINCTION APPROACH:**
> "Provide a detailed visualization of the data gathered and analysed"

**Include:**
- ✅ Charts/graphs showing results
- ✅ Analysis of patterns
- ✅ Key insights identified
- ✅ Action points derived from data

---

### Evidence-Based Improvements

**DISTINCTION APPROACH:**
> "Capability to integrate feedback and iterate on their work... evidence-informed enhancements"

**Document:**
1. What feedback you received
2. What you changed as a result
3. Why this change improves the solution
4. Evidence of the change (before/after)

---

## Task 3A Checklist:

- [ ] Two different feedback techniques used
- [ ] Both technical AND non-technical testers
- [ ] Questions are specific and actionable
- [ ] Data is visualised clearly
- [ ] Analysis identifies key insights
- [ ] Changes made based on feedback
- [ ] Evidence of improvements implemented

---

# TASK 3B: EVALUATION
## (~19 Marks | 2 Hours Supervised)

### What You Must Produce:
1. Evaluation of **assets and sources**
2. Evaluation of **prototype** against requirements
3. Review of **development process**

---

## Section 1: Asset Evaluation

### Source Validity

**DISTINCTION APPROACH:**
> "Rigorous approach... exhibited good understanding of how to discern credible information from less reliable sources"

**Evaluate:**
- ✅ Are sources **current** and up-to-date?
- ✅ Are they **reputable** and unbiased?
- ✅ Is information **accurate** and verifiable?

---

### Legal & Ethical Compliance

**DISTINCTION APPROACH:**
> "Considered legal and ethical implications... awareness of copyright laws, permissions, and ethical aspects"

**Demonstrate:**
- ✅ All assets comply with **copyright laws**
- ✅ Proper **attribution** where required
- ✅ **Licenses** have been followed
- ✅ Ethical use of third-party work

---

### Asset Appropriateness

**DISTINCTION APPROACH:**
> "Critically analyse the relevance and suitability of resources within the context of the task"

**For each asset:**
- ✅ Why was it chosen?
- ✅ How does it contribute to the solution?
- ✅ Is it appropriate for the target audience?
- ✅ Does it support user needs?

---

## Section 2: Prototype Evaluation

### Functional Requirements

**DISTINCTION APPROACH:**
> "Thorough and detailed evaluation considering how well it meets functional and non-functional requirements"

**Evaluate:**
- ✅ Does the prototype perform all required tasks?
- ✅ Which requirements are fully met?
- ✅ Which are partially met? Why?
- ✅ What would be needed for full compliance?

---

### Non-Functional Requirements

**Consider:**
- ✅ **Performance** - Is it fast enough?
- ✅ **Usability** - Is it easy to use?
- ✅ **Reliability** - Does it work consistently?
- ✅ **Security** - Is data protected?
- ✅ **Accessibility** - Can all users access it?

---

### Key Performance Indicators (KPIs)

**DISTINCTION APPROACH:**
> "Considering key performance indicators (KPIs) and user acceptance criteria"

**Evaluate against measurable targets:**
- Page load times
- Error rates
- Task completion rates
- User satisfaction scores

---

### User Acceptance Criteria

**Link back to Task 1:**
- ✅ Review each criterion from your proposal
- ✅ Evidence of whether each is met
- ✅ Honest assessment of gaps

---

## Section 3: User-Focused Evaluation

**CRITICAL REQUIREMENT:**
> "User needs should be at the forefront of design decisions and evaluations. The effectiveness of their work hinges on how well it caters to the end user's requirements"

**DISTINCTION APPROACH:**
- ✅ Evaluate from the **user's perspective**
- ✅ Consider **user experience** beyond just functionality
- ✅ Identify improvements that would benefit users

**WEAK APPROACH:**
> "Evaluations often needed to be reframed... typically at this level provide evaluative comments concerning the requirements"

- ❌ Only evaluating against requirements
- ❌ Not considering user experience
- ❌ Descriptive rather than evaluative

---

## Task 3B Checklist:

- [ ] Sources evaluated for validity and reliability
- [ ] Legal compliance of all assets confirmed
- [ ] Asset choices justified with reasoning
- [ ] All functional requirements evaluated
- [ ] Non-functional requirements assessed
- [ ] KPIs and user criteria reviewed
- [ ] Evaluation focused on USER needs
- [ ] Honest about limitations and gaps
- [ ] Suggestions for future improvements

---

# DISTINCTION FORMULA

## The 7 Key Principles:

### 1. JUSTIFY EVERYTHING
> "Each decision backed by comprehensive justifications"

Every decision should have a clear "WHY" that links to:
- Client requirements
- User needs
- Technical best practice
- Legal compliance

### 2. USER-CENTRIC APPROACH
> "Solutions were client-centric and user-oriented"

Always prioritise the end user's needs, not just the technical requirements.

### 3. DEPTH OVER BREADTH
> "Comprehensive and meticulously detailed"

Better to cover fewer things in depth than many things superficially.

### 4. THIRD-PARTY REPLICABILITY
> "Sufficient guidance for a third party to replicate the artefact completely"

Could someone else build your solution from your documentation alone?

### 5. ITERATIVE DEVELOPMENT
> "Effective iterative development process... testing each change"

Show continuous improvement, not just a final product.

### 6. LEGAL AWARENESS
> "Connected risks to legal aspects... ethical implications"

Demonstrate understanding of real-world compliance requirements.

### 7. EVIDENCE-BASED DECISIONS
> "Data-driven decision-making... evidence-informed enhancements"

Support your decisions with data, research, and feedback.

---

# COMMON MISTAKES TO AVOID

| Mistake | What To Do Instead |
|---------|---------------------|
| Describing WHAT instead of WHY | Add justification for every decision |
| Defining terms instead of applying them | Show how legislation applies to YOUR scenario |
| Generic requirements | Make all requirements scenario-specific |
| Poor visual designs | Include all specifications (colours, fonts, sizes) |
| No comments in code | Add meaningful comments explaining purpose |
| Only syntax testing | Test inputs, outputs, validation, processes |
| Test plans before strategy | Strategy first, then detailed test plans |
| Only technical evaluation | Focus on user needs and experience |
| Relying on IDE for testing | Manually test all functionality |
| Superficial feedback | Use multiple techniques, technical + non-technical testers |

---

# QUICK REFERENCE CHECKLISTS

## Before Submitting Task 1:
- [ ] Proposal relates to specific scenario
- [ ] All requirements have justifications
- [ ] Designs detailed enough for replication
- [ ] Test strategy (not test plan) complete
- [ ] Legal requirements applied, not just defined

## Before Submitting Task 2:
- [ ] Two languages used
- [ ] All code has meaningful comments
- [ ] W3C validation evidence
- [ ] Security controls implemented
- [ ] Normal, erroneous, AND extreme test data
- [ ] Evidence of iteration (bug → fix → retest)

## Before Submitting Task 3:
- [ ] Two feedback techniques used
- [ ] Technical AND non-technical testers
- [ ] Changes made based on feedback
- [ ] All assets evaluated for legal compliance
- [ ] Evaluation focused on USER experience
- [ ] Honest about what's missing

---

*Guide compiled from Pearson T-Level Digital Examiner Reports (2022-2024) and Task Papers (2022-2025)*

*Remember: Distinction = Justification + Detail + User-Focus + Iteration + Legal Awareness*
