import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import errorHandler from "./helpers/errorHandler.js";
import ApiError from "./helpers/ApiError.js";
import pg from "pg";
import crypto from "crypto";
import bcrypt from "bcrypt";
import OAuth2 from "google-auth-library";
import swaggerJSDoc from "swagger-jsdoc";
import cookieParser from "cookie-parser";
import swaggerUi from 'swagger-ui-express';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Support running backend from either repo root or backend/ folder.
// This loads the first matching .env values without overriding already-set vars.
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '../.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false, quiet: true });
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


if (process.env.NODE_ENV === "development") {
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
  ssl: { rejectUnauthorized: false }
});


const requireAuth = (needsManager = false) => {
  return async (req, res, next) => {
    try {
      //grab the session token cookie
      const token = req.cookies.session_token;
      if (!token) {
        throw new ApiError(401, "Unauthorized: No session token provided.", null, req.path);
      }

      //check if user exists
      const result = await pool.query(
        'SELECT * FROM employees WHERE session_token = $1 AND is_active = true',
        [token]
      );

      if (result.rows.length === 0) {
        throw new ApiError(401, "Unauthorized: Invalid or expired session.", null, req.path);
      }

      const user = result.rows[0];

      //check manager role
      if (needsManager && !user.is_manager) {
        throw new ApiError(403, "Forbidden: Manager access required.", null, req.path);
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

app.get('/api/menu/all', async (req, res, next) => {
  try {
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

  } catch (err) {
    next(err);
  }
});

app.get('/api/menu/drinks', async (req, res, next) => {
  try {
    // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all drinks in the menu"
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the menu list',
            schema: [{ 
                menu_id: 0, 
                name: 'Black Tea', 
                category: 'Drink',
                cost: 4.99,
                subcategory: 'Teas',
                is_active: true 
            }]
    } */

    const result = await pool.query("SELECT * FROM menu WHERE is_active = true AND category = 'drink' ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  } catch (err) {
    next(err);
  }
});

app.get('/api/menu/drinks/teas', async (req, res, next) => {
  try {
    // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all Tea drinks in the menu"
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the menu list',
            schema: [{ 
                menu_id: 0, 
                name: 'Black Tea', 
                category: 'Drink',
                cost: 4.99,
                subcategory: 'Teas',
                is_active: true 
            }]
    } */

    const result = await pool.query("SELECT * FROM menu WHERE is_active = true AND category = 'drink' AND subcategory = 'Teas' ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  } catch (err) {
    next(err);
  }
});

app.get('/api/menu/drinks/refreshers', async (req, res, next) => {
  try {
    // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all refresher drinks in the menu"
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the menu list',
            schema: [{ 
                menu_id: 0, 
                name: 'Black Tea', 
                category: 'Drink',
                cost: 4.99,
                subcategory: 'Teas',
                is_active: true 
            }]
    } */

    const result = await pool.query("SELECT * FROM menu WHERE is_active = true AND category = 'drink' AND subcategory = 'Refreshers' ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  } catch (err) {
    next(err);
  }
});

app.get('/api/menu/drinks/coffee-matcha', async (req, res, next) => {
  try {
    // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all Coffee/Matcha drinks in the menu"
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the menu list',
            schema: [{ 
                menu_id: 0, 
                name: 'Black Tea', 
                category: 'Drink',
                cost: 4.99,
                subcategory: 'Teas',
                is_active: true 
            }]
    } */

    const result = await pool.query("SELECT * FROM menu WHERE is_active = true AND category = 'drink' AND subcategory = 'Coffee/Matcha' ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  } catch (err) {
    next(err);
  }
});

app.get('/api/menu/drinks/specials', async (req, res, next) => {
  try {
    // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all Tea drinks in the menu"
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the menu list',
            schema: [{ 
                menu_id: 0, 
                name: 'Black Tea', 
                category: 'Drink',
                cost: 4.99,
                subcategory: 'Teas',
                is_active: true 
            }]
    } */

    const result = await pool.query("SELECT * FROM menu WHERE is_active = true AND category = 'drink' AND subcategory = 'Specials' ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  } catch (err) {
    next(err);
  }
});

app.get('/api/menu/drinks/seasonal', async (req, res, next) => {
  try {
    // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all Tea drinks in the menu"
    /* #swagger.responses[200] = { 
            description: 'Successfully retrieved the menu list',
            schema: [{ 
                menu_id: 0, 
                name: 'Black Tea', 
                category: 'Drink',
                cost: 4.99,
                subcategory: 'Teas',
                is_active: true 
            }]
    } */

    const result = await pool.query("SELECT * FROM menu WHERE is_active = true AND category = 'drink' AND subcategory = 'Seasonal' ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  } catch (err) {
    next(err);
  }
});

app.get('/api/menu/manager-all', requireAuth(true), async (req, res, next) => {
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
  try {
    const result = await pool.query("SELECT * FROM menu ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  } catch (err) {
    next(err);
  }
});

app.get('/api/menu/toppings', async (req, res, next) => {
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
  try {
    const result = await pool.query("SELECT * FROM menu WHERE category = 'topping' AND is_active = true ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  } catch (err) {
    next(err);
  }
});

app.get('/api/menu/mods', async (req, res, next) => {
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
  try {
    const result = await pool.query("SELECT * FROM menu WHERE category = 'modifications' AND is_active = true ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  } catch (err) {
    next(err);
  }
});

app.get('/api/menu/details', async (req, res, next) => {
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
  try {
    const menuID = req.query.menuID;
    if (!menuID) {
      throw new ApiError(400, "Missing Menu ID", null, req.path);
    }
    if (Number.isNaN(Number(menuID))) {
      throw new ApiError(400, "Menu ID must be an integer", null, req.path);
    }
    const query = "SELECT * FROM menu WHERE menu_id = $1;"
    const insertValues = [menuID];

    const result = await pool.query(query, insertValues);
    const menuItem = result.rowCount != 0 ? result.rows[0] : {};
    res.json(menuItem);

  } catch (err) {
    next(err);
  }
});

app.put('/api/menu/update', requireAuth(true), async (req, res, next) => {
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
          description: 'new Menu item data. Drinks required a \'subcategory\' ',
          required: true,
          schema: {
              name: "example-food",
              category: "food",
              cost: "9.99"
          }
      }        
  */
  try {
    const menuID = req.query.menuID;
    if (!menuID) {
      throw new ApiError(400, "Missing Menu ID", null, req.path);
    }
    if (Number.isNaN(Number(menuID))) {
      throw new ApiError(400, "Menu ID must be an integer", null, req.path);
    }
    if (!req.body) {
      throw new ApiError(400, "Missing 'item'", null, req.path);
    }
    const name = req.body.name;
    const category = req.body.category;
    const cost = req.body.cost;
    const subcategory = req.body.subcategory ? req.body.subcategory : "";
    if (!name || !category || !cost) {
      throw new ApiError(400, "Missing fields in 'item'", null, req.path);
    }

    if (Number.isNaN(parseFloat(cost))) {
      throw new ApiError(400, "Item cost must be an floating point number.", null, req.path);
    }

    if (category === "drink" && !subcategory) {
      throw new ApiError(400, "Drinks must have a subcategory", null, req.path);
    }
    if (subcategory !== "Teas" && subcategory !== "Refreshers" && subcategory !== "Coffee/Matcha" &&
      subcategory !== "Specials" && subcategory !== "Seasonal") {
      throw new ApiError(400, "Drink Subcategory must be a valid option: Teas, Refreshers, Coffee/Matcha, Specials, or Seasonal", null, req.path);
    }

    const query = "UPDATE menu SET name = $1, category = $2, cost = $3, subcategory = $4 WHERE menu_id = $5 RETURNING *;"
    const insertValues = [name, category, cost, subcategory, menuID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not find a menu item to update with this ID", null, req.path);
    }
    const updatedItem = result.rows[0];
    res.json(updatedItem);

  } catch (err) {
    next(err);
  }
});

//deletes don't actually remove items, because that results in two options
// 1. will 100% always result in an error, because every menu item is (usually) associated with orders, recipes, etc, will throw a foreign key error
// 2. can delete it with a cascade delete, but then all recipes, ingredients, and orders associated also get deleted.
//Instead we will toggle a boolean.
app.delete('/api/menu/disable', requireAuth(true), async (req, res, next) => {
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
  try {
    const menuID = req.query.menuID;
    if (!menuID) {
      throw new ApiError(400, "Missing Menu ID", null, req.path);
    }
    if (Number.isNaN(Number(menuID))) {
      throw new ApiError(400, "Menu ID must be an integer", null, req.path);
    }

    const query = "UPDATE menu SET is_active = false WHERE menu_id = $1 RETURNING *;"
    const insertValues = [menuID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not find a menu item to disable with this ID", null, req.path);
    }
    const updatedItem = result.rows[0];
    res.json(updatedItem);

  } catch (err) {
    next(err);
  }
});

app.patch('/api/menu/enable', requireAuth(true), async (req, res, next) => {
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
  try {
    const menuID = req.query.menuID;
    if (!menuID) {
      throw new ApiError(400, "Missing Menu ID", null, req.path);
    }
    if (Number.isNaN(Number(menuID))) {
      throw new ApiError(400, "Menu ID must be an integer", null, req.path);
    }

    const query = "UPDATE menu SET is_active = true WHERE menu_id = $1 RETURNING *;"
    const insertValues = [menuID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not find a menu item to enable with this ID", null, req.path);
    }
    const updatedItem = result.rows[0];
    res.json(updatedItem);

  } catch (err) {
    next(err);
  }
});

app.post('/api/menu/create', requireAuth(true), async (req, res, next) => {
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
           description: 'new Menu item data. Drinks must have a \'subcategory\'',
           required: true,
           schema: {
               name: "example-food",
               category: "food",
               cost: "9.99"
           }
       }        
   */
  try {
    console.log(req.body);
    if (!req.body) {
      throw new ApiError(400, "Missing 'item'", null, req.path);
    }
    const name = req.body.name;
    const category = req.body.category;
    const cost = req.body.cost;
    const subcategory = req.body.subcategory ? req.body.subcategory : "";

    if (!name || !category || !cost) {
      throw new ApiError(400, "Missing fields in 'item'", null, req.path);
    }

    if (Number.isNaN(parseFloat(cost))) {
      throw new ApiError(400, "Item cost must be an floating point number.", null, req.path);
    }

    if (category === "drink" && !subcategory) {
      throw new ApiError(400, "Drinks must have a subcategory", null, req.path);
    }
    if (subcategory !== "Teas" && subcategory !== "Refreshers" && subcategory !== "Coffee/Matcha" &&
      subcategory !== "Specials" && subcategory !== "Seasonal") {
      throw new ApiError(400, "Drink Subcategory must be a valid option: Teas, Refreshers, Coffee/Matcha, Specials, or Seasonal", null, req.path);
    }

    const query = "INSERT INTO menu (name, category, cost, subcategory) VALUES ($1, $2, $3, $4) RETURNING *;"
    const insertValues = [name, category, cost, subcategory];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not create a menu item to update with this ID", null, req.path);
    }
    const updatedItem = result.rows[0];
    res.json(updatedItem);

  } catch (err) {
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
  try {
    const result = await pool.query('SELECT * FROM employees WHERE is_active = true ORDER BY employee_id');
    const employeeList = result.rows;
    res.json(employeeList);
  } catch (err) {
    next(err);
  }
});

//endpoint example: /api/update-employee?employeeID=1
//requires 'employee' object to be sent over
//example format
/* 

*/
app.put('/api/employee/update', requireAuth(true), async (req, res, next) => {
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
  try {
    const employeeID = req.query.employeeID;
    if (!employeeID) {
      throw new ApiError(400, "Missing Employee ID", null, req.path);
    }
    if (Number.isNaN(Number(employeeID))) {
      throw new ApiError(400, "Employee ID must be an integer", null, req.path);
    }
    if (!req.body) {
      throw new ApiError(400, "Missing 'employee'", null, req.path);
    }
    const name = req.body.name;
    const plainPassword = req.body.password;
    const is_manager = req.body.is_manager;
    const username = req.body.username;
    if (!name || !plainPassword || !is_manager || !username) {
      throw new ApiError(400, "Missing fields in 'employee'", null, req.path);
    }
    const password = await bcrypt.hash(plainPassword, 10);


    const query = "UPDATE employees SET name = $1, password = $2, is_manager = $3, username = $4 WHERE employee_id = $5 RETURNING *;"
    const insertValues = [name, password, is_manager, username, employeeID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not find a employee to update with this ID", null, req.path);
    }
    const updatedEmployee = result.rows[0];
    res.json(updatedEmployee);

  } catch (err) {
    next(err);
  }
});

app.post('/api/employee/create', requireAuth(true), async (req, res, next) => {
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
  try {
    if (!req.body) {
      throw new ApiError(400, "Missing 'employee'", null, req.path);
    }
    const name = req.body.name;
    const plainPassword = req.body.password;
    const is_manager = req.body.is_manager;
    const username = req.body.username;
    if (!name || !plainPassword || !is_manager || !username) {
      throw new ApiError(400, "Missing fields in 'employee'", null, req.path);
    }
    const password = await bcrypt.hash(plainPassword, 10);


    const query = "INSERT INTO employees (name, password, is_manager, username) VALUES ($1, $2, $3, $4) RETURNING *;"
    const insertValues = [name, password, is_manager, username];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(500, "Could not create an employee", null, req.path);
    }
    const newEmployee = result.rows[0];
    res.json(newEmployee);

  } catch (err) {
    next(err);
  }
});

app.patch('/api/employee/enable', requireAuth(true), async (req, res, next) => {
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
  try {
    const employeeID = req.query.employeeID;
    if (!employeeID) {
      throw new ApiError(400, "Missing Employee ID", null, req.path);
    }
    if (Number.isNaN(Number(employeeID))) {
      throw new ApiError(400, "Employee ID must be an integer", null, req.path);
    }


    const query = "UPDATE employees SET is_active = true WHERE employee_id = $1 RETURNING *;"
    const insertValues = [employeeID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not enable an employee with this ID", null, req.path);
    }
    const updatedEmployee = result.rows[0];
    res.json(updatedEmployee);

  } catch (err) {
    next(err);
  }
});

app.delete('/api/employee/disable', requireAuth(true), async (req, res, next) => {
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
  try {
    const employeeID = req.query.employeeID;
    if (!employeeID) {
      throw new ApiError(400, "Missing Employee ID", null, req.path);
    }
    if (Number.isNaN(Number(employeeID))) {
      throw new ApiError(400, "Employee ID must be an integer", null, req.path);
    }


    const query = "UPDATE employees SET is_active = false WHERE employee_id = $1 RETURNING *;"
    const insertValues = [employeeID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not disable an employee with this ID", null, req.path);
    }
    const updatedEmployee = result.rows[0];
    res.json(updatedEmployee);

  } catch (err) {
    next(err);
  }
});

app.post('/api/employee/login', async (req, res, next) => {
  /* #swagger.tags = ['Employees']
      #swagger.summary = "Login via Username/Password OR Google OAuth"
      #swagger.parameters['loginData'] = {
          in: 'body',
          description: 'Provide username/password OR a googleToken',
          schema: {
              username: 'Test',
              password: '1',
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
  try {
    const { username, password, googleToken } = req.body;
    let user = null;
    if (googleToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      const email = payload.email;
      const name = payload.name;
      const googleResult = await pool.query(
        'SELECT * FROM employees WHERE username = $1 OR google_id = $2',
        [email, payload.sub]
      );
      if (googleResult.rows.length === 0) {

        //create a new account for this gmail if it doesnt exist
        const queryG = "INSERT INTO employees (name, password, is_manager, username, google_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;"
        const insertValuesG = [name, "Google", false, email, googleToken];
        const createResult = await pool.query(queryG, insertValuesG);
        user = createResult.rows[0];
      } else {
        //if account exists, grab it and set user
        console.log(`logging ${name} in with google...`)
        user = googleResult.rows[0];
      }
      //if disabled, throw an error
      if (user.is_active === false) {
        throw new ApiError(403, "The employee found for this Google account has been deactivated.")
      }
    }
    else if (username && password) {
      const query = "SELECT * FROM employees WHERE username = $1 AND is_active = true;"
      const insertValues = [username];
      const result = await pool.query(query, insertValues);
      if (result.rows.length > 0) {
        const goodPassword = await bcrypt.compare(password, result.rows[0].password);
        if (goodPassword) {
          user = result.rows[0];
        }
      }
    }
    if (!user) {
      throw new ApiError(401, "Invalid credentials.");
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
      const { password, ...restOfUser } = user;
      res.json({
        message: "login successful",
        user: {
          ...restOfUser,
          session_token: sessionToken
        }
      });
      return;
    }

  } catch (err) {
    next(err);
  }
});

app.post('/api/employee/logout', async (req, res, next) => {
  /* #swagger.tags = ['Employees']
      #swagger.summary = "Logout as an employee/manager"
      #swagger.responses[200] = { 
          description: 'Logout successful',
          schema: { message: "Logout successful" }
      } 
  */
  try {
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

  } catch (err) {
    next(err);
  }
});

app.get('/api/employee/auth', requireAuth(false), async (req, res, next) => {
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
  try {
    console.log(req.user);
    const { password, session_token, google_id, is_active, ...restUser } = req.user;
    res.json({
      message: "Authentication successful",
      user: restUser
    });

  } catch (err) {
    next(err);
  }
});


app.get('/api/orders/recent', requireAuth(true), async (req, res, next) => {
  /* #swagger.tags = ['Orders']
  #swagger.summary = "Get's the most recent orders, and their items"
  #swagger.security = [{"cookieAuth": []}]
  #swagger.responses[200] = { 
          description: 'Successfully retrieved recent orders',
          schema: [{ 
              orderId: 0, 
              orderTotal: 67.00, 
              timestamp: '2025-02-13 14:06:52+00',
              employee_id: 3,
              customer_name: 'Burt'
          }]
  } 
  #swagger.parameters['numRecent'] = {
    in: 'query',                        
          description: 'The number of recent orders to get. Default is 10',
          required: false,                        
          type: 'integer',                   
          example: 10                    
  }        
  */
  try {
    //default to 10 if not present
    const numRecent = req.query.numRecent ? req.query.numRecent : 10;
    if (Number.isNaN(Number(numRecent))) {
      throw new ApiError(400, "numResent must be an integer", null, req.path);
    }

    const query = `
      WITH recent_order_ids AS (
            SELECT order_id, timestamp, order_total
            FROM transactions 
            ORDER BY timestamp DESC 
            LIMIT $1
        )
      SELECT 
            roi.order_id,
            roi.timestamp,
            roi.order_total,
            oh.item_id,
            oh.quantity,
            m.name,
            m.cost
        FROM recent_order_ids roi
        JOIN order_history oh ON roi.order_id = oh.order_id
        JOIN menu m ON oh.item_id = m.menu_id
        ORDER BY roi.timestamp DESC, roi.order_id;
    `
    const result = await pool.query(query, [numRecent]);
    const recentOrders = result.rows;
    //format them so orders have items nested inside
    const formattedOrders = recentOrders.reduce((acc, row) => {
      let order = acc.find(order => order.orderId === row.order_id);
      if (!order) {
        //if the order is not already in the accumulated list, create it
        order = {
          orderId: row.order_id,
          timestamp: row.timestamp,
          orderTotal: row.order_total,
          items: []
        };
        acc.push(order);
      }

      //add items to the order
      order.items.push({
        name: row.name,
        quantity: row.quantity,
        menuId: row.item_id,
        cost: row.cost
      });
      return acc;
    }, [])

    res.json(formattedOrders);
  } catch (err) {
    next(err);
  }
});

//this is meant to take in a sanitized order object
async function getOrderTotal(items) {
  const itemTotals = await Promise.all(items.map(async (item) => {
    const itemResult = await pool.query("SELECT * FROM menu WHERE menu_id = $1;", [item.menuId]);
    if (itemResult.rowCount === 0) {
      throw new ApiError(404, "Could not find this item to get the cost of");
    }
    const itemCost = parseFloat(itemResult.rows[0].cost);
    //now get the toppings cost
    const toppingTotals = await Promise.all(item.toppings.map(async (topping) => {
      const toppingResult = await pool.query("SELECT * FROM menu WHERE menu_id = $1;", [topping.id]);
      if (toppingResult.rowCount === 0) {
        throw new ApiError(404, "Could not find this topping to get the cost of");
      }
      const toppingCost = parseFloat(toppingResult.rows[0].cost) * parseInt(topping.quantity);
      return toppingCost;
    }));

    const totalToppingsCost = toppingTotals.reduce((acc, curCost) => acc + curCost, 0);
    const totalItemCost = (itemCost + totalToppingsCost) * parseInt(item.quantity);
    return totalItemCost;
  }));
  const totalOrderCost = itemTotals.reduce((acc, curCost) => acc + curCost, 0);
  return totalOrderCost;
}

app.post('/api/orders/create', async (req, res, next) => {
  /* #swagger.tags = ['Orders']
   #swagger.summary = "Creates a new order, either from a customer or cashier"
   #swagger.responses[200] = { 
         description: 'Successfully created the order',
         schema: { 
             menu_id: 67, 
             name: 'Add Sugar', 
             category: 'Modification',
             cost: 4.99,
             is_active: true 
         }
   } 
   #swagger.parameters['order'] = {
         in: 'body',
         description: 'Order object',
         required: true,
         schema: {
           employeeId: 1,
           customerName: 'Guest',
           items: [
             {
               menuId: 41,
               quantity: 1,
               toppings: [
                 { id: 61, quantity: 1 }
               ]
             }
           ]
         }
     }      
   */


  const client = await pool.connect();

  try {
    const { employeeId, customerName, items } = req.body || {};
    console.log(req.body);

    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'order items array is required and must contain at least one item.', null, req.path);
    }


    const parsedEmployeeId = employeeId === null || employeeId === undefined
      ? null
      : Number(employeeId);

    if (parsedEmployeeId !== null && !Number.isInteger(parsedEmployeeId)) {
      throw new ApiError(400, 'employeeId must be an integer when provided.', null, req.path);
    }

    const normalizedCustomerName = String(customerName || 'Guest').trim() || 'Guest';

    const normalizedItems = items.map((item, itemIndex) => {
      const menuId = Number(item?.menuId);
      const quantity = Number(item?.quantity ?? 1);

      if (quantity == null || quantity == undefined) {
        throw new ApiError(400, `items[${itemIndex}].menuId must be defined.`, null, req.path);
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new ApiError(400, `items[${itemIndex}].quantity must be a number > 0.`, null, req.path);
      }


      //sanitize toppings
      const toppings = (Array.isArray(item?.toppings) ? item.toppings : []).map((topping, toppingIndex) => {
        const toppingId = Number(topping?.id);
        const toppingQty = Number(topping?.quantity ?? topping?.quantity ?? 1);

        if (!Number.isInteger(toppingId)) {
          throw new ApiError(400, `items[${itemIndex}].toppings[${toppingIndex}].id must be an integer.`, null, req.path);
        }

        if (!Number.isFinite(toppingQty) || toppingQty <= 0) {
          throw new ApiError(400, `items[${itemIndex}].toppings[${toppingIndex}].qty must be a number > 0.`, null, req.path);
        }

        return {
          id: toppingId,
          quantity: toppingQty,
        };
      });

      return {
        menuId,
        quantity,
        toppings,
      };
    });

    const orderTotal = await getOrderTotal(normalizedItems);

    await client.query('BEGIN');

    //get the orderTotal from the database. We don't want to pass it in because it could be wrong/doctored


    const newOrder = await client.query(
      'INSERT INTO transactions (order_total, timestamp, employee_id, customer_name) VALUES ($1, NOW(), $2, $3) RETURNING *;',
      [orderTotal, parsedEmployeeId, normalizedCustomerName],
    );

    const newOrderId = newOrder.rows[0].order_id;


    const menuUsageCounts = new Map();
    const addMenuUsage = (menuId, amount) => {
      menuUsageCounts.set(menuId, (menuUsageCounts.get(menuId) || 0) + amount);
    };

    let historyRowsInserted = 0;
    let toppingRowsInserted = 0;

    for (const item of normalizedItems) {
      await client.query(
        'INSERT INTO order_history (order_id, item_id, quantity) VALUES ($1, $2, $3)',
        [newOrderId, item.menuId, item.quantity],
      );
      historyRowsInserted += 1;

      addMenuUsage(item.menuId, item.quantity);

      for (const topping of item.toppings) {
        await client.query(
          'INSERT INTO toppings (item_menu_id, transaction_id, topping_menu_id, quantity) VALUES ($1, $2, $3, $4)',
          [item.menuId, newOrderId, topping.id, topping.quantity],
        );
        toppingRowsInserted += 1;

        addMenuUsage(topping.id, topping.quantity);
      }
    }

    //try to get the ingredients usage for each order item and its toppings 
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
      //check to see if we can subtract the ingredients
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

    const responseObject = {
      message: 'Order submitted successfully.',
      orderId: newOrderId,
      orderTotal: orderTotal,
      itemsRecorded: historyRowsInserted,
      toppingsRecorded: toppingRowsInserted,
    }
    console.log(responseObject);
    res.status(201).json(responseObject);
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
});



app.get('/api/recipes/all', requireAuth(true), async (req, res, next) => {
  /* #swagger.tags = ['Recipes']
  #swagger.summary = "Get's the recipes for every (active) item on the menu"
  #swagger.security = [{"cookieAuth": []}]
  #swagger.responses[200] = { 
          description: 'Successfully retrieved recipes',
          schema: [{ 
              menu_id: 0, 
              category: 'Drink',
              ingredients: [{
                ingredient_id: 0,
                name: 'Matcha',
                quantity: 1,
                unit: 'Cup',
                is_active: true
              }], 
          }]
  }      
  #swagger.parameters['showAll'] = {
    in: 'query',                        
          description: 'show all will also include inactive (deleted) items in the recipe',
          required: false,                        
          type: 'boolean',                   
          example: false                 
  }  
  */
  try {
    //default to 10 if not present
    const showAll = (req.query.showAll && req.query.showAll == 'true') ? true : false;
    const query = `
      SELECT 
          m.name AS menu_name,
          m.menu_id,
          m.category,
          i.name AS ingredient_name,
          i.ingredient_id,
          i.unit,
          r.quantity,
          r.is_active
      FROM recipes r
      JOIN menu m ON r.menu_id = m.menu_id
      JOIN ingredients i ON r.ingredient_id = i.ingredient_id ${showAll ? "" : "AND r.is_active = true"}
    `;
    const result = await pool.query(query);
    const recipes = result.rows;
    //format them so recipes have ingredients nested inside
    const formattedRecipes = recipes.reduce((acc, row) => {
      let recipe = acc.find(recipe => recipe.menu_id === row.menu_id);
      if (!recipe) {
        //if the recipe is not already in the accumulated list, create it
        recipe = {
          menu_id: row.menu_id,
          name: row.menu_name,
          category: row.category,
          ingredients: []
        };
        acc.push(recipe);
      }

      //add ingredients to the order
      recipe.ingredients.push({
        ingredient_id: row.ingredient_id,
        name: row.ingredient_name,
        quantity: parseFloat(row.quantity),
        unit: row.unit,
        is_active: row.is_active
      });
      return acc;
    }, [])

    res.json(formattedRecipes);
  } catch (err) {
    next(err);
  }
});

app.get('/api/recipes/details', requireAuth(true), async (req, res, next) => {
  /* #swagger.tags = ['Recipes']
  #swagger.summary = "Get a specific recipe based on the passed in menu ID"
  #swagger.security = [{"cookieAuth": []}]
  #swagger.responses[200] = { 
          description: 'Successfully retrieved recipe',
          schema: { 
              menu_id: 0, 
              category: 'Drink',
              ingredients: [{
                ingredient_id: 0,
                name: 'Matcha',
                quantity: 1,
                unit: 'Cup',
                is_active: true
            }], 
          }
  }      
  #swagger.parameters['menuID'] = {
    in: 'query',                        
          description: 'menu ID to get the recipe for',
          required: true,                        
          type: 'integer',                   
          example: 2                 
  }  
  #swagger.parameters['showAll'] = {
    in: 'query',                        
          description: 'show all will also include inactive (deleted) items in the recipe',
          required: false,                        
          type: 'boolean',                   
          example: false                 
  }  
  */
  try {
    //default to 10 if not present
    const showAll = (req.query.showAll && req.query.showAll == 'true') ? true : false;
    const menuID = req.query.menuID;
    if (!menuID) {
      throw new ApiError(401, "Missing menuID", null, req.path);
    }
    if (Number.isNaN(Number(menuID))) {
      throw new ApiError(400, "menuID must be an integer", null, req.path);
    }

    const query = `
      SELECT 
          m.name AS menu_name,
          m.menu_id,
          m.category,
          i.name AS ingredient_name,
          i.ingredient_id,
          i.unit,
          r.quantity,
          r.is_active
      FROM recipes r
      JOIN menu m ON r.menu_id = m.menu_id
      JOIN ingredients i ON r.ingredient_id = i.ingredient_id AND r.menu_id = $1 ${showAll ? "" : "AND r.is_active = true"}
    `;
    const result = await pool.query(query, [menuID]);
    if (result.rowCount === 0) {
      throw new ApiError(404, "A recipe could not be found with this menu ID.", null, req.path);
    }
    const recipeItems = result.rows;
    //format them so recipes have ingredients nested inside
    const formattedRecipe = recipeItems.reduce((acc, row) => {
      let recipe = acc.find(recipe => recipe.menu_id === row.menu_id);
      if (!recipe) {
        //if the recipe is not already in the accumulated list, create it
        recipe = {
          menu_id: row.menu_id,
          name: row.menu_name,
          category: row.category,
          ingredients: []
        };
        acc.push(recipe);
      }

      //add ingredients to the order
      recipe.ingredients.push({
        ingredient_id: row.ingredient_id,
        name: row.ingredient_name,
        quantity: parseFloat(row.quantity),
        unit: row.unit,
        is_active: row.is_active
      });
      return acc;
    }, [])
    if (formattedRecipe.length === 0) {
      throw new ApiError(500, "Something went wrong retrieving this recipe", null, req.path);
    }
    res.json(formattedRecipe[0]);
  } catch (err) {
    next(err);
  }
});

app.post('/api/recipes/add-ingredient', requireAuth(true), async (req, res, next) => {
  /* #swagger.tags = ['Recipes']
  #swagger.summary = "Adds an ingredient to a recipe determined by a passed in menu item ID"
  #swagger.security = [{"cookieAuth": []}]
  #swagger.responses[200] = { 
          description: 'Successfully updated recipe',
          schema: [{ 
              menu_id: 0, 
              category: 'Drink',
              ingredients: {
                ingredient_id: 0,
                name: 'Matcha',
                quantity: 1,
                unit: 'Cup',
                is_active: true
              }, 
          }]
  }
  #swagger.parameters['menuID'] = {
    in: 'query',                        
          description: 'The id of the menu item\'s recipe to be updated',
          required: true,                        
          type: 'integer',                   
          example: 1                   
  }     
  #swagger.parameters['ingredient'] = {
        in: 'body',
        description: 'Ingredient ID and quantity to be added to the recipe',
        required: true,
        schema: {
          ingredientID: 1,
          quantity: 1
        }
    }                
  */
  try {
    //default to 10 if not present
    const menuID = req.query.menuID;
    const ingredientID = req.body.ingredientID;
    const quantity = req.body.quantity;
    if (!menuID || !ingredientID || !quantity) {
      throw new ApiError(401, "Missing menuID and/or ingredient ID and/or quantity", null, req.path);
    }
    if (Number.isNaN(Number(menuID)) || Number.isNaN(Number(ingredientID)) || Number.isNaN(Number(quantity))) {
      throw new ApiError(400, "menuID, ingredientID, and quantity must be an integer", null, req.path);
    }

    const query = `
            INSERT INTO recipes (menu_id, ingredient_id, quantity, is_active)
            VALUES ($1, $2, $3, true)
            ON CONFLICT (menu_id, ingredient_id) 
            DO UPDATE SET 
                quantity = EXCLUDED.quantity,
                is_active = true
            WHERE recipes.is_active = false
            RETURNING *;
        `;
    const result = await pool.query(query, [menuID, ingredientID, quantity]);
    //uniqueness violation, which means a duplicate ingredient was attempted
    if (result.rowCount === 0) {
      throw new ApiError(409, "This ingredient is already in the recipe.", null, req.path);
    }
    const recipe = result.rows[0];
    res.json(recipe);
  } catch (err) {
    //one of the IDs didnt exist
    if (err.code === '23503') {
      const missingError = new ApiError(409, "Missing ingredient or menu ID.", null, req.path);
      next(missingError);
      return;
    }
    next(err);
  }
});

app.delete('/api/recipes/remove-ingredient', requireAuth(true), async (req, res, next) => {
  /* #swagger.tags = ['Recipes']
  #swagger.summary = "Removes an ingredient to a recipe determined by a passed in menu item ID"
  #swagger.security = [{"cookieAuth": []}]
  #swagger.responses[200] = { 
          description: 'Successfully removed ingredient from recipe',
          schema: [{ 
              menu_id: 0, 
              category: 'Drink',
              ingredients: {
                ingredient_id: 0,
                name: 'Matcha',
                quantity: 1,
                unit: 'Cup',
                is_active: true
              }, 
          }]
  }
  #swagger.parameters['menuID'] = {
    in: 'query',                        
          description: 'The id of the menu item\'s recipe to be updated',
          required: true,                        
          type: 'integer',                   
          example: 1                   
  }     
  #swagger.parameters['ingredient'] = {
        in: 'body',
        description: 'Ingredient ID to be removed from the recipe',
        required: true,
        schema: {
          ingredientID: 1,
        }
    }                
  */
  try {
    //default to 10 if not present
    const menuID = req.query.menuID;
    const ingredientID = req.body.ingredientID;
    if (!menuID || !ingredientID) {
      throw new ApiError(401, "Missing menuID and/or ingredient ID", null, req.path);
    }
    if (Number.isNaN(Number(menuID)) || Number.isNaN(Number(ingredientID))) {
      throw new ApiError(400, "menuID and ingredientID must be an integer", null, req.path);
    }
    const query = "UPDATE recipes SET is_active = false WHERE menu_id = $1 AND ingredient_id = $2 RETURNING *;"

    const result = await pool.query(query, [menuID, ingredientID]);
    const recipe = result.rows[0];
    res.json(recipe);
  } catch (err) {
    //one of the IDs didnt exist
    if (err.code === '23503') {
      const missingError = new ApiError(409, "Missing ingredient or menu ID.", null, req.path);
      next(missingError);
      return;
    }
    next(err);
  }
});

/*
Report API Endpoints: restricted to managers
X report requires: nothing, just returns the last 24 hours of sales data broken down by hour
Z report requires: date query parameter in YYYY-MM-DD format
Sales report requires: startDate, endDate query parameters in YYYY-MM-DD format
 */
app.get('/api/reports/x', requireAuth(true), async (req, res, next) => {
  /* Helper: This is the query we used from project 2:
  SELECT
                EXTRACT(HOUR FROM t.timestamp)::int AS hour,
                COUNT(DISTINCT t.order_id)          AS total_transactions,
                COUNT(*)                             AS total_items_sold,
                ROUND(COALESCE(SUM(m.cost), 0)::numeric, 2) AS total_sales_amount,
                SUM(CASE WHEN m.category = 'drink' THEN 1 ELSE 0 END) AS drinks_sold,
                SUM(CASE WHEN m.category = 'food'  THEN 1 ELSE 0 END) AS food_sold
            FROM order_history oh
            JOIN transactions t ON oh.order_id = t.order_id
            JOIN menu m ON oh.item_id = m.menu_id
            WHERE t.timestamp::date = CURRENT_DATE
            GROUP BY EXTRACT(HOUR FROM t.timestamp)::int
            ORDER BY hour */

  const query = `
    SELECT
        EXTRACT(HOUR FROM t.timestamp)::int AS hour,
        COUNT(DISTINCT t.order_id)          AS total_transactions,
        COUNT(*)                            AS total_items_sold,
        ROUND(COALESCE(SUM(m.cost), 0)::numeric, 2) AS total_sales_amount,
        SUM(CASE WHEN m.category = 'drink' THEN 1 ELSE 0 END) AS drinks_sold,
        SUM(CASE WHEN m.category = 'food'  THEN 1 ELSE 0 END) AS food_sold
    FROM order_history oh
    JOIN transactions t ON oh.order_id = t.order_id
    JOIN menu m ON oh.item_id = m.menu_id
    WHERE t.timestamp::date = CURRENT_DATE
    GROUP BY EXTRACT(HOUR FROM t.timestamp)::int
    ORDER BY hour
  `;

  // Notice there is no array of parameters passed as the second argument
  const result = await pool.query(query);
  res.json(result.rows);

});

/*TODO */
app.get('/api/reports/z', requireAuth(true), async (req, res, next) => {
  //Can probably just use the x report query and here just send a query to say we have generated the report
  //for the day and have frontend call this endpoint once the report is done.
  //before query, check if the entry already existed in the z_report_log table for the current date, if it does, throw an error saying you can only generate one report per day. If not, insert a new entry with the current date and return success.
  const checkQuery = 'SELECT * FROM z_report_log WHERE report_date = CURRENT_DATE';
  const checkResult = await pool.query(checkQuery);

  if (checkResult.rows.length > 0) {
    return res.status(400).json({ message: 'Z report for today has already been generated.' });
  }
  else {
    const query = 'INSERT INTO z_report_log (report_date) VALUES (CURRENT_DATE)';
    await pool.query(query);
    res.json({ message: 'Z report generated successfully.' });
  }

});

/*TODO */
app.get('/api/reports/sales', requireAuth(true), async (req, res, next) => {
  try {
    const { startDate, endDate, startHour, endHour } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const isSingleDay = startDate === endDate;
    const timezone = 'UTC';

    let query;
    let params;

    if (isSingleDay && startHour !== undefined && endHour !== undefined) {
      // Single day with hour filtering
      query = `
        SELECT 
          m.name as item_name,
          SUM(oh.quantity) as quantity_sold,
          SUM(oh.quantity * m.cost) as revenue,
          SUM(oh.quantity * COALESCE(recipe_cost.ingredient_cost, 0)) as total_ingredient_cost
        FROM order_history oh
        JOIN transactions t ON oh.order_id = t.order_id
        JOIN menu m ON oh.item_id = m.menu_id
        LEFT JOIN (
          SELECT r.menu_id, SUM(r.quantity * i.cost) as ingredient_cost
          FROM recipes r
          JOIN ingredients i ON r.ingredient_id = i.ingredient_id
          WHERE r.is_active = true
          GROUP BY r.menu_id
        ) recipe_cost ON m.menu_id = recipe_cost.menu_id
        WHERE DATE(t.timestamp AT TIME ZONE $4) = $1
          AND EXTRACT(HOUR FROM t.timestamp AT TIME ZONE $4) >= $2
          AND EXTRACT(HOUR FROM t.timestamp AT TIME ZONE $4) <= $3
        GROUP BY m.menu_id, m.name
        ORDER BY quantity_sold DESC
      `;
      params = [startDate, parseInt(startHour), parseInt(endHour), timezone];
    } else {
      // Multi-day range
      query = `
        SELECT 
          m.name as item_name,
          SUM(oh.quantity) as quantity_sold,
          SUM(oh.quantity * m.cost) as revenue,
          SUM(oh.quantity * COALESCE(recipe_cost.ingredient_cost, 0)) as total_ingredient_cost
        FROM order_history oh
        JOIN transactions t ON oh.order_id = t.order_id
        JOIN menu m ON oh.item_id = m.menu_id
        LEFT JOIN (
          SELECT r.menu_id, SUM(r.quantity * i.cost) as ingredient_cost
          FROM recipes r
          JOIN ingredients i ON r.ingredient_id = i.ingredient_id
          WHERE r.is_active = true
          GROUP BY r.menu_id
        ) recipe_cost ON m.menu_id = recipe_cost.menu_id
        WHERE DATE(t.timestamp AT TIME ZONE $3) >= $1 
          AND DATE(t.timestamp AT TIME ZONE $3) <= $2
        GROUP BY m.menu_id, m.name
        ORDER BY quantity_sold DESC
      `;
      params = [startDate, endDate, timezone];
    }

    const result = await pool.query(query, params);

    // Format response for Chart.js bar chart
    const labels = result.rows.map(row => row.item_name);
    const quantities = result.rows.map(row => parseInt(row.quantity_sold) || 0);
    const revenue = result.rows.map(row => parseFloat(row.revenue) || 0);
    const netRevenue = result.rows.map(row => {
      const gross = parseFloat(row.revenue) || 0;
      const ingredientCost = parseFloat(row.total_ingredient_cost) || 0;
      return gross - ingredientCost;
    });

    res.json({ labels, quantities, revenue, netRevenue });
  } catch (err) {
    next(err);
  }
});

app.get('/api/ingredients/all', async (req, res, next) => {
  /* #swagger.tags = ['Ingredients']
  #swagger.summary = "Get all Ingredients"
  #swagger.security = [{"cookieAuth": []}]
  #swagger.responses[200] = { 
          description: 'Successfully retrieved the ingredients list',
          schema: [{ 
              ingredient_id: 0, 
              name: 'Matcha Powder', 
              cost: 12.00,
              stock: 25500.00,
              unit: 'Cup',
              is_active: true
          }]
  } */
  try {
    const result = await pool.query('SELECT * FROM ingredients WHERE is_active = true ORDER BY ingredient_id');
    const ingredientList = result.rows;
    res.json(ingredientList);
  } catch (err) {
    next(err);
  }
});

app.put('/api/ingredients/update', requireAuth(true), async (req, res, next) => {
  /* #swagger.tags = ['Ingredients']
    #swagger.summary = "Updates an ingredient's attributes"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully updated the ingredient',
            schema: { 
                ingredient_id: 0, 
                name: 'Matcha Powder', 
                cost: 12.00,
                stock: 25500.00,
                unit: 'Cup',
                is_active: true
            }
    } 
    #swagger.parameters['ingredientID'] = {
      in: 'query',                        
            description: 'The ID of the ingredient to be updated',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }
    #swagger.parameters['ingredient'] = {
            in: 'body',
            description: 'updated ingredient data',
            required: true,
            schema: { 
                name: 'Matcha Powder', 
                cost: 12.00,
                unit: 'Cup',
            }
        }        
    */
  try {
    const ingredientID = req.query.ingredientID;
    if (!ingredientID) {
      throw new ApiError(400, "Missing Ingredient ID", null, req.path);
    }
    if (Number.isNaN(Number(ingredientID))) {
      throw new ApiError(400, "Ingredient ID must be an integer", null, req.path);
    }
    if (!req.body) {
      throw new ApiError(400, "Missing 'ingredient'", null, req.path);
    }
    const { name, cost, unit } = req.body
    if (!name || !cost || !unit) {
      throw new ApiError(400, "Missing fields in 'ingredient'", null, req.path);
    }


    const query = "UPDATE ingredients SET name = $1, cost = $2, unit = $3 WHERE ingredient_id = $4 RETURNING *;"
    const insertValues = [name, cost, unit, ingredientID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not find a ingredient to update with this ID", null, req.path);
    }
    const updatedIngredient = result.rows[0];
    res.json(updatedIngredient);

  } catch (err) {
    next(err);
  }
});

app.patch('/api/ingredients/restock', requireAuth(true), async (req, res, next) => {
  /* #swagger.tags = ['Ingredients']
    #swagger.summary = "Adds to an ingredient's stock by a provided amount"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully updated the ingredient stock',
            schema: { 
                ingredient_id: 0, 
                name: 'Matcha Powder', 
                cost: 12.00,
                stock: 25500.00,
                unit: 'Cup',
                is_active: true
            }
    } 
    #swagger.parameters['ingredientID'] = {
      in: 'query',                        
            description: 'The ID of the ingredient to be updated',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }
    #swagger.parameters['stock'] = {
            in: 'body',
            description: 'quantity of stock to be added to existing stock',
            required: true,
            schema: { 
                stock: 67.00, 
            }
        }        
    */
  try {
    const ingredientID = req.query.ingredientID;
    if (!ingredientID) {
      throw new ApiError(400, "Missing Ingredient ID", null, req.path);
    }
    if (Number.isNaN(Number(ingredientID))) {
      throw new ApiError(400, "Ingredient ID must be an integer", null, req.path);
    }
    if (!req.body) {
      throw new ApiError(400, "Missing 'ingredient'", null, req.path);
    }
    const { stock } = req.body
    if (!stock) {
      throw new ApiError(400, "Missing stock in body", null, req.path);
    }


    const query = "UPDATE ingredients SET stock = stock + $1 WHERE ingredient_id = $2 RETURNING *;"
    const insertValues = [stock, ingredientID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not find a ingredient to update stock with this ID", null, req.path);
    }
    const updatedIngredient = result.rows[0];
    res.json(updatedIngredient);

  } catch (err) {
    next(err);
  }
});

app.patch('/api/ingredients/enable', requireAuth(true), async (req, res, next) => {
  /* #swagger.tags = ['Ingredients']
    #swagger.summary = "Re-enables an ingredient to be used again"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully re-enabled the ingredient',
            schema: { 
                ingredient_id: 0, 
                name: 'Matcha Powder', 
                cost: 12.00,
                stock: 25500.00,
                unit: 'Cup',
                is_active: true
            }
    } 
    #swagger.parameters['ingredientID'] = {
      in: 'query',                        
            description: 'The ID of the ingredient to be updated',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }     
    */
  try {
    const ingredientID = req.query.ingredientID;
    if (!ingredientID) {
      throw new ApiError(400, "Missing Ingredient ID", null, req.path);
    }
    if (Number.isNaN(Number(ingredientID))) {
      throw new ApiError(400, "Ingredient ID must be an integer", null, req.path);
    }


    const query = "UPDATE ingredients SET is_active = true WHERE ingredient_id = $1 RETURNING *;"
    const insertValues = [ingredientID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not find a ingredient to enable with this ID", null, req.path);
    }
    const updatedIngredient = result.rows[0];
    res.json(updatedIngredient);

  } catch (err) {
    next(err);
  }
});

app.delete('/api/ingredients/disable', requireAuth(true), async (req, res, next) => {
  /* #swagger.tags = ['Ingredients']
    #swagger.summary = "Disables an ingredient"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully disabled (deleted) the ingredient',
            schema: { 
                ingredient_id: 0, 
                name: 'Matcha Powder', 
                cost: 12.00,
                stock: 25500.00,
                unit: 'Cup',
                is_active: false
            }
    } 
    #swagger.parameters['ingredientID'] = {
      in: 'query',                        
            description: 'The ID of the ingredient to be updated',
            required: true,                        
            type: 'integer',                   
            example: 0                    
    }     
    */
  try {
    const ingredientID = req.query.ingredientID;
    if (!ingredientID) {
      throw new ApiError(400, "Missing Ingredient ID", null, req.path);
    }
    if (Number.isNaN(Number(ingredientID))) {
      throw new ApiError(400, "Ingredient ID must be an integer", null, req.path);
    }


    const query = "UPDATE ingredients SET is_active = false WHERE ingredient_id = $1 RETURNING *;"
    const insertValues = [ingredientID];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not find a ingredient to disable with this ID", null, req.path);
    }
    const updatedIngredient = result.rows[0];
    res.json(updatedIngredient);

  } catch (err) {
    next(err);
  }
});

app.post('/api/ingredients/create', requireAuth(true), async (req, res, next) => {
  /* #swagger.tags = ['Ingredients']
    #swagger.summary = "Creates a new ingredient"
    #swagger.security = [{"cookieAuth": []}]
      #swagger.responses[200] = { 
            description: 'Successfully created the ingredient',
            schema: { 
                ingredient_id: 0, 
                name: 'Matcha Powder', 
                cost: 12.00,
                stock: 25500.00,
                unit: 'Cup',
                is_active: true
            }
    } 

    #swagger.parameters['ingredient'] = {
            in: 'body',
            description: 'new ingredient data, including a preset stock',
            required: true,
            schema: { 
                name: 'Matcha Powder', 
                cost: 12.00,
                unit: 'Cup',
                stock: 100.00
            }
        }        
    */
  try {
    if (!req.body) {
      throw new ApiError(400, "Missing 'ingredient'", null, req.path);
    }
    const { name, cost, unit, stock } = req.body
    if (!name || !cost || !unit || !stock) {
      throw new ApiError(400, "Missing fields in 'ingredient'", null, req.path);
    }

    const query = "INSERT INTO ingredients (name, cost, stock, unit) VALUES ($1, $2, $3, $4) RETURNING *;"
    const insertValues = [name, cost, stock, unit];

    const result = await pool.query(query, insertValues);

    //throw an error if you cant find the item. Postgres doesn't update an item that doesnt exist, so its handled.
    if (result.rowCount == 0) {
      throw new ApiError(404, "Could not create a new ingredient", null, req.path);
    }
    const updatedIngredient = result.rows[0];
    res.json(updatedIngredient);

  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Proxy endpoint for TAMU AI Chat API
 *     description: Forwards chat requests to TAMU AI to avoid CORS issues
 *     tags: [AI Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                     content:
 *                       type: string
 *               model:
 *                 type: string
 *               max_tokens:
 *                 type: number
 *     responses:
 *       200:
 *         description: AI response
 *       500:
 *         description: Error communicating with AI service
 */
app.post('/api/chat', async (req, res, next) => {
  try {
    const { messages, model = 'protected.Claude Sonnet 4.5', max_tokens = 2000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      throw new ApiError(400, 'messages array is required', null, req.path);
    }

    const tamuEndpoint = process.env.TAMUS_AI_CHAT_API_ENDPOINT;
    const tamuApiKey = process.env.TAMUS_AI_CHAT_API_KEY;

    if (!tamuEndpoint || !tamuApiKey) {
      throw new ApiError(500, 'TAMU AI API not configured', null, req.path);
    }

    const requestBody = {
      model,
      messages,
      max_tokens,
    };

    console.log('TAMU AI Request:', {
      url: `${tamuEndpoint}/openai/chat/completions`,
      model,
      messageCount: messages.length,
    });

    const response = await fetch(`${tamuEndpoint}/openai/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tamuApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TAMU AI Error Response:', response.status, errorText);
      throw new ApiError(response.status, `TAMU AI Error: ${errorText}`, null, req.path);
    }

    // TAMU AI always returns SSE format (text/event-stream)
    const responseText = await response.text();

    // Parse SSE format: each line is "data: {...}" or "data: [DONE]"
    let fullContent = '';
    const lines = responseText.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
        try {
          const jsonStr = trimmedLine.slice(6); // Remove 'data: ' prefix
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
          }
        } catch (e) {
          // Skip invalid JSON chunks
        }
      }
    }

    const rawAssistantContent = fullContent.trim();
    console.log('TAMU AI Full Response:', rawAssistantContent.substring(0, 400));

    const extractJsonPayload = (content) => {
      if (!content) return null;
      let stringToParse = content.trim();

      // Remove <think> blocks and their contents completely
      stringToParse = stringToParse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      if (stringToParse.startsWith('{') && stringToParse.endsWith('}')) {
        return stringToParse;
      }

      const fencedMatch = stringToParse.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fencedMatch?.[1]) {
        const fencedBody = fencedMatch[1].trim();
        if (fencedBody.startsWith('{') && fencedBody.endsWith('}')) {
          return fencedBody;
        }
      }

      // Fallback: attempt to capture everything from the first '{' to the last '}'
      const firstBrace = stringToParse.indexOf('{');
      const lastBrace = stringToParse.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return stringToParse.substring(firstBrace, lastBrace + 1);
      }

      return null;
    };

    let structuredChatResponse = null;
    const jsonPayload = extractJsonPayload(rawAssistantContent);
    if (jsonPayload) {
      try {
        const parsed = JSON.parse(jsonPayload);
        const parsedMessage = String(parsed?.message || '').trim();
        const parsedAction = String(parsed?.action || 'none')
          .trim()
          .toLowerCase()
          .replace(/^['"]|['"]$/g, '');
        const normalizedAction = ['add_to_order', 'remove_from_order'].includes(parsedAction)
          ? parsedAction
          : 'none';

        const normalizedOrderItems = ['add_to_order', 'remove_from_order'].includes(normalizedAction) && Array.isArray(parsed?.orderItems)
          ? parsed.orderItems
            .map((item) => {
              const menuId = Number(item?.menuId);
              const normalizedMenuId = Number.isInteger(menuId) && menuId > 0 ? menuId : null;

              const modificationsArray = Array.isArray(item?.modifications_array)
                ? item.modifications_array
                  .map((modification) => {
                    const modificationMenuId = Number(modification?.menu_id);
                    if (!Number.isInteger(modificationMenuId)) return null;
                    return {
                      category: String(modification?.category || '').trim().toLowerCase(),
                      cost: Number(modification?.cost || 0),
                      menu_id: modificationMenuId,
                      name: String(modification?.name || '').trim(),
                    };
                  })
                  .filter(Boolean)
                : [];

              return {
                menuId: normalizedMenuId,
                cost: Number(item?.cost || 0),
                name: String(item?.name || '').trim(),
                modifications_array: modificationsArray,
              };
            })
            .filter((item) => {
              if (normalizedAction === 'remove_from_order') {
                return Number.isInteger(item.menuId) || item.name.length > 0;
              }
              return Number.isInteger(item.menuId);
            })
          : [];

        structuredChatResponse = {
          message: parsedMessage || rawAssistantContent,
          action: normalizedAction,
          orderItems: normalizedOrderItems,
        };
      } catch (parseError) {
        console.warn('Chat response JSON parse failed; falling back to text response.');
      }
    }

    const chatAction = structuredChatResponse || {
      message: rawAssistantContent,
      action: 'none',
      orderItems: [],
    };

    // Return in OpenAI-compatible format plus normalized chatAction payload
    res.json({
      choices: [{
        message: {
          role: 'assistant',
          content: chatAction.message
        },
        finish_reason: 'stop'
      }],
      chatAction,
    });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    next(err);
  }
});

/* 
Weather Endpoint
*/
app.get('/api/weather', async (req, res, next) => {
  // #swagger.tags = ['Weather']
  // #swagger.summary = "Get weather data for a city"
  /* #swagger.parameters['city'] = {
    in: 'query',                        
    description: 'The city name',
    required: true,                        
    type: 'string',                   
    example: 'College Station'                    
  }*/
  /* #swagger.responses[200] = { 
    description: 'Successfully retrieved weather data',
    schema: { 
      humidity: 65,
      windSpeed: 10.5,
      temperature: 72,
      location: 'College Station',
      icon: '01d'
    }
  } */
  try {
    const city = req.query.city;
    if (!city) {
      throw new ApiError(400, "Missing city parameter", null, req.path);
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, "Weather API key not configured", null, req.path);
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=imperial&appid=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new ApiError(response.status, `Weather API error: ${response.statusText}`, null, req.path);
    }

    const data = await response.json();

    const weatherData = {
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      temperature: Math.floor(data.main.temp),
      location: data.name,
      icon: data.weather[0].icon
    };

    res.json(weatherData);
  } catch (err) {
    next(err);
  }
});

/*
Kitchen View Endpoints
*/
/* 
Requirements: Gathers all the orders from the transactions table where the: is_filled is false.
Then for each transaction that is_filled is false, store the transaction_id, find the corresponding order_id. Using the order_ids, go into
the order_history table and for each order id find all the unique item id's for each order and store that in an array that is an attribute of the orders array that contains each order.
After getting all the item id's for each order, go into the toppings table, find the topping_menu_id's for each unique item_menu_id for that transaction
within the transaction_id's and gather the quantity of each topping. Store the quantity. Then using the topping_menu_id and item_menu_id, find the name of the topping from the menu table and the item name from the menu table corresponding to the id.
Using the form: orders = array(order,...,) where order has attributes: 
transaction_id, id, customerName, and items. items = array(item, ...,) where item has attributes: quantity, name, and modifications.
modifications = array(modification,...) where modification has attributes: ingredient_name and name (modification name)

RETURNS: in res, an array that can be mapped that has all the orders. Attributes for each order: order.transaction_id, order.id, order.timestamp, order.customerName, and order.items.
          items attributes: items to be mapped to item: item.quantity, item.name, and item.modifications.
          Modifications attributes: modifications mapped to modification: modification.ingredient_name, mod.name
*/
/*TODO */
//Reference Kitchen.jsx lines 59-114 and lines 10-14 for more
app.get('/api/orders/fetch', async (req, res, next) => {
  try {
    const query = `
      SELECT
        t.order_id,
        t.timestamp,
        t.customer_name,
        oh_agg.item_id,
        oh_agg.total_quantity AS item_quantity,
        m.name               AS item_name,
        tp.topping_menu_id,
        tp.quantity           AS topping_quantity,
        tm.name              AS topping_name
      FROM transactions t
      JOIN (
        SELECT order_id, item_id, SUM(quantity) AS total_quantity
        FROM order_history
        GROUP BY order_id, item_id
      ) oh_agg ON t.order_id = oh_agg.order_id
      JOIN menu m            ON oh_agg.item_id = m.menu_id
      LEFT JOIN toppings tp  ON tp.transaction_id = t.order_id
                             AND tp.item_menu_id  = oh_agg.item_id
      LEFT JOIN menu tm      ON tp.topping_menu_id = tm.menu_id
      WHERE t.is_filled = false
      ORDER BY t.timestamp ASC, t.order_id, oh_agg.item_id;
    `;

    const result = await pool.query(query);

    // Reshape the flat rows into the nested structure Kitchen.jsx expects:
    // [ { transaction_id, id, timestamp, customerName, items: [ { quantity, name, modifications } ] } ]
    const ordersMap = new Map();

    for (const row of result.rows) {
      // --- order level ---
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          transaction_id: row.order_id,
          id: row.order_id,
          timestamp: row.timestamp,
          customerName: row.customer_name || 'Guest',
          _itemsMap: new Map(),
        });
      }

      const order = ordersMap.get(row.order_id);

      // --- item level (keyed by item_id to avoid duplicates from topping joins) ---
      if (!order._itemsMap.has(row.item_id)) {
        order._itemsMap.set(row.item_id, {
          quantity: row.item_quantity,
          name: row.item_name,
          toppingsMap: new Map(),
        });
      }

      const item = order._itemsMap.get(row.item_id);

      // --- modification (topping) level ---
      if (row.topping_menu_id) {
        if (!item.toppingsMap.has(row.topping_menu_id)) {
          item.toppingsMap.set(row.topping_menu_id, {
            id: row.topping_menu_id,
            name: row.topping_name,
            ingredient_name: row.topping_name,
            quantity: 0,
            action: 'add',
          });
        }
        item.toppingsMap.get(row.topping_menu_id).quantity += Number(row.topping_quantity);
      }
    }

    // Convert maps to plain arrays and strip internal helpers
    const orders = [];
    for (const order of ordersMap.values()) {
      const items = [];
      for (const itemData of order._itemsMap.values()) {
        const N = Number(itemData.quantity);
        const itemInstances = Array.from({ length: N }, () => ({
          quantity: 1,
          name: itemData.name,
          modifications: []
        }));
        
        for (const topping of itemData.toppingsMap.values()) {
          const qtyPerItem = Math.floor(topping.quantity / N);
          const remainder = topping.quantity % N;
          
          for (let i = 0; i < N; i++) {
            const assignedQty = qtyPerItem + (i < remainder ? 1 : 0);
            if (assignedQty > 0) {
              itemInstances[i].modifications.push({
                name: topping.name,
                ingredient_name: topping.ingredient_name,
                quantity: assignedQty,
                action: topping.action
              });
            }
          }
        }
        
        // Group itemInstances by exact modification signature
        const groupedInstances = new Map();
        for (const instance of itemInstances) {
          instance.modifications.sort((a, b) => a.name.localeCompare(b.name));
          const sig = instance.modifications.map(m => `${m.name}_${m.quantity}`).join('|');
          
          if (!groupedInstances.has(sig)) {
            groupedInstances.set(sig, { ...instance, quantity: 0 });
          }
          groupedInstances.get(sig).quantity += 1;
        }
        
        for (const grouped of groupedInstances.values()) {
          items.push(grouped);
        }
      }
      
      orders.push({
        transaction_id: order.transaction_id,
        id: order.id,
        timestamp: order.timestamp,
        customerName: order.customerName,
        items,
      });
    }

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

//Passes in a transaction id to have status changed to: is_filled = true
//Reference Kitchen.jsx lines 17-39
app.put('/api/transactions/fill', async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      throw new ApiError(400, "Missing transactionId in request body", null, req.path);
    }
    if (Number.isNaN(Number(transactionId))) {
      throw new ApiError(400, "transactionId must be an integer", null, req.path);
    }

    const query = 'UPDATE transactions SET is_filled = true WHERE order_id = $1 RETURNING *;';
    const result = await pool.query(query, [transactionId]);

    if (result.rowCount === 0) {
      throw new ApiError(404, "Could not find a transaction with this ID", null, req.path);
    }

    res.json(result.rows[0]);
  } catch (err) {
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



// // Catch-all handler: send back React's index.html file for non-API routes
// app.get(/^(?!\/api).*/, (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(errorHandler);
