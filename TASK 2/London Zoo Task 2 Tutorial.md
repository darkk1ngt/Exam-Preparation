# Building a London Zoo Visitor + Staff Platform

**A Step-by-Step Full-Stack Tutorial** (Node.js + Express + React + MySQL)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Tutorial](#backend-tutorial)
3. [Frontend Tutorial](#frontend-tutorial)
4. [Run &amp; Test Checklist](#run--test-checklist)
5. [Common Bugs &amp; Fixes](#common-bugs--fixes)
6. [What to Build Next](#what-to-build-next)

---

## Architecture Overview

### Project Structure (Single Monorepo)

```
london-zoo/
├── client-side/              # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── App.css
│   │   ├── api/
│   │   │   └── api.js        # Centralized API calls
│   │   ├── components/
│   │   │   └── Navigation.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── NavigationPage.jsx      # Map + ETA
│   │   │   ├── QueuePage.jsx           # Queue times + alerts
│   │   │   └── StaffDashboard.jsx      # Metrics + filters
│   │   └── styles/
│   │       ├── Auth.css
│   │       ├── Navigation.css
│   │       ├── Home.css
│   │       ├── Queue.css
│   │       ├── Profile.css
│   │       ├── Map.css
│   │       └── Dashboard.css
│   ├── package.json
│   ├── rsbuild.config.mjs
│   └── biome.json
│
├── server-side/              # Express backend
│   ├── src/
│   │   ├── server.js         # Main app setup, middleware, routes
│   │   ├── database/
│   │   │   ├── connections.js   # MySQL pool
│   │   │   ├── schema.js        # Database initialization
│   │   │   └── schema.sql       # SQL schema
│   │   ├── routes/
│   │   │   ├── auth.js          # Login, register, logout
│   │   │   ├── attractions.js    # GET attractions, attraction details
│   │   │   ├── queue.js          # Queue status endpoints
│   │   │   ├── notifications.js  # Subscribe/unsubscribe + list alerts
│   │   │   ├── navigation.js     # ETA calculation endpoint
│   │   │   ├── profile.js        # User preferences & profile update
│   │   │   └── staff-metrics.js  # Staff dashboard data + filters
│   │   ├── utils/
│   │   │   ├── middleware.js     # Auth middleware, role checks
│   │   │   └── index.js          # Helper functions (validation, etc.)
│   │   └── .env                  # Environment variables
│   └── package.json
│
└── .gitignore
```

### Data Flow

**Authentication (Express-Sessions):**

- User registers → password hashed (bcrypt) → stored in DB
- User logs in → email + password verified → `request.session.userId` set
- Session persists via secure HTTP-only cookies
- Frontend stores session in browser (automatic with credentials: 'include')

**Protected Routes:**

- Middleware checks `request.session.userId`
- Role-based access: `staff` role → access staff endpoints only
- React context checks auth status on app load

**API Communication:**

- Fetch with `credentials: 'include'` sends/receives cookies
- All requests go through centralized API service
- Error handling standardized: `{ error: "message" }`

---

# Backend Tutorial

## Step 1: Initialize Backend Project

### Goal

Set up Express server with session management, CORS, rate limiting, and database connections.

### Files to Create/Modify

```
server-side/
├── package.json          (create)
├── .env                  (create)
├── src/
│   ├── server.js        (create)
│   └── database/
│       └── connections.js (create)
```

### Step 1a: Initialize npm & Install Dependencies

```bash
cd server-side
npm init -y
npm install express express-session cors bcrypt chalk dotenv mysql2 express-rate-limit
npm install --save-dev nodemon
```

**Why each package:**

- `express` – web framework
- `express-session` – session middleware (stores userId in cookies)
- `cors` – cross-origin requests for React frontend
- `bcrypt` – password hashing
- `chalk` – colored console logging
- `dotenv` – load environment variables from `.env`
- `mysql2` – MySQL database driver
- `express-rate-limit` – limit authentication attempts (brute-force protection)
- `nodemon` – auto-restart server during development

### Step 1b: Create `.env` File

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=london_zoo

# Sessions
SESSION_SECRET=your_super_secret_key_change_this_in_production

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Important:** Replace `your_password_here` with your actual MySQL root password. Never commit `.env` to git.

### Step 1c: Update `package.json` Scripts

```json
{
  "name": "server-side",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "bcrypt": "^6.0.0",
    "chalk": "^5.6.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "express-rate-limit": "^8.2.1",
    "express-session": "^1.18.2",
    "mysql2": "^3.15.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}
```

### Step 1d: Create `database/connection.js`

**Goal:** Establish MySQL connection pool with automatic database creation

```javascript
import mysql from 'mysql2/promise';
import chalk from 'chalk';

const initialPool = mysql.createPool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    waitForConnections : true,
    connectionLimit : 10,
    queueLimit : 0
});

let pool;

export async function initializeConnection(){
    try{
        const connection = await initialPool.getConnection();
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        connection.release();
        console.log(chalk.yellow(`Database created or already exists.`));
      
        pool = mysql.createPool({
            host : process.env.DB_HOST,
            user : process.env.DB_USER,
            password : process.env.DB_PASSWORD,
            database : process.env.DB_NAME,
            waitForConnections : true,
            connectionLimit : 10,
            queueLimit : 0
        });
    }catch( error ){
        console.error(chalk.red(`Failed to initialize connection: ${error.message}`));
        throw error;
    }
}

export async function query(sql,values=[]){
    const connection = await pool.getConnection();
    try{
        const [ results ] = await connection.execute( sql , values );
        return results;
    }catch( error ){
        console.error(chalk.bgRedBright(`Database query error.${error.message}`));
        throw error;
    }finally{
        connection.release();
    }
}

export async function testConnection(){
    try{
        const connection = await pool.getConnection();
        connection.release();
        console.log(chalk.bgGreen(`Database connected successfully.`));
        return true;
    }catch( error ){
        console.error(chalk.red(`Database connection failed.${error.message}`));
        return false;
    }
}
```

**Detailed Explanation:**

**Why Connection Pooling?**

- **Performance:** Creating a new database connection for every query is expensive (handshake, authentication, etc.)
- **Connection pools** maintain a set of reusable connections, drastically reducing overhead
- When you request a connection, you get one from the pool; when done, it returns to the pool for reuse

**Configuration Breakdown:**

- `connectionLimit: 10` – Maximum 10 concurrent connections (adjust based on your server's capacity and expected traffic)
- `waitForConnections: true` – If all 10 connections are in use, new requests wait in a queue rather than failing immediately
- `queueLimit: 0` – Unlimited queue size (alternative: set a number to prevent memory overflow under extreme load)

**The `query()` Function:**

```javascript
const connection = await pool.getConnection();  // 1. Get connection from pool
try {
    const [results] = await connection.execute(sql, values);  // 2. Execute query with parameters
    return results;  // 3. Return results
} finally {
    connection.release();  // 4. ALWAYS release connection back to pool
}
```

**Key Best Practices:**

1. **Always use `finally` block** to ensure connection is released even if error occurs
2. **Use parameterized queries** (`execute(sql, values)`) to prevent SQL injection attacks
3. **Array destructuring** `[results]` – mysql2 returns `[rows, fields]`, we only need rows
4. **Error logging with chalk** – colored console output makes debugging easier in production logs

**SQL Injection Prevention Example:**

```javascript
// ❌ NEVER do this (vulnerable to SQL injection):
query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ ALWAYS do this (safe, parameterized):
query('SELECT * FROM users WHERE email = ?', [email]);
```

**The `testConnection()` Function:**

- Called once on server startup to verify database is accessible
- Fails fast if connection is misconfigured (better than discovering issues when first query runs)
- Returns boolean so server can gracefully exit if DB unavailable

---

## Step 2: Database Schema & Initialization

### Goal

Define the MySQL schema (users, attractions, queue status, notifications, etc.) and initialize the database.

### Files to Create

```
server-side/src/database/
├── schema.sql        (create)
└── schema.js         (create)
```

### Step 2a: Create `database/schema.sql`

This SQL script creates all tables for the London Zoo system:

CREATE DATABASE IF NOT EXISTS london_zoo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE london_zoo;

-- Users table (both visitors and staff)
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('visitor', 'staff') DEFAULT 'visitor',
    reset_token CHAR(64) DEFAULT NULL,
    reset_expires DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email(email),
    INDEX idx_role(role),
    INDEX idx_reset_token(reset_token)
);

-- User preferences (for visitors)
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    preferred_attractions TEXT,  -- JSON: ["giraffes", "penguins"]
    distance_alert_threshold INT DEFAULT 500,  -- meters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user(user_id)
);

-- Attractions
CREATE TABLE IF NOT EXISTS attractions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),  -- e.g., "Reptiles", "Big Cats", "Birds"
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    estimated_duration_minutes INT UNSIGNED DEFAULT 30,  -- typical visit time
    capacity INT UNSIGNED DEFAULT 100,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category(category),
    INDEX idx_open(is_open)
);

-- Queue status updates (real-time queue times)
CREATE TABLE IF NOT EXISTS queue_status (
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

-- Notifications/Alerts
CREATE TABLE IF NOT EXISTS notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    attraction_id INT UNSIGNED,
    type ENUM('queue_alert', 'status_update', 'general') DEFAULT 'general',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE SET NULL,
    INDEX idx_user_read(user_id, is_read),
    INDEX idx_created(created_at)
);

-- Staff performance metrics
CREATE TABLE IF NOT EXISTS staff_metrics (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attraction_id INT UNSIGNED NOT NULL,
    metric_date DATE NOT NULL,
    ticket_sales INT UNSIGNED DEFAULT 0,
    uptime_percentage DECIMAL(5, 2) DEFAULT 100.00,  -- e.g., 95.50 for 95.50%
    visitors_count INT UNSIGNED DEFAULT 0,
    avg_wait_time_minutes INT UNSIGNED DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
    INDEX idx_attraction_date(attraction_id, metric_date),
    UNIQUE KEY unique_attraction_date(attraction_id, metric_date)
);

-- Insert sample attractions
INSERT INTO attractions (name, description, category, latitude, longitude, capacity, estimated_duration_minutes)
SELECT 'African Savanna', 'See lions, zebras, and giraffes in open habitat', 'Mammals', 51.5350, -0.1507, 200, 45
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'African Savanna')
UNION ALL
SELECT 'Penguin Pool', 'Watch playful penguins dive and swim', 'Birds', 51.5355, -0.1512, 150, 30
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Penguin Pool')
UNION ALL
SELECT 'Reptile House', 'Explore snakes, lizards, and crocodiles', 'Reptiles', 51.5345, -0.1500, 100, 25
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Reptile House')
UNION ALL
SELECT 'Tropical Forest', 'Discover monkeys, birds, and exotic insects', 'Mammals', 51.5360, -0.1515, 180, 50
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Tropical Forest')
UNION ALL
SELECT 'Big Cats Arena', 'View tigers, leopards, and panthers', 'Mammals', 51.5340, -0.1495, 250, 40
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'Big Cats Arena');

-- Initialize queue status for all attractions
INSERT INTO queue_status (attraction_id, queue_length, estimated_wait_minutes)
SELECT id, 0, 0 FROM attractions
ON DUPLICATE KEY UPDATE queue_length = VALUES(queue_length);

-- Initialize metrics for today
INSERT INTO staff_metrics (attraction_id, metric_date, ticket_sales, uptime_percentage, visitors_count)
SELECT id, CURDATE(), 0, 100.00, 0 FROM attractions
ON DUPLICATE KEY UPDATE
    ticket_sales = VALUES(ticket_sales),
    uptime_percentage = VALUES(uptime_percentage);

-- Insert a demo admin staff account (password: 'TempPassword123!')
INSERT INTO users (email, password_hash, role)
SELECT 'staff@londonsoo.co.uk', '$2b$10$YqZfR.2QYyA7y6tLHHQ6ZuC6vwHQXxGb1XKH6gN6x5nNDHQGQXKWC', 'staff'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'staff@londonsoo.co.uk');

**Schema Highlights:**

- `users.role` – ENUM for `visitor` or `staff` (for role-based access control)
- `user_preferences.notifications_enabled` – opt-in alerts (privacy)
- `attractions` – store lat/lon for distance calculations
- `queue_status.unique_key` – only one queue record per attraction (latest data)
- `staff_metrics` – aggregated daily data (ticket sales, uptime, visitor count)

**Detailed Schema Design Decisions:**

**1. Users Table Architecture:**

```sql
role ENUM('visitor', 'staff') DEFAULT 'visitor'
```

- **Why ENUM?** Enforces only valid roles at database level (safer than VARCHAR which allows any string)
- **Default 'visitor'** ensures new users aren't accidentally granted staff privileges
- **Security principle:** Least privilege by default

**2. Password Storage:**

```sql
password_hash VARCHAR(255) NOT NULL
```

- **NEVER store plain-text passwords** – This stores bcrypt hashes (one-way encryption)
- **VARCHAR(255)** accommodates bcrypt hash format (`$2b$10$...` = ~60 chars) with room for algorithm upgrades
- **Best practice:** Even database administrators cannot see actual passwords

**3. Reset Token Security:**

```sql
reset_token CHAR(64) DEFAULT NULL,
reset_expires DATETIME DEFAULT NULL
```

- **Password reset flow:** Generate random 64-char token → email to user → expires after 1 hour
- **CHAR(64)** fixed length for cryptographically secure tokens
- **Indexed for performance** (lookups happen frequently during reset flow)

**4. Preferences Table Relationship:**

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

- **CASCADE deletion:** When user account deleted, preferences automatically deleted (prevents orphaned data)
- **Alternative:** `ON DELETE SET NULL` keeps data but removes link (useful for analytics)
- **Unique constraint on user_id** – each user has exactly one preferences record

**5. Attractions Geolocation:**

```sql
latitude DECIMAL(10, 8) NOT NULL,
longitude DECIMAL(11, 8) NOT NULL
```

- **DECIMAL vs FLOAT:** DECIMAL stores exact values (critical for coordinates)
- **Precision:** `(10, 8)` = up to 8 decimal places (accurate to ~1mm)
- **Why?** Used for Haversine distance calculations in navigation feature

**6. Queue Status Optimization:**

