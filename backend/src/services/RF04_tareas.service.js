import { pool } from "../config/db.js";

// Crear tarea
export const crearTareaDB = async (data) => {
  const { orden_id, descripcion, insumos, horas, costo } = data;

  const [result] = await pool.query(
    `INSERT INTO tar_tareas_realizadas 
      (orden_id, descripcion_tarea, insumos_utilizados, horas_trabajadas, costo_asociado)
     VALUES (?, ?, ?, ?, ?)`,
    [orden_id, descripcion, insumos, horas, costo]
  );

  return result.insertId;
};

// Listar todas
export const listarTareasDB = async () => {
  const [rows] = await pool.query(
    `SELECT
        id,
        orden_id,
        descripcion_tarea AS descripcion,
        insumos_utilizados AS insumos,
        horas_trabajadas AS horas,
        costo_asociado AS costo,
        fecha_realizacion
     FROM tar_tareas_realizadas
     ORDER BY fecha_realizacion DESC`
  );
  return rows;
};

// Listar por OT
export const listarTareasPorOrdenDB = async (id) => {
  const [rows] = await pool.query(
    `SELECT *
     FROM tar_tareas_realizadas
     WHERE orden_id = ?
     ORDER BY fecha_realizacion DESC`,
    [id]
  );

  return rows;
};
