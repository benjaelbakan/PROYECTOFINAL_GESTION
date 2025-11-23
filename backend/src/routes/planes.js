const express = require("express");
const router = express.Router();
const pool = require("../db"); // mismo pool que usas en app.js

// GET /api/planes
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.id,
        p.activo_id,
        a.codigo AS codigo_activo,
        a.marca,
        a.modelo,
        p.basado_en,
        p.frecuencia_dias,
        p.frecuencia_km,
        p.frecuencia_horas,
        p.descripcion,
        p.activo,
        p.creado_en
      FROM planes_mantenimiento p
      JOIN activos a ON a.id = p.activo_id
      WHERE p.activo = 1
      ORDER BY p.creado_en DESC
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener planes:", err);
    res
      .status(500)
      .json({ message: "Error al obtener los planes de mantenimiento" });
  }
});

// POST /api/planes
router.post("/", async (req, res) => {
  try {
    const {
      activo_id,
      basado_en, // 'TIEMPO' | 'KILOMETRAJE' | 'HORAS' | 'MIXTO'
      frecuencia_dias,
      frecuencia_km,
      frecuencia_horas,
      descripcion,
    } = req.body;

    const sql = `
      INSERT INTO planes_mantenimiento
        (activo_id, basado_en, frecuencia_dias, frecuencia_km, frecuencia_horas, descripcion)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      activo_id,
      basado_en,
      frecuencia_dias || null,
      frecuencia_km || null,
      frecuencia_horas || null,
      descripcion || null,
    ]);

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Error al crear plan:", err);
    res
      .status(500)
      .json({ message: "Error al crear el plan de mantenimiento" });
  }
});

module.exports = router;
