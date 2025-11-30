import pool from "../config/db.js";

// Listar OTs
const listarOT = (sql, params = []) => pool.query(sql, params);

// Crear OT
const crearOT = async (data) => {
  const sql = `INSERT INTO orden_trabajo
    (activo_id, tipo, descripcion, fecha_programada, trabajador_asignado, estado, costo)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    data.activo_id, 
    data.tipo, 
    data.descripcion, 
    data.fecha_programada, 
    data.trabajador_asignado, 
    data.estado, 
    data.costo
  ];

  return await pool.execute(sql, params);
};

// Eliminar OT
const eliminarOT = (id) => 
  pool.query("DELETE FROM orden_trabajo WHERE id = ?", [id]);

// Actualizar OT
const actualizarOT = (id, data) => {
  const { tipo, descripcion, fecha_programada, trabajador_asignado, estado, costo } = data;
  return pool.query(
    `UPDATE orden_trabajo 
     SET tipo=?, descripcion=?, fecha_programada=?, trabajador_asignado=?, estado=?, costo=? 
     WHERE id=?`,
    [tipo, descripcion, fecha_programada, trabajador_asignado, estado, costo, id]
  );
};

// Obtener OT por ID
const obtenerOT = (id) =>
  pool.query("SELECT * FROM orden_trabajo WHERE id = ?", [id]);

export default {
  listarOT,
  crearOT,
  eliminarOT,
  actualizarOT,
  obtenerOT
};
