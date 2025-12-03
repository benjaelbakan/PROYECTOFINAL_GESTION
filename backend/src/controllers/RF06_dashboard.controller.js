import  db  from "../config/db.js";

export const getDashboardData = async (req, res) => {
  try {
    // 1. OTs abiertas
    const [otsAbiertas] = await db.query(`
      SELECT COUNT(*) AS total FROM orden_trabajo WHERE estado = 'pendiente'
    `);

    // 2. OTs cerradas
    const [otsCerradas] = await db.query(`
      SELECT COUNT(*) AS total FROM orden_trabajo WHERE estado = 'cerrada'
    `);

    // 3. Tiempo promedio resolución
    const [tiempo] = await db.query(`
      SELECT 
        AVG(TIMESTAMPDIFF(DAY, fecha_creacion, fecha_cierre)) AS promedio
      FROM orden_trabajo 
      WHERE fecha_cierre IS NOT NULL
    `);

    // 4. Activos totales
    const [activos] = await db.query(`
      SELECT COUNT(*) AS total FROM activos
    `);

    // 5. Mantenimientos este mes
    const [mantMes] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM historial_mantenimiento 
      WHERE MONTH(fecha) = MONTH(NOW()) 
      AND YEAR(fecha) = YEAR(NOW())
    `);

    // 6. Top 5 activos con más OTs
    const [topActivos] = await db.query(`
      SELECT a.codigo AS activo, COUNT(o.id) AS cantidad
      FROM orden_trabajo o
      JOIN activos a ON a.id = o.activo_id
      GROUP BY a.codigo
      ORDER BY cantidad DESC
      LIMIT 5
    `);

    res.json({
      otsAbiertas: otsAbiertas[0].total,
      otsCerradas: otsCerradas[0].total,
      tiempoPromedio: tiempo[0].promedio || 0,
      totalActivos: activos[0].total,
      mantenimientosMes: mantMes[0].total,
      topActivos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener datos del dashboard" });
  }
};
