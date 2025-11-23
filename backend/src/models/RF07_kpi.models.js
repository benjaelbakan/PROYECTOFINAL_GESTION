// backend/src/models/RF07_kpi.models.js
import pool from "../config/db.js";

const KPIModel = {
  // Obtener costos totales de mantenimiento por activo
  async obtenerCostosPorActivo() {
    const query = `
      SELECT 
        a.id,
        a.nombre AS activo, 
        a.modelo,
        SUM(t.costo_asociado) AS costo_total,
        COUNT(t.id) as cantidad_intervenciones
      FROM act_activos a
      JOIN ot_ordenes_trabajo ot ON a.id = ot.activo_id
      JOIN tar_tareas_realizadas t ON ot.id = t.orden_id
      GROUP BY a.id, a.nombre, a.modelo
      ORDER BY costo_total DESC;
    `;
    const [rows] = await pool.query(query);
    return rows;
  },

  // Calcular MTBF (Tiempo Medio Entre Fallas)
  async obtenerMTBF() {
    const query = `
      SELECT 
        a.nombre AS activo,
        COUNT(f.id) AS numero_fallas,
        DATEDIFF(NOW(), MIN(f.fecha_falla)) AS dias_operacion,
        ROUND(DATEDIFF(NOW(), MIN(f.fecha_falla)) / NULLIF(COUNT(f.id), 0), 1) AS mtbf_dias
      FROM act_activos a
      JOIN mnt_fallas f ON a.id = f.id_activo
      GROUP BY a.id, a.nombre
      HAVING numero_fallas > 0;
    `;
    const [rows] = await pool.query(query);
    return rows;
  }
};

export default KPIModel;
