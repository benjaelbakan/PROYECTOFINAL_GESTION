const API_URL = "http://localhost:3001/api";

// Crear tarea
export async function registrarTarea(data) {
  const res = await fetch(`${API_URL}/tareas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al registrar tarea");
  return res.json();
}

// Listar tareas
export async function listarTareas(filtros = {}) {
  const query = new URLSearchParams(filtros).toString();
  const res = await fetch(`${API_URL}/tareas?${query}`);
  if (!res.ok) throw new Error("Error al obtener tareas");
  return res.json();
}

// Obtener una tarea por ID
export async function obtenerTarea(id) {
  const res = await fetch(`${API_URL}/tareas/${id}`);
  if (!res.ok) throw new Error("Error al obtener tarea");
  return res.json();
}

// Actualizar tarea
export async function actualizarTarea(id, data) {
  const res = await fetch(`${API_URL}/tareas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar tarea");
  return res.json();
}

// Eliminar tarea
export async function eliminarTarea(id) {
  const res = await fetch(`${API_URL}/tareas/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar tarea");
  return res.json();
}
