const express = require('express');
const router = express.Router();
const pool = require('../db');

// ======================================
//   RF04 — RUTAS OFICIALES DE TAREAS
// ======================================

// 1️⃣ CREAR UNA TAREA
router.post('/', async (req, res) => {
  try {
    const { orden_id, descripcion, insumos, horas, costo } = req.body;

    if (!orden_id || !descripcion) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const [result] = await pool.query(
      `INSERT INTO tareas_realizadas 
        (orden_id, descripcion_tarea, insumos_utilizados, horas_trabajadas, costo_asociado)
       VALUES (?, ?, ?, ?, ?)`,
      [orden_id, descripcion, insumos, horas, costo]
    );

    res.status(201).json({
      message: "Tarea registrada exitosamente",
      id: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar tarea" });
  }
});

// 2️⃣ OBTENER TODAS LAS TAREAS
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
          id,
          orden_id,
          descripcion_tarea AS descripcion,
          insumos_utilizados AS insumos,
          horas_trabajadas AS horas,
          costo_asociado AS costo,
          fecha_realizacion
       FROM tareas_realizadas
       ORDER BY fecha_realizacion DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al listar tareas" });
  }
});


// 3️⃣ OBTENER TAREAS POR ORDEN
router.get('/orden/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM tareas_realizadas WHERE orden_id = ? ORDER BY fecha_realizacion DESC`,
      [id]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener tareas por OT" });
  }
});

module.exports = router;
