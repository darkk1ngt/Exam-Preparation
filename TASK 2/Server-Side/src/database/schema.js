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