// Required dependencies
const mysql = require("mysql2");        
const bcrypt = require("bcrypt");        
const crypto = require("crypto");         
const chalk = require("chalk");        
const dbSchemaFile = "./src/schemas/dbschema.sql";

let pool;

async function checkDatabaseExists(connection){
    try{
        const[databases] = await connection.query(
            "SHOW DATABASES LIKE 'express_test'"
        );
        return databases.length > 0; 
    }catch(err){
        console.error(chalk.redBright("Error checking database existence: "), err)
        return false;
    }
}
async function runCreateDatabase(connection){
    const schemaSQL = require("fs").readFileSync(dbSchemaFile, "utf8");
    const statements = schemaSQL
        .split(";")                         
        .map((stmt) => stmt.trim())      
        .filter((stmt) => stmt.length > 0);   
    
    for (const statement of statements){
        if (statement.trim()){
            console.log(
                chalk.blueBright(`Executing: ${statement.substring(0, 50)}...`)
            );
            await connection.query(statement); 
        }
    }
    console.log(chalk.greenBright("Database schema created successfully."));
}

async function initializeDatabase(){
    try{
        const connection = await mysql
            .createConnection({
                host : "localhost",
                user : "root",
                password : "",
            })
            .promise();
        
        const databaseExists = await checkDatabaseExists(connection);
        if (!databaseExists){
            console.log(
                chalk.yellowBright(
                    "Database 'express_test' not found, setting up databse schema..."
                )
            );
            await runCreateDatabase(connection);
        }
        await connection.end();

        pool = mysql.createPool({
            host : "localhost",
            user : "root",
            password : "",
            database : "express_test",
            connectionLimit : 10,
            waitForConnections : true,
            queueLimit : 0,
        });
    }catch(err){
        console.error(chalk.redBright("Error initializing database: "), err);
        throw err;
    }
}

initializeDatabase();

async function doesAccountExist(email){
    const[existingUsers] = await pool
    .promise()
    .execute("SELECT * FROM users WHERE email = ?", [email]);
    return existingUsers.length > 0;
}

async function registerUser(email,password){
    const accountExists = await doesAccountExist(email);
    if(accountExists){
        const error = new Error("Email already registered.")
        error.statusCode = 400;
        throw error;
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const[result] = await pool
        .promise()
        .execute("INSERT INTO users (email, password_hash) VALUES(?,?)", [email,
            hashedPassword,
        ]);
        return result
}

async function loginUser(email, password, res, req) {
    const[existingUsers] = await pool
    .promise()
    .execute("SELECT * FROM users WHERE email = ? ", [ email]);

    if (existingUsers.length < 1){
        return res.status(400).json({message: "Email does not exist."});
    }
    const hashedPassword = existingUsers[0].password_hash;
    if (!hashedPassword){
        return res.status(500).json({message: "Password error."});
    }
    const valid = await bcrypt.compare(password,hashedPassword);
    if (!valid){
        return res.status(401).json({message: "Incorrect Password."})
    }
    req.session.userId = existingUsers[0].id;
    res.status(200).json({message: "Login successful."});
}

async function isLoggedIn(req,res){
    if (req.session && req.session.userId){
        res.status(200).json({LoggedIn: true, userId: req.session.userId});
    }else{
        res.status(200).json({LoggedIn: false})
    }
}
//EXPORT FUNCTIONS 
module.exports = {doesAccountExist, registerUser, loginUser, isLoggedIn};