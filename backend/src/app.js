const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de mantenimiento funcionando 😎");
  });

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
                                                                              ubicacion
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
                                                                                                                                                                                ubicacion
                                                                                                                                                                                      ]
                                                                                                                                                                                          );

                                                                                                                                                                                              res.status(201).json({ id: result.insertId, message: "Activo creado correctamente" });
                                                                                                                                                                                                } catch (err) {
                                                                                                                                                                                                    console.error("Error al crear activo:", err);
                                                                                                                                                                                                        res.status(500).json({ message: "Error al crear activo" });
                                                                                                                                                                                                          }
                                                                                                                                                                                                          });

                                                                                                                                                                                                          const PORT = process.env.PORT || 3001;
                                                                                                                                                                                                          app.listen(PORT, () => {
                                                                                                                                                                                                            console.log(`Backend corriendo en puerto ${PORT}`);
                                                                                                                                                                                                            });

                                                                                                                                                                                                          
// Obtener un activo por ID
app.get("/api/activos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM activos WHERE id = ?", [id]);

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

    const [result] = await pool.query("DELETE FROM activos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Activo no encontrado" });
    }

    res.json({ message: "Activo eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar activo:", err);
    res.status(500).json({ message: "Error al eliminar activo" });
  }
});

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

    // 👉 Ya NO insertamos en ot_historial aquí.
    // El historial de mantenimiento se registra cuando la OT pasa a 'finalizada'.

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

// Cambiar estado de la OT y, si queda 'finalizada', registrar en historial_mantenimiento
app.put("/api/ot/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, trabajadorAsignado } = req.body;

    const campos = [];
    const valores = [];

    // Validar estado si viene
    if (estado !== undefined) {
      const estadosPermitidos = ["pendiente", "en_progreso", "finalizada"];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({ message: "Estado no válido" });
      }
      campos.push("estado = ?");
      valores.push(estado);
    }

    // Actualizar trabajador si viene
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

    // 1) Actualizar la OT
    const [result] = await pool.query(
      `UPDATE orden_trabajo SET ${campos.join(", ")} WHERE id = ?`,
      valores
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "OT no encontrada" });
    }

    // 2) Si la OT queda FINALIZADA, registrar en historial_mantenimiento
    if (estado === "finalizada") {
      const [rows] = await pool.query(
        `SELECT id, activo_id, tipo, descripcion, 
                IFNULL(fecha_cierre, DATE(fecha_creacion)) AS fecha,
                costo
         FROM orden_trabajo
         WHERE id = ?`,
        [id]
      );

      if (rows.length > 0) {
        const ot = rows[0];

        await pool.query(
          `INSERT INTO historial_mantenimiento
             (activo_id, ot_id, tipo, descripcion, fecha, costo)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            ot.activo_id,
            ot.id,
            ot.tipo,
            ot.descripcion,
            ot.fecha,          // fecha de cierre o de creación
            ot.costo || null,  // si aún no tienes costo, puede ir null
          ]
        );
      }
    }

    return res.json({ message: "OT actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar OT:", error);
    res.status(500).json({ message: "Error al actualizar OT" });
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

// Historial por activo (con filtros opcionales)
// Historial por activo (con filtros opcionales)
app.get("/api/activos/:id/historial", async (req, res) => {
  try {
    const { id } = req.params;
    const { desde, hasta, tipo, costoMin, costoMax } = req.query;

    const condiciones = ["activo_id = ?"];
    const valores = [id];

    if (desde) {
      condiciones.push("fecha >= ?");
      valores.push(desde);
    }

    if (hasta) {
      condiciones.push("fecha <= ?");
      valores.push(hasta);
    }

    if (tipo && tipo !== "todos") {
      condiciones.push("tipo = ?");
      valores.push(tipo);
    }

    if (costoMin) {
      condiciones.push("costo >= ?");
      valores.push(costoMin);
    }

    if (costoMax) {
      condiciones.push("costo <= ?");
      valores.push(costoMax);
    }

    const where = "WHERE " + condiciones.join(" AND ");

    const [rows] = await pool.query(
      `SELECT id, activo_id, ot_id, tipo, descripcion, fecha, costo
       FROM historial_mantenimiento
       ${where}
       ORDER BY fecha DESC, id DESC`,
      valores
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ message: "Error al obtener historial" });
  }
});