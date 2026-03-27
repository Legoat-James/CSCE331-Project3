import express from "express"
import cors from "cors"
import "dotenv/config"
import path from "path"
import { fileURLToPath } from "url"
import errorHandler from "./helpers/errorHandler.js";
import ApiError from "./helpers/ApiError.js";
import pool from "./config/db.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://project3-backend.duckdns.org',
          'http://localhost:3000',  // for local dev
          'http://localhost:5000'   // for serving React from Express
          ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Routes
app.get('/api', (req, res, next) => {
  res.json({ message: 'Hello from Express backend!' });
});

app.get('/api/health', (req, res, next) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res, next) => {
  try{
      const { isError } = req.query;
      if(isError === "true"){
        throw new ApiError(400, "test error", {
          extraMessage: {
            "field": "type",
            "message" : "an error was thrown"
          }
        });
      }else{
        res.json({
          message: "all good, backend API working"
        });
      }
  }catch(err){
    next(err);
  }
});

app.get('/api/menu-items', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM menu');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/test-db', async (req, res, next) => {
  try {
    // Check if employees table exists and its structure
    const tableCheck = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'employees'
    `);

    if (tableCheck.rows.length === 0) {
      return res.json({
        message: 'employees table does not exist',
        suggestion: 'You may need to create the employees table first'
      });
    }

    res.json({
      message: 'employees table structure',
      columns: tableCheck.rows
    });
  } catch (err) {
    next(err);
  }
});

/*TODO Add support for login api being used in cashier view */
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Debug logging
    console.log('Login attempt - Raw body:', req.body);
    console.log('Username type:', typeof username, 'Value:', username);
    console.log('Password type:', typeof password, 'Value:', password ? '[HIDDEN]' : password);

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }

    // Ensure they are strings
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        message: 'Username and password must be strings'
      });
    }

    // Query database for user (adjust table/column names to match your schema)
    const { rows } = await pool.query(
      'SELECT * FROM employees WHERE username = $1',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid username or password'
      });
    }

    const user = rows[0];

    // Check password (in production, you'd hash passwords)
    // For now, assuming plain text comparison
    if (user.password !== password) {
      return res.status(401).json({
        message: 'Invalid username or password'
      });
    }

    // Successful login - return user info (exclude password)
    const { password: userPassword, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token: `simple-token-${user.id}` // In production, use JWT
    });

  } catch (err) {
    next(err);
  }
});

// Error handler middleware (must be before catch-all)
app.use(errorHandler);

// Catch-all handler: send back React's index.html file for non-API routes
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});