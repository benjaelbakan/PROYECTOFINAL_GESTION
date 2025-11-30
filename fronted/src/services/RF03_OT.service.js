const API_URL = "http://localhost:3001/api";

export async function listarOTs() {
  const res = await fetch(`${API_URL}/ordenes/orden_trabajo`);
  if (!res.ok) throw new Error("Error al listar OTs");
  return res.json();
}

export async function eliminarOT(id) {
  const res = await fetch(`${API_URL}/ordenes/orden_trabajo/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar OT");
  return res.json();
}

export async function crearOT(data) {
  const res = await fetch(`${API_URL}/ordenes/orden_trabajo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear OT");
  return res.json();
}

export async function obtenerOT(id) {
  const res = await fetch(`${API_URL}/ordenes/orden_trabajo/${id}`);
  if (!res.ok) throw new Error("Error al obtener OT");
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data; // devuelve el objeto
}


export async function actualizarOT(id, data) {
  const res = await fetch(`${API_URL}/ordenes/orden_trabajo/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar OT");
  return res.json();
}
