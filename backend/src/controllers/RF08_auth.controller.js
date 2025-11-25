import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM usr_usuarios WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const user = rows[0];


        // Verificar contraseña
        console.log("Password enviada:", password);
        console.log("Password en BD:", user.password);
        // Verificar contraseña
        console.log("Comparando:", password, user.password);
        const match = await bcrypt.compare(password, user.password);
        console.log("Resultado compare:", match);

        if (!match) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // Generar token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                rol: user.rol,
            },
            "MI_SECRETO_SUPER_SEGURO",
            { expiresIn: "8h" }
        );

        res.json({
            message: "Login exitoso",
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
};
