import {
  listarActivos,
  obtenerActivo,
  crearActivoDB,
  actualizarActivoDB,
  eliminarActivoDB
} from "../services/RF01_activos.service.js";

export const getActivos = async (req, res) => {
  try {
    const activos = await listarActivos();
    res.json(activos);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener activos" });
  }
};

export const getActivoById = async (req, res) => {
  try {
    const activo = await obtenerActivo(req.params.id);
    if (!activo) return res.status(404).json({ message: "Activo no encontrado" });

    res.json(activo);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener activo" });
  }
};

export const createActivo = async (req, res) => {
  try {
    const id = await crearActivoDB(req.body);
    res.status(201).json({ id, message: "Activo creado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al crear activo" });
  }
};

export const updateActivo = async (req, res) => {
  try {
    const actualizado = await actualizarActivoDB(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ message: "Activo no encontrado" });

    res.json({ message: "Activo actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar activo" });
  }
};

export const deleteActivo = async (req, res) => {
  try {
    const eliminado = await eliminarActivoDB(req.params.id);
    if (!eliminado) return res.status(404).json({ message: "Activo no encontrado" });

    res.json({ message: "Activo eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar activo" });
  }
};
