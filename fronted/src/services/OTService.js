const API_URL = "http://localhost:5000";

export async function crearOT(data) {
  const res = await fetch(`${API_URL}/ot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear OT");
  return res.json();
}

export async function listarOT(estado) {
  const url = estado ? `${API_URL}/ot?estado=${estado}` : `${API_URL}/ot`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener OT");
  return res.json();
}

export async function obtenerOT(id) {
  const res = await fetch(`${API_URL}/ot/${id}`);
  if (!res.ok) throw new Error("OT no encontrada");
  return res.json();
}

export async function actualizarEstadoOT(id, estado, trabajadorAsignado) {
  const res = await fetch(`${API_URL}/ot/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado, trabajadorAsignado }),
  });
  if (!res.ok) throw new Error("Error al actualizar OT");
  return res.json();
}
