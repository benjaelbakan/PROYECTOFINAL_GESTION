// backend/src/routes/estadisticas.routes.js
import { Router } from "express";
import {
  totalActivos,
  otsAbiertas,
  otsCerradas,
  topActivosOts,
  cumplimientoMensual,
  tiempoMedioResolucion,
  alertasProximas,
  ultimosMantenimientos
} from "../controllers/RF06_estadisticas.controller.js";

const router = Router();

router.get("/total-activos", totalActivos);
router.get("/ots-abiertas", otsAbiertas);
router.get("/ots-cerradas", otsCerradas);
router.get("/top-activos-ots", topActivosOts);
router.get("/cumplimiento-mensual", cumplimientoMensual);
router.get("/tiempo-medio-resolucion", tiempoMedioResolucion);
router.get("/alertas-proximas", alertasProximas);
router.get("/ultimos-mantenimientos", ultimosMantenimientos);

export default router;
