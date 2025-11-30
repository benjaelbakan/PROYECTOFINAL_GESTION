import { Router } from "express";
import {
  crear,
  listar,
  obtener,
  actualizarEstado,
} from "../controllers/RF03_OT.controller.js";

const router = Router();

router.post("/", crear);
router.get("/", listar);
router.get("/:id", obtener);
router.put("/:id", actualizarEstado);

export default router;
