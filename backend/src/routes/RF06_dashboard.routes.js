import { Router } from "express";
import { getDashboardData } from "../controllers/RF06_dashboard.controller.js";

const router = Router();

router.get("/dashboard", getDashboardData);

export default router;
