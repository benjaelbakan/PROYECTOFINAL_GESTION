const API_URL = "http://localhost:5000";

export async function obtenerKPIs() {
  const res = await fetch(`${API_URL}/kpi`);
  if (!res.ok) throw new Error("Error al obtener KPIs");
  return res.json();
}
