import { Router } from "express";
import { getNotificaciones, enviarAlertas } from "../controllers/RF06_alertas.controller.js";

const router = Router();

router.get("/notificaciones", getNotificaciones);
router.get("/enviar-alertas", enviarAlertas);

export default router;
