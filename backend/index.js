import express from "express"
import cors from "cors"
import "dotenv/config"
import path from "path"
import { fileURLToPath } from "url"
import errorHandler from "./helpers/errorHandler.js";
import ApiError from "./helpers/ApiError.js";
import pg from "pg";


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

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
  ssl: {rejectUnauthorized: false}
});

/* 
Menu Endpoints

*/

app.get('/api/get-full-menu', async (req,res,next)=>{
  try{
    const result = await pool.query("SELECT * FROM menu ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  }catch(err){
    next(err);
  }
});

app.get('/api/get-topping-menu', async (req,res,next)=>{
  try{
    const result = await pool.query("SELECT * FROM menu WHERE category = 'topping' ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  }catch(err){
    next(err);
  }
});

app.get('/api/get-mod-menu', async (req,res,next)=>{
  try{
    const result = await pool.query("SELECT * FROM menu WHERE category = 'modifications' ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  }catch(err){
    next(err);
  }
});



/* 
Employee Endpoints

*/
app.get('/api/get-employees', async (req, res, next) => {
  try{
    const result = await pool.query('SELECT username FROM employees');
    const employeeList = result.rows;
    const passedObject = {
        title: "home",
        employees: employeeList
    }
    res.json(passedObject);
  }catch(err){
    next(err);
  }
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