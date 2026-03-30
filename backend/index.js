import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import errorHandler from "./helpers/errorHandler.js";
import ApiError from "./helpers/ApiError.js";
import pg from "pg";
import crypto from "crypto";
import bcrypt from "bcrypt";
import OAuth2 from "google-auth-library";
import swaggerJSDoc from "swagger-jsdoc";
import cookieParser from "cookie-parser";
import swaggerUi from 'swagger-ui-express';

// Support running backend from either repo root or backend/ folder.
// This loads the first matching .env values without overriding already-set vars.
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '../.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}


const app = express();
const PORT = process.env.PORT || 5000;
const googleClient = new OAuth2.OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//global variable to enable/disable employee/manager authentication for associated endpoints
const enableAuthentication = false;

// Middleware
app.use(cors({
  origin: ['https://project3-backend.duckdns.org',
          'http://localhost:3000',  // for local dev
          'http://localhost:5000'   // for serving React from Express
          ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


if(process.env.NODE_ENV === "development"){
  const swaggerFilePath = path.resolve(process.cwd(), "swagger-out.json");

  if (fs.existsSync(swaggerFilePath)) {
    const swaggerFile = JSON.parse(fs.readFileSync(swaggerFilePath, "utf-8"));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
    console.log('API Docs available at http://localhost:5000/api-docs');
  } else {
    console.warn('Swagger docs disabled: swagger-out.json not found. Run `npm run swagger`.');
  }
}


const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
  ssl: {rejectUnauthorized: false}
});


const requireAuth = (needsManager = false) =>{
    return async (req,res,next)=>{
      try {
      //grab the session token cookie
      const token = req.cookies.session_token;
      if (!token) {
        throw new ApiError(401, "Unauthorized: No session token provided.",null,req.path);
      }

      //check if user exists
      const result = await pool.query(
        'SELECT * FROM employees WHERE session_token = $1 AND is_active = true', 
        [token]
      );
      
      if (result.rows.length === 0) {
        throw new ApiError(401, "Unauthorized: Invalid or expired session.",null,req.path);
      }

      const user = result.rows[0];

      //check manager role
      if (needsManager && !user.is_manager) {
        throw new ApiError(403, "Forbidden: Manager access required.",null,req.path);
      }

      //attach user to the request so the endpoint can use it
      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  }
};


/* 
Menu Endpoints

*/

app.get('/api/menu/all', async (req,res,next)=>{
  try{
    // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all items in the menu (that are enabled)"
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the menu list',
            schema: [{ 
                menu_id: 67, 
                name: 'Fries', 
                category: 'Food',
                cost: 4.99,
                is_active: true 
            }]
    } */

    const result = await pool.query("SELECT * FROM menu WHERE is_active = true ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  }catch(err){
    next(err);
  }
});

app.get('/api/menu/manager-all', requireAuth(true), async (req,res,next)=>{
  // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all items in the menu for managers"
    // #swagger.security = [{"cookieAuth": []}]
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the menu list',
            schema: [{ 
                menu_id: 67, 
                name: 'Fries', 
                category: 'Food',
                cost: 4.99,
                is_active: true 
            }]
    } */
  try{
    const result = await pool.query("SELECT * FROM menu ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  }catch(err){
    next(err);
  }
});

app.get('/api/menu/toppings', async (req,res,next)=>{
  // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all toppings items in the menu (that are enabled)"
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the topping menu list',
            schema: [{ 
                menu_id: 67, 
                name: 'Boba Pearls', 
                category: 'Topping',
                cost: 4.99,
                is_active: true 
            }]
    } */
  try{
    const result = await pool.query("SELECT * FROM menu WHERE category = 'topping' AND is_active = true ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  }catch(err){
    next(err);
  }
});

app.get('/api/menu/mods', async (req,res,next)=>{
  // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all modification items in the menu (that are enabled)"
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the modifications menu list',
            schema: [{ 
                menu_id: 67, 
                name: 'Add Sugar', 
                category: 'Modification',
                cost: 4.99,
                is_active: true 
            }]
    } */
  try{
    const result = await pool.query("SELECT * FROM menu WHERE category = 'modifications' AND is_active = true ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  }catch(err){
    next(err);
  }
});

app.get('/api/menu/details', async (req,res,next)=>{
    // #swagger.tags = ['Menu']
    // #swagger.summary = "Get a specific menu item"
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the menu item',
            schema: { 
                menu_id: 67, 
                name: 'Add Sugar', 
                category: 'Modification',
                cost: 4.99,
                is_active: true 
            }
    } */
    /*#swagger.parameters['menuID'] = {
      in: 'query',                        
            description: 'The ID of the menu item',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }*/
  try{
    const menuID = req.query.menuID;
    if(!menuID) {
       throw new ApiError(400, "Missing Menu ID",null,req.path);
    }
    if(Number.isNaN(Number(menuID))) {
       throw new ApiError(400, "Menu ID must be an integer",null,req.path);
    }
    const query = "SELECT * FROM menu WHERE menu_id = $1;"
    const insertValues = [menuID];

    const result = await pool.query(query, insertValues);
    const menuItem = result.rowCount != 0 ? result.rows[0] : {};
    res.json(menuItem);

  }catch(err){
    next(err);
  }
});

app.put('/api/menu/update', requireAuth(true), async (req,res,next)=>{
    /* #swagger.tags = ['Menu']
    #swagger.summary = "Update a specific menu item"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully updated the menu item',
            schema: { 
                menu_id: 67, 
                name: 'Add Sugar', 
                category: 'Modification',
                cost: 4.99,
                is_active: true 
            }
    } 
    #swagger.parameters['menuID'] = {
      in: 'query',                        
            description: 'The ID of the menu item',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }
    #swagger.parameters['item'] = {
            in: 'body',
            description: 'new Menu item data',
            required: true,
            schema: {
                name: "example-food",
                category: "food",
                cost: "9.99"
            }
        }        
    */
  try{
    const menuID = req.query.menuID;
    if(!menuID) {
       throw new ApiError(400, "Missing Menu ID",null,req.path);
    }
    if(Number.isNaN(Number(menuID))) {
       throw new ApiError(400, "Menu ID must be an integer",null,req.path);
    }
    if(!req.body){
      throw new ApiError(400, "Missing 'item'",null,req.path);
    }
    const name = req.body.name;
    const category = req.body.category;
    const cost = req.body.cost;
    if(!name || !category || !cost){
      throw new ApiError(400, "Missing fields in 'item'",null,req.path);
    }
    
    if(Number.isNaN(parseFloat(cost))) {
       throw new ApiError(400, "Item cost must be an floating point number.",null,req.path);
    }

    const query = "UPDATE menu SET name = $1, category = $2, cost = $3 WHERE menu_id = $4 RETURNING *;"
    const insertValues = [name, category, cost, menuID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if(result.rowCount == 0){
      throw new ApiError(404, "Could not find a menu item to update with this ID", null,req.path);
    }
    const updatedItem = result.rows[0];
    res.json(updatedItem);

  }catch(err){
    next(err);
  }
});

//deletes don't actually remove items, because that results in two options
// 1. will 100% always result in an error, because every menu item is (usually) associated with orders, recipes, etc, will throw a foreign key error
// 2. can delete it with a cascade delete, but then all recipes, ingredients, and orders associated also get deleted.
//Instead we will toggle a boolean.
app.delete('/api/menu/disable', requireAuth(true), async (req,res,next)=>{
  /* #swagger.tags = ['Menu']
    #swagger.summary = "Disable(Delete) a specific menu item"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully disabled the menu item',
            schema: { 
                menu_id: 67, 
                name: 'Add Sugar', 
                category: 'Modification',
                cost: 4.99,
                is_active: true 
            }
    } 
    #swagger.parameters['menuID'] = {
      in: 'query',                        
            description: 'The ID of the menu item',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }      
    */
  try{
    const menuID = req.query.menuID;
    if(!menuID) {
       throw new ApiError(400, "Missing Menu ID",null,req.path);
    }
    if(Number.isNaN(Number(menuID))) {
       throw new ApiError(400, "Menu ID must be an integer",null,req.path);
    }

    const query = "UPDATE menu SET is_active = false WHERE menu_id = $1 RETURNING *;"
    const insertValues = [menuID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if(result.rowCount == 0){
      throw new ApiError(404, "Could not find a menu item to disable with this ID", null,req.path);
    }
    const updatedItem = result.rows[0];
    res.json(updatedItem);

  }catch(err){
    next(err);
  }
});

app.patch('/api/menu/enable', requireAuth(true), async (req,res,next)=>{
  /* #swagger.tags = ['Menu']
    #swagger.summary = "Re-enables a specific menu item. Can be used for stuff like seasonal items."
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully enabled the menu item',
            schema: { 
                menu_id: 67, 
                name: 'Add Sugar', 
                category: 'Modification',
                cost: 4.99,
                is_active: true 
            }
    } 
    #swagger.parameters['menuID'] = {
      in: 'query',                        
            description: 'The ID of the menu item',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }      
    */
  try{
    const menuID = req.query.menuID;
    if(!menuID) {
       throw new ApiError(400, "Missing Menu ID",null,req.path);
    }
    if(Number.isNaN(Number(menuID))) {
       throw new ApiError(400, "Menu ID must be an integer",null,req.path);
    }

    const query = "UPDATE menu SET is_active = true WHERE menu_id = $1 RETURNING *;"
    const insertValues = [menuID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if(result.rowCount == 0){
      throw new ApiError(404, "Could not find a menu item to enable with this ID", null,req.path);
    }
    const updatedItem = result.rows[0];
    res.json(updatedItem);

  }catch(err){
    next(err);
  }
});

app.post('/api/menu/create', requireAuth(true), async (req,res,next)=>{
   /* #swagger.tags = ['Menu']
    #swagger.summary = "Creates a new menu item"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully created the menu item',
            schema: { 
                menu_id: 67, 
                name: 'Add Sugar', 
                category: 'Modification',
                cost: 4.99,
                is_active: true 
            }
    } 
    #swagger.parameters['item'] = {
            in: 'body',
            description: 'new Menu item data',
            required: true,
            schema: {
                name: "example-food",
                category: "food",
                cost: "9.99"
            }
        }        
    */
  try{
    console.log(req.body);
    if(!req.body){
      throw new ApiError(400, "Missing 'item'",null,req.path);
    }
    const name = req.body.name;
    const category = req.body.category;
    const cost = req.body.cost;
    if(!name || !category || !cost){
      throw new ApiError(400, "Missing fields in 'item'",null,req.path);
    }
    
    if(Number.isNaN(parseFloat(cost))) {
       throw new ApiError(400, "Item cost must be an floating point number.",null,req.path);
    }

    const query = "INSERT INTO menu (name, category, cost) VALUES ($1, $2, $3) RETURNING *;"
    const insertValues = [name, category, cost];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if(result.rowCount == 0){
      throw new ApiError(404, "Could not create a menu item to update with this ID", null,req.path);
    }
    const updatedItem = result.rows[0];
    res.json(updatedItem);

  }catch(err){
    next(err);
  }
});



/* 
Employee Endpoints: restricted to managers
query parameter: employeeID
endpoint example: /api/update-employee?employeeID=1
*/

//employeeID not required
app.get('/api/employee/all', requireAuth(false), async (req, res, next) => {
    /* #swagger.tags = ['Employees']
    #swagger.summary = "Get all employees (that are enabled)"
    #swagger.security = [{"cookieAuth": []}]
    #swagger.responses[200] = { 
            description: 'Successfully retrieved the employees list',
            schema: [{ 
                employee_id: 0, 
                name: 'John_Doe', 
                password: 'Password123',
                is_manager: true,
                username: 'John_Doe@gmail.com',
                is_active: true 
            }]
    } */
  try{
    const result = await pool.query('SELECT username FROM employees WHERE is_active = true ORDER BY employee_id');
    const employeeList = result.rows;
    res.json(employeeList);
  }catch(err){
    next(err);
  }
});

//endpoint example: /api/update-employee?employeeID=1
//requires 'employee' object to be sent over
//example format
/* 

*/
app.put('/api/employee/update', requireAuth(true), async (req,res,next)=>{
  /* #swagger.tags = ['Employees']
    #swagger.summary = "Updates an employee's attributes"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully updated the employee',
            schema: { 
                employee_id: 0, 
                name: 'John_Doe', 
                password: 'Password123',
                is_manager: true,
                username: 'John_Doe@gmail.com',
                is_active: true 
            }
    } 
    #swagger.parameters['employeeID'] = {
      in: 'query',                        
            description: 'The ID of the employee to be updated',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }
    #swagger.parameters['employee'] = {
            in: 'body',
            description: 'updated employee data',
            required: true,
            schema: {
                name: "Jane_Doe",
                password: "MyPass123",
                is_manager: true,
                username: "Jane_Doe@gmail.com"
            }
        }        
    */
  try{
    const employeeID = req.query.employeeID;
    if(!employeeID) {
       throw new ApiError(400, "Missing Employee ID",null,req.path);
    }
    if(Number.isNaN(Number(employeeID))) {
       throw new ApiError(400, "Employee ID must be an integer",null,req.path);
    }
    if(!req.body){
      throw new ApiError(400, "Missing 'employee'",null,req.path);
    }
    const name = req.body.name;
    const password = req.body.password;
    const is_manager = req.body.is_manager;
    const username = req.body.username;
    if(!name || !password || !is_manager || !username){
      throw new ApiError(400, "Missing fields in 'employee'",null,req.path);
    }
    

    const query = "UPDATE employees SET name = $1, password = $2, is_manager = $3, username = $4 WHERE menu_id = $5 RETURNING *;"
    const insertValues = [name, password, is_manager, username, employeeID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if(result.rowCount == 0){
      throw new ApiError(404, "Could not find a employee to update with this ID", null,req.path);
    }
    const updatedEmployee = result.rows[0];
    res.json(updatedEmployee);

  }catch(err){
    next(err);
  }
});

app.post('/api/employee/create', requireAuth(true), async (req,res,next)=>{
  /* #swagger.tags = ['Employees']
    #swagger.summary = "Creates an employee"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully created the employee',
            schema: { 
                employee_id: 0, 
                name: 'John_Doe', 
                password: 'Password123',
                is_manager: true,
                username: 'John_Doe@gmail.com',
                is_active: true 
            }
    } 
    #swagger.parameters['employee'] = {
            in: 'body',
            description: 'new employee data',
            required: true,
            schema: {
                name: "Jane_Doe",
                password: "MyPass123",
                is_manager: true,
                username: "Jane_Doe@gmail.com"
            }
        }        
    */
  try{
    if(!req.body){
      throw new ApiError(400, "Missing 'employee'",null,req.path);
    }
    const name = req.body.name;
    const password = req.body.password;
    const is_manager = req.body.is_manager;
    const username = req.body.username;
    if(!name || !password || !is_manager || !username){
      throw new ApiError(400, "Missing fields in 'employee'",null,req.path);
    }
    

    const query = "INSERT INTO employees (name, password, is_manager, username) VALUES ($1, $2, $3, $4) RETURNING *;"
    const insertValues = [name, password, is_manager, username];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if(result.rowCount == 0){
      throw new ApiError(500, "Could not create an employee", null,req.path);
    }
    const newEmployee = result.rows[0];
    res.json(newEmployee);

  }catch(err){
    next(err);
  }
});

app.patch('/api/employee/enable', requireAuth(true), async (req,res,next)=>{
  /* #swagger.tags = ['Employees']
    #swagger.summary = "Re-enables an employee"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully enabled the employee',
            schema: { 
                employee_id: 0, 
                name: 'John_Doe', 
                password: 'Password123',
                is_manager: true,
                username: 'John_Doe@gmail.com',
                is_active: true 
            }
    } 
    #swagger.parameters['employeeID'] = {
      in: 'query',                        
            description: 'The ID of the employee to be updated',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }     
    */
  try{
    const employeeID = req.query.employeeID;
    if(!employeeID) {
       throw new ApiError(400, "Missing Employee ID",null,req.path);
    }
    if(Number.isNaN(Number(employeeID))) {
       throw new ApiError(400, "Employee ID must be an integer",null,req.path);
    }
    

    const query = "UPDATE employees SET is_active = true WHERE employee_id = $1 RETURNING *;"
    const insertValues = [employeeID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if(result.rowCount == 0){
      throw new ApiError(404, "Could not enable an employee with this ID", null,req.path);
    }
    const updatedEmployee = result.rows[0];
    res.json(updatedEmployee);

  }catch(err){
    next(err);
  }
});

app.delete('/api/employee/disable', requireAuth(true), async (req,res,next)=>{
  /* #swagger.tags = ['Employees']
    #swagger.summary = "Deletes (disables) an employee"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully disabled the employee',
            schema: { 
                employee_id: 0, 
                name: 'John_Doe', 
                password: 'Password123',
                is_manager: true,
                username: 'John_Doe@gmail.com',
                is_active: true 
            }
    } 
    #swagger.parameters['employeeID'] = {
      in: 'query',                        
            description: 'The ID of the employee to be updated',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }     
    */
  try{
    const employeeID = req.query.employeeID;
    if(!employeeID) {
       throw new ApiError(400, "Missing Employee ID",null,req.path);
    }
    if(Number.isNaN(Number(employeeID))) {
       throw new ApiError(400, "Employee ID must be an integer",null,req.path);
    }
    

    const query = "UPDATE employees SET is_active = false WHERE employee_id = $1 RETURNING *;"
    const insertValues = [employeeID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if(result.rowCount == 0){
      throw new ApiError(404, "Could not disable an employee with this ID", null,req.path);
    }
    const updatedEmployee = result.rows[0];
    res.json(updatedEmployee);

  }catch(err){
    next(err);
  }
});

app.post('/api/employee/login', async (req,res,next)=>{
  /* #swagger.tags = ['Employees']
      #swagger.summary = "Login via Username/Password OR Google OAuth"
      #swagger.parameters['loginData'] = {
          in: 'body',
          description: 'Provide username/password OR a googleToken',
          schema: {
              username: 'John_Doe@gmail.com',
              password: 'Password123',
              googleToken: 'eyJhbGciOiJSUzI1NiIs...'
          }
      }
      #swagger.responses[200] = { 
          description: 'Login successful, session cookie set',
          schema: { message: "Login successful", user: 
          {employee_id: 1, name: "John_Doe", 
            is_manager: true, 
            username: "John_Doe@gmail.com",
            is_active: true,
            session_token: "eY8Cj@p00Sd...",
            google_id: "efdsfsd.... or null"
            } 
          }
      } 
      #swagger.responses[401] = { description: 'Invalid credentials' } 
  */
  try{
    const {username, password, googleToken } = req.body;
    let user = null;
    // if(googleToken){
    //   const ticket = await googleClient.verifyIdToken({
    //     idToken: googleToken,
    //     audience: process.env.GOOGLE_CLIENT_ID
    //   });
    //   const payload = ticket.getPayload();
    //   const email = payload.email;
    //   const name = payload.name;
  
    //   const googleResult = await pool.query(
    //       'SELECT * FROM employees WHERE username = $1 OR google_id = $2 AND is_active = true',
    //       [email, payload.sub]
    //     );
    //   if(googleResult.rows.length === 0){
    //     throw new ApiError(401, "No active employee found for this Google account.")
    //   }
    //   user = googleResult.rows[0];
    // }

    if(username && password){
      const query = "SELECT * FROM employees WHERE username = $1 AND is_active = true;"
      const insertValues = [username];
      const result = await pool.query(query, insertValues);
      if(result.rows.length > 0){
        const goodPassword = await bcrypt.compare(password, result.rows[0].password);
        if(goodPassword){
          user = result.rows[0];
        }
      }
    }
    if(!user){
      throw new ApiError(401,"Invalid credentials.");
    }

    //generate session cookie
    const sessionToken = crypto.randomBytes(32).toString('hex');
    //save the token to the current user
    await pool.query('UPDATE employees SET session_token = $1 WHERE employee_id = $2', [sessionToken, user.employee_id]);
    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 // 1 day 
    });


    { //scope inside to avoid another named password variable
      const {password, ...restOfUser} = user;
      res.json({
      message: "login successful",
      user: {
        ...restOfUser,
        session_token: sessionToken
      }
      });
      return;
    }

  }catch(err){
    next(err);
  }
});

app.post('/api/employee/logout', async (req,res,next)=>{
  /* #swagger.tags = ['Employees']
      #swagger.summary = "Logout as an employee/manager"
      #swagger.responses[200] = { 
          description: 'Logout successful',
          schema: { message: "Logout successful" }
      } 
  */
  try{
    const sessionToken = req.cookies.session_token;

    if (sessionToken) {
      await pool.query(
        'UPDATE employees SET session_token = NULL WHERE session_token = $1',
        [sessionToken]
      );
    }
    res.clearCookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    });

    res.json({
      message: "login successful"
    });

  }catch(err){
    next(err);
  }
});

app.get('/api/employee/auth', requireAuth(false), async (req,res,next)=>{
  /* #swagger.tags = ['Employees']
      #swagger.summary = "Authenticate an employee using their session_token cookie"
      #swagger.responses[200] = { 
          description: 'Authentication successful, user object returned',
          schema: { message: "Authentication successful", user: 
          {employee_id: 1, name: "John_Doe", 
            is_manager: true, 
            username: "John_Doe@gmail.com",
            is_active: true,
            session_token: "eY8Cj@p00Sd...",
            google_id: "efdsfsd.... or null"
            } 
          }
      } 
      #swagger.responses[401] = { description: 'Invalid cookie' } 
  */
  try{
    console.log(req.user);
    const {password, session_token, google_id, is_active, ...restUser} = req.user;
    res.json({
      message: "Authentication successful",
      user: restUser
    });

  }catch(err){
    next(err);
  }
});

const submitOrderHandler = async (req, res, next) => {
  /* #swagger.tags = ['Orders']
      #swagger.summary = 'Submit customer order, append history, and decrement ingredient stock'
      #swagger.parameters['orderData'] = {
          in: 'body',
          description: 'Order payload',
          required: true,
          schema: {
            orderTotal: 12.5,
            employeeId: 1,
            customerName: 'Guest',
            orderItems: [
              {
                menuId: 41,
                quantity: 1,
                toppings: [
                  { id: 61, qty: 1 }
                ]
              }
            ]
          }
      }
  */
  const client = await pool.connect();

  try {
    const { orderTotal, employeeId, customerName, orderItems } = req.body || {};

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      throw new ApiError(400, 'orderItems is required and must contain at least one item.', null, req.path);
    }

    const parsedOrderTotal = Number(orderTotal);
    if (!Number.isFinite(parsedOrderTotal) || parsedOrderTotal < 0) {
      throw new ApiError(400, 'orderTotal must be a valid non-negative number.', null, req.path);
    }

    const parsedEmployeeId = employeeId === null || employeeId === undefined
      ? null
      : Number(employeeId);

    if (parsedEmployeeId !== null && !Number.isInteger(parsedEmployeeId)) {
      throw new ApiError(400, 'employeeId must be an integer when provided.', null, req.path);
    }

    const normalizedCustomerName = String(customerName || 'Guest').trim() || 'Guest';

    const normalizedItems = orderItems.map((item, itemIndex) => {
      const menuId = Number(item?.menuId);
      const quantity = Number(item?.quantity ?? 1);

      if (!Number.isInteger(menuId)) {
        throw new ApiError(400, `orderItems[${itemIndex}].menuId must be an integer.`, null, req.path);
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(400, `orderItems[${itemIndex}].quantity must be an integer >= 1.`, null, req.path);
      }

      const toppings = (Array.isArray(item?.toppings) ? item.toppings : []).map((topping, toppingIndex) => {
        const toppingId = Number(topping?.id);
        const toppingQty = Number(topping?.qty ?? topping?.quantity ?? 1);

        if (!Number.isInteger(toppingId)) {
          throw new ApiError(400, `orderItems[${itemIndex}].toppings[${toppingIndex}].id must be an integer.`, null, req.path);
        }

        if (!Number.isInteger(toppingQty) || toppingQty < 1) {
          throw new ApiError(400, `orderItems[${itemIndex}].toppings[${toppingIndex}].qty must be an integer >= 1.`, null, req.path);
        }

        return {
          id: toppingId,
          qty: toppingQty,
        };
      });

      return {
        menuId,
        quantity,
        toppings,
      };
    });

    await client.query('BEGIN');

    // Manual IDs are used in this schema, so lock related tables before MAX(id)+1 generation.
    await client.query('LOCK TABLE transactions IN EXCLUSIVE MODE');
    await client.query('LOCK TABLE order_history IN EXCLUSIVE MODE');
    await client.query('LOCK TABLE toppings IN EXCLUSIVE MODE');

    const nextOrderIdResult = await client.query('SELECT COALESCE(MAX(order_id), 0) + 1 AS next_id FROM transactions');
    const nextHistoryIdResult = await client.query('SELECT COALESCE(MAX(history_id), 0) + 1 AS next_id FROM order_history');
    const nextToppingIdResult = await client.query('SELECT COALESCE(MAX(topping_id), 0) + 1 AS next_id FROM toppings');

    const orderId = Number(nextOrderIdResult.rows[0].next_id);
    let nextHistoryId = Number(nextHistoryIdResult.rows[0].next_id);
    let nextToppingId = Number(nextToppingIdResult.rows[0].next_id);

    await client.query(
      'INSERT INTO transactions (order_id, order_total, timestamp, employee_id, customer_name) VALUES ($1, $2, NOW(), $3, $4)',
      [orderId, parsedOrderTotal, parsedEmployeeId, normalizedCustomerName],
    );

    const menuUsageCounts = new Map();
    const addMenuUsage = (menuId, amount) => {
      menuUsageCounts.set(menuId, (menuUsageCounts.get(menuId) || 0) + amount);
    };

    let historyRowsInserted = 0;
    let toppingRowsInserted = 0;

    for (const item of normalizedItems) {
      await client.query(
        'INSERT INTO order_history (history_id, order_id, item_id, quantity) VALUES ($1, $2, $3, $4)',
        [nextHistoryId, orderId, item.menuId, item.quantity],
      );
      nextHistoryId += 1;
      historyRowsInserted += 1;

      addMenuUsage(item.menuId, item.quantity);

      for (const topping of item.toppings) {
        await client.query(
          'INSERT INTO toppings (topping_id, item_menu_id, transaction_id, topping_menu_id, quantity) VALUES ($1, $2, $3, $4, $5)',
          [nextToppingId, item.menuId, orderId, topping.id, topping.qty],
        );
        nextToppingId += 1;
        toppingRowsInserted += 1;

        addMenuUsage(topping.id, topping.qty);
      }
    }

    const usedMenuIds = [...menuUsageCounts.keys()];
    if (usedMenuIds.length > 0) {
      const recipeResult = await client.query(
        'SELECT menu_id, ingredient_id, quantity FROM recipes WHERE menu_id = ANY($1::int[]) AND is_active = true',
        [usedMenuIds],
      );

      const ingredientNeeded = new Map();

      for (const row of recipeResult.rows) {
        const menuId = Number(row.menu_id);
        const ingredientId = Number(row.ingredient_id);
        const recipeQuantity = Number(row.quantity);
        const menuCount = menuUsageCounts.get(menuId) || 0;

        if (menuCount <= 0 || !Number.isFinite(recipeQuantity)) {
          continue;
        }

        const requiredAmount = recipeQuantity * menuCount;
        ingredientNeeded.set(ingredientId, (ingredientNeeded.get(ingredientId) || 0) + requiredAmount);
      }

      const ingredientIds = [...ingredientNeeded.keys()];

      if (ingredientIds.length > 0) {
        const stockResult = await client.query(
          'SELECT ingredient_id, name, stock FROM ingredients WHERE ingredient_id = ANY($1::int[]) FOR UPDATE',
          [ingredientIds],
        );

        const stockByIngredientId = new Map(
          stockResult.rows.map((row) => [
            Number(row.ingredient_id),
            {
              name: row.name,
              stock: Number(row.stock),
            },
          ]),
        );

        for (const [ingredientId, requiredAmount] of ingredientNeeded.entries()) {
          const stockRow = stockByIngredientId.get(ingredientId);

          if (!stockRow) {
            throw new ApiError(500, `Ingredient ${ingredientId} is referenced by recipes but missing from ingredients.`, null, req.path);
          }

          if (stockRow.stock < requiredAmount) {
            throw new ApiError(
              409,
              `Insufficient stock for ingredient '${stockRow.name}'. Need ${requiredAmount.toFixed(2)}, have ${stockRow.stock.toFixed(2)}.`,
              {
                ingredientId,
                ingredientName: stockRow.name,
                needed: requiredAmount,
                available: stockRow.stock,
              },
              req.path,
            );
          }
        }

        for (const [ingredientId, requiredAmount] of ingredientNeeded.entries()) {
          await client.query(
            'UPDATE ingredients SET stock = stock - $1 WHERE ingredient_id = $2',
            [requiredAmount, ingredientId],
          );
        }
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order submitted successfully.',
      orderId,
      orderTotal: parsedOrderTotal,
      itemsRecorded: historyRowsInserted,
      toppingsRecorded: toppingRowsInserted,
    });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // If rollback fails, continue propagating the original error.
    }

    next(err);
  } finally {
    client.release();
  }
};

app.post('/api/orders/submit', submitOrderHandler);
app.post('/api/order/submit', submitOrderHandler);


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

app.use('/api', (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'API endpoint not found.',
    path: req.originalUrl || req.url,
    method: req.method,
  });
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