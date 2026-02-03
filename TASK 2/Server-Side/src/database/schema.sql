CREATE DATABASE IF NOT EXISTS london_zoo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE london_zoo;

-- user and visitor table --
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR (225) NOT NULL UNIQUE,
    password_hash VARCHAR (225) NOT NULL,
    role ENUM ('visitor' , 'staff') DEFAULT 'visitor',
    reset_token CHAR (64) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email(email),
    INDEX idx_role(role),
    INDEX idx_reset_token(reset_token)
);

-- user preferences (visitors) --
CREATE TABLE IF NOT EXISTS user_preferences(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    preferred_attractions TEXT, -- in json format ['penguins' , 'giraffes']
    distance_alert_threshold INT DEFAULT 500, -- meters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user(user_id)
);

-- attractions --
CREATE TABLE IF NOT EXISTS attractions(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR (150) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100), -- could be 'reptiles' or 'cats'
    latitude DECIMAL (10,8) NOT NULL,
    longitude DECIMAL (11,8) NOT NULL,
    estimated_duration_minutes INT UNSIGNED DEFAULT 30, -- visit time
    capacity INT UNSIGNED DEFAULT 100,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category(category),
    INDEX idx_open(is_open)
);

-- real time queue status updates --
CREATE TABLE IF NOT EXISTS queue_status(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attraction_id INT UNSIGNED NOT NULL,
    queue_length INT UNSIGNED DEFAULT 0,
    estimated_wait_minutes INT UNSIGNED DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
    INDEX idx_attraction(attraction_id),
    INDEX idx_last_updated(last_updated),
    UNIQUE KEY unique_attraction_queue(attraction_id)
);

-- Notifications/Alerts --
CREATE TABLE IF NOT EXISTS notifications(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    attraction_id INT UNSIGNED,
    type ENUM('queue_alerts' , 'status_updates' , 'general') DEFAULT 'general',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE SET NULL,
    INDEX idx_user_read(user_id, is_read),
    INDEX idx_created(created_at)
);

-- Staff performance metrics --
CREATE TABLE IF NOT EXISTS staff_metrics(
    ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attraction_id INT UNSIGNED NOT NULL,
    metric_date DATE NOT NULL,
    ticket_sales INT UNSIGNED DEFAULT 0,
    uptime_percentage DECIMAL (5, 2) DEFAULT 100.00,
    visitors_count INT UNSIGNED DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
    INDEX idx_attraction_date(attraction_id,metric_date),
    UNIQUE KEY unique_attraction_date(attraction_id,metric_date)
);

-- Insert sample attractions --
INSERT INTO attractions (name, description, category, latitude, longitude, capacity, estimated_duration_minutes, is_open)
SELECT 'African Savanna' , 'See Lions , Zebras and giraffes in open habitat' , 'Mammals' , 51.5350, -0.1507, 200, 45, TRUE
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'African Savanna')
UNION ALL 
SELECT 'Penguin Pool', 'Watch playful penguins dive , swim , smile and wave' , 'Birds' , 51.5355, -0.1500, 100, 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Penguin Pool')
UNION ALL
SELECT 'Reptile House', 'Explore snakes, lizards, and crocodiles', 'Reptiles', 51.5345, -0.1500, 100, 25, TRUE
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Reptile House')
UNION ALL
SELECT 'Tropical Forest', 'Discover monkeys, birds, and exotic insects', 'Mammals', 51.5360, -0.1515, 180, 50, TRUE
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Tropical Forest')
UNION ALL
SELECT 'Big Cats Arena', 'View tigers, leopards, and panthers', 'Mammals', 51.5340, -0.1495, 250, 40, TRUE
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Big Cats Arena');

-- Initialize queue status for all attractions --
INSERT INTO queue_status (attraction_id, queue_length, estimated_wait_minutes)
SELECT id, 0, 0 FROM attractions
ON DUPLICATE KEY UPDATE queue_length = VALUES(queue_length);

-- Initialize metrics for today --
INSERT INTO staff_metrics (attraction_id, metric_date, ticket_sales, uptime_percentage, visitors_count)
SELECT id, CURDATE(), 0, 100.00, 0 FROM attractions
ON DUPLICATE KEY UPDATE 
    ticket_sales = VALUES(ticket_sales),
    uptime_percentage = VALUES(uptime_percentage);

-- Insert a demo admin staff account (password: 'TempPassword123!')
INSERT INTO users (email, password_hash, role)
SELECT 'staff@londonzoo.co.uk', '$2b$10$YqZfR.2QYyA7y6tLHHQ6ZuC6vwHQXxGb1XKH6gN6x5nNDHQGQXKWC', 'staff'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'staff@londonzoo.co.uk');