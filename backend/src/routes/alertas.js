// Limpieza total del archivo para eliminar duplicados y errores de llaves
const express = require('express');
const router = express.Router();
const pool = require('../db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Registrar notificación: migra estructura si la tabla antigua no tiene columnas nuevas
async function registrarNotificacion(data) {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS notificaciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asunto VARCHAR(255) NOT NULL,
      alertas_json JSON NOT NULL,
      destinatarios VARCHAR(255) DEFAULT NULL,
      metodo VARCHAR(50) DEFAULT NULL,
      enviado TINYINT(1) DEFAULT 0,
      error_envio VARCHAR(500) DEFAULT NULL,
      proveedor_respuesta JSON DEFAULT NULL,
      message_id VARCHAR(255) DEFAULT NULL,
      tipo VARCHAR(50) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    // Detectar columnas existentes
    const [cols] = await pool.query(`SHOW COLUMNS FROM notificaciones`);
    const existing = new Set(cols.map(c => c.Field));
    const alters = [];
    if (!existing.has('alertas_json')) alters.push('ADD COLUMN alertas_json JSON NOT NULL AFTER asunto');
    if (!existing.has('destinatarios')) alters.push('ADD COLUMN destinatarios VARCHAR(255) DEFAULT NULL');
    if (!existing.has('metodo')) alters.push('ADD COLUMN metodo VARCHAR(50) DEFAULT NULL');
    if (!existing.has('enviado')) alters.push('ADD COLUMN enviado TINYINT(1) DEFAULT 0');
    if (!existing.has('error_envio')) alters.push('ADD COLUMN error_envio VARCHAR(500) DEFAULT NULL');
    if (!existing.has('proveedor_respuesta')) alters.push('ADD COLUMN proveedor_respuesta JSON DEFAULT NULL');
    if (!existing.has('message_id')) alters.push("ADD COLUMN message_id VARCHAR(255) DEFAULT NULL");
    if (!existing.has('tipo')) alters.push("ADD COLUMN tipo VARCHAR(50) DEFAULT 'alerta' AFTER error_envio");
    if (!existing.has('created_at')) alters.push('ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    // Caso antiguo: quizá existían columnas como exito/error -> intentar renombrar si presentes.
    if (existing.has('exito') && !existing.has('enviado')) alters.push('ADD COLUMN enviado TINYINT(1) DEFAULT 0');
    if (existing.has('error') && !existing.has('error_envio')) alters.push('ADD COLUMN error_envio VARCHAR(500) DEFAULT NULL');
    if (alters.length) {
      try { await pool.query(`ALTER TABLE notificaciones ${alters.join(', ')}`); } catch (e) { console.warn('ALTER ignorado:', e.message); }
    }

    // Insert
    const { asunto, alertas_json, destinatarios, metodo, enviado, error_envio, proveedor_respuesta, message_id } = data;
    // Siempre registrar tipo: 'alerta' (o el que venga en data)
    const tipo = data.tipo || 'alerta';
    await pool.query(
      `INSERT INTO notificaciones (asunto, alertas_json, destinatarios, metodo, enviado, error_envio, proveedor_respuesta, message_id, tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [asunto, alertas_json, destinatarios, metodo, enviado ? 1 : 0, error_envio, proveedor_respuesta ? JSON.stringify(proveedor_respuesta) : null, message_id || null, tipo]
    );
  } catch (e) {
    console.error('Error registrando notificación:', e.message);
  }
}

// GET /api/alertas/enviar-alertas
router.get('/enviar-alertas', async (req, res) => {
  try {
    const umbralDias = parseInt(process.env.ALERT_UMBRAL_DIAS || '10', 10);
    
    // Obtener lista de suscriptores activos
    await pool.query(`CREATE TABLE IF NOT EXISTS suscriptores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      activo TINYINT(1) DEFAULT 1,
      fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    
    // Migrar tabla si falta columna activo
    try {
      const [cols] = await pool.query('SHOW COLUMNS FROM suscriptores');
      const existing = new Set(cols.map(c => c.Field));
      if (!existing.has('activo')) {
        await pool.query('ALTER TABLE suscriptores ADD COLUMN activo TINYINT(1) DEFAULT 1 AFTER email');
      }
      if (!existing.has('fecha_suscripcion')) {
        await pool.query('ALTER TABLE suscriptores ADD COLUMN fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      }
    } catch (e) {
      console.warn('Error migrando suscriptores:', e.message);
    }
    
    const [suscriptores] = await pool.query('SELECT email FROM suscriptores WHERE activo = 1');
    if (suscriptores.length === 0) {
      return res.json({ ok: true, message: 'No hay suscriptores activos', alertas: [] });
    }
    
    let tableName = 'orden_trabajo';
    try {
      const [t1] = await pool.query("SHOW TABLES LIKE 'orden_trabajo'");
      if (t1.length === 0) {
        const [t2] = await pool.query("SHOW TABLES LIKE 'ordenes_trabajo'");
        if (t2.length > 0) tableName = 'ordenes_trabajo';
      }
    } catch { tableName = 'ordenes_trabajo'; }

    const [rows] = await pool.query(`
      SELECT a.id AS activo_id, a.codigo, ot.fecha_programada
      FROM ${tableName} ot
      JOIN activos a ON a.id = ot.activo_id
      WHERE ot.fecha_programada IS NOT NULL
    `);
    const hoy = new Date();
    const alertas = [];
    for (const r of rows) {
      const fecha = new Date(r.fecha_programada);
      const diff = Math.ceil((fecha - hoy) / (1000 * 3600 * 24));
      if (diff <= umbralDias) {
        let mensaje;
        if (diff < 0) mensaje = `Mantenimiento atrasado hace ${Math.abs(diff)} día(s).`;
        else if (diff === 0) mensaje = 'Mantenimiento programado para hoy.';
        else mensaje = `Mantenimiento programado en ${diff} día(s).`;
        alertas.push({ activo: r.codigo || `#${r.activo_id}`, mensaje });
      }
    }
    if (alertas.length === 0) return res.json({ ok: true, message: 'Sin alertas próximas', alertas: [] });

    const html = `<!DOCTYPE html><html><body><h3>Alertas de mantenimiento (${alertas.length})</h3><ul>${alertas.map(x => `<li><strong>${x.activo}:</strong> ${x.mensaje}</li>`).join('')}</ul><p>Generado: ${new Date().toLocaleString()}</p></body></html>`;

    // Enviar a todos los suscriptores
    const destinatarios = suscriptores.map(s => s.email).join(', ');
    const sendGridKey = process.env.SENDGRID_API_KEY;
    const sendGridFrom = process.env.SENDGRID_FROM;
    const brevoKey = process.env.BREVO_API_KEY;
    const brevoFrom = process.env.BREVO_FROM;
    let metodo = 'smtp';
    let logged = false;
    const registroBase = {
      asunto: `Alertas de mantenimiento (${alertas.length})`,
      alertas_json: JSON.stringify(alertas),
      destinatarios,
      metodo: '',
      enviado: 0,
      error_envio: null,
      tipo: 'alerta'
    };
    const respondOk = (extra = {}) => {
      if (!logged) {
        registroBase.enviado = 1;
        registroBase.metodo = extra.metodo || metodo || 'desconocido';
        registrarNotificacion(registroBase);
        logged = true;
      }
      return res.json({ ok: true, alertas, destinatarios, ...extra });
    };

    // Brevo (prioridad)
    if (brevoKey && suscriptores.length > 0) {
      try {
        const toList = suscriptores.map(s => ({ email: s.email }));
        const senderEmail = brevoFrom || suscriptores[0].email;
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: { email: senderEmail }, to: toList, subject: registroBase.asunto, htmlContent: html })
        });
        const brevoText = await brevoRes.text();
        let brevoBody = null;
        try { brevoBody = JSON.parse(brevoText); } catch (e) { brevoBody = brevoText; }
        if (!brevoRes.ok) throw new Error(`Brevo status ${brevoRes.status}: ${brevoText}`);

        // Extraer messageId si está presente
        const extractedMessageId = (brevoBody && typeof brevoBody === 'object' && brevoBody.messageId) ? brevoBody.messageId : null;

        // Registrar la notificación con la respuesta de Brevo (proveedor_respuesta + message_id)
        try {
          await registrarNotificacion({
            asunto: registroBase.asunto,
            alertas_json: registroBase.alertas_json,
            destinatarios: registroBase.destinatarios,
            metodo: 'brevo',
            enviado: 1,
            error_envio: null,
            proveedor_respuesta: brevoBody,
            message_id: extractedMessageId,
            tipo: registroBase.tipo
          });
        } catch (e) {
          console.warn('No se pudo registrar notificación (Brevo):', e.message);
        }

        return res.json({ ok: true, alertas, destinatarios, message: 'Correo enviado vía Brevo', metodo: 'brevo', proveedor: brevoBody, messageId: extractedMessageId });
      } catch (e) {
        console.error('Fallo Brevo ->', e.message);
        metodo = 'brevo-fallback';
      }
    }

    // SendGrid (fallback si Brevo no se usó)
    if (sendGridKey && suscriptores.length > 0) {
      try {
        const toList = suscriptores.map(s => ({ email: s.email }));
        const fromEmail = sendGridFrom || suscriptores[0].email;
        const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${sendGridKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalizations: [{ to: toList }],
            from: { email: fromEmail },
            subject: registroBase.asunto,
            content: [{ type: 'text/html', value: html }]
          })
        });
        if (!sgRes.ok) throw new Error(`SendGrid status ${sgRes.status}: ${await sgRes.text()}`);
        return respondOk({ message: 'Correo enviado vía SendGrid', metodo: 'sendgrid' });
      } catch (e) {
        console.error('Fallo SendGrid ->', e.message);
        metodo = 'sendgrid-fallback';
      }
    }

    // SMTP
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const secure = process.env.SMTP_SECURE === 'true';
    if (host && user && pass && suscriptores.length > 0) {
      try {
        const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
        const info = await transporter.sendMail({ from: user, to: destinatarios, subject: registroBase.asunto, html });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        return respondOk({ message: 'Correo enviado vía SMTP', metodo: 'smtp', messageId: info.messageId, previewUrl });
      } catch (e) {
        console.error('Fallo SMTP ->', e.message);
        metodo = 'smtp-fallback';
      }
    }

    // Ethereal fallback
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false, auth: { user: testAccount.user, pass: testAccount.pass } });
      const info = await transporter.sendMail({
        from: testAccount.user,
        to: testAccount.user,
        subject: `${registroBase.asunto} [FALLBACK]`,
        html: `${html}<p style=\"color:#888;font-size:12px\">Método previo falló: ${metodo}</p>`
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      return respondOk({ message: 'Fallback Ethereal (preview disponible)', metodo, messageId: info.messageId, previewUrl });
    } catch (e) {
      if (!logged) {
        registroBase.error_envio = e.message;
        registroBase.metodo = metodo || 'desconocido';
        try { await registrarNotificacion(registroBase); } catch {}
      }
      return res.status(500).json({ ok: false, error: 'Fallo total envío', detalle: e.message });
    }
  } catch (err) {
    console.error('Error /enviar-alertas:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/alertas/notificaciones
router.get('/notificaciones', async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS notificaciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asunto VARCHAR(255) NOT NULL,
      alertas_json JSON NOT NULL,
      destinatarios VARCHAR(255) DEFAULT NULL,
      metodo VARCHAR(50) DEFAULT NULL,
      enviado TINYINT(1) DEFAULT 0,
      error_envio VARCHAR(500) DEFAULT NULL,
      proveedor_respuesta JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    const [rows] = await pool.query('SELECT * FROM notificaciones ORDER BY id DESC LIMIT 50');
    const notificaciones = rows.map(r => ({
      id: r.id,
      asunto: r.asunto,
      destinatarios: r.destinatarios,
      metodo: r.metodo,
      enviado: !!r.enviado,
      error_envio: r.error_envio,
      proveedor_respuesta: (() => { try { return r.proveedor_respuesta ? JSON.parse(r.proveedor_respuesta) : null; } catch { return r.proveedor_respuesta; } })(),
      message_id: r.message_id || null,
      created_at: r.created_at,
      alertas: (() => { try { return JSON.parse(r.alertas_json); } catch { return []; } })()
    }));
    return res.json({ ok: true, notificaciones });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/alertas/crear-ot-demo  body: { dias?: number }
router.post('/crear-ot-demo', async (req, res) => {
  try {
    const dias = parseInt(req.body?.dias || '2', 10);
    const fecha = new Date(Date.now() + dias * 24 * 3600 * 1000);
    let tableName = 'orden_trabajo';
    const [t1] = await pool.query("SHOW TABLES LIKE 'orden_trabajo'");
    if (t1.length === 0) {
      const [t2] = await pool.query("SHOW TABLES LIKE 'ordenes_trabajo'");
      if (t2.length > 0) tableName = 'ordenes_trabajo';
    }
    const [activos] = await pool.query('SELECT id, codigo FROM activos LIMIT 1');
    if (activos.length === 0) return res.status(400).json({ ok: false, message: 'No hay activos para crear OT demo' });
    const activoId = activos[0].id;
    let insertSql; let params;
    if (tableName === 'ordenes_trabajo') {
      insertSql = `INSERT INTO ordenes_trabajo (codigo_ot, activo_id, tipo, origen, prioridad, estado, fecha_programada, usuario_creador_id, descripcion)
                   VALUES (?, ?, 'PREVENTIVO', 'PLAN', 'MEDIA', 'PENDIENTE', ?, 1, ?)`;
      params = [`OT-DEMO-${Date.now()}`, activoId, fecha, 'OT demo auto'];
    } else {
      insertSql = `INSERT INTO orden_trabajo (activo_id, tipo, descripcion, fecha_programada) VALUES (?, 'PREVENTIVO', ?, ?)`;
      params = [activoId, 'OT demo auto', fecha];
    }
    const [result] = await pool.query(insertSql, params);
    return res.status(201).json({ ok: true, ot_id: result.insertId, table: tableName, fecha_programada: fecha, activo_id: activoId });
  } catch (err) {
    console.error('Error crear OT demo:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// ============= GESTIÓN DE SUSCRIPTORES =============

// POST /api/alertas/suscribirse - Agregar email a la lista de suscriptores
router.post('/suscribirse', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ ok: false, message: 'Email inválido' });
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS suscriptores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      activo TINYINT(1) DEFAULT 1,
      fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    try {
      await pool.query('INSERT INTO suscriptores (email) VALUES (?)', [email]);
      return res.status(201).json({ ok: true, message: 'Suscripción exitosa', email });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        // Ya está suscrito, reactivar si estaba inactivo
        await pool.query('UPDATE suscriptores SET activo = 1 WHERE email = ?', [email]);
        return res.json({ ok: true, message: 'Ya estabas suscrito, suscripción reactivada', email });
      }
      throw e;
    }
  } catch (err) {
    console.error('Error al suscribirse:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/alertas/suscriptores - Listar todos los suscriptores activos
router.get('/suscriptores', async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS suscriptores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      activo TINYINT(1) DEFAULT 1,
      fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

    const [rows] = await pool.query('SELECT id, email, fecha_suscripcion FROM suscriptores WHERE activo = 1 ORDER BY fecha_suscripcion DESC');
    return res.json({ ok: true, suscriptores: rows });
  } catch (err) {
    console.error('Error al listar suscriptores:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/alertas/suscriptores/:id - Desactivar suscriptor
router.delete('/suscriptores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE suscriptores SET activo = 0 WHERE id = ?', [id]);
    return res.json({ ok: true, message: 'Suscriptor desactivado' });
  } catch (err) {
    console.error('Error al desactivar suscriptor:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;

// POST /api/alertas/test-send  body: { to: string, subject?: string, html?: string }
// Endpoint de diagnóstico: intenta enviar usando SMTP (nodemailer) si hay credenciales,
// si no, usa Brevo API, si falla, cae a Ethereal. Devuelve la respuesta del proveedor.
router.post('/test-send', async (req, res) => {
  try {
    const { to, subject, html } = req.body || {};
    if (!to || !to.includes('@')) return res.status(400).json({ ok: false, message: 'Email destino inválido' });

    const asunto = subject || 'Prueba de envío - Test';
    const contenido = html || `<p>Prueba de envío desde backend: ${new Date().toLocaleString()}</p>`;

    // Intentar SMTP si está configurado
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const secure = process.env.SMTP_SECURE === 'true';

    if (host && user && pass) {
      try {
        const transporter = require('nodemailer').createTransport({ host, port, secure, auth: { user, pass } });
        const info = await transporter.sendMail({ from: user, to, subject: asunto, html: contenido });
        const preview = require('nodemailer').getTestMessageUrl(info);
        return res.json({ ok: true, metodo: 'smtp', messageId: info.messageId, previewUrl: preview || null, raw: info });
      } catch (e) {
        console.error('Error SMTP en test-send:', e && e.message ? e.message : e);
        // continuar a Brevo
      }
    }

    // Si no hay SMTP o falló, intentar Brevo API (si está clave)
    const brevoKey = process.env.BREVO_API_KEY;
    const brevoFrom = process.env.BREVO_FROM;
    if (brevoKey) {
      try {
        const toObj = [{ email: to }];
        const sender = { email: brevoFrom || to };
        const r = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST', headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender, to: toObj, subject: asunto, htmlContent: contenido })
        });
        const text = await r.text();
        let body = null; try { body = JSON.parse(text); } catch { body = text; }
        if (!r.ok) return res.status(502).json({ ok: false, metodo: 'brevo', status: r.status, body });
        return res.json({ ok: true, metodo: 'brevo', proveedor: body });
      } catch (e) {
        console.error('Error Brevo en test-send:', e && e.message ? e.message : e);
      }
    }

    // Fallback Ethereal
    try {
      const nodemailer = require('nodemailer');
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false, auth: { user: testAccount.user, pass: testAccount.pass } });
      const info = await transporter.sendMail({ from: testAccount.user, to, subject: asunto, html: contenido });
      const preview = nodemailer.getTestMessageUrl(info);
      return res.json({ ok: true, metodo: 'ethereal', previewUrl: preview, messageId: info.messageId });
    } catch (e) {
      console.error('Fallo fallback Ethereal en test-send:', e && e.message ? e.message : e);
      return res.status(500).json({ ok: false, error: 'No se pudo enviar por ningún proveedor', detalle: e && e.message ? e.message : String(e) });
    }
  } catch (err) {
    console.error('Error test-send general:', err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});
