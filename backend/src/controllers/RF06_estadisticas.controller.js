// backend/src/controllers/RF06_estadisticas.controller.js
import {
  obtenerTotalActivos,
  obtenerOtsAbiertas,
  obtenerOtsCerradas,
  obtenerTopActivosOts,
  obtenerCumplimientoMensual,
  obtenerTiempoMedioResolucion,
  obtenerAlertasProximas,
  obtenerUltimosMantenimientos
} from "../services/RF06_estadisticas.service.js";

export const totalActivos = async (req, res) => {
  res.json({ total: await obtenerTotalActivos() });
};

export const otsAbiertas = async (req, res) => {
  res.json({ total: await obtenerOtsAbiertas() });
};

export const otsCerradas = async (req, res) => {
  res.json({ total: await obtenerOtsCerradas() });
};

export const topActivosOts = async (req, res) => {
  res.json({ top: await obtenerTopActivosOts() });
};

export const cumplimientoMensual = async (req, res) => {
  res.json({ porcentaje: await obtenerCumplimientoMensual() });
};

export const tiempoMedioResolucion = async (req, res) => {
  res.json({ dias: await obtenerTiempoMedioResolucion() });
};

export const alertasProximas = async (req, res) => {
  res.json({ total: await obtenerAlertasProximas() });
};

export const ultimosMantenimientos = async (req, res) => {
  res.json({ rows: await obtenerUltimosMantenimientos(10) });
};
