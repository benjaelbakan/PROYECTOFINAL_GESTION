// backend/src/controllers/RF07_kpi.controllers.js
import KPIModel from "../models/RF07_kpi.models.js";

// Controlador para combinar costos + MTBF
export const obtenerIndicadoresController = async (req, res) => {
  try {
    console.log("Obteniendo costos...");
    const costos = await KPIModel.obtenerCostosPorActivo();

    console.log("Obteniendo MTBF...");
    const mtbf = await KPIModel.obtenerMTBF();

    const indicadores = costos.map((activo) => {
      const mtbfActivo = mtbf.find((m) => m.activo === activo.activo);
      return {
        ...activo,
        numero_fallas: mtbfActivo?.numero_fallas || 0,
        mtbf_dias: mtbfActivo?.mtbf_dias || null,
      };
    });

    res.json({ ok: true, indicadores });
  } catch (error) {
    console.error("Error en controlador KPI:", error);
    res.status(500).json({ ok: false, msg: "Error al obtener indicadores" });
  }
};

// NUEVO: Controlador para obtener la lista de activos con costos (solo activos)
export const getKpiActivos = async (req, res) => {
  try {
    const activos = await KPIModel.obtenerCostosPorActivo();

    res.json({
      ok: true,
      activos,
    });
  } catch (error) {
    console.error("Error en getKpiActivos:", error);
    res.status(500).json({ ok: false, msg: "Error al obtener KPI de activos" });
  }
};
