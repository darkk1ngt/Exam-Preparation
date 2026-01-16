# Code Examples with Distinction-Level Comments

## How to Comment Your Code

Examiners want to see **meaningful comments** that explain:
- **WHY** you made decisions
- **WHAT** the code does
- **HOW** it meets requirements

---

## Python Examples

### Example 1: User Authentication

```python
"""
User Authentication Module
==========================
Handles user login and session management for the health information system.

JUSTIFICATION: Python chosen for backend logic due to:
- Strong library support (bcrypt for password hashing)
- Clear syntax for maintainability
- Integration with SQL databases

Meets Requirements:
- FR-001: User authentication
- NFR-002: Password security
- LEGAL: GDPR Article 32 - Security of processing
"""

import bcrypt
import re
from datetime import datetime, timedelta

# Constants for security configuration
# JUSTIFICATION: Session timeout of 30 mins balances security with usability
# Based on OWASP recommendations for sensitive applications
SESSION_TIMEOUT_MINUTES = 30
MAX_LOGIN_ATTEMPTS = 5  # Prevents brute force attacks


def validate_email(email):
    """
    Validates email format using regex pattern.
    
    Args:
        email (str): The email address to validate
        
    Returns:
        bool: True if valid email format, False otherwise
    
    JUSTIFICATION: Client-side AND server-side validation ensures
    data integrity even if JavaScript is disabled. Meets requirement
    for robust input validation (FR-012).
    
    Pattern allows:
    - Standard emails: user@domain.com
    - Subdomains: user@sub.domain.co.uk  
    - Plus addressing: user+tag@domain.com
    """
    # Regex pattern for comprehensive email validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def hash_password(plain_password):
    """
    Securely hashes password using bcrypt algorithm.
    
    Args:
        plain_password (str): The user's plain text password
        
    Returns:
        str: Bcrypt hash of the password
    
    SECURITY JUSTIFICATION:
    - bcrypt chosen over MD5/SHA because it's designed for passwords
    - Includes salt automatically (prevents rainbow table attacks)
    - Cost factor of 12 provides good security/performance balance
    - Meets GDPR requirement for appropriate security measures
    
    NEVER store plain text passwords - this is a legal requirement
    under Data Protection Act 2018.
    """
    # Generate salt and hash - cost factor 12 = 2^12 iterations
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password, hashed_password):
    """
    Verifies a password against its stored hash.
    
    JUSTIFICATION: Using bcrypt's built-in comparison prevents
    timing attacks that could leak password information.
    """
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


def authenticate_user(email, password, db_connection):
    """
    Authenticates user credentials against database.
    
    Args:
        email (str): User's email address
        password (str): User's password attempt
        db_connection: Active database connection
        
    Returns:
        dict: User data if successful, None if failed
        
    SECURITY FEATURES:
    1. Rate limiting via failed_attempts counter (prevents brute force)
    2. Account lockout after 5 failed attempts
    3. Generic error message (doesn't reveal if email exists)
    4. Timing-safe password comparison
    
    Meets requirements: FR-001, NFR-002, NFR-007
    """
    # Validate input before database query
    if not validate_email(email):
        # Log invalid attempt for security monitoring
        log_security_event("INVALID_EMAIL_FORMAT", email)
        return None
    
    # Parameterised query prevents SQL injection attacks
    # JUSTIFICATION: Using ? placeholders instead of string formatting
    # is essential for security (OWASP Top 10 - Injection)
    cursor = db_connection.cursor()
    query = """
        SELECT user_id, email, password_hash, failed_attempts, is_locked
        FROM users 
        WHERE email = ?
    """
    cursor.execute(query, (email,))
    user = cursor.fetchone()
    
    # Check if user exists
    if not user:
        # SECURITY: Don't reveal that email doesn't exist
        # Use same response time to prevent timing attacks
        hash_password("dummy_password")  # Constant time operation
        return None
    
    # Check if account is locked
    if user['is_locked']:
        log_security_event("LOCKED_ACCOUNT_ACCESS", email)
        return None
    
    # Verify password
    if verify_password(password, user['password_hash']):
        # Successful login - reset failed attempts
        reset_failed_attempts(user['user_id'], db_connection)
        log_security_event("LOGIN_SUCCESS", email)
        return {
            'user_id': user['user_id'],
            'email': user['email']
        }
    else:
        # Failed login - increment counter
        increment_failed_attempts(user['user_id'], db_connection)
        log_security_event("LOGIN_FAILED", email)
        return None
```

---

### Example 2: Data Validation