```sql
UNIQUE KEY unique_attraction_queue(attraction_id)
```

- **Ensures only one queue record per attraction** (latest status)
- **Update pattern:** Use `INSERT ... ON DUPLICATE KEY UPDATE` to upsert
- **Performance:** Index on last_updated allows fast "recent updates" queries

**7. Staff Metrics Composite Key:**

```sql
UNIQUE KEY unique_attraction_date(attraction_id, metric_date)
```

- **Prevents duplicate entries** for same attraction on same day
- **Supports efficient queries** like "Get all metrics for Penguin Pool in January"
- **Data integrity:** Business rule enforced at database level

**8. Timestamp Best Practices:**

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

- **Automatic audit trail** – Know when records created/modified without application code
- **ON UPDATE CURRENT_TIMESTAMP** automatically updates timestamp on any row modification
- **Debugging aid:** Essential for tracking down when data changed

**9. Indexing Strategy:**

```sql
INDEX idx_user_read(user_id, is_read)  -- Composite index
```

- **Composite index on (user_id, is_read)** speeds up query: "Get all unread notifications for user X"
- **Rule of thumb:** Index foreign keys and WHERE clause columns
- **Trade-off:** Indexes speed up reads but slow down writes (acceptable here since reads >> writes)

**10. Sample Data Insertion Pattern:**

```sql
SELECT 'African Savanna', 'Description...', 'Mammals', 51.5350, -0.1507, 200, 45
WHERE NOT EXISTS (SELECT 1 FROM attractions WHERE name = 'African Savanna')
```

- **Idempotent inserts:** Running schema.sql multiple times won't create duplicates
- **Best for development:** Fresh database setup doesn't fail on "duplicate entry" errors
- **Production alternative:** Use migration tools (Knex, Sequelize) with version tracking

### Step 2b: Create `database/schema.js`

**Goal:** Auto-initialize database on server startup

```javascript
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

export async function initializeDatabase(){
    try{
        const schemaPath = path.join(process.cwd(),'src','database','schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

        // First, create database without selecting it
        let connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        // Execute the entire schema SQL at once (includes USE statement)
        await connection.query(schemaSQL);
        await connection.end();
        
        console.log(chalk.greenBright(`Database schema initialized successfully.`));        
    }catch( error ){
        console.error(chalk.red(`Database initialization failed : ${error.message}`));
        throw error;
    }
}
```

**Explanation:**

- Uses `mysql2/promise` to create a direct connection (not from pool) for schema initialization
- Uses `.query()` with `multipleStatements: true` to execute entire schema.sql file at once
- Executes the entire schema SQL including CREATE DATABASE and USE statements
- Called once on server startup in `server.js`

**Note:** For production, consider using migrations (e.g., Knex.js or db-migrate).

**Key Features:**

**File Reading with ES Modules:**

```javascript
const schemaPath = path.join(process.cwd(),'src','database','schema.sql');
```

- `process.cwd()` returns current working directory (where you ran `npm run dev`)
- **Why not `__dirname`?** We're using ES modules (`"type": "module"` in package.json), which don't have `__dirname`
- `path.join()` creates OS-agnostic paths (works on Windows and Unix)

**Multiple Statements Support:**

```javascript
multipleStatements: true
```

- Allows executing multiple SQL statements in one query (required for schema.sql which contains CREATE DATABASE, USE, CREATE TABLE, etc.)
- Without this, only the first statement would execute

**Error Handling Philosophy:**

```javascript
catch (error) {
    console.error(chalk.red(`Database initialization failed : ${error.message}`));
    throw error;  // Re-throw to stop server startup
}
```

- **Fail-fast principle:** If database can't initialize, don't start the server
- **Prevents silent failures** where app runs but database is broken
- **Better user experience:** Error shown immediately rather than first query failing later

**When initializeDatabase() Runs:**

- Called once in `server.js` before starting HTTP listener
- **Idempotent:** Safe to run multiple times (thanks to `IF NOT EXISTS` and `WHERE NOT EXISTS` in SQL)
- **Development workflow:** Restart server → schema recreated automatically

**Production Considerations:**
For real-world applications, replace this with a migration system:

```javascript
// Example with Knex.js migrations:
// migrations/001_create_users.js
export async function up(knex) {
    await knex.schema.createTable('users', (table) => {
        table.increments('id');
        table.string('email').unique();
        // ...
    });
}

export async function down(knex) {
    await knex.schema.dropTable('users');
}
```

**Benefits of migrations:**

- **Version control:** Each change is a numbered migration file
- **Rollback capability:** Can undo changes with `down()` functions
- **Team collaboration:** No conflicts when multiple developers modify schema
- **Deployment safety:** Apply only new migrations, never re-run old ones

---

## Step 3: Main Server Setup & Middleware

### Goal

Configure Express, session management, CORS, rate limiting, and error handling.

### Files to Create

```
server-side/src/
├── server.js          (create)
└── utils/
    └── middleware.js  (create)
```

### Step 3a: Create `server.js`

```javascript
import 'dotenv/config';
import express, { request, response } from 'express';
import session from 'express-session';
import chalk from 'chalk';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './database/schema.js';
import { testConnection, initializeConnection, getPool } from './database/connection.js';

/* PAGE ROUTE HANDLERS */
import authRoutes from './routes/auth.js';
import attractionsRoutes from './routes/attractions.js';
import queueRoutes from './routes/queue.js';
import notificationsRoutes from './routes/notifications.js';
import navigationRoutes from './routes/navigation.js';
import profileRoutes from './routes/profile.js';
import staffMetricsRoutes from './routes/staff-metrics.js';

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express()

app.use(cors({
    origin : FRONTEND_URL,
    credentials : true, /* allow cookies */
    methods : ['GET','POST','PATCH','DELETE'],
    allowedHeaders : ['Content-Type','Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use(session({
    secret : process.env.SESSION_SECRET || 'change_this_in_production',
    resave : false,
    saveUninitialized : false,
    cookie : {
        httpOnly : true, /* prevents js access to cookies yum yum */
        secure : process.env.NODE_ENV === 'production',
        sameSite : 'lax',
        maxAge : 24 * 60 * 60 * 1000
    }
}));

/* RATE LIMITATION */
const authLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 10,
    message : 'Too many login/register attempts, please try again later.',
    standardHeaders : true,
    legacyHeaders : false
});

const apiLimiter = rateLimit({
    windowMs : 60 * 1000,
    max : 30,
    standardHeaders : true,
    legacyHeaders : false
});

/* APPLICATION OF RATE LIMITERS TO AUTHENTICATION ROUTES */
app.use('/api/auth/login',authLimiter);
app.use('/api/auth/register',authLimiter);

/* API REQUEST LOGGING */
app.use(( request , response , next )=>{
    console.log(chalk.cyan(`${request.method} ${request.path}`));
    next();
});

/* ROUTES */
app.use('/api/auth',authRoutes);
app.use('/api/attractions',attractionsRoutes);
app.use('/api/queue/',queueRoutes);
app.use('/api/notifications',notificationsRoutes);
app.use('/api/navigation',navigationRoutes);
app.use('/api/profile',profileRoutes);
app.use('/api/staff-metrics',staffMetricsRoutes);

/* HEALTH CHECK */
app.get('/api/health',( request , response )=>{
    response.json({
        status : 'ok',
        timestamp : new Date().toISOString(),
        uptime : process.uptime()
    });
});

/* 404 SERVER HANDLER */
app.use(( request , response )=>{
    response.status(404).json({
        error : 'Not Found',
        message : `Route ${request.originalUrl} does not exist.`
    });
});

/* GLOBAL ERROR HANDLER */
app.use(( err , request , response , next )=>{
    console.error(chalk.red(`Error:${err.message}`));
    if( process.env.NODE_ENV === 'development' ){
        console.error(err.stack);
    }
    response.status( err.status || 500 ).json({
        error : err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack : err.stack })
    });
});

async function startServer(){
    try {
        await initializeConnection();
        const isConnected = await testConnection();
        if( !isConnected ){
            throw new Error(`Cannot connect to database.`);
        }
        await initializeDatabase();

        app.listen(PORT,()=>{
            console.log(chalk.green(`Your server is running on http://localhost:${PORT} all great one.`))
        });
    }catch( error ){
        console.error(chalk.red(`Failed to start server:${error.message}`));
        process.exit(1);
    }
}

startServer();

/* SERVER SHUTDOWN */
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    const pool = getPool();
    if(pool){
        await pool.end();
    }
    process.exit(0);
});
        console.error(chalk.red(`Failed to start server: ${error.message}`));
        process.exit(1);
    }
}

startServer();
```

**Key Points:**

- **`initializeConnection()` first** – Creates database if it doesn't exist
- **`testConnection()` second** – Verifies connection to the database
- **`initializeDatabase()` third** – Creates all tables from schema.sql
- `credentials: true` on CORS – allows cookies to be sent from frontend
- Session `maxAge` – 24 hours before session expires
- Rate limiters on auth routes – prevent brute-force attacks
- Global error handler – catches all errors and sends consistent responses

**Deep Dive into Server Architecture:**

**1. Middleware Order Matters:**

```javascript
app.use(cors({ ... }));           // 1. Must be first - handles preflight requests
app.use(express.json());          // 2. Parse request bodies before routes
app.use(session({ ... }));        // 3. Session middleware before auth checks
app.use((req, res, next) => {}); // 4. Logging
app.use('/api/auth', authRoutes); // 5. Finally, route handlers
```

**Why this order?**

- **CORS first:** Browser sends preflight OPTIONS requests before actual request; CORS must respond
- **Body parsers before routes:** Routes need access to `request.body`
- **Session before routes:** Routes check `request.session.userId` for authentication
- **If you get order wrong:** Requests fail with cryptic errors like "Cannot read property 'userId' of undefined"

**2. Session Configuration Explained:**

```javascript
app.use(session({
    secret: process.env.SESSION_SECRET || 'change_this_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
```

**Each setting's purpose:**

- **`secret`:** Used to sign session cookie (prevents tampering). **Critical:** Use long, random string in production
- **`resave: false`:** Don't save session if unmodified (reduces database/store writes)
- **`saveUninitialized: false`:** Don't create session until something stored (GDPR compliance - no tracking before consent)

**Cookie security flags:**

- **`httpOnly: true`:** JavaScript can't access cookie (prevents XSS attacks from stealing session)
- **`secure: true`:** Only send cookie over HTTPS (production only; localhost uses HTTP)
- **`sameSite: 'lax'`:** Prevents CSRF attacks (cookie not sent on cross-site POST requests)
- **`maxAge`:** Cookie expires after 24 hours (forces re-login, limits hijacking window)

**3. Rate Limiting Strategy:**

```javascript
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15-minute window
    max: 10,                    // Max 10 attempts per window
    message: 'Too many login/register attempts...'
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

**Why rate limiting?**

- **Prevents brute-force attacks:** Attacker can't try thousands of passwords
- **10 attempts in 15 minutes:** Reasonable for legitimate users (forgetting password), strict enough to slow attackers
- **Different limits per route:** Auth routes strict (10/15min), API routes generous (30/1min)

**Attack scenario without rate limiting:**

```
Attacker script:
for password in common_passwords:
    try_login("victim@email.com", password)
    # Without limit, tries 1000s of passwords in seconds
```

**4. CORS Configuration Deep Dive:**

```javascript
app.use(cors({
    origin: FRONTEND_URL,           // Only allow requests from our React app
    credentials: true,               // Allow cookies to be sent
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Why `credentials: true` is critical:**

- **Browser behavior:** By default, browsers don't send cookies on cross-origin requests
- **Our setup:** React (port 3000) → Express (port 5000) = cross-origin
- **Without this:** `request.session` will always be undefined (new session every request)
- **Frontend must also set:** `fetch(url, { credentials: 'include' })` (already in our api.js)

**5. Global Error Handler Pattern:**

```javascript
app.use((err, request, response, next) => {
    console.error(chalk.red(`Error: ${err.message}`));
  
    response.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
```

**How it works:**

- **Must have 4 parameters:** `(err, req, res, next)` – Express detects error handlers by parameter count
- **Catch-all:** Any unhandled error in routes/middleware lands here
- **Consistent format:** All errors return `{ error: "message" }` JSON
- **Development vs Production:** Show stack traces locally, hide in production (security)

**Usage in routes:**

```javascript
router.get('/example', async (req, res, next) => {
    try {
        const data = await someAsyncOperation();
        res.json(data);
    } catch (error) {
        next(error);  // Passes to global error handler
    }
});
```

**6. Startup Sequence Logic:**

```javascript
async function startServer() {
    try {
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('Cannot connect to database');
        }
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(chalk.green(`✓ Server running...`));
        });
    } catch (error) {
        console.error(chalk.red(`✗ Failed to start: ${error.message}`));
        process.exit(1);  // Exit with error code (CI/CD systems detect failure)
    }
}
```

**Why this sequence?**

1. **Test DB connection** → Fail immediately if database unreachable
2. **Initialize schema** → Ensure tables exist before accepting requests
3. **Start HTTP listener** → Only after everything ready
4. **`process.exit(1)`** → Signals to Docker/PM2/systemd that startup failed (triggers restart policies)

**Production Enhancement:**

```javascript
// Add graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    await pool.end();  // Close database connections
    process.exit(0);
});
```

### Step 3b: Create `utils/middleware.js`

**Goal:** Define reusable middleware for authentication and role checking

```javascript
import chalk from 'chalk';

/* User authentication check */
export function requireAuth( request , response , next ){
    if(!request.session || !request.session.userId){
        console.log(chalk.yellow(`Unauthorized access attempt to ${request.path}`));
        return response.status(401).json({
            error : 'Authentication Required.',
            message : 'Please log in to access this resource.'
        });
    }

    request.userId = request.session.userId;
    request.userRole = request.session.userRole;
    next();
}

/* User is staff member authentication check */
export function requireStaff( request , response , next ){
    if(!request.userRole || request.userRole !== 'staff'){
        console.log(chalk.yellow(`Staff-only access denied for user ${request.userId}`));
        return response.status(403).json({
            error : 'Forbidden.',
            message : 'This resource is for staff only.'
        });
    }
    next()
}

