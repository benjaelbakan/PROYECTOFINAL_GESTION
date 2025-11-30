const API_URL = "http://localhost:5000";

export async function registrarTarea(data) {
  const res = await fetch(`${API_URL}/tareas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al registrar tarea");
  return res.json();
}

export async function listarTareas(filtros = {}) {
  const query = new URLSearchParams(filtros).toString();
  const res = await fetch(`${API_URL}/tareas?${query}`);
  if (!res.ok) throw new Error("Error al obtener tareas");
  return res.json();
}
