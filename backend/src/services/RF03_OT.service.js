import * as OT from "../models/RF03_OT.models.js";

export const crear = async (data) => {
  const [result] = await OT.crearOT(data);
  return result.insertId;
};

export const listar = async (estado) => {
  let sql = "SELECT * FROM orden_trabajo";
  const params = [];

  if (estado) {
    sql += " WHERE estado=?";
    params.push(estado);
  }

  sql += " ORDER BY id DESC";

  const [rows] = await OT.listarOT(sql, params);
  return rows;
};

export const obtener = async (id) => {
  const [rows] = await OT.obtenerOT(id);
  return rows[0];
};

export const actualizarEstado = async (id, estado, trabajador) => {
  const campos = [];
  const params = [];

  if (estado) {
    const valid = ["pendiente", "en_progreso", "finalizada"];
    if (!valid.includes(estado.toLowerCase())) {
      throw new Error("Estado no válido");
    }

    campos.push("estado = ?");
    params.push(estado.toLowerCase());
  }

  if (trabajador !== undefined) {
    campos.push("trabajador_asignado = ?");
    params.push(trabajador);
  }

  params.push(id);

  const sql = `UPDATE orden_trabajo SET ${campos.join(", ")} WHERE id=?`;
  const [result] = await OT.actualizarEstado(sql, params);

  return result.affectedRows;
};

export const guardarHistorial = async (ot) => {
  const data = {
    activo_id: ot.activo_id,
    ot_id: ot.id,
    tipo: ot.tipo,
    descripcion: ot.descripcion,
    fecha: ot.fecha_programada || new Date()
  };

  await OT.insertarHistorial(data);
};