export function optionalAuth( request , response , next ){
    if(request.session && request.session.userId){
        request.userId = request.session.userId;
        request.userRole = request.session.userRole;
    }
    next();
}
```

**Usage:**

- `requireAuth` – on endpoints that require login (e.g., get user profile)
- `requireStaff` – on staff-only endpoints (chain after `requireAuth`)
- `optionalAuth` – on endpoints where data varies by user but login is optional

**Detailed Middleware Patterns Explained:**

**1. The `requireAuth` Middleware:**

```javascript
export function requireAuth(request, response, next) {
    if(!request.session || !request.session.userId){
        return response.status(401).json({
            error: 'Authentication required',
            message: 'Please log in to access this resource'
        });
    }
    request.userId = request.session.userId;
    request.userRole = request.session.role;
    next();  // Continue to next middleware/route handler
}
```

**How Express middleware works:**

- **`next()`:** Passes control to next middleware in chain
- **No `next()` call:** Chain stops (we sent response, don't continue)
- **`return` before `response.json()`:** Prevents "headers already sent" error

**Flow diagram:**

```
Request → requireAuth → next() → Route Handler → Response
                ↓ (if no session)
            401 JSON ← (stops here, doesn't reach route)
```

**Setting request properties:**

```javascript
request.userId = request.session.userId;
request.userRole = request.session.role;
```

- **Convenience pattern:** Downstream handlers use `request.userId` instead of `request.session.userId`
- **Shorter code:** `const userId = request.userId;` vs `const userId = request.session.userId;`
- **Type safety:** Later can add TypeScript types for `request.userId`

**2. The `requireStaff` Middleware (Chaining Pattern):**

```javascript
export function requireStaff(request, response, next) {
    if (!request.userRole || request.userRole !== 'staff') {
        return response.status(403).json({
            error: 'Forbidden',
            message: 'This resource is for staff only'
        });
    }
    next();
}
```

**Usage in routes:**

```javascript
router.get('/staff-metrics', requireAuth, requireStaff, async (req, res) => {
    // This handler only runs if BOTH middleware pass
    // 1. requireAuth checks if logged in
    // 2. requireStaff checks if role === 'staff'
});
```

**Why chain instead of combining?**

```javascript
// ❌ Don't do this (less reusable):
function requireStaffAuth(req, res, next) {
    if (!req.session.userId) { /* ... */ }
    if (req.userRole !== 'staff') { /* ... */ }
    next();
}

// ✅ Do this (composable):
router.get('/endpoint', requireAuth, requireStaff, handler);
router.get('/other', requireAuth, handler);  // Reuse requireAuth alone
```

**HTTP Status Code Best Practices:**

- **401 Unauthorized:** User not authenticated (needs to log in)
- **403 Forbidden:** User authenticated but lacks permission (role check failed)
- **Why it matters:** Clients can handle differently (401 → redirect to login, 403 → show "access denied" message)

**3. The `optionalAuth` Middleware:**

```javascript
export function optionalAuth(request, response, next) {
    if (request.session && request.session.userId) {
        request.userId = request.session.userId;
        request.userRole = request.session.role;
    }
    next();  // ALWAYS continue, even if not logged in
}
```

**Use cases:**

- **Public endpoints with personalization:** "Get all attractions" shows favorite indicators if logged in
- **No requirement to log in:** Anonymous users can still access
- **Conditional logic in handler:**

```javascript
router.get('/attractions', optionalAuth, async (req, res) => {
    const attractions = await query('SELECT * FROM attractions');
  
    if (req.userId) {
        // Logged in: Add user's favorite status
        const favorites = await query('SELECT attraction_id FROM favorites WHERE user_id = ?', [req.userId]);
        // ... merge data
    }
  
    // Not logged in: Just return basic attraction data
    res.json(attractions);
});
```

**4. Middleware Error Handling Pattern:**

```javascript
export function requireAuth(request, response, next) {
    if (!request.session || !request.session.userId) {
        console.log(chalk.yellow(`Unauthorized access attempt to ${request.path}`));
        return response.status(401).json({
            error: 'Authentication required',
            message: 'Please log in to access this resource'
        });
    }
    request.userId = request.session.userId;
    request.userRole = request.session.role;
    next();
}
```

**Why log unauthorized attempts?**

- **Security monitoring:** Repeated attempts to access protected routes may indicate attack
- **Debugging:** See which routes users try to access before logging in (UX improvement opportunity)
- **Audit trail:** Compliance requirements (GDPR, HIPAA) often require access logging

**5. Advanced Pattern: Role Hierarchy (Future Enhancement):**

```javascript
// For more complex apps with multiple roles (admin, staff, manager, etc.)
export function requireRole(...allowedRoles) {
    return (request, response, next) => {
        if (!allowedRoles.includes(request.userRole)) {
            return response.status(403).json({
                error: 'Forbidden',
                message: `This resource requires one of: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
}

// Usage:
router.get('/admin', requireAuth, requireRole('admin', 'super_admin'), handler);
router.get('/metrics', requireAuth, requireRole('staff', 'admin'), handler);
```

**Testing Middleware:**

```javascript
// Example test with Jest/Supertest
describe('requireAuth middleware', () => {
    it('should return 401 if no session', async () => {
        const res = await request(app)
            .get('/api/profile')
            .expect(401);
    
        expect(res.body.error).toBe('Authentication required');
    });
  
    it('should call next() if session exists', async () => {
        const res = await request(app)
            .get('/api/profile')
            .set('Cookie', 'session=valid_session_cookie')
            .expect(200);
    });
});
```

---

## Step 4: Authentication Routes (Login, Register, Logout)

### Goal

Implement user registration, login, logout with password hashing and session management.

### Files to Create

```
server-side/src/routes/
└── auth.js  (create)
```

### Step 4a: Create `routes/auth.js`

```javascript
import express, { request, response } from 'express';
import bcrypt from 'bcrypt';
import chalk from 'chalk';
import { query } from '../database/connection.js';

const router = express.Router();

/* user registration */

router.post( '/register' , async ( request , response )=>{
    try{
        /* Email and password destructuring from the main request body */
        const { email , password } = request.body
        if( !email || !password ){
            return response.status(400).json({
                error : 'Email and password are required.'
            });
        }

        /* Email format restriction */
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if( !emailRegex.test(email) ){
            return response.status(400).json({
                error : 'Invalid email format.'
            });
        }

        /* Password format restriction */
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if( !passwordRegex.test(password) ){
            return response.status(400).json({
                error : 'Password must be atleast 8 characters with uppercase, lowercase, number and special characters.'
            });
        }

        /* Verify email existence */
        const existingUsers = await query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if( existingUsers.length > 0){
            return response.status(400).json({
                error : 'Email already registered.'
            })
        }

        /* Password hashing */
        const passwordHash = await bcrypt.hash( password , 10 );

        /* Insert user into database */
        const result = await query(
            'INSERT INTO users (email,password_hash,role) VALUES ( ? , ? , ? )',
            [ email , passwordHash , 'visitor']
        );

        console.log(chalk.green(`New user registered:${email}`));

        response.status(201).json({
            message : 'Registration successful.',
            user : {
                id : result.insertId,
                email : email,
                role : 'visitor'
            }
        });
    }catch( error ){
        console.error(chalk.red(`Registration error:${error.message}`));
        response.status(500).json({
            error : 'Registration failed. Please try again.'
        });
    }
});

/* user login */

router.post('/login' , async ( request , response )=>{
    try{
        const { email , password } = request.body;

        /* input validation */
        if( !email || !password ){
            return response.status(400).json({
                error : 'Email and password are required.'
            });
        }

        /* fetch user by email */
        const users = await query(
            'SELECT id,email,password_hash,role FROM users WHERE email = ?',
            [email]
        );

        if( users.length === 0 ){
            return response.status(401).json({
                error : 'Invalid email or password.'
            });
        }

        const user = users[0];

        /* password comparison */
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if(!isValidPassword){
            return response.status(401).json({
                error : 'Invalid email or password.'
            });
        }

        /* session creation */
        request.session.userId = user.id;
        request.session.email = user.email;
        request.session.userRole = user.role;

        console.log(chalk.green(`User logged in:${email}`));

        response.status(200).json({
            message : 'Login successful.',
            user : {
                id : user.id,
                email : user.email,
                role : user.role
            }
        });
    } catch (error) {
        console.error(chalk.red(`Login error: ${error.message}`));
        response.status(500).json({
            error: 'Login failed. Please try again.'
        });
    }
});

/**
 * POST /api/auth/logout
 * Destroy session
 */
router.post('/logout', (request, response) => {
    request.session.destroy((err) => {
        if (err) {
            console.error(chalk.red(`Logout error: ${err.message}`));
            return response.status(500).json({
                error: 'Logout failed'
            });
        }
        console.log(chalk.green('✓ User logged out'));
        response.status(200).json({
            message: 'Logout successful'
        });
    });
});

/**
 * GET /api/auth/status
 * Check if user is authenticated
 * Returns user data if authenticated, or { isAuthenticated: false }
 */
router.get('/status', (request, response) => {
    if (request.session && request.session.userId) {
        return response.json({
            isAuthenticated: true,
            user: {
                id: request.session.userId,
                email: request.session.email,
                role: request.session.role
            }
        });
    }
    response.json({
        isAuthenticated: false
    });
});

export default router;
```

**Key Points:**

- Password regex enforces strong passwords (security)
- `bcrypt.hash(password, 10)` – hash with 10 salt rounds (slow, intentional)
- `request.session.userId` – persists across requests (session middleware handles cookies)
- `/status` endpoint – frontend calls on app load to check if user is still authenticated

**In-Depth Authentication Flow Explanation:**

**1. Password Validation Regex Breakdown:**

```javascript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
```

**Regex anatomy:**

- `^` and `$` – Match entire string (prevents bypass with extra chars)
- `(?=.*[a-z])` – Lookahead: at least one lowercase letter
- `(?=.*[A-Z])` – Lookahead: at least one uppercase letter
- `(?=.*\d)` – Lookahead: at least one digit (0-9)
- `(?=.*[^A-Za-z0-9])` – Lookahead: at least one special character
- `.{8,}` – Minimum 8 characters total

**Why strict password requirements?**

- **Prevents common passwords:** "password123" fails (no uppercase/special char)
- **Increases entropy:** More character variety = harder to crack
- **Industry standard:** Matches OWASP password guidelines

**Example valid passwords:** `MyP@ssw0rd`, `London2024!`, `Zoo#Tiger99`
**Example invalid passwords:** `password` (too simple), `PASSWORD123` (no lowercase), `MyPassword1` (no special char)

**2. Bcrypt Hashing Deep Dive:**

```javascript
const password_hash = await bcrypt.hash(password, 10);
```

**What are "salt rounds"?**

- **Salt:** Random data added to password before hashing (prevents rainbow table attacks)
- **Rounds (10):** Number of times bcrypt algorithm iterates (2^10 = 1024 iterations)
- **Each iteration doubles the time:** Makes brute-force exponentially slower

**Why 10 rounds?**

- **Balance security vs performance:**
  - 10 rounds ≈ 100ms per hash (acceptable for login)
  - 12 rounds ≈ 400ms (more secure, slower)
  - 8 rounds ≈ 25ms (faster, less secure)
- **Future-proof:** As computers get faster, increase rounds (bcrypt designed for this)

**Hash output example:**

```
Plain password: "MyP@ssw0rd"
Bcrypt hash: "$2b$10$N9qo8uLOickgx2ZMRZoMye1234567890abcdefghijklmnopqrstuv"
              ^   ^  ^                                            ^
              |   |  |                                            |
         Algorithm |  Salt (random, different every time)        Hash
                   |
              Cost factor (10 rounds)
```

**Key property: Same password ≠ same hash**

```javascript
bcrypt.hash("password123", 10) → "$2b$10$abc...xyz"
bcrypt.hash("password123", 10) → "$2b$10$def...uvw"  // Different!
```

This is why we use `bcrypt.compare()` instead of direct comparison.

**3. Registration Flow with Duplicate Check:**

```javascript
// Check if email already exists
const existingUser = await query(
    'SELECT id FROM users WHERE email = ?',
    [email]
);

if (existingUser.length > 0) {
    return response.status(409).json({
        error: 'Email already registered',
        message: 'An account with this email already exists.'
    });
}
```

**Why check before inserting?**

- **Better error message:** "Email already registered" vs "Duplicate key error: email_UNIQUE"
- **Security consideration:** Tells attacker email is registered (unavoidable with unique constraint)
- **HTTP 409 Conflict:** Correct status code for "resource already exists"

**Alternative approach (let database handle):**

```javascript
try {
    await query('INSERT INTO users ...', [email, hash]);
} catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email exists' });
    }
    throw error;  // Other errors
}
```

**4. Login Flow with Password Comparison:**

```javascript
const user = await query(
    'SELECT id, email, password_hash, role FROM users WHERE email = ?',
    [email]
);

if (user.length === 0) {
    return response.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password incorrect'
    });
}

const isValidPassword = await bcrypt.compare(password, user[0].password_hash);

if (!isValidPassword) {
    return response.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password incorrect'
    });
}
```

**Security best practice: Vague error messages**

- **Don't say:** "Email not found" or "Password incorrect"
- **Do say:** "Email or password incorrect"
- **Why?** Prevents attackers from enumerating registered emails

**Attack scenario:**

```
Attacker: Try login with random-email@test.com / password123
Server: "Email not found"
Attacker: Now I know that email isn't registered

Attacker: Try login with john@company.com / password123  
Server: "Password incorrect"
Attacker: Now I know John has an account! (Can phish him or brute-force)
```

**Timing attack consideration:**

```javascript
// ❌ Bad: Fast response if email doesn't exist, slow if password check needed
if (!user) return res.status(401);  // Instant
if (!await bcrypt.compare(...)) return res.status(401);  // ~100ms

// ✅ Better: Always take similar time (advanced security)
const hash = user ? user.password_hash : '$2b$10$invalid';
await bcrypt.compare(password, hash);  // Always runs bcrypt
if (!user || !isValid) return res.status(401);
```

**5. Session Creation:**

```javascript
request.session.userId = user[0].id;
request.session.role = user[0].role;

return response.json({
    message: 'Login successful',
    user: {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role
    }
});
```

**What happens behind the scenes:**

1. **Express-session middleware** sees session data changed
2. **Generates session ID** (random string, e.g., `s:J8fk2nD...`)
3. **Stores session data** in memory (or Redis/database in production)
4. **Sends cookie to browser:** `Set-Cookie: connect.sid=s:J8fk2nD...; HttpOnly; Path=/`
5. **Browser automatically sends cookie** on all future requests

**Session storage options:**

```javascript
// Development (default): MemoryStore (in-process, lost on restart)
app.use(session({ /* no store specified */ }));

// Production: Redis (shared across servers, persists)
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient();
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET
}));
```

**6. The /status Endpoint (Critical for React Apps):**

```javascript
router.get('/status', (request, response) => {
    if (request.session && request.session.userId) {
        return response.json({
            isAuthenticated: true,
            user: {
                id: request.session.userId,
                role: request.session.role
            }
        });
    }
    response.json({ isAuthenticated: false });
});
```

**Why this endpoint exists:**

- **Page refresh problem:** User logged in → refreshes page → React state lost
- **Frontend needs to know:** "Is this user still authenticated?"
- **Called on app mount:**

```javascript
useEffect(() => {
    async function checkAuth() {
        const data = await api.checkAuthStatus();
        if (data.isAuthenticated) {
            setUser(data.user);
        }
    }
    checkAuth();
}, []);
```

**Security note:**

- **No password sent:** Status check uses existing session cookie
- **Stateless from frontend perspective:** React doesn't store auth tokens, relies on HTTP-only cookie
- **XSS protection:** Even if attacker injects JS, can't steal session (HttpOnly flag)

---

## Step 5: Attractions Routes

### Goal

Create endpoints to fetch attractions list and individual attraction details with queue data.

### Files to Create

```
server-side/src/routes/
└── attractions.js  (create)
```

### Step 5a: Create `routes/attractions.js`

```javascript
import express from 'express';
import { query } from '../database/connections.js';
import { optionalAuth } from '../utils/middleware.js';

const router = express.Router();

/**
 * GET /api/attractions
 * Fetch all attractions with current queue status
 */
router.get('/', optionalAuth, async (request, response) => {
    try {
        const attractions = await query(`
            SELECT 
                a.id,
                a.name,
                a.description,
                a.category,
                a.latitude,
                a.longitude,
                a.estimated_duration_minutes,
                a.capacity,
                a.is_open,
                q.queue_length,
                q.estimated_wait_minutes,
                q.last_updated as queue_updated_at
            FROM attractions a
            LEFT JOIN queue_status q ON a.id = q.attraction_id
            WHERE a.is_open = TRUE
            ORDER BY a.name
        `);

        response.json({
            attractions: attractions
        });
    } catch (error) {
        console.error(`Error fetching attractions: ${error.message}`);
        response.status(500).json({
            error: 'Failed to fetch attractions'
        });
    }
});

/**
 * GET /api/attractions/:id
 * Fetch single attraction with detailed queue info
 * Param: id – attraction ID
 */
router.get('/:id', optionalAuth, async (request, response) => {
    try {
        const { id } = request.params;

        // Validate ID is a number
        if (isNaN(id) || id <= 0) {
            return response.status(400).json({
                error: 'Invalid attraction ID'
            });
        }

        const attractions = await query(`
            SELECT 
                a.id,
                a.name,
                a.description,
                a.category,
                a.latitude,
                a.longitude,
                a.estimated_duration_minutes,
                a.capacity,
                a.is_open,
                q.queue_length,
                q.estimated_wait_minutes,
                q.last_updated as queue_updated_at
            FROM attractions a
            LEFT JOIN queue_status q ON a.id = q.attraction_id
            WHERE a.id = ?
        `, [id]);

        if (attractions.length === 0) {
            return response.status(404).json({
                error: 'Attraction not found'
            });
        }

        response.json({
            attraction: attractions[0]
        });
    } catch (error) {
        console.error(`Error fetching attraction: ${error.message}`);
        response.status(500).json({
            error: 'Failed to fetch attraction'
        });
    }
});

export default router;
```

**Explanation:**

- `LEFT JOIN queue_status` – includes queue data even if no queue record exists
- `WHERE a.is_open = TRUE` – only show open attractions
- `optionalAuth` – endpoint works for logged-in and logged-out users
- Data includes lat/lon for distance calculation on frontend

**SQL Query Patterns Explained:**

**1. The LEFT JOIN Pattern:**

```sql
SELECT 
    a.id, a.name, a.description, a.category,
    a.latitude, a.longitude,
    COALESCE(q.queue_length, 0) AS queue_length,
    COALESCE(q.estimated_wait_minutes, 0) AS estimated_wait_minutes,
    q.last_updated
FROM attractions a
LEFT JOIN queue_status q ON a.id = q.attraction_id
WHERE a.is_open = TRUE
ORDER BY a.name;
```

**Why LEFT JOIN instead of INNER JOIN?**

- **LEFT JOIN:** Returns ALL attractions, even if no queue data exists
- **INNER JOIN:** Only returns attractions WITH queue data
- **Scenario:** New attraction added but no queue record yet → should still appear in list

**Visual example:**

```
attractions table:
| id | name           | is_open |
|----|----------------|---------|
| 1  | African Savanna| TRUE    |
| 2  | Penguin Pool   | TRUE    |
| 3  | Reptile House  | FALSE   |

queue_status table:
| attraction_id | queue_length | estimated_wait |
|---------------|--------------|----------------|
| 1             | 15           | 20             |

INNER JOIN result (missing Penguin Pool!):
| name           | queue_length |
|----------------|--------------|
| African Savanna| 15           |

LEFT JOIN result (all open attractions):
| name           | queue_length |
|----------------|--------------|
| African Savanna| 15           |
| Penguin Pool   | NULL         |
```

**2. COALESCE Function:**

```sql
COALESCE(q.queue_length, 0) AS queue_length
```

**What it does:**

- Returns first non-NULL value
- `COALESCE(NULL, 0)` → `0`
- `COALESCE(15, 0)` → `15`

**Why use it?**

- **Consistent data type:** Frontend always gets number, never `null`
- **Prevents errors:** `null + 5` = error, `0 + 5` = `5`
- **Better UX:** "0 people waiting" vs "undefined people waiting"

**3. Filtering Closed Attractions:**

```sql
WHERE a.is_open = TRUE
```

**Business logic in database:**

- **Could filter in JavaScript:** Fetch all, then `attractions.filter(a => a.is_open)`
- **Better in SQL:**
  - Less data transferred (network efficiency)
  - Leverages database index on `is_open` column
  - Centralizes business rule (all queries get same logic)

**4. Optional Authentication Pattern:**

```javascript
router.get('/', optionalAuth, async (request, response) => {
    // request.userId might be undefined (not logged in)
    // or a number (logged in)
  
    const attractions = await query(`...`);
  
    // Future enhancement: If logged in, add favorite status
    if (request.userId) {
        // Fetch user's favorite attractions
        const favorites = await query(
            'SELECT attraction_id FROM favorites WHERE user_id = ?',
            [request.userId]
        );
        const favoriteIds = new Set(favorites.map(f => f.attraction_id));
    
        // Add isFavorite flag to each attraction
        attractions.forEach(a => {
            a.isFavorite = favoriteIds.has(a.id);
        });
    }
  
    response.json(attractions);
});
```

**Why optionalAuth here?**

- **Public data:** Anyone should see attractions (even not logged in)
- **Personalization:** Logged-in users get extra features (favorites)
- **Progressive enhancement:** Basic functionality for all, enhanced for authenticated

**5. Route Parameter Handling:**

```javascript
router.get('/:id', optionalAuth, async (request, response) => {
    const { id } = request.params;  // Extract from URL
  
    // Validate ID is a number
    if (!id || isNaN(id)) {
        return response.status(400).json({
            error: 'Invalid attraction ID'
        });
    }
  
    const attraction = await query(`
        SELECT ...
        WHERE a.id = ? AND a.is_open = TRUE
    `, [id]);
  
    if (attraction.length === 0) {
        return response.status(404).json({
            error: 'Attraction not found'
        });
    }
  
    response.json(attraction[0]);  // Return single object, not array
});
```

**Common mistakes to avoid:**

**❌ Don't trust user input:**

```javascript
// Vulnerable to SQL injection!
const attraction = await query(`SELECT * FROM attractions WHERE id = ${id}`);
```

**✅ Always use parameterized queries:**

```javascript
const attraction = await query('SELECT * FROM attractions WHERE id = ?', [id]);
```

**❌ Don't return arrays when expecting one result:**

```javascript
response.json(attraction);  // Returns [{ id: 1, ... }] - client needs [0]
```

**✅ Return single object:**

```javascript
response.json(attraction[0]);  // Returns { id: 1, ... } - cleaner API
```

**6. Consistent Error Responses:**

```javascript
// 400 Bad Request - Client error (invalid input)
return response.status(400).json({
    error: 'Invalid attraction ID',
    message: 'ID must be a positive integer'
});

// 404 Not Found - Resource doesn't exist
return response.status(404).json({
    error: 'Attraction not found',
    message: 'No attraction found with that ID'
});

// 500 Internal Server Error - Server error (caught by global handler)
throw new Error('Database connection failed');
```

**HTTP status code guide:**

- **200 OK:** Successful GET/PATCH
- **201 Created:** Successful POST (new resource)
- **400 Bad Request:** Invalid input (validation failed)
- **401 Unauthorized:** Not logged in
- **403 Forbidden:** Logged in but insufficient permissions
- **404 Not Found:** Resource doesn't exist
- **409 Conflict:** Resource already exists (duplicate email)
- **500 Internal Server Error:** Unexpected server error

**Frontend error handling:**

```javascript
try {
    const attraction = await api.getAttraction(id);
    setAttraction(attraction);
} catch (error) {
    if (error.status === 404) {
        setError('Attraction not found');
    } else if (error.status === 400) {
        setError('Invalid ID provided');
    } else {
        setError('Something went wrong');
    }
}
```

---

## Step 6: Queue Status Routes

### Goal

Provide real-time queue information. In production, this would be updated by staff; here we'll provide GET endpoints and a simple admin update endpoint.

### Files to Create

```
server-side/src/routes/
└── queue.js  (create)
```

### Step 6a: Create `routes/queue.js`

```javascript
import express from 'express';
import { query } from '../database/connections.js';
import { optionalAuth, requireAuth, requireStaff } from '../utils/middleware.js';

const router = express.Router();

/**
 * GET /api/queue/:attractionId
 * Fetch queue status for specific attraction
 */
router.get('/:attractionId', optionalAuth, async (request, response) => {
    try {
        const { attractionId } = request.params;

        if (isNaN(attractionId) || attractionId <= 0) {
            return response.status(400).json({
                error: 'Invalid attraction ID'
            });
        }

        const queueData = await query(`
            SELECT 
                qs.id,
                qs.attraction_id,
                a.name as attraction_name,
                qs.queue_length,
                qs.estimated_wait_minutes,
                qs.last_updated
            FROM queue_status qs
            JOIN attractions a ON qs.attraction_id = a.id
            WHERE qs.attraction_id = ?
        `, [attractionId]);

        if (queueData.length === 0) {
            return response.status(404).json({
                error: 'Queue status not found'
            });
        }

        response.json({
            queue: queueData[0]
        });
    } catch (error) {
        console.error(`Error fetching queue: ${error.message}`);
        response.status(500).json({
            error: 'Failed to fetch queue status'
        });
    }
});

/**
 * PATCH /api/queue/:attractionId
 * Update queue status (staff only)
 * Body: { queue_length, estimated_wait_minutes }
 */
router.patch('/:attractionId', requireAuth, requireStaff, async (request, response) => {
    try {
        const { attractionId } = request.params;
        const { queue_length, estimated_wait_minutes } = request.body;

        // Validate inputs
        if (isNaN(attractionId) || attractionId <= 0) {
            return response.status(400).json({
                error: 'Invalid attraction ID'
            });
        }

        if (queue_length === undefined || isNaN(queue_length) || queue_length < 0) {
            return response.status(400).json({
                error: 'queue_length must be a non-negative number'
            });
        }

        if (estimated_wait_minutes === undefined || isNaN(estimated_wait_minutes) || estimated_wait_minutes < 0) {
            return response.status(400).json({
                error: 'estimated_wait_minutes must be a non-negative number'
            });
        }

        // Update queue status
        await query(`
            UPDATE queue_status 
            SET queue_length = ?, estimated_wait_minutes = ?
            WHERE attraction_id = ?
        `, [queue_length, estimated_wait_minutes, attractionId]);

        // Fetch updated record
        const updated = await query(`
            SELECT * FROM queue_status WHERE attraction_id = ?
        `, [attractionId]);

        response.json({
            message: 'Queue status updated',
            queue: updated[0]
        });
    } catch (error) {
        console.error(`Error updating queue: ${error.message}`);
        response.status(500).json({
            error: 'Failed to update queue status'
        });
    }
});

/**
 * GET /api/queue
 * Fetch all attractions queue status
 */
router.get('/', optionalAuth, async (request, response) => {
    try {
        const allQueues = await query(`
            SELECT 
                qs.id,
                qs.attraction_id,
                a.name as attraction_name,
                qs.queue_length,
                qs.estimated_wait_minutes,
                qs.last_updated
            FROM queue_status qs
            JOIN attractions a ON qs.attraction_id = a.id
            ORDER BY a.name
        `);

        response.json({
            queues: allQueues
        });
    } catch (error) {
        console.error(`Error fetching all queues: ${error.message}`);
        response.status(500).json({
            error: 'Failed to fetch queue statuses'
        });
    }
});

export default router;
```

**Key Points:**

- `GET /api/queue/:attractionId` – public endpoint (optionalAuth)
- `PATCH /api/queue/:attractionId` – staff-only update
- Input validation ensures queue_length and wait_minutes are non-negative

---

## Step 7: Notifications Routes

### Goal

Allow users to subscribe/unsubscribe from alerts and retrieve their notifications.

### Files to Create

```
server-side/src/routes/
└── notifications.js  (create)
```

### Step 7a: Create `routes/notifications.js`

```javascript
import express from 'express';
import { query } from '../database/connections.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

/**
 * POST /api/notifications/subscribe
 * Enable notifications for the logged-in user
 */
router.post('/subscribe', requireAuth, async (request, response) => {
    try {
        const userId = request.userId;

        // Check if preference record exists
        const prefs = await query(
            'SELECT id FROM user_preferences WHERE user_id = ?',
            [userId]
        );

        if (prefs.length === 0) {
            // Create new preference record
            await query(
                'INSERT INTO user_preferences (user_id, notifications_enabled) VALUES (?, TRUE)',
                [userId]
            );
        } else {
            // Update existing
            await query(
                'UPDATE user_preferences SET notifications_enabled = TRUE WHERE user_id = ?',
                [userId]
            );
        }

        response.json({
            message: 'Notifications enabled'
        });
    } catch (error) {
        console.error(`Subscription error: ${error.message}`);
        response.status(500).json({
            error: 'Failed to enable notifications'
        });
    }
});

/**
 * POST /api/notifications/unsubscribe
 * Disable notifications for the logged-in user
 */
router.post('/unsubscribe', requireAuth, async (request, response) => {
    try {
        const userId = request.userId;

        const prefs = await query(
            'SELECT id FROM user_preferences WHERE user_id = ?',
            [userId]
        );

        if (prefs.length === 0) {
            // Create new preference record with notifications disabled
            await query(
                'INSERT INTO user_preferences (user_id, notifications_enabled) VALUES (?, FALSE)',
                [userId]
            );
        } else {
            // Update existing
            await query(
                'UPDATE user_preferences SET notifications_enabled = FALSE WHERE user_id = ?',
                [userId]
            );
        }

        response.json({
            message: 'Notifications disabled'
        });
    } catch (error) {
        console.error(`Unsubscribe error: ${error.message}`);
        response.status(500).json({
            error: 'Failed to disable notifications'
        });
    }
});

/**
 * GET /api/notifications
 * Fetch unread notifications for logged-in user
 */
router.get('/', requireAuth, async (request, response) => {
    try {
        const userId = request.userId;
        const limit = request.query.limit || 20;

        const notifications = await query(`
            SELECT 
                n.id,
                n.user_id,
                n.attraction_id,
                n.type,
                n.message,
                n.is_read,
                n.created_at,
                a.name as attraction_name
            FROM notifications n
            LEFT JOIN attractions a ON n.attraction_id = a.id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
            LIMIT ?
        `, [userId, parseInt(limit)]);

        response.json({
            notifications: notifications
        });
    } catch (error) {
        console.error(`Error fetching notifications: ${error.message}`);
        response.status(500).json({
            error: 'Failed to fetch notifications'
        });
    }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', requireAuth, async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.userId;

        // Verify notification belongs to user
        const notifs = await query(
            'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (notifs.length === 0) {
            return response.status(404).json({
                error: 'Notification not found'
            });
        }

        await query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ?',
            [id]
        );

        response.json({
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error(`Error marking notification: ${error.message}`);
        response.status(500).json({
            error: 'Failed to update notification'
        });
    }
});

export default router;
```

**Key Points:**

- `POST /subscribe` – create preference record if doesn't exist
- `GET /notifications` – only returns logged-in user's notifications
- `PATCH /:id/read` – verify user owns notification before updating
- In production, consider WebSockets for real-time push (out of scope here)

---

## Step 8: Navigation (ETA) Routes

### Goal

Calculate estimated distance and time from user's current location to a chosen attraction.

### Files to Create

```
server-side/src/routes/
└── navigation.js  (create)
```

### Step 8a: Create `routes/navigation.js`

```javascript
import express from 'express';
import { query } from '../database/connections.js';
import { optionalAuth } from '../utils/middleware.js';

const router = express.Router();

/**
 * Helper: Calculate distance between two lat/lon points (Haversine formula)
 * Returns distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * POST /api/navigation/eta
 * Calculate ETA from current location to attraction
 * Body: { 
 *   user_latitude, user_longitude (current location), 
 *   attraction_id (destination)
 * }
 * Returns: { distance_meters, distance_km, estimated_time_minutes }
 */
router.post('/eta', optionalAuth, async (request, response) => {
    try {
        const { user_latitude, user_longitude, attraction_id } = request.body;

        // Validate inputs
        if (user_latitude === undefined || user_longitude === undefined) {
            return response.status(400).json({
                error: 'user_latitude and user_longitude are required'
            });
        }

        if (isNaN(user_latitude) || isNaN(user_longitude)) {
            return response.status(400).json({
                error: 'Coordinates must be valid numbers'
            });
        }

        if (!attraction_id || isNaN(attraction_id)) {
            return response.status(400).json({
                error: 'attraction_id is required'
            });
        }

        // Fetch attraction
        const attractions = await query(
            'SELECT id, latitude, longitude, name FROM attractions WHERE id = ?',
            [attraction_id]
        );

        if (attractions.length === 0) {
            return response.status(404).json({
                error: 'Attraction not found'
            });
        }

        const attraction = attractions[0];

        // Calculate distance
        const distanceMeters = calculateDistance(
            user_latitude,
            user_longitude,
            parseFloat(attraction.latitude),
            parseFloat(attraction.longitude)
        );

        // Estimate walking time (assume 1.4 m/s average walking speed)
        const walkingSpeedMs = 1.4;
        const estimatedSeconds = distanceMeters / walkingSpeedMs;
        const estimatedMinutes = Math.round(estimatedSeconds / 60);

        response.json({
            attraction_id: attraction.id,
            attraction_name: attraction.name,
            distance_meters: Math.round(distanceMeters),
            distance_km: (distanceMeters / 1000).toFixed(2),
            estimated_walk_time_minutes: Math.max(1, estimatedMinutes)  // At least 1 minute
        });
    } catch (error) {
        console.error(`Error calculating ETA: ${error.message}`);
        response.status(500).json({
            error: 'Failed to calculate ETA'
        });
    }
});

export default router;
```

**Key Points:**

- Haversine formula calculates great-circle distance between two points on Earth
- Assumes average walking speed of 1.4 m/s (~5 km/h)
- Returns both meters and kilometers for flexibility
- Rounds time to nearest minute (minimum 1 minute)

**Note:** In production, integrate with Google Maps API for turn-by-turn directions.

**Geospatial Mathematics Explained:**

**1. Haversine Formula Deep Dive:**

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
```

**Why Haversine?**

- **Earth is a sphere:** Pythagorean theorem (√(x² + y²)) doesn't work on curved surfaces
- **Great-circle distance:** Shortest path between two points on a sphere
- **Alternative formulas:**
  - Vincenty (more accurate, much more complex)
  - Simple approximation (only works for small distances)

**Formula breakdown:**

1. **Convert degrees to radians:** `lat * π / 180` (trigonometry functions use radians)
2. **Calculate differences:** `dLat` and `dLon`
3. **Haversine of angle:** `a = sin²(dLat/2) + cos(lat1) * cos(lat2) * sin²(dLon/2)`
4. **Angular distance:** `c = 2 * atan2(√a, √(1-a))`
5. **Linear distance:** `distance = radius * c`

**Accuracy:**

- **Earth radius:** 6,371 km (mean radius, varies by ~21km pole-to-equator)
- **Error margin:** ±0.5% for distances < 500km
- **Good enough for:** Zoo navigation (< 2km distances)
- **Not good enough for:** Aviation, GPS navigation (use Vincenty)

**Example calculation:**

```
Point A (London Zoo entrance): 51.5355°N, 0.1512°W
Point B (Penguin Pool): 51.5350°N, 0.1507°W

dLat = (51.5350 - 51.5355) * π/180 = -0.0000872 radians
dLon = (-0.1507 - (-0.1512)) * π/180 = 0.0000872 radians

a = sin²(-0.0000436) + cos(51.5355°) * cos(51.5350°) * sin²(0.0000436)
a ≈ 0.000000003808

c = 2 * atan2(√0.000000003808, √0.999999996192)
c ≈ 0.0001236 radians

distance = 6,371,000 m * 0.0001236
distance ≈ 787 meters
```

**2. Walking Speed Calculation:**

```javascript
const walking_speed_mps = 1.4; // meters per second
const estimated_time_minutes = Math.max(
    1,
    Math.round(distance_meters / (walking_speed_mps * 60))
);
```

**Why 1.4 m/s?**

- **Average human walking speed:** 1.4 m/s = 5 km/h = 3.1 mph
- **Accounts for:**
  - Casual walking (not rushing)
  - Families with children
  - Looking at exhibits while walking
- **Could enhance:** Adjust based on user preference (slow/normal/fast)

**Formula:**

```
Distance: 787 meters
Time = 787 / (1.4 m/s * 60 s/min)
Time = 787 / 84
Time ≈ 9.4 minutes
Rounded = 9 minutes
```

**Why `Math.max(1, ...)`?**

- **Prevents "0 minutes":** Even if 10 meters away, show "1 minute"
- **User expectation:** "0 minutes" feels broken, "1 minute" is acceptable

**3. API Endpoint Design:**

```javascript
router.post('/eta', optionalAuth, async (request, response) => {
    const { user_latitude, user_longitude, attraction_id } = request.body;
  
    // Input validation
    if (!user_latitude || !user_longitude || !attraction_id) {
        return response.status(400).json({
            error: 'Missing required parameters',
            message: 'user_latitude, user_longitude, and attraction_id are required'
        });
    }
  
    // Validate latitude range (-90 to 90)
    if (user_latitude < -90 || user_latitude > 90) {
        return response.status(400).json({
            error: 'Invalid latitude',
            message: 'Latitude must be between -90 and 90'
        });
    }
  
    // Validate longitude range (-180 to 180)
    if (user_longitude < -180 || user_longitude > 180) {
        return response.status(400).json({
            error: 'Invalid longitude',
            message: 'Longitude must be between -180 and 180'
        });
    }
  
    // ... rest of endpoint
});
```

**Why validate coordinates?**

- **Prevents calculation errors:** Invalid values cause `NaN` results
- **Security:** Malicious input (e.g., strings) could crash server
- **Clear error messages:** "Invalid latitude" vs "NaN result"

**4. Frontend Integration Pattern:**

```javascript
// React component using Geolocation API
async function getDirections(attractionId) {
    if (!navigator.geolocation) {
        setError('Geolocation not supported by your browser');
        return;
    }
  
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
        
            try {
                const eta = await api.calculateETA(
                    latitude,
                    longitude,
                    attractionId
                );
            
                setETA({
                    distance: eta.distance_km,
                    time: eta.estimated_time_minutes,
                    accuracy: position.coords.accuracy  // meters
                });
            } catch (error) {
                setError('Failed to calculate route');
            }
        },
        (error) => {
            if (error.code === error.PERMISSION_DENIED) {
                setError('Location permission denied');
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                setError('Location unavailable');
            } else {
                setError('Location timeout');
            }
        },
        {
            enableHighAccuracy: true,  // Use GPS if available
            timeout: 10000,            // 10 second timeout
            maximumAge: 60000          // Accept 1-minute-old location
        }
    );
}
```

**Geolocation API considerations:**

- **User permission required:** Browser shows "Allow location access?" prompt
- **Accuracy varies:**
  - GPS: 5-10 meters
  - WiFi: 20-50 meters
  - Cell tower: 100-1000 meters
- **Battery drain:** `enableHighAccuracy: true` uses more battery (worth it for navigation)

**5. Production Enhancements:**

**Use routing API (Google Maps, Mapbox):**

```javascript
// Instead of straight-line distance, get walking route
const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${user_lat},${user_lon}&` +
    `destination=${attraction_lat},${attraction_lon}&` +
    `mode=walking&` +
    `key=${process.env.GOOGLE_MAPS_API_KEY}`
);

const data = await response.json();
const route = data.routes[0];

return {
    distance_meters: route.legs[0].distance.value,
    estimated_time_minutes: Math.round(route.legs[0].duration.value / 60),
    steps: route.legs[0].steps.map(step => ({
        instruction: step.html_instructions,
        distance: step.distance.text
    }))
};
```

**Benefits of routing API:**

- **Follows paths:** Accounts for walkways, not straight line
- **Turn-by-turn:** "Turn left at Tiger Exhibit"
- **Obstacles:** Avoids walls, water features
- **Real-time:** Considers temporary path closures

**Cost consideration:**

- Google Maps: $5 per 1000 requests (first $200/month free)
- Mapbox: $0.75 per 1000 requests
- For zoo with 10,000 daily route requests: ~$3-5/day

---

## Step 9: User Profile & Preferences Routes

### Goal

Allow users to view and update their profile and notification preferences.

### Files to Create

```
server-side/src/routes/
└── profile.js  (create)
```

### Step 9a: Create `routes/profile.js`

```javascript
import express from 'express';
import { query } from '../database/connections.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

/**
 * GET /api/profile
 * Fetch logged-in user's profile and preferences
 */
router.get('/', requireAuth, async (request, response) => {
    try {
        const userId = request.userId;

        // Fetch user
        const users = await query(
            'SELECT id, email, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return response.status(404).json({
                error: 'User not found'
            });
        }

        // Fetch preferences
        const prefs = await query(
            'SELECT * FROM user_preferences WHERE user_id = ?',
            [userId]
        );

        const user = users[0];
        const preferences = prefs.length > 0 ? prefs[0] : null;

        response.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            },
            preferences: preferences
        });
    } catch (error) {
        console.error(`Error fetching profile: ${error.message}`);
        response.status(500).json({
            error: 'Failed to fetch profile'
        });
    }
});

/**
 * PATCH /api/profile/preferences
 * Update user preferences
 * Body: { 
 *   notifications_enabled (boolean),
 *   preferred_attractions (JSON string: ["giraffes", "penguins"]),
 *   distance_alert_threshold (number in meters)
 * }
 */
router.patch('/preferences', requireAuth, async (request, response) => {
    try {
        const userId = request.userId;
        const { notifications_enabled, preferred_attractions, distance_alert_threshold } = request.body;

        // Validate inputs (all optional for PATCH)
        if (notifications_enabled !== undefined && typeof notifications_enabled !== 'boolean') {
            return response.status(400).json({
                error: 'notifications_enabled must be a boolean'
            });
        }

        if (preferred_attractions !== undefined && typeof preferred_attractions !== 'string') {
            return response.status(400).json({
                error: 'preferred_attractions must be a JSON string'
            });
        }

        if (distance_alert_threshold !== undefined && (isNaN(distance_alert_threshold) || distance_alert_threshold < 0)) {
            return response.status(400).json({
                error: 'distance_alert_threshold must be a non-negative number'
            });
        }

        // Check if preferences exist
        const prefs = await query(
            'SELECT id FROM user_preferences WHERE user_id = ?',
            [userId]
        );

        if (prefs.length === 0) {
            // Create new preferences
            await query(
                `INSERT INTO user_preferences 
                 (user_id, notifications_enabled, preferred_attractions, distance_alert_threshold) 
                 VALUES (?, ?, ?, ?)`,
                [
                    userId,
                    notifications_enabled ?? true,
                    preferred_attractions ?? null,
                    distance_alert_threshold ?? 500
                ]
            );
        } else {
            // Update existing
            const updateFields = [];
            const updateValues = [];

            if (notifications_enabled !== undefined) {
                updateFields.push('notifications_enabled = ?');
                updateValues.push(notifications_enabled);
            }
            if (preferred_attractions !== undefined) {
                updateFields.push('preferred_attractions = ?');
                updateValues.push(preferred_attractions);
            }
            if (distance_alert_threshold !== undefined) {
                updateFields.push('distance_alert_threshold = ?');
                updateValues.push(distance_alert_threshold);
            }

            if (updateFields.length > 0) {
                updateValues.push(userId);
                await query(
                    `UPDATE user_preferences SET ${updateFields.join(', ')} WHERE user_id = ?`,
                    updateValues
                );
            }
        }

        // Return updated preferences
        const updated = await query(
            'SELECT * FROM user_preferences WHERE user_id = ?',
            [userId]
        );

        response.json({
            message: 'Preferences updated',
            preferences: updated[0]
        });
    } catch (error) {
        console.error(`Error updating preferences: ${error.message}`);
        response.status(500).json({
            error: 'Failed to update preferences'
        });
    }
});

export default router;
```

**Key Points:**

- `GET /profile` – returns user AND preferences together
- `PATCH /preferences` – all fields optional; creates record if doesn't exist
- `preferred_attractions` – stored as JSON string (can query with MySQL JSON functions if needed)

---

## Step 10: Staff Metrics Routes (Dashboard Data)

### Goal

Provide endpoints for staff to view performance metrics (ticket sales, uptime, visitor count) with filtering by date range and attraction.

### Files to Create

```
server-side/src/routes/
└── staff-metrics.js  (create)
```

### Step 10a: Create `routes/staff-metrics.js`

```javascript
import express from 'express';
import { query } from '../database/connections.js';
import { requireAuth, requireStaff } from '../utils/middleware.js';

const router = express.Router();

/**
 * GET /api/staff-metrics
 * Fetch metrics for all attractions (with optional date range filter)
 * Query params:
 *   - from_date (YYYY-MM-DD, optional)
 *   - to_date (YYYY-MM-DD, optional)
 *   - attraction_id (optional, single attraction)
 */
router.get('/', requireAuth, requireStaff, async (request, response) => {
    try {
        const { from_date, to_date, attraction_id } = request.query;

        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];

        if (from_date) {
            whereConditions.push('sm.metric_date >= ?');
            queryParams.push(from_date);
        }
        if (to_date) {
            whereConditions.push('sm.metric_date <= ?');
            queryParams.push(to_date);
        }
        if (attraction_id) {
            whereConditions.push('sm.attraction_id = ?');
            queryParams.push(attraction_id);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        const metrics = await query(`
            SELECT 
                sm.id,
                sm.attraction_id,
                a.name as attraction_name,
                sm.metric_date,
                sm.ticket_sales,
                sm.uptime_percentage,
                sm.visitors_count,
                sm.avg_wait_time_minutes,
                sm.recorded_at
            FROM staff_metrics sm
            JOIN attractions a ON sm.attraction_id = a.id
            ${whereClause}
            ORDER BY sm.metric_date DESC, a.name
        `, queryParams);

        response.json({
            metrics: metrics,
            filters: {
                from_date: from_date || null,
                to_date: to_date || null,
                attraction_id: attraction_id || null
            }
        });
    } catch (error) {
        console.error(`Error fetching metrics: ${error.message}`);
        response.status(500).json({
            error: 'Failed to fetch metrics'
        });
    }
});

/**
 * GET /api/staff-metrics/summary
 * Get aggregated metrics summary for a date range
 * Query params: from_date, to_date (optional)
 */
router.get('/summary', requireAuth, requireStaff, async (request, response) => {
    try {
        const { from_date, to_date } = request.query;

        let whereClause = '';
        let queryParams = [];

        if (from_date || to_date) {
            const conditions = [];
            if (from_date) {
                conditions.push('sm.metric_date >= ?');
                queryParams.push(from_date);
            }
            if (to_date) {
                conditions.push('sm.metric_date <= ?');
                queryParams.push(to_date);
            }
            whereClause = `WHERE ${conditions.join(' AND ')}`;
        }

        const summary = await query(`
            SELECT 
                COUNT(DISTINCT sm.attraction_id) as num_attractions,
                SUM(sm.ticket_sales) as total_ticket_sales,
                ROUND(AVG(sm.uptime_percentage), 2) as avg_uptime_percentage,
                SUM(sm.visitors_count) as total_visitors,
                ROUND(AVG(sm.avg_wait_time_minutes), 2) as avg_wait_time_minutes,
                MIN(sm.metric_date) as period_start,
                MAX(sm.metric_date) as period_end
            FROM staff_metrics sm
            ${whereClause}
        `, queryParams);

        response.json({
            summary: summary[0],
            filters: {
                from_date: from_date || null,
                to_date: to_date || null
            }
        });
    } catch (error) {
        console.error(`Error fetching summary: ${error.message}`);
        response.status(500).json({
            error: 'Failed to fetch summary'
        });
    }
});

/**
 * POST /api/staff-metrics
 * Record/update metrics for an attraction (staff only)
 * Body: {
 *   attraction_id,
 *   metric_date (YYYY-MM-DD),
 *   ticket_sales,
 *   uptime_percentage,
 *   visitors_count,
 *   avg_wait_time_minutes
 * }
 */
router.post('/', requireAuth, requireStaff, async (request, response) => {
    try {
        const { attraction_id, metric_date, ticket_sales, uptime_percentage, visitors_count, avg_wait_time_minutes } = request.body;

        // Validate required fields
        if (!attraction_id || !metric_date) {
            return response.status(400).json({
                error: 'attraction_id and metric_date are required'
            });
        }

        // Validate data types
        if (isNaN(attraction_id) || isNaN(ticket_sales) || isNaN(uptime_percentage) || isNaN(visitors_count)) {
            return response.status(400).json({
                error: 'All metrics must be numbers'
            });
        }

        // Validate percentages
        if (uptime_percentage < 0 || uptime_percentage > 100) {
            return response.status(400).json({
                error: 'uptime_percentage must be between 0 and 100'
            });
        }

        // Insert or update
        await query(`
            INSERT INTO staff_metrics 
            (attraction_id, metric_date, ticket_sales, uptime_percentage, visitors_count, avg_wait_time_minutes)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            ticket_sales = VALUES(ticket_sales),
            uptime_percentage = VALUES(uptime_percentage),
            visitors_count = VALUES(visitors_count),
            avg_wait_time_minutes = VALUES(avg_wait_time_minutes)
        `, [attraction_id, metric_date, ticket_sales, uptime_percentage, visitors_count, avg_wait_time_minutes]);

        response.json({
            message: 'Metrics recorded successfully'
        });
    } catch (error) {
        console.error(`Error recording metrics: ${error.message}`);
        response.status(500).json({
            error: 'Failed to record metrics'
        });
    }
});

export default router;
```

**Key Points:**

- `GET /` – list all metrics with optional filters (date range, attraction)
- `GET /summary` – aggregated totals for analysis
- `POST /` – record/update daily metrics; uses `ON DUPLICATE KEY UPDATE` for upserting
- All endpoints require `requireAuth` + `requireStaff` middleware
- Uptime percentage validated 0–100

---

## Step 11: Create `utils/index.js` (Helper Functions)

### Goal

Centralize utility functions for validation, error handling, etc.

```javascript
/**
 * Validate email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return passwordRegex.test(password);
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}
```

---

## Step 12: Backend Testing & Verification

### Goal

Verify all endpoints work before moving to frontend.

### Manual Test Checklist

**Setup:**

1. Ensure MySQL is running and `.env` is configured
2. Run `npm install` in `server-side/`
3. Run `npm run dev` (starts on `http://localhost:5000`)
4. Open Postman or use `curl` / Thunder Client

**Auth Tests:**

```bash
# Register
POST http://localhost:5000/api/auth/register
Body: { "email": "visitor@london-zoo.co.uk", "password": "Visitor123!" }

# Login
POST http://localhost:5000/api/auth/login
Body: { "email": "visitor@london-zoo.co.uk", "password": "Visitor123!" }

# Check status
GET http://localhost:5000/api/auth/status
```

**Attractions Tests:**

```bash
GET http://localhost:5000/api/attractions
GET http://localhost:5000/api/attractions/1
```

**Queue Tests:**

```bash
GET http://localhost:5000/api/queue/1
```

**Navigation Tests:**

```bash
POST http://localhost:5000/api/navigation/eta
Body: {
  "user_latitude": 51.535,
  "user_longitude": -0.151,
  "attraction_id": 1
}
```

**Staff Metrics Tests (must be logged in as staff):**

```bash
GET http://localhost:5000/api/staff-metrics?from_date=2024-01-01&to_date=2024-12-31
GET http://localhost:5000/api/staff-metrics/summary
```

---

# Frontend Tutorial

## Step 1: React Project Setup

### Goal

Initialize React app with routing and API configuration.

### Files to Modify/Create

```
client-side/
├── src/
│   ├── App.jsx          (modify)
│   ├── App.css
│   ├── index.jsx
│   ├── api/
│   │   └── api.js       (create)
│   ├── context/
│   │   └── AuthContext.jsx  (create)
│   ├── components/
│   │   └── Navigation.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── NavigationPage.jsx
│   │   ├── QueuePage.jsx
│   │   └── StaffDashboard.jsx
│   └── styles/
│       └── (CSS files)
└── package.json (already exists)
```

### Step 1a: Already Done (Package.json + Dependencies)

Your `package.json` already has:

- `react`, `react-dom`, `react-router-dom`

All set!

### Step 1b: Create `src/api/api.js` (Centralized API Service)

```javascript
const API_BASE = '/api';

class ApiService {
    /**
     * Generic request handler
     * All fetch calls go through here for consistency
     */
    async request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include',  // Include cookies for sessions
            ...options
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // === Auth Endpoints ===
    async register(email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async checkAuthStatus() {
        return this.request('/auth/status');
    }

    // === Attractions Endpoints ===
    async getAttractions() {
        return this.request('/attractions');
    }

    async getAttraction(id) {
        return this.request(`/attractions/${id}`);
    }

    // === Queue Endpoints ===
    async getQueueStatus(attractionId) {
        return this.request(`/queue/${attractionId}`);
    }

    async getAllQueues() {
        return this.request('/queue');
    }

    async updateQueueStatus(attractionId, queue_length, estimated_wait_minutes) {
        return this.request(`/queue/${attractionId}`, {
            method: 'PATCH',
            body: JSON.stringify({ queue_length, estimated_wait_minutes })
        });
    }

    // === Notifications Endpoints ===
    async subscribeNotifications() {
        return this.request('/notifications/subscribe', {
            method: 'POST'
        });
    }

    async unsubscribeNotifications() {
        return this.request('/notifications/unsubscribe', {
            method: 'POST'
        });
    }

    async getNotifications(limit = 20) {
        return this.request(`/notifications?limit=${limit}`);
    }

    async markNotificationAsRead(id) {
        return this.request(`/notifications/${id}/read`, {
            method: 'PATCH'
        });
    }

    // === Navigation (ETA) Endpoints ===
    async calculateETA(user_latitude, user_longitude, attraction_id) {
        return this.request('/navigation/eta', {
            method: 'POST',
            body: JSON.stringify({
                user_latitude,
                user_longitude,
                attraction_id
            })
        });
    }

    // === Profile Endpoints ===
    async getProfile() {
        return this.request('/profile');
    }

    async updatePreferences(preferences) {
        return this.request('/profile/preferences', {
            method: 'PATCH',
            body: JSON.stringify(preferences)
        });
    }

    // === Staff Metrics Endpoints ===
    async getStaffMetrics(from_date, to_date, attraction_id) {
        let url = '/staff-metrics';
        const params = new URLSearchParams();
        if (from_date) params.append('from_date', from_date);
        if (to_date) params.append('to_date', to_date);
        if (attraction_id) params.append('attraction_id', attraction_id);
        if (params.toString()) url += `?${params.toString()}`;
        return this.request(url);
    }

    async getMetricsSummary(from_date, to_date) {
        let url = '/staff-metrics/summary';
        const params = new URLSearchParams();
        if (from_date) params.append('from_date', from_date);
        if (to_date) params.append('to_date', to_date);
        if (params.toString()) url += `?${params.toString()}`;
        return this.request(url);
    }

    async recordMetrics(attraction_id, metric_date, ticket_sales, uptime_percentage, visitors_count, avg_wait_time_minutes) {
        return this.request('/staff-metrics', {
            method: 'POST',
            body: JSON.stringify({
                attraction_id,
                metric_date,
                ticket_sales,
                uptime_percentage,
                visitors_count,
                avg_wait_time_minutes
            })
        });
    }
}

export default new ApiService();
```

**Key Pattern:**

- Centralized `request()` method handles all fetch calls
- `credentials: 'include'` ensures cookies sent/received
- All methods wrap this and build URLs/bodies
- Error handling is consistent
- Easy to add logging, retry logic, or auth token refresh

**Centralized API Architecture Explained:**

**1. The Power of a Single Request Method:**

```javascript
async request(endpoint, options = {}) {
    const config = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include',  // CRITICAL: Send cookies
        ...options
    };

    if (options.body) {
        config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw { ...data, status: response.status };
    }

    return data;
}
```

**Why centralize?**

- **DRY principle:** Write `credentials: 'include'` once, not 30 times
- **Consistent error handling:** All failures handled same way
- **Easy to enhance:** Add logging, retry logic, or auth refresh in one place
- **Type safety:** Later add TypeScript types in one location

**2. Credentials: 'include' - The Critical Setting:**

```javascript
credentials: 'include'
```

**What it does:**

- Tells browser to send cookies with cross-origin requests
- Without it: Session cookie not sent, every request appears anonymous

**Cross-origin scenario:**

```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
↑ Different origins (different ports)

Browser default: Don't send cookies cross-origin (security)
With credentials: 'include': Send cookies (opt-in to this behavior)
```

**Must match backend CORS settings:**

```javascript
// Backend (server.js)
cors({
    origin: 'http://localhost:3000',
    credentials: true  // Must be true if frontend uses credentials: 'include'
})
```

**Security implication:**

- **Only allow trusted origins:** `origin: FRONTEND_URL`, not `origin: '*'`
- **CSRF protection:** `sameSite: 'lax'` cookie flag prevents cross-site attacks

**3. Error Handling Pattern:**

```javascript
if (!response.ok) {
    throw { ...data, status: response.status };
}
```

**Why throw objects, not Errors?**

```javascript
// ❌ Loses backend error details:
throw new Error('Request failed');

// ✅ Preserves backend response:
throw { error: 'Invalid email', message: '...', status: 400 };
```

**Frontend usage:**

```javascript
try {
    await api.login(email, password);
} catch (error) {
    if (error.status === 401) {
        setError(error.message);  // "Invalid credentials"
    } else if (error.status === 429) {
        setError('Too many attempts, please wait');
    } else {
        setError('Something went wrong');
    }
}
```

**4. Method Patterns - Consistent API Design:**

**GET request (no body):**

```javascript
async getAttractions() {
    return this.request('/attractions');
    // Becomes: fetch('/api/attractions', { method: 'GET', credentials: 'include' })
}
```

**POST request (with body):**

```javascript
async login(email, password) {
    return this.request('/auth/login', {
        method: 'POST',
        body: { email, password }
    });
    // Becomes: fetch('/api/auth/login', {
    //     method: 'POST',
    //     body: JSON.stringify({ email, password }),
    //     headers: { 'Content-Type': 'application/json' },
    //     credentials: 'include'
    // })
}
```

**PATCH request (partial update):**

```javascript
async updatePreferences(preferences) {
    return this.request('/profile/preferences', {
        method: 'PATCH',
        body: preferences
    });
}
```

**DELETE request:**

```javascript
async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
        method: 'DELETE'
    });
}
```

**5. Query Parameter Helper (Enhancement):**

```javascript
// Current approach (manual string building):
async getStaffMetrics(from_date, to_date, attraction_id) {
    let url = '/staff-metrics';
    const params = new URLSearchParams();
    if (from_date) params.append('from_date', from_date);
    if (to_date) params.append('to_date', to_date);
    if (attraction_id) params.append('attraction_id', attraction_id);
    if (params.toString()) url += `?${params.toString()}`;
    return this.request(url);
}

// Better approach (helper method):
buildURL(endpoint, params = {}) {
    const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.append(key, value);
        }
    });
    return url.pathname + url.search;
}

async getStaffMetrics(from_date, to_date, attraction_id) {
    const url = this.buildURL('/staff-metrics', {
        from_date,
        to_date,
        attraction_id
    });
    return this.request(url);
}
```

**6. Advanced Features to Add:**

**Request/response logging:**

```javascript
async request(endpoint, options = {}) {
    console.log(`→ ${options.method || 'GET'} ${endpoint}`, options.body);
  
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();
  
    console.log(`← ${response.status} ${endpoint}`, data);
  
    if (!response.ok) throw { ...data, status: response.status };
    return data;
}
```

**Retry logic for network errors:**

```javascript
async request(endpoint, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            // ... success
            return data;
        } catch (error) {
            if (i === retries - 1) throw error;  // Last attempt
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));  // Exponential backoff
        }
    }
}
```

**Token refresh (if using JWT instead of sessions):**

```javascript
async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
  
    if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
            // Retry original request with new token
            return this.request(endpoint, options);
        }
    }
  
    // ... rest of method
}
```

**Request cancellation (for search debouncing):**

```javascript
class ApiService {
    abortControllers = new Map();
  
    async request(endpoint, options = {}) {
        // Cancel previous request to same endpoint
        if (this.abortControllers.has(endpoint)) {
            this.abortControllers.get(endpoint).abort();
        }
    
        const controller = new AbortController();
        this.abortControllers.set(endpoint, controller);
    
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...config,
                signal: controller.signal
            });
            // ...
        } finally {
            this.abortControllers.delete(endpoint);
        }
    }
}

// Usage: User types in search box, cancels old requests automatically
await api.searchAttractions('penguin');  // Cancelled if user types again
await api.searchAttractions('peng');     // Cancelled if user types again
await api.searchAttractions('pen');      // This one completes
```

**7. Why Export a Singleton Instance:**

```javascript
export default new ApiService();  // Singleton pattern
```

**Benefits:**

- **Shared state:** All components use same instance (shared abort controllers, caching, etc.)
- **Simple imports:** `import api from './api.js'` → `api.login(...)`
- **Easy to mock:** Test with `jest.mock('./api.js')`

**Alternative (class export):**

```javascript
export default ApiService;  // Export class
// Usage: const api = new ApiService(); (create instance per component)
```

**When to use which:**

- **Singleton:** API services, database connections, logger
- **Class export:** Components, utilities that need different configs

### Step 1c: Create `src/context/AuthContext.jsx` (Auth State Management)

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth status on app mount
    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const data = await api.checkAuthStatus();
            if (data.isAuthenticated) {
                setUser(data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email, password) {
        const data = await api.login(email, password);
        setUser(data.user);
        setIsAuthenticated(true);
        return data;
    }

    async function register(email, password) {
        const data = await api.register(email, password);
        // Don't auto-login after register; user still needs to login
        return data;
    }

    async function logout() {
        await api.logout();
        setUser(null);
        setIsAuthenticated(false);
    }

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        checkAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
```

**Key Pattern:**

- `checkAuth()` on mount – fetch session status from backend
- `isLoading` – prevents premature redirects while checking auth
- `login()`/`logout()` update local state AND backend session
- `useAuth()` hook provides access anywhere in app

**React Context Pattern In-Depth:**

**1. Why Context Instead of Props?**

**Problem without Context (prop drilling):**

```javascript
<App user={user}>
  <Header user={user}>
    <Navigation user={user}>
      <UserMenu user={user}>
        <Avatar user={user} />  // Passed through 5 levels!
      </UserMenu>
    </Navigation>
  </Header>
</App>
```

**Solution with Context:**

```javascript
<AuthProvider>  {/* Provide once at top level */}
  <App>
    <Header>
      <Navigation>
        <UserMenu>
          <Avatar />  {/* Use useAuth() hook directly */}
        </UserMenu>
      </Navigation>
    </Header>
  </App>
</AuthProvider>
```

**2. Context Setup Explained:**

```javascript
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  
    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth
    };
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Why three separate state variables?**

- **`user`:** Object with `{ id, email, role }` or `null`
- **`isAuthenticated`:** Boolean for quick checks (derived from `user` but explicit)
- **`isLoading`:** Critical for preventing UI flashing (explained below)

**Could combine:**

```javascript
// ❌ Less clear:
const [auth, setAuth] = useState({ user: null, loading: true });

// ✅ More readable:
const [user, setUser] = useState(null);
const [isLoading, setIsLoading] = useState(true);
```

**3. The isLoading Pattern (Critical for UX):**

```javascript
useEffect(() => {
    checkAuth();
}, []);

async function checkAuth() {
    try {
        const data = await api.checkAuthStatus();
        if (data.isAuthenticated) {
            setUser(data.user);
            setIsAuthenticated(true);
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    } finally {
        setIsLoading(false);  // ALWAYS set loading to false
    }
}
```

**Without isLoading (bad UX):**

```
1. App loads
2. isAuthenticated = false (initial state)
3. ProtectedRoute sees false → redirects to /login
4. API call finishes → user actually authenticated
5. User now stuck on login page, needs to navigate back
```

**With isLoading (good UX):**

```
1. App loads
2. isLoading = true → Show loading spinner
3. API call finishes → isAuthenticated = true
4. isLoading = false → Show protected content
   (No flash, no unwanted redirect)
```

**Protected route implementation:**

```javascript
function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}
```

**4. Login Flow Step-by-Step:**

```javascript
async function login(email, password) {
    const data = await api.login(email, password);  // 1. Send request to backend
    setUser(data.user);                              // 2. Update local state
    setIsAuthenticated(true);                        // 3. Set authenticated flag
    return data;                                     // 4. Return for component use
}
```

**What happens:**

1. **Component calls:** `await login(email, password)`
2. **API request:** POST to `/api/auth/login`
3. **Backend:** Validates credentials, sets `request.session.userId`
4. **Backend response:** `{ user: { id, email, role } }`
5. **Frontend:** Updates Context state
6. **All components:** Re-render with new auth state
7. **ProtectedRoute:** Now sees `isAuthenticated = true`, shows protected content

**5. Session Persistence Across Page Refresh:**

```javascript
// User's journey:
1. User logs in → session cookie set in browser
2. User navigates around → cookie sent with each request
3. User refreshes page → React state cleared!
4. App.jsx mounts → AuthProvider's useEffect runs
5. checkAuth() called → GET /api/auth/status
6. Backend sees session cookie → responds with user data
7. Frontend restores user state
```

**Key insight:** Session lives in browser cookie (HTTP-only), not JavaScript state. React state is just a mirror of the cookie's session.

**6. Custom Hook Pattern:**

```javascript
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
```

**Why check for null?**

```javascript
// If someone does this (forgot AuthProvider):
function MyComponent() {
    const { user } = useAuth();  // context is null!
    return <div>{user.email}</div>;  // CRASH: Cannot read 'user' of null
}

// With error check:
// Error message: "useAuth must be used within AuthProvider"
// Developer immediately knows the fix: wrap app with <AuthProvider>
```

**7. Logout Flow:**

```javascript
async function logout() {
    await api.logout();          // 1. Tell backend to destroy session
    setUser(null);               // 2. Clear local state
    setIsAuthenticated(false);   // 3. Update flag
}
```

**Backend destroys session:**

```javascript
request.session.destroy();  // Removes session from store
response.clearCookie('connect.sid');  // Tells browser to delete cookie
```

**Frontend clears state:**

```javascript
setUser(null);  // All components see user as logged out
```

**8. Advanced Pattern - Role-Based Rendering:**

```javascript
export function AuthProvider({ children }) {
    // ... existing state
  
    const hasRole = useCallback((role) => {
        return user?.role === role;
    }, [user]);
  
    const hasAnyRole = useCallback((roles) => {
        return roles.includes(user?.role);
    }, [user]);
  
    const value = {
        // ... existing values
        hasRole,
        hasAnyRole
    };
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Usage in components:
function Dashboard() {
    const { hasRole } = useAuth();
  
    return (
        <div>
            <h1>Dashboard</h1>
            {hasRole('staff') && <StaffPanel />}
            {hasRole('admin') && <AdminPanel />}
        </div>
    );
}
```

**9. Testing Context:**

```javascript
// Test helper
function renderWithAuth(component, { user = null } = {}) {
    return render(
        <AuthProvider initialUser={user}>
            {component}
        </AuthProvider>
    );
}

// Test
test('shows logout button when authenticated', () => {
    renderWithAuth(<Navigation />, {
        user: { id: 1, email: 'test@test.com', role: 'visitor' }
    });
  
    expect(screen.getByText('Logout')).toBeInTheDocument();
});
```

**10. Performance Optimization:**

```javascript
const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth
}), [user, isAuthenticated, isLoading]);  // Only recreate when these change

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

**Why useMemo?**

- **Without:** Every render creates new `value` object → all consumers re-render
- **With:** Same object reference unless dependencies change → fewer re-renders
- **Rule of thumb:** Always memoize Context value objects

### Step 1d: Update `src/App.jsx` (Routing & Protected Routes)

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navigation from './components/Navigation.jsx';
import './App.css';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import NavigationPage from './pages/NavigationPage.jsx';
import QueuePage from './pages/QueuePage.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';

/**
 * ProtectedRoute: Only authenticated users can access
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * PublicRoute: Only unauthenticated users can access (login/register pages)
 */
function PublicRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return !isAuthenticated ? children : <Navigate to="/" replace />;
}

/**
 * StaffRoute: Only staff can access
 */
function StaffRoute({ children }) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated || user?.role !== 'staff') {
        return <Navigate to="/" replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <Navigation />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <RegisterPage />
                        </PublicRoute>
                    }
                />

                {/* Protected routes (any authenticated user) */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/navigation"
                    element={
                        <ProtectedRoute>
                            <NavigationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/queue"
                    element={
                        <ProtectedRoute>
                            <QueuePage />
                        </ProtectedRoute>
                    }
                />

                {/* Staff-only routes */}
                <Route
                    path="/staff/dashboard"
                    element={
                        <StaffRoute>
                            <StaffDashboard />
                        </StaffRoute>
                    }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
```

**Key Patterns:**

- `ProtectedRoute` – redirects to `/login` if not authenticated
- `StaffRoute` – only allows users with `role === 'staff'`
- All check `isLoading` to avoid flashing redirects
- AuthProvider wraps entire app so context is accessible everywhere

---

## Step 2: Navigation Component

### Goal

Create a header/navbar with links and logout button.

### Create `src/components/Navigation.jsx`

```javascript
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navigation.css';

export default function Navigation() {
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            alert('Logout failed: ' + error.message);
        }
    }

    if (isLoading) {
        return <nav className="navigation">Loading...</nav>;
    }

    return (
        <nav className="navigation">
            <div className="nav-brand">
                <Link to="/">🦁 London Zoo</Link>
            </div>

            <ul className="nav-links">
                {!isAuthenticated ? (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                ) : (
                    <>
                        {user?.role === 'visitor' && (
                            <>
                                <li><Link to="/queue">Queue Times</Link></li>
                                <li><Link to="/navigation">Navigation</Link></li>
                                <li><Link to="/profile">My Profile</Link></li>
                            </>
                        )}
                        {user?.role === 'staff' && (
                            <>
                                <li><Link to="/staff/dashboard">Dashboard</Link></li>
                                <li><Link to="/profile">My Profile</Link></li>
                            </>
                        )}
                        <li>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}
```

### Create `src/components/Navigation.css`

```css
.navigation {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-brand a {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
    margin: 0;
    padding: 0;
}

.nav-links a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.nav-links a:hover {
    background-color: #34495e;
}

.logout-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
}

.logout-btn:hover {
    background-color: #c0392b;
}
```

---

## Step 3: Auth Pages (Login & Register)

### Create `src/pages/LoginPage.jsx`

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Auth.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Login to London Zoo</h1>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}
```

### Create `src/pages/RegisterPage.jsx`

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Auth.css';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        // Client-side validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password);
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Create Your London Zoo Account</h1>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        <small>Min 8 chars, with uppercase, lowercase, number, special char</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}
```

### Create `src/styles/Auth.css`

```css
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 80px);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
}

.auth-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.auth-card h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 2rem;
    font-size: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #2c3e50;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
    transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
    background-color: #ecf0f1;
    cursor: not-allowed;
}

.password-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.password-wrapper input {
    flex: 1;
}

.toggle-password {
    padding: 0.75rem;
    background: none;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
}

.toggle-password:hover:not(:disabled) {
    background-color: #ecf0f1;
}

.toggle-password:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.auth-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}

.auth-button:hover:not(:disabled) {
    background-color: #764ba2;
}

.auth-button:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
}

.error-message {
    background-color: #e74c3c;
    color: white;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
}

.success-message {
    background-color: #27ae60;
    color: white;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
}

.auth-footer {
    text-align: center;
    margin-top: 1.5rem;
    color: #7f8c8d;
}

.auth-footer a {
    color: #667eea;
    text-decoration: none;
    font-weight: bold;
}

.auth-footer a:hover {
    text-decoration: underline;
}

.form-group small {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.85rem;
    color: #7f8c8d;
}
```

---

## Step 4: Visitor Pages (Queue, Navigation, Profile)

Due to length limits, here are **brief code outlines** for the remaining pages:

### Create `src/pages/HomePage.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/api.js';
import '../styles/Home.css';

export default function HomePage() {
    const { isAuthenticated, user } = useAuth();
    const [attractions, setAttractions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttractions();
    }, []);

    async function fetchAttractions() {
        try {
            const data = await api.getAttractions();
            setAttractions(data.attractions);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) return <div className="loading">Loading attractions...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="home-page">
            <h1>Welcome to London Zoo</h1>
            {!isAuthenticated && (
                <p><Link to="/login">Login</Link> or <Link to="/register">register</Link> to get started!</p>
            )}

            <div className="attractions-grid">
                {attractions.map(attr => (
                    <div key={attr.id} className="attraction-card">
                        <h3>{attr.name}</h3>
                        <p>{attr.description}</p>
                        <p><strong>Queue Wait:</strong> {attr.estimated_wait_minutes || 0} min</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

### Create `src/pages/QueuePage.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import api from '../api/api.js';
import '../styles/Queue.css';

export default function QueuePage() {
    const [queues, setQueues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQueues();
        // Refresh every 30 seconds
        const interval = setInterval(fetchQueues, 30000);
        return () => clearInterval(interval);
    }, []);

    async function fetchQueues() {
        try {
            const data = await api.getAllQueues();
            setQueues(data.queues);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) return <div className="loading">Loading queue times...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="queue-page">
            <h1>Queue Times</h1>
            <table className="queue-table">
                <thead>
                    <tr>
                        <th>Attraction</th>
                        <th>Queue Length</th>
                        <th>Wait Time</th>
                        <th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {queues.map(q => (
                        <tr key={q.id}>
                            <td>{q.attraction_name}</td>
                            <td>{q.queue_length}</td>
                            <td>{q.estimated_wait_minutes} min</td>
                            <td>{new Date(q.last_updated).toLocaleTimeString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

### Create `src/pages/NavigationPage.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import api from '../api/api.js';
import '../styles/Map.css';

export default function NavigationPage() {
    const [attractions, setAttractions] = useState([]);
    const [selectedAttractionId, setSelectedAttractionId] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [eta, setEta] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch attractions on load
        api.getAttractions().then(data => setAttractions(data.attractions));

        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude
                    });
                },
                (err) => setError('Unable to access your location')
            );
        }
    }, []);

    async function handleCalculateETA() {
        if (!selectedAttractionId || !userLocation) {
            setError('Please select an attraction and allow location access');
            return;
        }

        setIsLoading(true);
        try {
            const data = await api.calculateETA(
                userLocation.lat,
                userLocation.lon,
                selectedAttractionId
            );
            setEta(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="navigation-page">
            <h1>Navigation to Attractions</h1>

            {userLocation && <p>📍 Your location: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}</p>}

            <div className="navigation-form">
                <select value={selectedAttractionId} onChange={(e) => setSelectedAttractionId(e.target.value)}>
                    <option value="">Select an attraction...</option>
                    {attractions.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>

                <button onClick={handleCalculateETA} disabled={isLoading}>
                    {isLoading ? 'Calculating...' : 'Get Directions'}
                </button>
            </div>

            {error && <div className="error">{error}</div>}

            {eta && (
                <div className="eta-result">
                    <h2>{eta.attraction_name}</h2>
                    <p>Distance: {eta.distance_km} km ({eta.distance_meters}m)</p>
                    <p>Walking time: ~{eta.estimated_walk_time_minutes} minutes</p>
                </div>
            )}
        </div>
    );
}
```

### Create `src/pages/ProfilePage.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/api.js';
import '../styles/Profile.css';

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [preferredAttractions, setPreferredAttractions] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const data = await api.getProfile();
            setProfile(data.user);
            if (data.preferences) {
                setNotificationsEnabled(data.preferences.notifications_enabled);
                setPreferredAttractions(data.preferences.preferred_attractions || '');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSavePreferences() {
        try {
            await api.updatePreferences({
                notifications_enabled: notificationsEnabled,
                preferred_attractions: preferredAttractions
            });
            setSuccess('Preferences updated!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    }

    if (isLoading) return <div className="loading">Loading profile...</div>;

    return (
        <div className="profile-page">
            <h1>My Profile</h1>
            {profile && <p>Email: {profile.email} (Role: {profile.role})</p>}

            <div className="preferences-section">
                <h2>Notification Settings</h2>
                <label>
                    <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    />
                    Enable notifications
                </label>

                <div className="form-group">
                    <label>Preferred Attractions (JSON)</label>
                    <textarea
                        value={preferredAttractions}
                        onChange={(e) => setPreferredAttractions(e.target.value)}
                        placeholder='["giraffes", "penguins"]'
                    />
                </div>

                <button onClick={handleSavePreferences}>Save Preferences</button>
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
        </div>
    );
}
```

### Create `src/pages/StaffDashboard.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import api from '../api/api.js';
import '../styles/Dashboard.css';

export default function StaffDashboard() {
    const [metrics, setMetrics] = useState([]);
    const [summary, setSummary] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMetrics();
    }, []);

    async function fetchMetrics() {
        try {
            setIsLoading(true);
            const metricsData = await api.getStaffMetrics(fromDate, toDate);
            const summaryData = await api.getMetricsSummary(fromDate, toDate);
            setMetrics(metricsData.metrics);
            setSummary(summaryData.summary);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="staff-dashboard">
            <h1>Staff Dashboard</h1>

            <div className="filters">
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                <button onClick={fetchMetrics}>Apply Filters</button>
            </div>

            {summary && (
                <div className="summary-cards">
                    <div className="card">Total Ticket Sales: {summary.total_ticket_sales}</div>
                    <div className="card">Avg Uptime: {summary.avg_uptime_percentage}%</div>
                    <div className="card">Total Visitors: {summary.total_visitors}</div>
                </div>
            )}

            {isLoading ? (
                <div className="loading">Loading metrics...</div>
            ) : (
                <table className="metrics-table">
                    <thead>
                        <tr>
                            <th>Attraction</th>
                            <th>Date</th>
                            <th>Ticket Sales</th>
                            <th>Uptime %</th>
                            <th>Visitors</th>
                            <th>Avg Wait</th>
                        </tr>
                    </thead>
                    <tbody>
                        {metrics.map(m => (
                            <tr key={m.id}>
                                <td>{m.attraction_name}</td>
                                <td>{m.metric_date}</td>
                                <td>{m.ticket_sales}</td>
                                <td>{m.uptime_percentage}%</td>
                                <td>{m.visitors_count}</td>
                                <td>{m.avg_wait_time_minutes} min</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {error && <div className="error">{error}</div>}
        </div>
    );
}
```

---

## Step 5: CSS Styling

Create remaining CSS files:

**`src/styles/Home.css`**

```css
.home-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.attractions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.attraction-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.attraction-card h3 {
    margin-top: 0;
    color: #2c3e50;
}
```

**`src/styles/Queue.css`**

```css
.queue-page {
    padding: 2rem;
}

.queue-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
}

.queue-table th,
.queue-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #bdc3c7;
}

.queue-table th {
    background-color: #2c3e50;
    color: white;
}

.queue-table tr:hover {
    background-color: #ecf0f1;
}
```

**`src/styles/Map.css`**

```css
.navigation-page {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.navigation-form {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.navigation-form select,
.navigation-form button {
    padding: 0.75rem;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
    font-size: 1rem;
}

.eta-result {
    background-color: #d5f4e6;
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 1rem;
}
```

**`src/styles/Profile.css`**

```css
.profile-page {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
}

.preferences-section {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preferences-section label {
    display: block;
    margin: 0.5rem 0;
}
```

**`src/styles/Dashboard.css`**

```css
.staff-dashboard {
    padding: 2rem;
}

.filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.filters input,
.filters button {
    padding: 0.75rem;
    border: 1px solid #bdc3c7;
    border-radius: 4px;
}

.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.summary-cards .card {
    background: #667eea;
    color: white;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
}

.metrics-table {
    width: 100%;
    border-collapse: collapse;
}

.metrics-table th,
.metrics-table td {
    padding: 1rem;
    border: 1px solid #bdc3c7;
}

.metrics-table th {
    background-color: #2c3e50;
    color: white;
}
```

---

# Run & Test Checklist

## Prerequisites

- Node.js 16+ installed
- MySQL running locally
- `.env` configured in `server-side/`

## Start Backend

```bash
cd server-side
npm install
npm run dev
```

Expected output:

```
✓ Database connected successfully
✓ Database schema initialized successfully
✓ Server running on http://localhost:5000
```

## Start Frontend

```bash
cd client-side
npm install
npm run dev
```

Will open `http://localhost:3000` in browser.

## Test Flows

**1. Register & Login**

- Click "Register" → fill form → should redirect to login
- Login with new credentials → should redirect to home
- Navbar shows "Logout" button

**2. View Queue Times**

- Click "Queue Times" → should show all attractions with queue data
- Auto-refresh every 30 seconds

**3. Navigation**

- Click "Navigation" → browser asks for location permission
- Select attraction → click "Get Directions" → shows distance & ETA

**4. Profile**

- Click "My Profile" → shows email and role
- Toggle notifications → click "Save" → shows success message

**5. Staff Dashboard** (Login as staff@londonsoo.co.uk)

- Click "Dashboard" → shows metrics table
- Enter date range → click "Apply Filters" → updates data

---

# Common Bugs & Fixes

| Bug                                      | Cause                                        | Fix                                                    |
| ---------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| "Cannot GET /api/..."                    | Routes not mounted in server.js              | Import and mount route handler in server.js            |
| Cookies not persisting                   | `credentials: 'include'` missing in fetch  | Add to all fetch requests (already in api.js)          |
| "Forbidden: Staff only" for visitor      | User role not set correctly                  | Check DB: user inserted with `role = 'visitor'`      |
| No attractions showing                   | SQL query syntax error or DB not initialized | Run `npm run dev` to trigger schema initialization   |
| ETA always returns 1 minute              | Haversine distance too close to user         | Test with locations far apart; check coordinate values |
| React Router not working                 | BrowserRouter not wrapping App               | Verify in App.jsx:`<BrowserRouter>` wraps everything |
| `useAuth()` error outside AuthProvider | AuthProvider missing in App                  | Wrap AppRoutes() with `<AuthProvider>`               |
| CORS errors in console                   | CORS not configured properly                 | Check `cors()` origin matches FRONTEND_URL           |
| Logout doesn't redirect                  | Navigate not in scope                        | Import `useNavigate` from react-router-dom           |

---

# What to Build Next

**Within Scope (Suggested Next Steps):**

1. **Notification Real-Time Updates** – Use WebSockets (Socket.io) to push queue alerts to clients
2. **Search & Filter Attractions** – Add filter by category, open/closed status
3. **Favorite Attractions** – Save preferences, view custom list
4. **Queue History Charts** – Display historical queue trends (Chart.js/Recharts)
5. **Staff: Bulk Metrics Upload** – CSV import for daily metrics
6. **Mobile Responsiveness** – Optimize CSS for mobile (media queries)
7. **Accessibility Improvements** – ARIA labels, keyboard navigation, color contrast
8. **User Reviews** – Allow visitors to review attractions

**Out of Scope (Beyond This Tutorial):**

- Payment processing
- Advanced analytics/BI
- Machine learning predictions
- Mobile app (separate React Native project)
- Real-time turn-by-turn GPS
- Multi-language support

---

## End of Tutorial

You now have a complete roadmap to build the London Zoo platform. Each step includes:

- Clear goals
- File structure
- Runnable code snippets
- Testing instructions
- Common pitfalls

**Next Actions:**

1. Copy backend code into your `/server-side` directory
2. Copy frontend code into your `/client-side` directory
3. Update `.env` with your MySQL credentials
4. Run both servers and test manually
5. Refer to "Common Bugs & Fixes" if issues arise

Good luck! 🦁
