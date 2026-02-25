import express from 'express';
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

        /* Create session directly using insert result */
        request.session.userId = result.insertId;
        request.session.email = email;
        request.session.role = 'visitor';

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
        const isValidPassword = await bcrypt.compare(password,user.password_hash);
        if( !isValidPassword ){
            return response.status(401).json({
                error : 'Invalid email or password.'
            });
        }

        /* session creation after successful login attempt */
        request.session.userId = user.id;
        request.session.email = user.email;
        request.session.role = user.role;

        console.log(chalk.green(`User logged in: ${email}`))
        response.status(200).json({
            message : 'Login Successful.',
            user : {
                id : user.id,
                email : user.email,
                role : user.role
            }
        });

    }catch( error ){
        console.error(chalk.red(`Login error: ${error.message}`));
        response.status(500).json({
            error : 'Login failed. Please try again.'
        });
    }
});

/* user logout */

router.post('/logout' , ( request , response )=>{
    request.session.destroy(( err )=>{
        if( err ){
            console.error(chalk.red(`Logout error: ${err.message}`));
            return response.status(500).json({
                error : 'Logout failed.'
            });
        }
        console.log(chalk.green(`User logged out successfully.`));
        response.status(200).json({
            message : 'Logout successful.'
        });
    });
});


/* user authentication status */

router.get('/status', ( request , response )=>{
    if( request.session && request.session.userId ){
        return response.json({
            isAuthenticated : true,
            user : {
                id : request.session.userId,
                email : request.session.email,
                role : request.session.role
            }
        });
    }
    response.json({
        isAuthenticated : false
    });
});

export default router;