// RF03_OT.routes.js
import { Router } from "express";
import OTService from "../models/RF03_OT.models.js"; // Ajusta la ruta si es necesario

const router = Router();

// =========================
// Listar todas las OTs
// GET /api/ordenes/orden_trabajo
// =========================
router.get("/orden_trabajo", async (req, res) => {
  try {
    const [rows] = await OTService.listarOT("SELECT * FROM orden_trabajo");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener OTs" });
  }
});

// =========================
// Obtener OT por ID
// GET /api/ordenes/orden_trabajo/:id
// =========================
router.get("/orden_trabajo/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await OTService.listarOT(
      "SELECT * FROM orden_trabajo WHERE id = ?",
      [id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "OT no encontrada" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener OT" });
  }
});

// =========================
// Crear OT
// POST /api/ordenes/orden_trabajo
// =========================
// Crear OT
router.post("/orden_trabajo", async (req, res) => {
  const data = req.body;
  try {
    const [result] = await OTService.crearOT(data); // Debe existir el método crearOT en el modelo
    res.status(201).json({ message: "OT creada correctamente", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear OT" });
  }
});


// =========================
// Actualizar OT por ID
// PUT /api/ordenes/orden_trabajo/:id
// =========================
router.put("/orden_trabajo/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  console.log("Actualizar OT:", id, data); // <--- Verifica qué llega
  try {
    const [result] = await OTService.actualizarOT(id, data);
    if (result.affectedRows > 0) {
      res.json({ message: "OT actualizada correctamente" });
    } else {
      res.status(404).json({ error: "OT no encontrada" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar OT" });
  }
});

// =========================
// Eliminar OT por ID
// DELETE /api/ordenes/orden_trabajo/:id
// =========================
router.delete("/orden_trabajo/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await OTService.eliminarOT(id);
    if (result.affectedRows > 0) {
      res.json({ message: "OT eliminada correctamente" });
    } else {
      res.status(404).json({ error: "OT no encontrada" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar OT" });
  }
});

export default router;
