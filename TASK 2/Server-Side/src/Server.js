import 'dotenv/config';
import express from 'express';
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

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
    console.error(chalk.red(`ERROR: Missing environment variables: ${missingVars.join(', ')}`));
    process.exit(1);
}

if (process.env.DB_PASSWORD === undefined) {
    console.warn(chalk.yellow('WARNING: DB_PASSWORD not set (using empty password)'));
}

// Validate session secret
if (!process.env.SESSION_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        console.error(chalk.red('ERROR: SESSION_SECRET must be set in production'));
        process.exit(1);
    } else {
        console.warn(chalk.yellow('WARNING: Using default SESSION_SECRET (development only)'));
        process.env.SESSION_SECRET = 'dev-secret-change-in-production';
    }
}

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express()

app.use(cors({
    origin : FRONTEND_URL,
    credentials : true, /* allow cookies */
    methods : ['GET','POST','PATCH','DELETE'],
    allowedHeaders : ['Content-Type','Authorization'],
    maxAge : 86400 /* 24 hours */
}));

app.use(express.json({ limit : '10mb' }));

app.use(express.urlencoded({ extended : true , limit : '10mb' }));

/* Request timeout */
app.use((request, response, next) => {
    request.setTimeout(30000); // 30 seconds
    response.setTimeout(30000);
    next();
});

/* RATE LIMITATION */
const createLimiter = (windowMs, max, message = 'Too many requests') => 
    rateLimit({ windowMs, max, message, standardHeaders: true, legacyHeaders: false });

const authLimiter = createLimiter(15 * 60 * 1000, 10, 'Too many login/register attempts, please try again later.');

/* APPLICATION OF RATE LIMITERS */
app.use('/api/auth/login',authLimiter);
app.use('/api/auth/register',authLimiter);

app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
    cookie : {
        httpOnly : true, /* prevents js access to cookies yum yum */
        secure : process.env.NODE_ENV === 'production',
        sameSite : 'lax',
        maxAge : 24 * 60 * 60 * 1000
    }
}));

/*  REQUEST LOGGING */
app.use((request, response, next) => {
    const start = Date.now();
    
    // Log response after it's sent
    response.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = response.statusCode >= 400 ? chalk.red : chalk.green;
        console.log(
            chalk.cyan(`${request.method} ${request.path}`) + 
            statusColor(` ${response.statusCode}`) + 
            chalk.gray(` ${duration}ms`)
        );
    });
    
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
app.get('/api/health', async (request, response) => {
    const dbConnected = await testConnection();
    const status = dbConnected ? 'ok' : 'degraded';
    
    response.status(dbConnected ? 200 : 503).json({
        status : status,
        timestamp : new Date().toISOString(),
        uptime : process.uptime(),
        database : dbConnected ? 'connected' : 'disconnected'
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
app.use((err, request, response, _next) => {
    console.error(chalk.red(`Error: ${err.message}`));
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    response.status(err.status || 500).json({
        error : err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack : err.stack })
    });
});

let server;

async function startServer(){
    try {
        console.log(chalk.blue('Starting server initialization...'));
        
        await initializeConnection();
        console.log(chalk.green('✓ Database connection pool created'));
        
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error(`Cannot connect to database.`);
        }
        console.log(chalk.green('✓ Database connection verified'));
        
        await initializeDatabase();
        console.log(chalk.green('✓ Database schema initialized'));

        server = app.listen(PORT, () => {
            console.log(chalk.bold.magenta(
                `\n✓ Server running on http://localhost:${PORT}`
            ));
            console.log(chalk.gray(`Environment: ${process.env.NODE_ENV || 'development'}`));
            console.log(chalk.gray(`Frontend URL: ${FRONTEND_URL}\n`));
        });
    } catch (error) {
        console.error(chalk.red(`✗ Failed to start server: ${error.message}`));
        process.exit(1);
    }
}

/* GRACEFUL SHUTDOWN */
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
    console.log(chalk.yellow('\nShutdown signal received, closing server gracefully...'));
    
    // Stop accepting new connections
    if (server) {
        server.close(() => {
            console.log(chalk.green('✓ HTTP server closed'));
        });
    }
    
    // Close database pool
    const pool = getPool();
    if (pool) {
        await pool.end();
        console.log(chalk.green('✓ Database connections closed'));
    }
    
    console.log(chalk.green('✓ Graceful shutdown complete'));
    process.exit(0);
}

startServer();

/* UNHANDLED ERROR LOGGING */
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
    if (process.env.NODE_ENV === 'production') {
        gracefulShutdown();
    }
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught Exception:'), error);
    gracefulShutdown();
});