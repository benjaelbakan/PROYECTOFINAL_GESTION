import express from "express";
import {
  getActivos,
  getActivoById,
  createActivo,
  updateActivo,
  deleteActivo
} from "../controllers/RF01_activos.controller.js";

const router = express.Router();

/**  RUTAS OFICIALES RF01 - GESTIÓN DE ACTIVOS  **/
router.get("/", getActivos);
router.get("/:id", getActivoById);
router.post("/", createActivo);
router.put("/:id", updateActivo);
router.delete("/:id", deleteActivo);

export default router;
