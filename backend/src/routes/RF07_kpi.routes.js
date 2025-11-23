// backend/src/routes/RF07_kpi.routes.js
import express from "express";
import { obtenerIndicadoresController } from "../controllers/RF07_kpi.controllers.js";

const router = express.Router();

// Ruta principal para obtener indicadores
router.get("/indicadores", obtenerIndicadoresController);

export default router;
