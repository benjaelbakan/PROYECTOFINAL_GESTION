// RF03_ot.model.js (ESM)
import pool from "../config/db.js";

const crearOT = (data) =>
  pool.query(
    `INSERT INTO orden_trabajo (activo_id, tipo, descripcion, fecha_programada, trabajador_asignado)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.activoId,
      data.tipo,
      data.descripcion,
      data.fechaProgramada,
      data.trabajadorAsignado
    ]
  );

const listarOT = (sql, params) => pool.query(sql, params);

const obtenerOT = (id) =>
  pool.query("SELECT * FROM orden_trabajo WHERE id = ?", [id]);

const actualizarEstado = (sql, params) =>
  pool.query(sql, params);

const insertarHistorial = (data) =>
  pool.query(
    `INSERT INTO historial_mantenimiento (activo_id, ot_id, tipo, descripcion, fecha)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.activo_id,
      data.ot_id,
      data.tipo,
      data.descripcion,
      data.fecha
    ]
  );

export default {
  crearOT,
  listarOT,
  obtenerOT,
  actualizarEstado,
  insertarHistorial
};
