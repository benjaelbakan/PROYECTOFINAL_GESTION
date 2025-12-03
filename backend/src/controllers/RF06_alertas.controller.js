import { obtenerNotificaciones, procesarEnvioAlertas } from "../services/RF06_alertas.service.js";

export const getNotificaciones = async (req, res) => {
  const rows = await obtenerNotificaciones();
  res.json({ rows });
};

export const enviarAlertas = async (req, res) => {
  const result = await procesarEnvioAlertas();
  res.json({ message: result });
};
