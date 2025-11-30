const pool = require("../config/db");

module.exports = {
  listarActivos: () => pool.query("SELECT * FROM activos"),

  crearActivo: (data) =>
    pool.query(
      `INSERT INTO activos (codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.codigo,
        data.tipo,
        data.marca,
        data.modelo,
        data.anio,
        data.kilometraje_actual,
        data.horas_uso_actual,
        data.ubicacion
      ]
    ),

  obtenerActivo: (id) => pool.query("SELECT * FROM activos WHERE id = ?", [id]),

  actualizarActivo: (id, data) =>
    pool.query(
      `UPDATE activos
       SET codigo=?, tipo=?, marca=?, modelo=?, anio=?, kilometraje_actual=?, horas_uso_actual=?, ubicacion=?
       WHERE id=?`,
      [
        data.codigo,
        data.tipo,
        data.marca,
        data.modelo,
        data.anio,
        data.kilometraje_actual,
        data.horas_uso_actual,
        data.ubicacion,
        id
      ]
    ),

  eliminarActivo: (id) =>
    pool.query("DELETE FROM activos WHERE id=?", [id]),
};
