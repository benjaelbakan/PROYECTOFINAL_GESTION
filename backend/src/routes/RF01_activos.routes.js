import { Router } from "express";
import {
  listar,
  crear,
  obtener,
  actualizar,
  eliminar,
} from "../controllers/RF01_activos.controller.js";

const router = Router();

router.get("/", listar);
router.post("/", crear);
router.get("/:id", obtener);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;
