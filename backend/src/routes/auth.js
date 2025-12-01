const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

// POST /api/auth/login { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, message: 'Email y password requeridos' });
    const [rows] = await pool.query('SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?', [email]);
    if (!rows || rows.length === 0) return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    const user = rows[0];

    let valid = false;
    if (user.password) {
      // Si parece bcrypt, usar compare; si no, comparar en texto (dev)
      if (typeof user.password === 'string' && user.password.startsWith('$2')) {
        valid = await bcrypt.compare(password, user.password);
      } else {
        valid = password === user.password;
      }
    }
    if (!valid) return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.rol }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ ok: true, token, user: { id: user.id, email: user.email, nombre: user.nombre, role: user.rol } });
  } catch (e) {
    console.error('Error /auth/login:', e.message);
    return res.status(500).json({ ok: false, message: e.message });
  }
});

// Middleware: verificar token
function verifyToken(req, res, next) {
  const header = req.headers['authorization'] || req.headers['Authorization'];
  if (!header) return res.status(401).json({ ok: false, message: 'No autorizado' });
  const parts = header.split(' ');
  if (parts.length !== 2) return res.status(401).json({ ok: false, message: 'Formato token inválido' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: 'Token inválido' });
  }
}

// POST /api/auth/create-demo-gerente  (solo en entorno dev) -> crea usuario GERENTE si no existe
router.post('/create-demo-gerente', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ ok: false, message: 'No permitido en producción' });
    const email = req.body?.email || 'gerente@demo.local';
    const nombre = req.body?.nombre || 'Gerente Demo';
    const passwordPlain = req.body?.password || 'Gerente123!';

    const [exists] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exists && exists.length > 0) return res.json({ ok: true, message: 'Usuario ya existe', email });

    const salt = await require('bcryptjs').genSalt(10);
    const hash = await require('bcryptjs').hash(passwordPlain, salt);
    await pool.query('INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, 1)', [nombre, email, hash, 'GERENTE']);
    return res.json({ ok: true, message: 'Usuario gerente creado', email, password: passwordPlain });
  } catch (e) {
    console.error('Error create-demo-gerente:', e.message);
    return res.status(500).json({ ok: false, message: e.message });
  }
});

module.exports = { router, verifyToken };
