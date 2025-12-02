import * as PlanModel from '../models/RF02_planes.model.js';

export const listarPlanes = async () => {
  return await PlanModel.obtenerPlanes();
};

export const crearNuevoPlan = async (plan) => {
  const {
    activo_id,
    ot_id,            // si no quieres obligarlo, puedes ponerlo opcional
    tipo,
    descripcion,
    fecha,
    km_programado,
    horas_programado
  } = plan;

  if (!activo_id || !tipo || !descripcion) {
    throw new Error("Faltan datos obligatorios: activo_id, tipo o descripcion");
  }

  const [result] = await pool.query(
    `INSERT INTO historial_mantenimiento
      (activo_id, ot_id, tipo, descripcion, fecha, km_programado, horas_programado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      activo_id,
      ot_id || null,
      tipo,
      descripcion,
      fecha || null,
      km_programado || null,
      horas_programado || null
    ]
  );

  return result.insertId;
};



export const eliminarPlanPorId = async (id) => {
  return await PlanModel.eliminarPlan(id);
};