```python
"""
Data Validation Module
======================
Validates all user inputs before processing.

JUSTIFICATION: Centralised validation ensures consistency across
the application and reduces code duplication (DRY principle).
"""

def validate_registration_data(data):
    """
    Validates all fields for user registration.
    
    Args:
        data (dict): Registration form data
        
    Returns:
        tuple: (is_valid: bool, errors: list)
    
    VALIDATION APPROACH:
    - Server-side validation is essential (client-side can be bypassed)
    - All errors collected before returning (better UX than one at a time)
    - Specific error messages help users correct mistakes
    
    Meets FR-003: User registration with validation
    """
    errors = []
    
    # Email validation
    if 'email' not in data or not data['email']:
        errors.append("Email is required")
    elif not validate_email(data['email']):
        errors.append("Please enter a valid email address")
    
    # Password validation
    # JUSTIFICATION: Password requirements based on NCSC guidance
    # Minimum 8 chars with complexity provides reasonable security
    if 'password' not in data or not data['password']:
        errors.append("Password is required")
    elif len(data['password']) < 8:
        errors.append("Password must be at least 8 characters")
    elif not re.search(r'[A-Z]', data['password']):
        errors.append("Password must contain at least one uppercase letter")
    elif not re.search(r'[a-z]', data['password']):
        errors.append("Password must contain at least one lowercase letter")
    elif not re.search(r'[0-9]', data['password']):
        errors.append("Password must contain at least one number")
    
    # Name validation
    # JUSTIFICATION: Names between 2-50 chars covers most real names
    # while preventing single-char or excessively long inputs
    if 'first_name' not in data or len(data['first_name']) < 2:
        errors.append("First name must be at least 2 characters")
    
    if 'last_name' not in data or len(data['last_name']) < 2:
        errors.append("Last name must be at least 2 characters")
    
    # Age validation for GDPR compliance
    # JUSTIFICATION: Users must be 13+ to create account (Children's code)
    if 'date_of_birth' in data:
        age = calculate_age(data['date_of_birth'])
        if age < 13:
            errors.append("You must be at least 13 years old to register")
    
    return (len(errors) == 0, errors)
```

---

## JavaScript Examples

### Example 3: Front-End Validation

```javascript
/**
 * Form Validation Module
 * ======================
 * Client-side validation for improved user experience.
 * 
 * JUSTIFICATION: JavaScript chosen for front-end because:
 * - Runs in browser without server round-trip
 * - Provides instant feedback to users
 * - Reduces server load
 * 
 * NOTE: Server-side validation still required (this can be bypassed)
 * 
 * Meets: NFR-004 (Usability), FR-012 (Input validation)
 */

/**
 * Validates login form before submission
 * 
 * @param {HTMLFormElement} form - The login form element
 * @returns {boolean} - True if valid, false otherwise
 * 
 * JUSTIFICATION: Preventing form submission with invalid data
 * improves user experience and reduces unnecessary server requests.
 */
function validateLoginForm(form) {
    // Clear previous error messages
    clearErrors();
    
    let isValid = true;
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    
    // Email validation
    // Using same regex as server-side for consistency
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
        showError('email', 'Email is required');
        isValid = false;
    } else if (!emailPattern.test(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Password validation
    // JUSTIFICATION: Only checking presence on login (not complexity)
    // because we don't want to reveal password requirements to attackers
    if (!password) {
        showError('password', 'Password is required');
        isValid = false;
    }
    
    return isValid;
}


/**
 * Displays error message next to form field
 * 
 * @param {string} fieldId - ID of the input field
 * @param {string} message - Error message to display
 * 
 * ACCESSIBILITY: Error messages are associated with fields using
 * aria-describedby for screen reader users (Equality Act 2010 compliance)
 */
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    
    // Styling for visibility
    errorDiv.className = 'error-message';
    errorDiv.id = `${fieldId}-error`;
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert'); // Announces to screen readers
    
    // Associate error with field for accessibility
    field.setAttribute('aria-describedby', errorDiv.id);
    field.classList.add('error-field');
    
    // Insert error after the field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}


/**
 * Clears all error messages from the form
 * 
 * Called before validation to reset state
 */
function clearErrors() {
    // Remove all error message elements
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Remove error styling from fields
    document.querySelectorAll('.error-field').forEach(el => {
        el.classList.remove('error-field');
        el.removeAttribute('aria-describedby');
    });
}
```

---

## SQL Examples

### Example 4: Database Queries

