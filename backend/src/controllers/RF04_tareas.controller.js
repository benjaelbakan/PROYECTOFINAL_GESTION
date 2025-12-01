import pool from "../config/db.js";   // <-- ESTA LÍNEA Faltaba
import {
  listarTareasDB,
  obtenerTareaPorIdDB,
  crearTareaDB,
  actualizarTareaDB,
  eliminarTareaDB
} from "../models/RF04_tareas.models.js";

export const obtenerTareas = async (req, res) => {
  try {
    const tareas = await listarTareasDB();
    res.json(tareas);
  } catch (error) {
    console.error("Error en obtenerTareas:", error);
    res.status(500).json({ message: "Error obteniendo tareas" });
  }
};

export const obtenerTarea = async (req, res) => {
  try {
    const tarea = await obtenerTareaPorIdDB(req.params.id);
    if (!tarea || tarea.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json(tarea[0]);
  } catch (error) {
    console.error("Error en obtenerTarea:", error);
    res.status(500).json({ message: "Error obteniendo tarea" });
  }
};

export const crearTarea = async (req, res) => {
  try {
    console.log("BODY RECIBIDO:", req.body);

    const { orden_id, descripcion, insumos, horas, costo } = req.body;

    const [resultado] = await pool.query(
      `INSERT INTO tar_tareas_realizadas (orden_id, descripcion, insumos, horas, costo)
       VALUES (?, ?, ?, ?, ?)`,
      [orden_id, descripcion, insumos, horas, costo]
    );

    res.json({ id: resultado.insertId });

  } catch (error) {
    console.log("ERROR en crearTarea:", error);
    res.status(500).json({ message: "Error al registrar tarea" });
  }
};

export const actualizarTarea = async (req, res) => {
  try {
    console.log("PUT BODY:", req.body);

    const { orden_id, descripcion, insumos, horas, costo } = req.body;

    await actualizarTareaDB(req.params.id, {
      orden_id,
      descripcion,
      insumos,
      horas,
      costo
    });

    res.json({ message: "Tarea actualizada correctamente" });

  } catch (error) {
    console.error("Error en actualizarTarea:", error);
    res.status(500).json({ message: "Error actualizando tarea" });
  }
};

export const eliminarTarea = async (req, res) => {
  try {
    await eliminarTareaDB(req.params.id);
    res.json({ message: "Tarea eliminada" });
  } catch (error) {
    console.error("Error en eliminarTarea:", error);
    res.status(500).json({ message: "Error eliminando tarea" });
  }
};
