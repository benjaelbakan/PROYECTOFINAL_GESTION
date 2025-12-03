// backend/src/services/RF06_estadisticas.service.js
import  db  from "../config/db.js";

export async function obtenerTotalActivos() {
  const [rows] = await db.query(`SELECT COUNT(*) AS total FROM activos`);
  return rows[0].total || 0;
}

export async function obtenerOtsAbiertas() {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM orden_trabajo
    WHERE LOWER(IFNULL(estado, '')) NOT IN ('cerrada','cerrado')
  `);
  return rows[0].total || 0;
}

export async function obtenerOtsCerradas() {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM orden_trabajo
    WHERE LOWER(IFNULL(estado, '')) = 'cerrada'
  `);
  return rows[0].total || 0;
}

export async function obtenerTopActivosOts() {
  const [rows] = await db.query(`
    SELECT a.codigo AS activo, COUNT(ot.id) AS cantidad
    FROM activos a
    LEFT JOIN orden_trabajo ot
      ON ot.activo_id = a.id
      AND ot.fecha_programada >= DATE_SUB(CURDATE(), INTERVAL 180 DAY)
    GROUP BY a.id
    ORDER BY cantidad DESC
    LIMIT 6
  `);
  return rows;
}

export async function obtenerCumplimientoMensual() {
  const [rows] = await db.query(`
    SELECT
      CASE WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND( (SUM(CASE WHEN LOWER(IFNULL(estado,''))='cerrada' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) END AS porcentaje
    FROM orden_trabajo
    WHERE fecha_programada >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  `);
  return rows[0].porcentaje || 0;
}

export async function obtenerTiempoMedioResolucion() {
  const [rows] = await db.query(`
    SELECT ROUND(AVG(DATEDIFF(fecha_cierre, fecha_programada)), 1) AS dias
    FROM orden_trabajo
    WHERE fecha_cierre IS NOT NULL
  `);
  return rows[0].dias || 0;
}

export async function obtenerAlertasProximas() {
  // No hay tabla "alertas" en tu esquema: usamos mantenimientos programados en historial_mantenimiento próximos 7 días
  const [rows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM historial_mantenimiento
    WHERE fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  `);
  return rows[0].total || 0;
}

export async function obtenerUltimosMantenimientos(limit = 10) {
  const [rows] = await db.query(`
    SELECT h.id, h.activo_id, a.codigo AS activo_codigo, h.tipo, h.descripcion, h.fecha, h.km_programado, h.horas_programado, h.estado
    FROM historial_mantenimiento h
    LEFT JOIN activos a ON a.id = h.activo_id
    ORDER BY h.fecha DESC
    LIMIT ?
  `, [limit]);
  return rows;
}
