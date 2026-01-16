# Test Log Example - Distinction Quality

## How to Structure Your Test Log

---

## Test Log Entry Format

| Field | Description |
|-------|-------------|
| Test ID | Unique identifier (e.g., T001) |
| Test Description | What you're testing |
| Test Data | The actual values you input |
| Data Type | Normal / Erroneous / Extreme |
| Expected Result | What SHOULD happen |
| Actual Result | What DID happen |
| Status | PASS / FAIL |
| Issue | Description of problem (if FAIL) |
| Fix Applied | How you resolved it |
| Retest Result | Result after fix |

---

## Example Test Log Entries

### INPUT TESTING

| Test ID | T001 |
|---------|------|
| **Description** | Test login with valid credentials |
| **Test Data** | username: "john.smith@email.com", password: "SecurePass123!" |
| **Data Type** | Normal |
| **Expected** | User redirected to dashboard, session created |
| **Actual** | User redirected to dashboard, session created |
| **Status** | ✅ PASS |

---

| Test ID | T002 |
|---------|------|
| **Description** | Test login with invalid password |
| **Test Data** | username: "john.smith@email.com", password: "wrongpassword" |
| **Data Type** | Erroneous |
| **Expected** | Error message: "Invalid credentials", remain on login page |
| **Actual** | Error message: "Invalid credentials", remain on login page |
| **Status** | ✅ PASS |

---

| Test ID | T003 |
|---------|------|
| **Description** | Test login with empty password field |
| **Test Data** | username: "john.smith@email.com", password: "" |
| **Data Type** | Erroneous |
| **Expected** | Error message: "Password required" |
| **Actual** | Form submitted, 500 server error displayed |
| **Status** | ❌ FAIL |
| **Issue** | No client-side validation for empty password field |
| **Fix Applied** | Added JavaScript validation: `if(password.length === 0) { showError("Password required"); return false; }` |
| **Retest** | ✅ PASS - Error message now displays correctly |

---

| Test ID | T004 |
|---------|------|
| **Description** | Test login with maximum length password (255 characters) |
| **Test Data** | username: "test@email.com", password: [255 character string] |
| **Data Type** | Extreme/Boundary |
| **Expected** | Password accepted if valid, or appropriate error if invalid |
| **Actual** | Password accepted and hashed correctly |
| **Status** | ✅ PASS |

---

### CALCULATION TESTING

| Test ID | T010 |
|---------|------|
| **Description** | Calculate order total with multiple items |
| **Test Data** | Item1: £29.99 x 2, Item2: £15.50 x 1, VAT: 20% |
| **Data Type** | Normal |
| **Expected** | Subtotal: £75.48, VAT: £15.10, Total: £90.58 |
| **Actual** | Subtotal: £75.48, VAT: £15.10, Total: £90.58 |
| **Status** | ✅ PASS |

---

| Test ID | T011 |
|---------|------|
| **Description** | Calculate total with zero quantity |
| **Test Data** | Item1: £29.99 x 0 |
| **Data Type** | Extreme/Boundary |
| **Expected** | Total: £0.00 or item removed from basket |
| **Actual** | NaN error displayed |
| **Status** | ❌ FAIL |
| **Issue** | calculateTotal() doesn't handle zero quantity |
| **Fix Applied** | Added check: `if(quantity <= 0) { removeItem(itemId); return; }` |
| **Retest** | ✅ PASS - Item removed when quantity set to 0 |

---

| Test ID | T012 |
|---------|------|
| **Description** | Calculate total with negative price (erroneous data) |
| **Test Data** | Item1: £-10.00 x 1 |
| **Data Type** | Erroneous |
| **Expected** | Error: "Invalid price value" |
| **Actual** | Negative value accepted, total reduced incorrectly |
| **Status** | ❌ FAIL |
| **Issue** | No validation for negative prices in database/input |
| **Fix Applied** | Added server-side validation: `if(price < 0) throw new Error("Invalid price")` |
| **Retest** | ✅ PASS - Error thrown for negative prices |

---

### VALIDATION TESTING

| Test ID | T020 |
|---------|------|
| **Description** | Validate email format |
| **Test Data** | email: "notanemail" |
| **Data Type** | Erroneous |
| **Expected** | Error: "Please enter a valid email address" |
| **Actual** | Error: "Please enter a valid email address" |
| **Status** | ✅ PASS |

---

| Test ID | T021 |
|---------|------|
| **Description** | Validate email with special characters |
| **Test Data** | email: "user+tag@sub.domain.co.uk" |
| **Data Type** | Extreme |
| **Expected** | Email accepted (valid format) |
| **Actual** | Error: "Invalid email" |
| **Status** | ❌ FAIL |
| **Issue** | Regex pattern too restrictive, doesn't allow + or subdomains |
| **Fix Applied** | Updated regex: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` |
| **Retest** | ✅ PASS - Complex email formats now accepted |

---

### PROCESS TESTING

| Test ID | T030 |
|---------|------|
| **Description** | Complete checkout process |
| **Test Data** | Valid user, 2 items in basket, valid payment details |
| **Data Type** | Normal |
| **Expected** | Order created, confirmation email sent, stock reduced |
| **Actual** | Order created, confirmation email sent, stock reduced |
| **Status** | ✅ PASS |

---

| Test ID | T031 |
|---------|------|
| **Description** | Checkout with out-of-stock item |
| **Test Data** | Item with 0 stock in basket |
| **Data Type** | Erroneous |
| **Expected** | Error message, user returned to basket to update |
| **Actual** | Order processed with negative stock |
| **Status** | ❌ FAIL |
| **Issue** | Stock check occurs before basket, not at checkout |
| **Fix Applied** | Added stock validation in checkout process before payment |
| **Retest** | ✅ PASS - User notified of stock issue before payment |

---

## Summary Statistics

| Category | Total Tests | Passed | Failed | Fixed |
|----------|-------------|--------|--------|-------|
| Input Testing | 4 | 3 | 1 | 1 |
| Calculation Testing | 3 | 1 | 2 | 2 |
| Validation Testing | 2 | 1 | 1 | 1 |
| Process Testing | 2 | 1 | 1 | 1 |
| **TOTAL** | **11** | **6** | **5** | **5** |

**All identified issues were fixed and retested successfully.**

---

## Key Points for Distinction:

1. ✅ Includes **Normal, Erroneous, AND Extreme** test data
2. ✅ Tests **Inputs, Calculations, Validation, AND Processes**
3. ✅ Shows **iterative development** (fail → fix → retest)
4. ✅ Specific test data values given
5. ✅ Clear expected vs actual results
6. ✅ Detailed description of issues found
7. ✅ Code-level fixes documented
8. ✅ All failures have corresponding fixes and retests
