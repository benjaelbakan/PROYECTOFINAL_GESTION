import jwt from "jsonwebtoken";
import db from "../database/config.js";  // o la ruta que uses para BD

import jwt from "jsonwebtoken";
import db from "../database/config.js";  // o la ruta que uses para BD


router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const [user] = await db.query(
      "SELECT * FROM usr_usuarios WHERE correo = ? AND contrasena = ?",
      [correo, contrasena]
    );

    if (!user.length) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const usuario = user[0];

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    return res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno en el servidor" });
  }
});
