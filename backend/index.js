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

// Catch-all handler: send back React's index.html file for non-API routes
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(errorHandler);