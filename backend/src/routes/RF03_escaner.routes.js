import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

router.post("/verificar-patente", async (req, res) => {
  const { patente } = req.body; // Tu frontend envía "patente" => corresponde al QR

  try {
    const [rows] = await pool.query(
      "SELECT id, marca, modelo, codigo FROM activos WHERE codigo = ? LIMIT 1",
      [patente] // usamos el QR como código
    );

    if (rows.length === 0) {
      return res.json({
        existe: false
      });
    }

    return res.json({
      existe: true,
      id: rows[0].id,
      marca: rows[0].marca,
      modelo: rows[0].modelo,
      codigo: rows[0].codigo
    });

  } catch (error) {
    console.error("Error verificando activo:", error);
    res.status(500).json({ error: "Error en servidor" });
  }
});

export default router;
