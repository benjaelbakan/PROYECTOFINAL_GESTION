const express = require('express');
const router = express.Router();
const pool = require('../db');

// OBTENER TODOS
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM activos");
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener activos:", err);
        res.status(500).json({ message: "Error al obtener activos" });
    }
});

// CREAR UNO
router.post("/", async (req, res) => {
    try {
        const { codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion } = req.body;
        const [result] = await pool.query(
            `INSERT INTO activos (codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion]
        );
        res.status(201).json({ id: result.insertId, message: "Activo creado correctamente" });
    } catch (err) {
        console.error("Error al crear activo:", err);
        res.status(500).json({ message: "Error al crear activo" });
    }
});

// OBTENER UNO POR ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM activos WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Activo no encontrado" });
        res.json(rows[0]);
    } catch (err) {
        console.error("Error al obtener activo:", err);
        res.status(500).json({ message: "Error al obtener activo" });
    }
});

// ACTUALIZAR
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion } = req.body;
        const [result] = await pool.query(
            `UPDATE activos SET codigo = ?, tipo = ?, marca = ?, modelo = ?, anio = ?, kilometraje_actual = ?, horas_uso_actual = ?, ubicacion = ? WHERE id = ?`,
            [codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Activo no encontrado" });
        res.json({ message: "Activo actualizado correctamente" });
    } catch (err) {
        console.error("Error al actualizar activo:", err);
        res.status(500).json({ message: "Error al actualizar activo" });
    }
});

// ELIMINAR
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM activos WHERE id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Activo no encontrado" });
        res.json({ message: "Activo eliminado correctamente" });
    } catch (err) {
        console.error("Error al eliminar activo:", err);
        res.status(500).json({ message: "Error al eliminar activo" });
    }
});

module.exports = router;