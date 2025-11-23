import { pool } from "../config/db.js";

export const listarActivos = async () => {
  const [rows] = await pool.query("SELECT * FROM act_activos");
  return rows;
};

export const obtenerActivo = async (id) => {
  const [rows] = await pool.query("SELECT * FROM act_activos WHERE id = ?", [id]);
  return rows[0] ?? null;
};

export const crearActivoDB = async (data) => {
  const {
    codigo, tipo, marca, modelo, anio,
    kilometraje_actual, horas_uso_actual, ubicacion
  } = data;

  const [result] = await pool.query(
    `INSERT INTO act_activos 
    (codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion]
  );

  return result.insertId;
};

export const actualizarActivoDB = async (id, data) => {
  const {
    codigo, tipo, marca, modelo, anio,
    kilometraje_actual, horas_uso_actual, ubicacion
  } = data;

  const [result] = await pool.query(
    `UPDATE act_activos SET 
      codigo=?, tipo=?, marca=?, modelo=?, anio=?, 
      kilometraje_actual=?, horas_uso_actual=?, ubicacion=? 
    WHERE id=?`,
    [codigo, tipo, marca, modelo, anio, kilometraje_actual, horas_uso_actual, ubicacion, id]
  );

  return result.affectedRows > 0;
};

export const eliminarActivoDB = async (id) => {
  const [result] = await pool.query("DELETE FROM act_activos WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
