const express = require("express");
const cors = require("cors");
const pool = require("./db");
const planesRoutes = require("./routes/planes");
const alertasRoutes = require("./routes/alertas");
const estadisticasRoutes = require('./routes/estadisticas');
const { router: authRoutes } = require('./routes/auth');
const cron = require('node-cron');
const axios = require('axios');


const app = express();

// Middlewares
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// Rutas montadas con routers externos
app.use("/api/planes", planesRoutes);
app.use("/api/alertas", alertasRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de mantenimiento funcionando 😎");
});

// El cron se registra después de arrancar el servidor (ver más abajo)

// ====================== ACTIVOS ======================

// Listar activos
app.get("/api/activos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM activos");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener activos:", err);
    res.status(500).json({ message: "Error al obtener activos" });
  }
});

// Crear activo
app.post("/api/activos", async (req, res) => {
  try {
    const {
      codigo,
      tipo,
      marca,
      modelo,
      anio,
      kilometraje_actual,
      horas_uso_actual,
      ubicacion,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO activos
        (codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo,
        tipo,
        marca,
        modelo,
        anio,
        kilometraje_actual,
        horas_uso_actual,
        ubicacion,
      ]
    );

    res
      .status(201)
      .json({ id: result.insertId, message: "Activo creado correctamente" });
  } catch (err) {
    console.error("Error al crear activo:", err);
    res.status(500).json({ message: "Error al crear activo" });
  }
});

// Obtener un activo por ID
app.get("/api/activos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM activos WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Activo no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener activo:", err);
    res.status(500).json({ message: "Error al obtener activo" });
  }
});

