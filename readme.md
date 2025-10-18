# How to run the code

Either use git to clone the repository

```
git clone https://github.com/darkk1ngt/Pauls-express-repo
```

or download zip from GitHub and extract

# Prerequisites

-   Node.js installed
-   XAMPP (or another MySQL/MariaDB server) running

# Running the website

**IMPORTANT: Ensure you have XAMPP MySQL/MariaDB server running before starting!**

Open two terminals

1. Navigate to the "client" folder in one terminal
2. Navigate to the "server" folder in the other terminal

Your filepath should look like:

-   `... Pauls-express-react/server-side>`
-   `... Pauls-express-react/client-side>`

In **both terminals**, run:

```
npm i
```

Then in **both terminals**, run:

```
npm start
```

-   Client will run on: http://localhost:3000 --> go to this link
-   Server will run on: http://localhost:5000

The database will automatically create itself on first run.

# Database Configuration

Default MySQL connection settings (in `server/db.js`):

-   Host: `localhost`
-   User: `root`
-   Password: `` (empty)
-   Database: `restaurant_db` (auto-created)

If your MySQL uses different credentials, update `server/db.js`.