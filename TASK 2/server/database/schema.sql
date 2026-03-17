CREATE DATABASE IF NOT EXISTS Greenfields CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Greenfields;

-- users: customers, producers, admins --
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','producer','admin') DEFAULT 'customer',
  farm_name VARCHAR(150) NULL,
  contact_number VARCHAR(20) NULL,
  reset_token CHAR(64) DEFAULT NULL,
  reset_token_expiry DATETIME DEFAULT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verify_token CHAR(64) DEFAULT NULL,
  producer_status ENUM('pending','approved','rejected') DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email(email),
  INDEX idx_role(role),
  INDEX idx_reset_token(reset_token),
  INDEX idx_producer_status(producer_status)
);

-- products sold by producers --
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  producer_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  stock_quantity INT UNSIGNED DEFAULT 0 CHECK (stock_quantity >= 0),
  is_available BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_producer(producer_id),
  INDEX idx_category(category)
);

-- collection/delivery time slots --
CREATE TABLE IF NOT EXISTS collection_slots (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  max_capacity INT UNSIGNED DEFAULT 10,
  current_bookings INT UNSIGNED DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_slot(slot_date, slot_time),
  INDEX idx_date(slot_date),
  INDEX idx_available(is_available)
);

-- orders placed by customers --
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  collection_slot_id INT UNSIGNED NULL,
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
  discount_applied DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('pending','confirmed','ready','out_for_delivery','collected','delivered','cancelled') DEFAULT 'pending',
  fulfilment_type ENUM('collection','delivery') NOT NULL,
  delivery_address_line1 VARCHAR(255) NULL,
  delivery_address_line2 VARCHAR(255) NULL,
  delivery_city VARCHAR(100) NULL,
  delivery_postcode VARCHAR(10) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_slot_id) REFERENCES collection_slots(id) ON DELETE SET NULL,
  INDEX idx_customer(customer_id),
  INDEX idx_status(status),
  INDEX idx_fulfilment(fulfilment_type)
);

-- items within each order --
CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  product_name_snapshot VARCHAR(150) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_order_product(order_id, product_id)
);

-- loyalty points system --
CREATE TABLE IF NOT EXISTS loyalty (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL UNIQUE,
  points_balance INT UNSIGNED DEFAULT 0 CHECK (points_balance >= 0),
  discount_threshold INT UNSIGNED DEFAULT 100 CHECK (discount_threshold > 0),
  discount_active BOOLEAN DEFAULT FALSE,
  discount_value DECIMAL(5,2) DEFAULT 10.00 CHECK (discount_value > 0),
  points_rate DECIMAL(5,2) DEFAULT 1.00 CHECK (points_rate > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- notifications for customers --
CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL,
  order_id INT UNSIGNED NULL,
  type ENUM('order_update','product_available') NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_customer_read(customer_id, is_read),
  INDEX idx_created(created_at)
);

-- shopping cart items --
CREATE TABLE IF NOT EXISTS cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_customer_product(customer_id, product_id),
  INDEX idx_customer(customer_id)
);