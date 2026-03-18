import mysql from 'mysql2/promise';
import chalk from 'chalk';

let pool;

const getPoolConfig = () => ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});
export async function initializeConnection(){
    const poolConfig = getPoolConfig();
    const initialPool = mysql.createPool(poolConfig);

    try{
        const connection = await initialPool.getConnection();
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        connection.release();
        console.log(chalk.white(`Database created or already exists.`));
        
        pool = mysql.createPool({
            ...poolConfig,
            database: process.env.DB_NAME
        });
    }catch( error ){
        console.error(chalk.red(`Failed to initialize connection: ${error.message}`));
        throw error;
    }finally{
        await initialPool.end();
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
        await pool.query('SELECT 1');
        console.log(chalk.grey(`Database connected successfully.`));
        return true;
    }catch( error ){
        console.error(chalk.red(`Database connection failed.${error.message}`));
        return false;
    }
}

export function getPool(){
    return pool;
}