import mysql from 'mysql2/promise';
import chalk from 'chalk';

const pool = mysql.createPool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    waitForConnections : true,
    connectionLimit : 10,
    queueLimit : 0
});

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