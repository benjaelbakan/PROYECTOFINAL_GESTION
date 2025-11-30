const API_URL = "http://localhost:3001/api"; // ajusta según tu backend

export async function listarActivos() {
  const res = await fetch(`${API_URL}/activos`);
  if (!res.ok) throw new Error("Error al listar activos");
  return res.json();
}

export async function eliminarActivo(id) {
  const res = await fetch(`${API_URL}/activos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar activo");
  return res.json();
}

export async function crearActivo(data) {
  const res = await fetch(`${API_URL}/activos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear activo");
  return res.json();
}
