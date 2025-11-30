import pool from "../config/db.js";

const ActivosService = {
  listar: async () => {
    const [rows] = await pool.query("SELECT * FROM activos");
    return rows;
  },

  crear: async (data) => {
    const [res] = await pool.query(
      "INSERT INTO activos SET ?",
      data
    );
    return res.insertId;
  },

  obtener: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM activos WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  actualizar: async (id, data) => {
    const [res] = await pool.query(
      "UPDATE activos SET ? WHERE id = ?",
      [data, id]
    );
    return res.affectedRows > 0;
  },

  eliminar: async (id) => {
    const [res] = await pool.query(
      "DELETE FROM activos WHERE id = ?",
      [id]
    );
    return res.affectedRows > 0;
  },
};

export default ActivosService;
