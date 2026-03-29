import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import errorHandler from "./helpers/errorHandler.js";
import ApiError from "./helpers/ApiError.js";
import pg from "pg";
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
// Middleware
app.use(cors({
  origin: ['https://project3-backend.duckdns.org',
          'http://localhost:3000',  // for local dev
          'http://localhost:5000'   // for serving React from Express
          ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

/* 
Menu Endpoints

*/

app.get('/api/get-full-menu', async (req,res,next)=>{
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

app.get('/api/get-manager-menu', async (req,res,next)=>{
  // #swagger.tags = ['Menu']
    // #swagger.summary = "Get all items in the menu for managers"
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
    //TODO: require authentication
    const result = await pool.query("SELECT * FROM menu ORDER BY menu_id");
    const menuList = result.rows;
    res.json(menuList);

  }catch(err){
    next(err);
  }
});

app.get('/api/get-topping-menu', async (req,res,next)=>{
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

app.get('/api/get-mod-menu', async (req,res,next)=>{
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

app.get('/api/get-menu-item', async (req,res,next)=>{
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

app.put('/api/update-menu-item', async (req,res,next)=>{
    /* #swagger.tags = ['Menu']
    #swagger.summary = "Update a specific menu item"
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
                item: {
                  name: "example-food",
                  category: "food",
                  cost: "9.99"
                }
            }
        }        
    */
  try{
    //TODO: require authentication
    const menuID = req.query.menuID;
    console.log(req.body);
    if(!menuID) {
       throw new ApiError(400, "Missing Menu ID",null,req.path);
    }
    if(Number.isNaN(Number(menuID))) {
       throw new ApiError(400, "Menu ID must be an integer",null,req.path);
    }
    if(!req.body || !req.body.item){
      throw new ApiError(400, "Missing 'item'",null,req.path);
    }
    
    const newMenuValues = req.body.item;
    
    if(!newMenuValues.name || !newMenuValues.category || !newMenuValues.cost) {
       throw new ApiError(400, "Missing or empty fields in 'item'",null,req.path);
    }
    if(Number.isNaN(parseFloat(newMenuValues.cost))) {
       throw new ApiError(400, "Item cost must be an floating point number.",null,req.path);
    }

    const query = "UPDATE menu SET name = $1, category = $2, cost = $3 WHERE menu_id = $4 RETURNING *;"
    const insertValues = [newMenuValues.name, newMenuValues.category, newMenuValues.cost, menuID];

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
app.delete('/api/disable-menu-item', async (req,res,next)=>{
  /* #swagger.tags = ['Menu']
    #swagger.summary = "Disable(Delete) a specific menu item"
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
    //TODO: require authentication
    const menuID = req.query.menuID;
    if(!menuID) {
       throw new ApiError(400, "Missing Menu ID",null,req.path);
    }
    if(Number.isNaN(Number(menuID))) {
       throw new ApiError(400, "Menu ID must be an integer",null,req.path);
    }
    if(!req.body || !req.body.item){
      throw new ApiError(400, "Missing 'item'",null,req.path);
    }
    
    const newMenuValues = req.body.item;
    
    if(!newMenuValues.name || !newMenuValues.category || !newMenuValues.cost) {
       throw new ApiError(400, "Missing or empty fields in 'item'",null,req.path);
    }
    if(Number.isNaN(parseFloat(newMenuValues.cost))) {
       throw new ApiError(400, "Item cost must be an floating point number.",null,req.path);
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

app.patch('/api/enable-menu-item', async (req,res,next)=>{
  /* #swagger.tags = ['Menu']
    #swagger.summary = "Re-enables a specific menu item. Can be used for stuff like seasonal items."
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
    //TODO: require authentication
    const menuID = req.query.menuID;
    if(!menuID) {
       throw new ApiError(400, "Missing Menu ID",null,req.path);
    }
    if(Number.isNaN(Number(menuID))) {
       throw new ApiError(400, "Menu ID must be an integer",null,req.path);
    }
    if(!req.body || !req.body.item){
      throw new ApiError(400, "Missing 'item'",null,req.path);
    }
    
    const newMenuValues = req.body.item;
    
    if(!newMenuValues.name || !newMenuValues.category || !newMenuValues.cost) {
       throw new ApiError(400, "Missing or empty fields in 'item'",null,req.path);
    }
    if(Number.isNaN(parseFloat(newMenuValues.cost))) {
       throw new ApiError(400, "Item cost must be an floating point number.",null,req.path);
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

app.post('/api/add-menu-item', async (req,res,next)=>{
   /* #swagger.tags = ['Menu']
    #swagger.summary = "Creates a new menu item"
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
                item: {
                  name: "example-food",
                  category: "food",
                  cost: "9.99"
                }
            }
        }        
    */
  try{
    //TODO: require authentication
    console.log(req.body);
    if(!req.body || !req.body.item){
      throw new ApiError(400, "Missing 'item'",null,req.path);
    }
    
    const newMenuValues = req.body.item;
    
    if(!newMenuValues.name || !newMenuValues.category || !newMenuValues.cost) {
       throw new ApiError(400, "Missing or empty fields in 'item'",null,req.path);
    }
    if(Number.isNaN(parseFloat(newMenuValues.cost))) {
       throw new ApiError(400, "Item cost must be an floating point number.",null,req.path);
    }

    const query = "INSERT INTO menu (name, category, cost) VALUES ($1, $2, $3) RETURNING *;"
    const insertValues = [newMenuValues.name, newMenuValues.category, newMenuValues.cost];

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
app.get('/api/get-employees', async (req, res, next) => {
    /* #swagger.tags = ['Employees']
    #swagger.summary = "Get all employees (that are enabled)"
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
    //TODO: require authentication
    const result = await pool.query('SELECT username FROM employees WHERE is_active = true ORDER BY employee_id');
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

//endpoint example: /api/update-employee?employeeID=1
//requires 'employee' object to be sent over
//example format
/* 

*/
app.put('/api/update-employee', async (req,res,next)=>{
  try{
    //TODO: require authentication
    const employeeID = req.query.employeeID;
    if(!employeeID) {
       throw new ApiError(400, "Missing Employee ID",null,req.path);
    }
    if(Number.isNaN(Number(employeeID))) {
       throw new ApiError(400, "Employee ID must be an integer",null,req.path);
    }
    if(!req.body || !req.body.employee){
      throw new ApiError(400, "Missing 'employee'",null,req.path);
    }
    
    const newEmployee = req.body.employee;
    
    if(!newEmployee.name || !newEmployee.category || !newEmployee.cost) {
       throw new ApiError(400, "Missing or empty fields in 'item'",null,req.path);
    }
    if(Number.isNaN(parseFloat(newMenuValues.cost))) {
       throw new ApiError(400, "Item cost must be an floating point number.",null,req.path);
    }

    const query = "UPDATE menu SET name = $1, category = $2, cost = $3 WHERE menu_id = $4 RETURNING *;"
    const insertValues = [newMenuValues.name, newMenuValues.category, newMenuValues.cost, menuID];

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

// Catch-all handler: send back React's index.html file for non-API routes
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(errorHandler);