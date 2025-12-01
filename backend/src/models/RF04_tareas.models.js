import { pool } from "../config/db.js";

// Obtener todas las tareas
export const listarTareasDB = async () => {
  const [rows] = await pool.query(`
    SELECT id, orden_id, descripcion, insumos, horas, costo, fecha_registro 
    FROM tar_tareas_realizadas
    ORDER BY fecha_registro DESC
  `);
  return rows;
};

// Obtener 1 tarea por ID
export const obtenerTareaPorIdDB = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM tar_tareas_realizadas WHERE id = ?`,
    [id]
  );
  return rows[0];
};

// Crear tarea
export const crearTareaDB = async ({ orden_id, descripcion, insumos, horas, costo }) => {
  const [resultado] = await pool.query(
    `INSERT INTO tar_tareas_realizadas (orden_id, descripcion, insumos, horas, costo)
     VALUES (?, ?, ?, ?, ?)`,
    [orden_id, descripcion, insumos, horas, costo]
  );
  return resultado.insertId;
};

// 🔥 CORRECCIÓN IMPORTANTE
export const actualizarTareaDB = async (id, tarea) => {
  const { orden_id, descripcion, insumos, horas, costo } = tarea;

  await pool.query(
    `UPDATE tar_tareas_realizadas
     SET orden_id=?, descripcion=?, insumos=?, horas=?, costo=?
     WHERE id = ?`,
    [orden_id, descripcion, insumos, horas, costo, id]
  );
};

// Eliminar tarea
export const eliminarTareaDB = async (id) => {
  await pool.query(`DELETE FROM tar_tareas_realizadas WHERE id = ?`, [id]);
};
