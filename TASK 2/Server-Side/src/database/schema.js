import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

export async function initializeDatabase(){
    try{
        const schemaPath = path.join(process.cwd(),'src','database','schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

        let connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        // Create database first
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(chalk.yellow(`Database ${process.env.DB_NAME} created or already exists.`));
        
        await connection.end();

        // Now reconnect to the specific database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const statements = schemaSQL
            .split(';')
            .map(stmt=>stmt.trim())
            .filter(stmt=>stmt && !stmt.startsWith('--') && !stmt.startsWith('CREATE DATABASE') && !stmt.startsWith('USE'));

            for( const statement of statements){
                if(statement){
                    try{
                        await connection.query(statement);
                    }catch(error){
                        console.error(chalk.yellow(`Statement error: ${error.message}`));
                    }
                }
            }
            
            await connection.end();
            console.log(chalk.greenBright(`Database schema initialized successfully.`));        
    }catch( error ){
        console.error(chalk.red(`Database initialization failed : ${error.message}`));
        throw error;
    }
}