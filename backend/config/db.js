import pg from "pg";
import "dotenv/config";
// import dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
