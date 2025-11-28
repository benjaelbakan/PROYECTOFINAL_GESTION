const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de mantenimiento funcionando 😎");
});

// ----------------------------------------------------
// RUTAS DE ACTIVOS
// ----------------------------------------------------

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
    const { codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion } = req.body;
    const [result] = await pool.query(
      `INSERT INTO activos (codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion]
    );
    res.status(201).json({ id: result.insertId, message: "Activo creado correctamente" });
  } catch (err) {
    console.error("Error al crear activo:", err);
    res.status(500).json({ message: "Error al crear activo" });
  }
});

// Obtener un activo por ID
app.get("/api/activos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM activos WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Activo no encontrado" });
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
    const { codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion } = req.body;
    const [result] = await pool.query(
      `UPDATE activos SET codigo=?, tipo=?, marca=?, modelo=?, anio=?, kilometraje_actual=?, horas_uso_actual=?, ubicacion=? WHERE id=?`,
      [codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Activo no encontrado" });
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
    const [result] = await pool.query("DELETE FROM activos WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Activo no encontrado" });
    res.json({ message: "Activo eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar activo:", err);
    res.status(500).json({ message: "Error al eliminar activo" });
  }
});

// ----------------------------------------------------
// RUTAS DE ÓRDENES DE TRABAJO (OT)
// ----------------------------------------------------

// Crear Orden de Trabajo
app.post("/api/ot", async (req, res) => {
  try {
    const { activoId, tipo, descripcion, fechaProgramada, trabajadorAsignado } = req.body;
    if (!activoId || !tipo || !descripcion) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    const [result] = await pool.query(
      `INSERT INTO orden_trabajo (activo_id, tipo, descripcion, fecha_programada, trabajador_asignado) VALUES (?, ?, ?, ?, ?)`,
      [activoId, tipo, descripcion, fechaProgramada || null, trabajadorAsignado || null]
    );
    return res.status(201).json({ id: result.insertId, message: "OT creada correctamente" });
  } catch (error) {
    console.error("Error al crear OT:", error);
    return res.status(500).json({ message: "Error al crear OT" });
  }
});

// Listar OT
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
    res.status(500).json({ message: "Error al obtener las órdenes de trabajo" });
  }
});

// Detalle de una OT
app.get("/api/ot/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM orden_trabajo WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "OT no encontrada" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener detalle de OT:", error);
    res.status(500).json({ message: "Error al obtener detalle de OT" });
  }
});

// Cambiar estado de la OT y registrar en historial
app.put("/api/ot/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, trabajadorAsignado } = req.body;
    const estadoNormalizado = estado ? estado.toLowerCase() : null;

    const campos = [];
    const valores = [];

    if (estadoNormalizado) {
      const permitidos = ["pendiente", "en_progreso", "finalizada"];
      if (!permitidos.includes(estadoNormalizado)) return res.status(400).json({ message: "Estado no válido" });
      campos.push("estado = ?");
      valores.push(estadoNormalizado);
    }
    if (trabajadorAsignado !== undefined) {
      campos.push("trabajador_asignado = ?");
      valores.push(trabajadorAsignado);
    }
    if (campos.length === 0) return res.status(400).json({ message: "No hay datos para actualizar" });

    valores.push(id);
    const [result] = await pool.query(`UPDATE orden_trabajo SET ${campos.join(", ")} WHERE id = ?`, valores);
    
    if (result.affectedRows === 0) return res.status(404).json({ message: "OT no encontrada" });

    // Si se finalizó, guardar en historial
    if (estadoNormalizado === "finalizada") {
      const [rows] = await pool.query("SELECT * FROM orden_trabajo WHERE id = ?", [id]);
      if (rows.length > 0) {
        const ot = rows[0];
        const fechaMantenimiento = ot.fecha_programada || new Date();
        try {
          await pool.query(
            `INSERT INTO historial_mantenimiento (activo_id, ot_id, tipo, descripcion, fecha) VALUES (?, ?, ?, ?, ?)`,
            [ot.activo_id, ot.id, ot.tipo, ot.descripcion, fechaMantenimiento]
          );
        } catch (e) {
          console.error("Error guardando historial:", e);
        }
      }
    }
    res.json({ message: "OT actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar OT:", error);
    res.status(500).json({ message: "Error al actualizar OT" });
  }
});

// ----------------------------------------------------
// RUTAS DE HISTORIAL (CORREGIDAS)
// ----------------------------------------------------

// Historial por Activo Específico (ACTUALIZADO para aceptar anio/mes)
app.get("/api/activos/:id/historial", async (req, res) => {
  try {
    const { id } = req.params;
    // Ahora aceptamos anio y mes en lugar de desde/hasta
    const { anio, mes, tipo } = req.query;

    let sql = `SELECT * FROM historial_mantenimiento WHERE activo_id = ?`;
    const params = [id];

    if (anio) {
      sql += " AND YEAR(fecha) = ?";
      params.push(anio);
    }
    if (mes) {
      sql += " AND MONTH(fecha) = ?";
      params.push(mes);
    }
    if (tipo && tipo !== "todos") {
      sql += " AND tipo = ?";
      params.push(tipo);
    }

    sql += " ORDER BY fecha DESC, id DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ message: "Error al obtener historial" });
  }
});

// Historial GLOBAL (ACTUALIZADO para aceptar anio/mes y hacer JOIN)
app.get("/api/historial", async (req, res) => {
  try {
    const { anio, mes, tipo } = req.query;

    let sql = `
      SELECT h.id, h.activo_id, h.ot_id, h.tipo, h.descripcion, h.fecha, h.creado_en,
             a.modelo, a.marca, a.codigo 
      FROM historial_mantenimiento h
      JOIN activos a ON h.activo_id = a.id
    `;
    const condiciones = [];
    const params = [];

    if (anio) {
      condiciones.push("YEAR(h.fecha) = ?");
      params.push(anio);
    }
    if (mes) {
      condiciones.push("MONTH(h.fecha) = ?");
      params.push(mes);
    }
    if (tipo && tipo !== "todos") {
      condiciones.push("h.tipo = ?");
      params.push(tipo);
    }

    if (condiciones.length > 0) {
      sql += " WHERE " + condiciones.join(" AND ");
    }

    sql += " ORDER BY h.fecha DESC, h.id DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historial global:", error);
    res.status(500).json({ message: "Error al obtener historial global" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});