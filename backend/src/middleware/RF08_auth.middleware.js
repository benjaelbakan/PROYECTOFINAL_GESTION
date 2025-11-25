import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const verificarToken = async (req, res, next) => {
    try {
        const token = req.headers["authorization"];

        if (!token) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        const tokenSinBearer = token.replace("Bearer ", "");

        const decoded = jwt.verify(tokenSinBearer, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido" });
    }
};

export const permitirRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        next();
    };
};
