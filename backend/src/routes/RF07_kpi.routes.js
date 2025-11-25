// backend/src/routes/RF07_kpi.routes.js
import express from "express";
import { obtenerIndicadoresController, getKpiActivos } from "../controllers/RF07_kpi.controllers.js";

import { verificarToken, permitirRoles } from "../middleware/RF08_auth.middleware.js";

const router = express.Router();

// Ruta principal para obtener indicadores
router.get("/indicadores", obtenerIndicadoresController);

router.get(
    "/kpi/activos",
    verificarToken,
    permitirRoles(["ADMIN", "GERENTE"]),
    getKpiActivos
);

export default router;
