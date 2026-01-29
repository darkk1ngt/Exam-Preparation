import 'dotenv/config';
import express, { request, response } from 'express';
import session from 'express-session';
import chalk from 'chalk';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './database/schema.js';
import { testConnection } from './database/connection.js';

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
    console.log(chalk.cyan(`${request.method}${request.path}`));
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
        const isConnected = await testConnection();
        if( !isConnected ){
            throw new Error(`Cannot connect to database.`);
        }
        await initializeDatabase();

        app.listen(PORT,()=>{
            console.log(chalk.green(`Your server is ruinning on http://localhost:${PORT} all great one.`))
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
    await pool.end();  
    process.exit(0);
});
