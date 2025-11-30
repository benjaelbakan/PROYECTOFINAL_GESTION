import pool from "../config/db.js";

const Historial = {
  historialPorActivo: (sql, params) => pool.query(sql, params),
  historialGlobal: (sql, params) => pool.query(sql, params),
};

export default Historial;
