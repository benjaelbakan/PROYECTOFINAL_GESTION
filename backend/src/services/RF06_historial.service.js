import Historial from "../models/RF06_historial.models.js";

export const porActivo = async (activoId, filtros = {}) => {
  let sql = `
    SELECT *
    FROM historial_mantenimiento
    WHERE activo_id = ?
  `;

  const params = [activoId];

  // FILTROS OPCIONALES
  if (filtros.tipo) {
    sql += " AND tipo = ?";
    params.push(filtros.tipo);
  }

  if (filtros.desde) {
    sql += " AND fecha >= ?";
    params.push(filtros.desde);
  }

  if (filtros.hasta) {
    sql += " AND fecha <= ?";
    params.push(filtros.hasta);
  }

  sql += " ORDER BY fecha DESC";

  const [rows] = await Historial.query(sql, params);
  return rows;
};

export const global = async (filtros = {}) => {
  let sql = `
    SELECT *
    FROM historial_mantenimiento
    WHERE 1 = 1
  `;

  const params = [];

  // FILTROS OPCIONALES
  if (filtros.tipo) {
    sql += " AND tipo = ?";
    params.push(filtros.tipo);
  }

  if (filtros.desde) {
    sql += " AND fecha >= ?";
    params.push(filtros.desde);
  }

  if (filtros.hasta) {
    sql += " AND fecha <= ?";
    params.push(filtros.hasta);
  }

  sql += " ORDER BY fecha DESC";

  const [rows] = await Historial.query(sql, params);
  return rows;
};
