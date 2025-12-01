import { Router } from "express";
import {
  obtenerTareas,
  obtenerTarea,
  crearTarea,
  actualizarTarea,
  eliminarTarea
} from "../controllers/RF04_tareas.controller.js";

const router = Router();

router.get("/", obtenerTareas);           // Listar todas
router.get("/:id", obtenerTarea);         // Obtener 1 por ID
router.post("/", crearTarea);             // Crear
router.put("/:id", actualizarTarea);      // Actualizar
router.delete("/:id", eliminarTarea);     // Eliminar

export default router;
