import { Router } from "express";
import { login } from "../controllers/RF08_auth.controller.js";

const router = Router();

router.post("/login", login);

export default router;
