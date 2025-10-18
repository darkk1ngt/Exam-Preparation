-- Create the application database with UTF8MB4 charset to support emojis and wide unicode characters.
-- COLLATE selects a Unicode-aware collation.
CREATE DATABASE IF NOT EXISTS express_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database for the following statements.
USE express_test;

-- `users` table: stores registered user accounts.
-- Columns:
--  - id: primary key, auto-incrementing unsigned integer.
--  - email: unique user email (used for login/identification).
--  - password_hash: hashed password (use bcrypt on the application side).
--  - reset_token: optional token for password reset flows (hex/string of fixed length).
--  - reset_expires: optional datetime when the reset_token expires.
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    reset_token CHAR(64) DEFAULT NULL,
    reset_expires DATETIME DEFAULT NULL
);