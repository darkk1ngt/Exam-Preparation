const express = require("express");
const chalk = require("chalk");
const cors = require("cors");
const session = require("express-session");

const app = express();
const db = require("./db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
  res.json({ status: "Server is running" });
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.registerUser(email, password);
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      userId: result.userId,
    });
  } catch (error) {
    console.log(chalk.redBright("Error during registration:"), error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    db.loginUser(email, password, res, req);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/authcheck", async (req, res) => {
  try {
    db.isLoggedIn(req, res);
  } catch (error) {
    console.log(chalk.redBright("Error during auth check:"), error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.log(chalk.redBright("Error during logout:"), err);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    });
  } else {
    res.status(200).json({
      success: false,
      message: "No active session found",
    });
  }
});

app.post("/api/forgot", async (req, res) => {
  const { email } = req.body;
  try {
    await db.createPasswordReset(email, res);
  } catch (err) {
    res.status(500).json({ message: "Internal server error: " + err });
  }
});

app.post("/api/reset", async (req, res) => {
  const { token, password } = req.body;
  try {
    await db.completePasswordReset(token, password, res);
  } catch (err) {
    res.status(500).json({ message: "Internal server error: " + err });
  }
});

app.get("/api/profile", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await db.getUserInfo(req.session.userId);
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(chalk.redBright("Error fetching profile:"), error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
});

app.delete("/api/account", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    await db.deleteUserAccount(req.session.userId);

    req.session.destroy((err) => {
      if (err) {
        console.log(chalk.redBright("Error destroying session"), err);
      }
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.log(chalk.redBright("Error deleting account:"), error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
});

app.listen(5000, () => {
  console.log(chalk.cyanBright("Your server is running on http://localhost:5000 your majesty."));
});
