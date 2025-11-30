import * as HistorialService from "../services/RF06_historial.service.js";

export const porActivo = async (req, res) => {
  try {
    const filtros = req.query;
    const historial = await HistorialService.porActivo(req.params.id, filtros);
    res.json(historial);
  } catch {
    res.status(500).json({ message: "Error al obtener historial" });
  }
};

export const global = async (req, res) => {
  try {
    const historial = await HistorialService.global(req.query);
    res.json(historial);
  } catch {
    res.status(500).json({ message: "Error al obtener historial global" });
  }
};
