import { Router } from 'express';
import { obtenerPlanes, crearPlan, eliminarPlan } from '../controllers/RF02_planes.controller.js';

const router = Router();

router.get("/", obtenerPlanes);
router.post("/", crearPlan);
router.delete("/:id", eliminarPlan);

export default router;
