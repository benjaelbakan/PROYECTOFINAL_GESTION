import  db  from "../config/db.js";

export async function obtenerNotificaciones() {
  const [rows] = await db.query(`
    SELECT mensaje, fecha
    FROM notificaciones
    ORDER BY fecha DESC
    LIMIT 20;
  `);
  return rows;
}

export async function procesarEnvioAlertas() {
  await db.query(`
    INSERT INTO notificaciones(mensaje, fecha)
    SELECT CONCAT('Alerta por vencer: ', nombre), NOW()
    FROM activos
    WHERE dias_restantes <= 5;
  `);
  return "Alertas enviadas correctamente";
}