```sql
/*
 * Database Queries for User Management
 * =====================================
 * 
 * JUSTIFICATION: SQL used for database operations because:
 * - Industry standard for relational databases
 * - Efficient for complex queries with JOINs
 * - Supports transactions for data integrity
 * 
 * SECURITY: All queries use parameterised statements when 
 * called from application code to prevent SQL injection.
 */

-- Create users table with appropriate constraints
-- JUSTIFICATION: Constraints enforce data integrity at database level
-- This provides a second layer of validation beyond application code
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,  -- UNIQUE prevents duplicate accounts
    password_hash VARCHAR(255) NOT NULL,  -- Storing hash, NEVER plain text
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Audit trail
    is_active BOOLEAN DEFAULT TRUE,  -- Soft delete capability
    
    -- Index on email for faster login queries
    -- JUSTIFICATION: Email is used for every login, index improves performance
    INDEX idx_email (email)
);


-- Query to get user for authentication
-- JUSTIFICATION: Only selecting required fields (not SELECT *)
-- reduces data transfer and follows principle of least privilege
SELECT 
    user_id,
    email,
    password_hash,
    failed_attempts,
    is_locked
FROM users
WHERE email = ?  -- Parameterised to prevent SQL injection
    AND is_active = TRUE;  -- Don't authenticate deleted accounts


-- Query to get order history with product details
-- JUSTIFICATION: Using JOINs retrieves all needed data in one query
-- More efficient than multiple separate queries
SELECT 
    o.order_id,
    o.order_date,
    o.total_amount,
    o.status,
    oi.quantity,
    oi.unit_price,
    p.product_name,
    p.image_url
FROM orders o
INNER JOIN order_items oi ON o.order_id = oi.order_id
INNER JOIN products p ON oi.product_id = p.product_id
WHERE o.user_id = ?
ORDER BY o.order_date DESC
LIMIT 20;  -- Pagination for performance
```

---

## PHP Example

### Example 5: Session Management

```php
<?php
/**
 * Session Management Module
 * =========================
 * Handles user session creation and validation.
 * 
 * JUSTIFICATION: PHP used for server-side session management because:
 * - Built-in session handling functions
 * - Integrates well with MySQL database
 * - Wide hosting support
 * 
 * SECURITY MEASURES:
 * - Regenerate session ID on login (prevents session fixation)
 * - HTTP-only cookies (prevents XSS access to session)
 * - Secure flag for HTTPS-only transmission
 * 
 * Meets: NFR-007 (Security), GDPR Article 32
 */

/**
 * Initialises secure session with proper configuration
 * 
 * JUSTIFICATION: Setting these options hardens the session
 * against common attack vectors (OWASP Session Management)
 */
function initSecureSession() {
    // Configure session cookie parameters BEFORE starting session
    session_set_cookie_params([
        'lifetime' => 1800,      // 30 minutes - balances security/usability
        'path' => '/',
        'domain' => $_SERVER['HTTP_HOST'],
        'secure' => true,        // HTTPS only - prevents interception
        'httponly' => true,      // JavaScript cannot access - prevents XSS
        'samesite' => 'Strict'   // CSRF protection
    ]);
    
    session_start();
    
    // Regenerate ID periodically to prevent session fixation
    if (!isset($_SESSION['created'])) {
        $_SESSION['created'] = time();
    } else if (time() - $_SESSION['created'] > 1800) {
        // Session older than 30 mins - regenerate
        session_regenerate_id(true);
        $_SESSION['created'] = time();
    }
}


/**
 * Creates new session after successful login
 * 
 * @param array $user User data from database
 * 
 * SECURITY: Regenerating session ID prevents session fixation attacks
 * where attacker sets a known session ID before victim logs in
 */
function createUserSession($user) {
    // CRITICAL: Regenerate session ID on login
    session_regenerate_id(true);
    
    // Store minimal user data in session
    // JUSTIFICATION: Only store what's needed - principle of least privilege
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['login_time'] = time();
    $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];  // For anomaly detection
}


/**
 * Validates current session is legitimate
 * 
 * @return boolean True if session is valid
 * 
 * SECURITY CHECKS:
 * 1. Session exists and has required data
 * 2. Session not expired
 * 3. IP address matches (optional - can break for mobile users)
 */
function validateSession() {
    // Check session exists
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['login_time'])) {
        return false;
    }
    
    // Check session not expired (30 minute timeout)
    // JUSTIFICATION: Timeout reduces risk if user forgets to logout
    $timeout = 1800; // 30 minutes in seconds
    if (time() - $_SESSION['login_time'] > $timeout) {
        destroySession();
        return false;
    }
    
    // Refresh session timestamp on activity
    $_SESSION['login_time'] = time();
    
    return true;
}


/**
 * Destroys session completely on logout
 * 
 * JUSTIFICATION: Complete session destruction ensures no residual
 * data remains that could be exploited
 */
function destroySession() {
    // Unset all session variables
    $_SESSION = array();
    
    // Delete session cookie
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    // Destroy session
    session_destroy();
}
?>
```

---

## Key Commenting Principles

### DO ✅

1. **Explain WHY, not just WHAT**
   - Bad: `// Hash the password`
   - Good: `// Hash password using bcrypt to meet GDPR security requirements`

2. **Reference requirements**
   - `// Meets FR-001: User authentication`

3. **Document security decisions**
   - `// SECURITY: Parameterised query prevents SQL injection`

4. **Explain trade-offs**
   - `// Session timeout of 30 mins balances security with usability`

5. **Note legal compliance**
   - `// GDPR Article 32: Appropriate security measures`

### DON'T ❌

1. State the obvious
   - `// Set x to 5`

2. Leave code uncommented

3. Write comments that become outdated

4. Comment every single line

---

## Remember

> "Justifications and depth are essential... justify the decisions by adding comments on the code"

**Every significant decision should be explained!**
