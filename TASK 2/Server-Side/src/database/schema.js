import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { query } from './connection.js';

export async function initializeDatabase(){
    try{
        const schemaPath = path.join(process.cwd(),'src','database','schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

        const statements = schemaSQL
            .split(';')
            .map(stmt=>stmt.trim())
            .filter(stmt=>stmt && !stmt.startsWith('--'));

            for( const statement of statements){
                await query( statement );
            }
            
            console.log(chalk.greenBright(`Database schema initialized successfully.`));        
    }catch( error ){
        console.error(chalk.red(`Database initialization failed : ${error.message}`));
        throw error;
    }
}