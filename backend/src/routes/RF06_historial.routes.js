import { Router } from "express";
import { porActivo, global } from "../controllers/RF06_historial.controller.js";

const router = Router();

router.get("/", global);
router.get("/:id", porActivo);

export default router;
