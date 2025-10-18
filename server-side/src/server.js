const express = require("express");
const cors = require("cors");
const chalk = require("chalk");
const session = require("express-session");

const app = express();
const db = require("./db");

// Add middleware to parse JSON bodies
app.use(express.json());

app.use(
    session({
        secret: "SuperSecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 2,
        },
    })
);

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

app.get("/api", (req, res) => {
    res.json({ status: "Server is running your highness." });
});

app.post("/api/register", async (req,res) => {
    const { email, password} = req.body;
    try{
        const result = await db.registerUser(email, password);
        res.status(200).json({
            success: true,
            message: "User registered successfully",
            userId: result.insertId,
        });
    }catch(error){
        console.log(chalk.redBright("Error during registration: "), error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error",
        });
    }
});

app.post("/api/login", async (req,res) => {
    const {email, password} = req.body;
    try{
        db.loginUser(email,password,req,res);
    }catch(err){
        res.status(500).json({message: "Internal server error."})
    }
});

app.post("/api/authcheck", async (req,res) => {
    try{
        db.isLoggedIn(req,res);
    }catch(error){
        console.log(chalk.redBright("Error during auth check: "), error);
        res.status(500).json({message: "Internal server error."})
    }
});

app.post("/api/logout", (req,res) =>{
    if(req.session){
        req.session.destroy((err) => {
            if (err){
                console.log(chalk.redBright("Error during logout:"), err);
                return res.status(500).json({message: "Internal server error."})
            }
            res.status(200).json({
                success: true,
                message: "Logged out successfully."
            });
        });
    }else{
        res.status(200).json({
            success: false,
            message: "No active session found."
        });
    }
});

app.listen(5000, () => {
    console.log(chalk.cyanBright("Server is running on http://localhost:5000"));
});