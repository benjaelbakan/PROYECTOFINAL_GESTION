import * as PlanService from '../services/RF02_planes.service.js';

export const obtenerPlanes = async (req, res) => {
  try {
    const planes = await PlanService.listarPlanes();
    res.json(planes);
  } catch (error) {
    console.error("Error al obtener planes:", error);
    res.status(500).json({ message: "Error al obtener planes" });
  }
};

export const crearPlan = async (req, res) => {
  try {
    const id = await PlanService.crearNuevoPlan(req.body);
    res.status(201).json({ id, message: "Plan de mantenimiento creado correctamente" });
  } catch (error) {
    console.error("Error al crear plan:", error);
    res.status(500).json({ message: "Error al crear plan" });
  }
};

export const eliminarPlan = async (req, res) => {
  try {
    const afectadas = await PlanService.eliminarPlanPorId(req.params.id);
    if (!afectadas) return res.status(404).json({ message: "Plan no encontrado" });
    res.json({ message: "Plan eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar plan:", error);
    res.status(500).json({ message: "Error al eliminar plan" });
  }
};
