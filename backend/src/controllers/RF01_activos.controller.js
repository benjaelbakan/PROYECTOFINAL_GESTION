import ActivosService from "../services/RF01_activos.service.js";

import pool from "../config/db.js"; // o tu archivo de conexión

export const listar = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM activos");
    res.json(rows);
  } catch (error) {
    console.error(error);  // <--- esto imprime el error real
    res.status(500).json({ message: "Error al listar activos" });
  }
};


export const crear = async (req, res) => {
  try {
    const id = await ActivosService.crear(req.body);
    res.status(201).json({ id, message: "Activo creado correctamente" });
  } catch {
    res.status(500).json({ message: "Error al crear activo" });
  }
};

export const obtener = async (req, res) => {
  try {
    const activo = await ActivosService.obtener(req.params.id);
    if (!activo) return res.status(404).json({ message: "Activo no encontrado" });
    res.json(activo);
  } catch {
    res.status(500).json({ message: "Error al obtener activo" });
  }
};

export const actualizar = async (req, res) => {
  try {
    const ok = await ActivosService.actualizar(req.params.id, req.body);
    if (!ok) return res.status(404).json({ message: "Activo no encontrado" });
    res.json({ message: "Activo actualizado correctamente" });
  } catch {
    res.status(500).json({ message: "Error al actualizar activo" });
  }
};

export const eliminar = async (req, res) => {
  try {
    const ok = await ActivosService.eliminar(req.params.id);
    if (!ok) return res.status(404).json({ message: "Activo no encontrado" });
    res.json({ message: "Activo eliminado correctamente" });
  } catch {
    res.status(500).json({ message: "Error al eliminar activo" });
  }
};
