import express from "express";
import {
  crearTarea,
  obtenerTareas,
  obtenerTareasPorOrden
} from "../controllers/RF04_tareas.controller.js";

const router = express.Router();

// ======================================
//     RUTAS OFICIALES RF04 — TAREAS
// ======================================

router.post("/", crearTarea);
router.get("/", obtenerTareas);
router.get("/orden/:id", obtenerTareasPorOrden);

export default router;
