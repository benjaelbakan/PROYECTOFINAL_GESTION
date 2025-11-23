import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "mantenimiento_user",
  password: "password_strong",
  database: "mantenimiento",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


export default pool;