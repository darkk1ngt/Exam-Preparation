CREATE DATABASE IF NOT EXISTS GLH CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE GLH;

/*Table 1: users Stores authentication credentials and access roles for all system users including customers, producers and admins. The role ENUM field restricts access to three valid values, ensuring unauthorised role assignments are rejected at the database level. Passwords are stored exclusively as bcrypt hashes — plaintext credentials are never retained at any point in the authentication flow.*/
-- customer , producer and admin table --
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR (255) NOT NULL UNIQUE,
    password_hash VARCHAR (255) NOT NULL,
    role ENUM ('customer' , 'producer' , 'admin') DEFAULT 'customer',
    farm_name VARCHAR(150) NULL,
    reset_token CHAR (64) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email(email),
    INDEX idx_role(role),
    INDEX idx_reset_token(reset_token)
);

/*Stores all product listings created by producers. The producer_id foreign key links each product back to its creator in the users table, enabling full product traceability. Both stock_quantity and is_available fields are included — stock_quantity tracks the numeric level while is_available allows producers to manually toggle a product off even when stock exists, for example due to quality issues. ON DELETE CASCADE ensures products are removed if a producer account is deleted.*/
-- products table --
CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    producer_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT UNSIGNED DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_producer(producer_id),
    INDEX idx_category(category)
);

/*Stores all customer orders with real-time status tracking. The status ENUM field restricts order progress to five valid states, preventing invalid status assignments at the database level. The fulfilment_type ENUM distinguishes between collection and delivery orders, supporting GLH's dual fulfilment model. ON DELETE CASCADE ensures orders are removed if a customer account is deleted, supporting GDPR right to erasure.*/
-- orders --
CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'out_for_delivery', 'delivered', 'collected') DEFAULT 'pending',
    fulfilment_type ENUM('collection', 'delivery') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_customer(customer_id),
    INDEX idx_status(status)
);

/*Table 4: order_items
Stores the individual products within each order, linking orders to specific products and quantities. The composite relationship between order_id and product_id ensures accurate order contents are maintained. unit_price is stored at the time of purchase rather than referencing the current product price, protecting against price changes affecting historical order records.*/

CREATE TABLE IF NOT EXISTS order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order(order_id),
    INDEX idx_product(product_id)
);

/*Table 5: loyalty
Stores loyalty points and discount eligibility per customer. The UNIQUE constraint on customer_id enforces a one-to-one relationship — each customer has exactly one loyalty record. The discount_active boolean is automatically toggled by the Loyalty Points and Discount Allocation algorithm when points_balance surpasses the discount_threshold, ensuring discounts are applied without manual intervention.*/
-- loyalty table --
CREATE TABLE IF NOT EXISTS loyalty (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED NOT NULL UNIQUE,
    points_balance INT UNSIGNED DEFAULT 0,
    discount_threshold INT UNSIGNED DEFAULT 100,
    discount_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_customer(customer_id)
);

/*Table 6: notifications
Stores system-generated notifications delivered to customers for both order status updates and product availability changes. The type ENUM restricts notifications to two valid categories, preventing invalid notification types at the database level. A composite index on customer_id and is_read enables fast retrieval of unread notifications per customer.*/
-- notifications table --
CREATE TABLE IF NOT EXISTS notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NULL,
    order_id INT UNSIGNED NULL,
    type ENUM('order_update', 'product_available') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_customer_read(customer_id, is_read)
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

-- Insert a demo admin staff account (password: 'Theadmin123-')
INSERT INTO users (email, password_hash, role)
SELECT 'admin@glh.co.uk', '$2b$10$d8gc9P9VPXg8Yfv.o5ZquOU1GRGtKRuLZwutjMqY/EQ.5M/9fAY6q', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@glh.co.uk');