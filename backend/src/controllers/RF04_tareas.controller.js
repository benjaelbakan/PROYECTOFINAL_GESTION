import {
  crearTareaDB,
  listarTareasDB,
  listarTareasPorOrdenDB
} from "../services/RF04_tareas.service.js";

export const crearTarea = async (req, res) => {
  try {
    const { orden_id, descripcion, insumos, horas, costo } = req.body;

    if (!orden_id || !descripcion) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const id = await crearTareaDB({
      orden_id,
      descripcion,
      insumos,
      horas,
      costo,
    });

    res.status(201).json({
      message: "Tarea registrada exitosamente",
      id,
    });
  } catch (error) {
    console.error("❌ Error en controlador crearTarea:", error);
    res.status(500).json({ message: "Error al guardar tarea" });
  }
};

export const obtenerTareas = async (req, res) => {
  try {
    const tareas = await listarTareasDB();
    res.json(tareas);
  } catch (error) {
    console.error("❌ Error en controlador obtenerTareas:", error);
    res.status(500).json({ message: "Error al listar tareas" });
  }
};

export const obtenerTareasPorOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const tareas = await listarTareasPorOrdenDB(id);
    res.json(tareas);
  } catch (error) {
    console.error("❌ Error en controlador obtenerTareasPorOrden:", error);
    res.status(500).json({ message: "Error al obtener tareas por OT" });
  }
};
