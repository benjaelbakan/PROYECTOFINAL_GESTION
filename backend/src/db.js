const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "mantenimiento_user",
  password: process.env.DB_PASS || "mantenimiento123",
  database: process.env.DB_NAME || "mantenimiento",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
});

module.exports = pool;
