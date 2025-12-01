const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('./auth');

// Proteger todas las rutas de estadisticas: sólo gerente
router.use(verifyToken, (req, res, next) => {
  if (!req.user || !req.user.role) return res.status(403).json({ ok: false, message: 'No autorizado' });
  const role = (req.user.role || '').toString().toUpperCase();
  if (role !== 'GERENTE') return res.status(403).json({ ok: false, message: 'Acceso restringido a gerentes' });
  next();
});

// Helper: detecta tabla disponible entre orden_trabajo y ordenes_trabajo
async function detectTable() {
  try {
    const [t1] = await pool.query("SHOW TABLES LIKE 'orden_trabajo'");
    if (t1.length > 0) return 'orden_trabajo';
    const [t2] = await pool.query("SHOW TABLES LIKE 'ordenes_trabajo'");
    if (t2.length > 0) return 'ordenes_trabajo';
    return null;
  } catch (e) {
    return null;
  }
}

// GET /api/estadisticas/ots-abiertas
router.get('/ots-abiertas', async (req, res) => {
  try {
    const table = await detectTable();
    if (!table) return res.json({ ok: true, total: 0 });
    // considerar estados que no sean finalizada/finalizadas
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${table} WHERE LOWER(estado) NOT IN ('finalizada','finalizadas','finalizado','cerrada')`);
    return res.json({ ok: true, total: rows[0].total });
  } catch (e) {
    console.error('Error ots-abiertas:', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/estadisticas/alertas-proximas
router.get('/alertas-proximas', async (req, res) => {
  try {
    const table = await detectTable();
    if (!table) return res.json({ ok: true, total: 0 });
    const umbral = parseInt(process.env.ALERT_UMBRAL_DIAS || '10', 10);
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${table} WHERE fecha_programada IS NOT NULL AND fecha_programada <= DATE_ADD(CURDATE(), INTERVAL ? DAY)`,
      [umbral]
    );
    return res.json({ ok: true, total: rows[0].total });
  } catch (e) {
    console.error('Error alertas-proximas:', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/estadisticas/cumplimiento-mensual
router.get('/cumplimiento-mensual', async (req, res) => {
  try {
    const table = await detectTable();
    if (!table) return res.json({ ok: true, porcentaje: 0 });
    // últimos 30 días
    const [tot] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${table} WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
    );
    const [fin] = await pool.query(
      `SELECT COUNT(*) AS finalizadas FROM ${table} WHERE LOWER(estado) IN ('finalizada','finalizado','finalizadas') AND fecha_cierre >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
    );
    const total = tot[0]?.total || 0;
    const finalizadas = fin[0]?.finalizadas || 0;
    const porcentaje = total === 0 ? 0 : Math.round((finalizadas / total) * 100);
    return res.json({ ok: true, porcentaje, total, finalizadas });
  } catch (e) {
    console.error('Error cumplimiento-mensual:', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/estadisticas/tiempo-medio-resolucion
router.get('/tiempo-medio-resolucion', async (req, res) => {
  try {
    const table = await detectTable();
    if (!table) return res.json({ ok: true, dias: 0 });
    // Promedio en días entre fecha_creacion y fecha_cierre para OTs finalizadas en últimos 90 días
    const [rows] = await pool.query(
      `SELECT AVG(DATEDIFF(fecha_cierre, fecha_creacion)) AS dias FROM ${table} WHERE fecha_cierre IS NOT NULL AND LOWER(estado) IN ('finalizada','finalizado','finalizadas') AND fecha_cierre >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)`
    );
    const dias = rows[0] && rows[0].dias ? Number(rows[0].dias) : 0;
    return res.json({ ok: true, dias: Math.round(dias * 10) / 10 });
  } catch (e) {
    console.error('Error tiempo-medio-resolucion:', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/estadisticas/top-activos-ots
router.get('/top-activos-ots', async (req, res) => {
  try {
    const table = await detectTable();
    if (!table) return res.json({ ok: true, top: [] });
    const [rows] = await pool.query(
      `SELECT a.codigo AS activo, COUNT(*) AS cantidad FROM ${table} ot JOIN activos a ON a.id = ot.activo_id WHERE ot.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 180 DAY) GROUP BY ot.activo_id ORDER BY cantidad DESC LIMIT 5`
    );
    return res.json({ ok: true, top: rows });
  } catch (e) {
    console.error('Error top-activos-ots:', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
