# Data Dictionary Example - Distinction Quality

## How to Structure Your Data Dictionary

A distinction-level data dictionary is **meticulous** and includes ALL attributes for every data element.

---

## Example: User Management System

### Table: users

| Field Name | Data Type | Size | Constraints | Validation Rules | Purpose/Description |
|------------|-----------|------|-------------|------------------|---------------------|
| user_id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | System generated | Unique identifier for each user record |
| email | VARCHAR | 255 | UNIQUE, NOT NULL | Must match email regex pattern, max 255 chars | User's email address for login and communication |
| password_hash | VARCHAR | 255 | NOT NULL | Bcrypt hashed, original min 8 chars with uppercase, lowercase, number | Securely stored password (never plain text) |
| first_name | VARCHAR | 50 | NOT NULL | Letters only, 2-50 characters | User's first name for personalisation |
| last_name | VARCHAR | 50 | NOT NULL | Letters only, 2-50 characters | User's surname for personalisation |
| date_of_birth | DATE | - | NULL | Must be valid date, user must be 13+ | For age verification and birthday offers |
| phone_number | VARCHAR | 20 | NULL | UK format validation, optional | Contact number for delivery updates |
| created_at | DATETIME | - | NOT NULL, DEFAULT CURRENT_TIMESTAMP | System generated | Record creation timestamp for auditing |
| updated_at | DATETIME | - | NULL, ON UPDATE CURRENT_TIMESTAMP | System generated | Last modification timestamp |
| is_active | BOOLEAN | 1 | NOT NULL, DEFAULT TRUE | TRUE/FALSE only | Account status (for soft delete) |
| role_id | INT | 11 | FOREIGN KEY → roles.role_id, NOT NULL | Must exist in roles table | User's permission level |

---

### Table: roles

| Field Name | Data Type | Size | Constraints | Validation Rules | Purpose/Description |
|------------|-----------|------|-------------|------------------|---------------------|
| role_id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | System generated | Unique identifier for role |
| role_name | VARCHAR | 30 | UNIQUE, NOT NULL | Predefined values only | Name of role (admin, customer, staff) |
| permissions | JSON | - | NOT NULL | Valid JSON structure | JSON object defining access rights |

---

### Table: products

| Field Name | Data Type | Size | Constraints | Validation Rules | Purpose/Description |
|------------|-----------|------|-------------|------------------|---------------------|
| product_id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | System generated | Unique product identifier |
| product_name | VARCHAR | 100 | NOT NULL | 3-100 characters | Display name for product |
| description | TEXT | 65535 | NULL | Max 65535 characters | Detailed product description |
| price | DECIMAL | 10,2 | NOT NULL | Must be > 0, max 2 decimal places | Product price in GBP |
| stock_quantity | INT | 11 | NOT NULL, DEFAULT 0 | Must be >= 0 | Current stock level |
| category_id | INT | 11 | FOREIGN KEY → categories.category_id | Must exist in categories table | Product category link |
| image_url | VARCHAR | 500 | NULL | Valid URL format | Path to product image |
| is_available | BOOLEAN | 1 | NOT NULL, DEFAULT TRUE | TRUE/FALSE | Whether product is displayed |
| created_at | DATETIME | - | NOT NULL, DEFAULT CURRENT_TIMESTAMP | System generated | When product was added |

---

### Table: orders

| Field Name | Data Type | Size | Constraints | Validation Rules | Purpose/Description |
|------------|-----------|------|-------------|------------------|---------------------|
| order_id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | System generated | Unique order identifier |
| user_id | INT | 11 | FOREIGN KEY → users.user_id, NOT NULL | Must exist in users table | Customer who placed order |
| order_date | DATETIME | - | NOT NULL, DEFAULT CURRENT_TIMESTAMP | System generated | When order was placed |
| total_amount | DECIMAL | 10,2 | NOT NULL | Calculated from order_items, must be > 0 | Total order value including VAT |
| status | ENUM | - | NOT NULL, DEFAULT 'pending' | Values: pending, processing, shipped, delivered, cancelled | Current order status |
| shipping_address_id | INT | 11 | FOREIGN KEY → addresses.address_id | Must exist in addresses table | Delivery address |
| payment_method | VARCHAR | 50 | NOT NULL | Predefined values only | How customer paid |
| payment_status | ENUM | - | NOT NULL, DEFAULT 'pending' | Values: pending, completed, failed, refunded | Payment transaction status |

---

### Table: order_items

| Field Name | Data Type | Size | Constraints | Validation Rules | Purpose/Description |
|------------|-----------|------|-------------|------------------|---------------------|
| item_id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | System generated | Unique line item identifier |
| order_id | INT | 11 | FOREIGN KEY → orders.order_id, NOT NULL | Must exist in orders table | Parent order reference |
| product_id | INT | 11 | FOREIGN KEY → products.product_id, NOT NULL | Must exist in products table | Product being ordered |
| quantity | INT | 11 | NOT NULL | Must be > 0, max 99 | Number of items ordered |
| unit_price | DECIMAL | 10,2 | NOT NULL | Price at time of order, must be > 0 | Price per item (snapshot) |
| line_total | DECIMAL | 10,2 | NOT NULL | Calculated: quantity × unit_price | Total for this line item |

---

### Table: addresses

| Field Name | Data Type | Size | Constraints | Validation Rules | Purpose/Description |
|------------|-----------|------|-------------|------------------|---------------------|
| address_id | INT | 11 | PRIMARY KEY, AUTO_INCREMENT | System generated | Unique address identifier |
| user_id | INT | 11 | FOREIGN KEY → users.user_id, NOT NULL | Must exist in users table | Address owner |
| address_line1 | VARCHAR | 100 | NOT NULL | 5-100 characters | First line of address |
| address_line2 | VARCHAR | 100 | NULL | Max 100 characters | Second line (optional) |
| city | VARCHAR | 50 | NOT NULL | 2-50 characters | City/Town |
| postcode | VARCHAR | 10 | NOT NULL | UK postcode format validation | Postal code |
| is_default | BOOLEAN | 1 | NOT NULL, DEFAULT FALSE | Only one default per user | Primary address flag |

---

## Entity Relationship Summary

```
users (1) ──────< (M) orders
  │                    │
  │                    │
  └──< addresses       └──< order_items >── products
  │                                              │
  └── roles                                      │
                                           categories
```

**Relationships:**
- One user can have many orders (1:M)
- One user can have many addresses (1:M)
- One order can have many order_items (1:M)
- One product can appear in many order_items (1:M)
- One user has one role (M:1)
- One product belongs to one category (M:1)

---

## Key Points for Distinction:

1. ✅ **Every field** is documented
2. ✅ **Data types** are specific (VARCHAR not just "text")
3. ✅ **Sizes** are included (VARCHAR(255) not just VARCHAR)
4. ✅ **Constraints** listed (PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE)
5. ✅ **Validation rules** explain what's acceptable
6. ✅ **Purpose** explains WHY the field exists
7. ✅ **Relationships** between tables are clear
8. ✅ **GDPR consideration** - sensitive data identified
