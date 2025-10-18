const mysql = require("mysql2"); // used to contact the database
const bcrypt = require("bcrypt"); // used to hash the password
const crypto = require("crypto"); // used to generate password reset token
const chalk = require("chalk"); // different font colours in console

const dbSchemaFile = "./dbschema.sql";

let pool;

async function checkDatabaseExists(connection) {
  try {
    const [databases] = await connection.query(
      "SHOW DATABASES LIKE 'restaurant'"
    );
    return databases.length > 0;
  } catch (err) {
    console.error(chalk.redBright("Error checking database existence:"), err);
    return false;
  }
}

async function runCreateDatabase(connection) {
  const schemaSQL = require("fs").readFileSync(dbSchemaFile, "utf8");
  const statements = schemaSQL
    .split(";")
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);

  for (const statement of statements) {
    if (statement.trim()) {
      console.log(
        chalk.blueBright(`Executing: ${statement.substring(0, 50)}...`)
      );
      await connection.query(statement);
    }
  }

  console.log(chalk.greenBright("Database schema setup completed"));
}

async function initialiseDatabase() {
  try {
    const connection = await mysql
      .createConnection({
        host: "localhost",
        user: "root",
        password: "",
      })
      .promise();

    const databaseExists = await checkDatabaseExists(connection);

    if (!databaseExists) {
      console.log(
        chalk.yellowBright(
          "Database 'restaurant' not found, setting up database schema..."
        )
      );
      await runCreateDatabase(connection);
    }

    await connection.end();

    pool = mysql
      .createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "restaurant",
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
      })
      .promise();

    console.log(chalk.cyan("Database connection pool established"));
  } catch (err) {
    console.error(chalk.redBright("Error initialising database:"), err);
    throw err;
  }
}

initialiseDatabase();

async function doesAccountExist(email) {
  const [existingUsers] = await pool.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return existingUsers.length > 0;
}

async function registerUser(email, password) {
  const accountExists = await doesAccountExist(email);

  if (accountExists) {
    const error = new Error("Email already registered");
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.execute(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
    [email, hashedPassword]
  );

  return result;
}

async function loginUser(email, password, res, req) {
  const [existingUsers] = await pool.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (existingUsers.length < 1) {
    return res.status(400).json({ message: "Email does not exist" });
  }

  const hashedPassword = existingUsers[0].password_hash;
  if (!hashedPassword) {
    return res.status(500).json({ message: "Password error" });
  }

  const valid = await bcrypt.compare(password, hashedPassword);
  if (!valid) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  req.session.userId = existingUsers[0].id;
  res.status(200).json({ message: "Login successful" });
}

async function isLoggedIn(req, res) {
  if (req.session && req.session.userId) {
    res.status(200).json({ loggedIn: true, userId: req.session.userId });
  } else {
    res.status(200).json({ loggedIn: false });
  }
}

async function createPasswordReset(email, res) {
  const accountExists = await doesAccountExist(email);

  if (!accountExists) {
    const error = new Error("Email is not registered");
    error.statusCode = 400;
    throw error;
  }

  const token = crypto.randomBytes(32).toString("hex");

  await pool.execute("UPDATE users SET reset_token = ? WHERE email = ?", [
    token,
    email,
  ]);

  await pool.execute(
    "UPDATE users SET reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?",
    [email]
  );

  res.status(200).json({
    message: "Password reset token created.",
    resetToken: token,
  });
}

async function completePasswordReset(token, newPassword, res) {
  if (!token || typeof token !== "string" || token.length !== 64) {
    const error = new Error("Invalid token format");
    error.statusCode = 400;
    throw error;
  }

  if (!newPassword) {
    const error = new Error("Invalid Password");
    error.statusCode = 400;
    throw error;
  }

  const [users] = await pool.execute(
    "SELECT id, reset_expires FROM users WHERE reset_token = ?",
    [token]
  );

  if (users.length === 0) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 400;
    throw error;
  }

  const user = users[0];

  if (!user.reset_expires || new Date(user.reset_expires) < new Date()) {
    await pool.execute(
      "UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE id = ?",
      [user.id]
    );

    const error = new Error("Token has expired");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const [result] = await pool.execute(
    "UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
    [hashedPassword, user.id]
  );

  if (result.affectedRows === 0) {
    const error = new Error("Failed to update password");
    error.statusCode = 500;
    throw error;
  }

  res.status(200).json({ message: "Password has been reset successfully." });
}

async function getUserInfo(userId) {
  const [users] = await pool.execute(
    "SELECT id, email FROM users WHERE id = ?",
    [userId]
  );

  if (users.length === 0) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return users[0];
}

async function deleteUserAccount(userId) {
  const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [
    userId,
  ]);

  if (result.affectedRows === 0) {
    const error = new Error("User not found or already deleted");
    error.statusCode = 404;
    throw error;
  }

  return result;
}

module.exports = { doesAccountExist };
module.exports.registerUser = registerUser;
module.exports.loginUser = loginUser;
module.exports.isLoggedIn = isLoggedIn;
module.exports.createPasswordReset = createPasswordReset;
module.exports.completePasswordReset = completePasswordReset;
module.exports.getUserInfo = getUserInfo;
module.exports.deleteUserAccount = deleteUserAccount;
