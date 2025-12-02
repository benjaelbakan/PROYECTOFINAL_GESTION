import pool from '../config/db.js';

export const obtenerPlanes = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM historial_mantenimiento ORDER BY creado_en DESC`
  );
  return rows;
};

export const crearPlan = async (plan) => {
  const { activo_id, tipo, descripcion, fecha, km_programado, horas_programado } = plan;
  const [result] = await pool.query(
    `INSERT INTO historial_mantenimiento
      (activo_id, tipo, descripcion, fecha, km_programado, horas_programado)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [activo_id, tipo, descripcion, fecha || null, km_programado || null, horas_programado || null]
  );
  return result.insertId;
};

export const eliminarPlan = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM historial_mantenimiento WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
};