// Actualizar un activo
app.put("/api/activos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo,
      tipo,
      marca,
      modelo,
      anio,
      kilometraje_actual,
      horas_uso_actual,
      ubicacion,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE activos
       SET codigo = ?, tipo = ?, marca = ?, modelo = ?, anio = ?, 
           kilometraje_actual = ?, horas_uso_actual = ?, ubicacion = ?
       WHERE id = ?`,
      [
        codigo,
        tipo,
        marca,
        modelo,
        anio,
        kilometraje_actual,
        horas_uso_actual,
        ubicacion,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Activo no encontrado" });
    }

    res.json({ message: "Activo actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar activo:", err);
    res.status(500).json({ message: "Error al actualizar activo" });
  }
});

// Eliminar un activo
app.delete("/api/activos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM activos WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Activo no encontrado" });
    }

    res.json({ message: "Activo eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar activo:", err);
    res.status(500).json({ message: "Error al eliminar activo" });
  }
});

// ====================== ÓRDENES DE TRABAJO (OT) ======================

// Crear Orden de Trabajo
app.post("/api/ot", async (req, res) => {
  try {
    const {
      activoId,
      tipo,
      descripcion,
      fechaProgramada,
      trabajadorAsignado,
    } = req.body;

    if (!activoId || !tipo || !descripcion) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const [result] = await pool.query(
      `INSERT INTO orden_trabajo 
        (activo_id, tipo, descripcion, fecha_programada, trabajador_asignado)
       VALUES (?, ?, ?, ?, ?)`,
      [
        activoId,
        tipo,
        descripcion,
        fechaProgramada || null,
        trabajadorAsignado || null,
      ]
    );

    // Historial de creación (opcional, no falla si tabla no existe)
    try {
      await pool.query(
        `INSERT INTO ot_historial
         (ot_id, descripcion_cambio, estado, trabajador_asignado)
         VALUES (?, ?, ?, ?)`,
        [
          result.insertId,
          "Creación de OT",
          "pendiente",
          trabajadorAsignado || null,
        ]
      );
    } catch (e) {
      console.warn('Historial OT no registrado (tabla ot_historial no existe):', e.message);
    }

    return res.status(201).json({
      id: result.insertId,
      activoId,
      tipo,
      descripcion,
      fechaProgramada,
      trabajadorAsignado,
      estado: "pendiente",
      message: "OT creada correctamente",
    });
  } catch (error) {
    console.error("Error al crear OT:", error);
    return res.status(500).json({ message: "Error al crear OT" });
  }
});

// Listar OT (con filtro opcional por estado)
app.get("/api/ot", async (req, res) => {
  try {
    const { estado } = req.query;

    let sql = "SELECT * FROM orden_trabajo";
    const params = [];

    if (estado) {
      sql += " WHERE estado = ?";
      params.push(estado);
    }

    sql += " ORDER BY id DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al listar OT:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las órdenes de trabajo" });
  }
});

// Actualizar estado / trabajador de OT
app.put("/api/ot/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, trabajadorAsignado } = req.body;

    const campos = [];
    const valores = [];

    if (estado !== undefined) {
      const estadosPermitidos = ["pendiente", "en_progreso", "finalizada"];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({ message: "Estado no válido" });
      }
      campos.push("estado = ?");
      valores.push(estado);
    }

    if (trabajadorAsignado !== undefined) {
      campos.push("trabajador_asignado = ?");
      valores.push(trabajadorAsignado);
    }

    if (campos.length === 0) {
      return res
        .status(400)
        .json({ message: "No se enviaron datos para actualizar" });
    }

    valores.push(id);

    const [result] = await pool.query(
      `UPDATE orden_trabajo SET ${campos.join(", ")} WHERE id = ?`,
      valores
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "OT no encontrada" });
    }

    let descripcion = "Actualización de OT:";
    if (estado !== undefined) descripcion += ` estado -> ${estado}`;
    if (trabajadorAsignado !== undefined)
      descripcion += `, trabajador -> ${trabajadorAsignado}`;

    // Historial de actualización (opcional)
    try {
      await pool.query(
        `INSERT INTO ot_historial
          (ot_id, descripcion_cambio, estado, trabajador_asignado)
         VALUES (?, ?, ?, ?)`,
        [id, descripcion, estado || null, trabajadorAsignado || null]
      );
    } catch (e) {
      console.warn('Historial OT no registrado:', e.message);
    }

    res.json({ message: "OT actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar OT:", error);
    res.status(500).json({ message: "Error al actualizar OT" });
  }
});

// Historial de una OT
app.get("/api/ot/:id/historial", async (req, res) => {
  try {
    const { id } = req.params;
    // Verificar si tabla existe
    const [tables] = await pool.query("SHOW TABLES LIKE 'ot_historial'");
    if (tables.length === 0) {
      return res.json({ ok: true, historial: [], message: 'Tabla ot_historial no existe' });
    }
    const [rows] = await pool.query(
      `SELECT * FROM ot_historial
       WHERE ot_id = ?
       ORDER BY fecha ASC`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historial de OT:", error);
    res.status(500).json({ message: "Error al obtener historial de OT" });
  }
});

// Detalle de una OT
app.get("/api/ot/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM orden_trabajo WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "OT no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener detalle de OT:", error);
    res.status(500).json({ message: "Error al obtener detalle de OT" });
  }
});

// ====================== SERVIDOR ======================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});

// ===== CRON JOB DESHABILITADO =====
// El envío de alertas ahora se hace manualmente o cuando los usuarios se suscriben
// Si quieres habilitar envío automático diario, descomenta esto y cambia '* * * * *' a '0 9 * * *'
/*
cron.schedule('* * * * *', () => {
  console.log('Verificando alertas de mantenimiento...');
  const url = `http://127.0.0.1:${PORT}/api/alertas/enviar-alertas`;

  axios
    .get(url)
    .then((response) => {
      console.log('Alertas enviadas correctamente:', response.data);
    })
    .catch((error) => {
      console.error('Error al enviar alertas:', error && error.message ? error.message : error);
      if (error && error.response) {
        console.error('Axios response status:', error.response.status);
        console.error('Axios response data:', error.response.data);
      }
      if (error && error.stack) console.error(error.stack);
    });
});
*/
