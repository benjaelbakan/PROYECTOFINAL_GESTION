import express from "express";
import cors from "cors";

// =========================
// Importar rutas reales
// =========================

// RF01 - Activos
import activosRoutes from "./routes/RF01_activos.routes.js";

// RF03 - Órdenes de Trabajo (tu archivo real)
import ordenesRoutes from "./routes/RF03_OT.routes.js";

// RF04 - Tareas
import tareasRoutes from "./routes/RF04_tareas.routes.js";

// RF06 - Historial / Fallas (tu archivo real)
import historialRoutes from "./routes/RF06_historial.routes.js";

// RF07 - KPI
import kpiRoutes from "./routes/RF07_kpi.routes.js";

const app = express();

// Middlewares globales
app.use(cors({ origin: "*" }));
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Mantenimiento Funcionando 🚀");
});

// =========================
// Registrar rutas
// =========================
app.use("/api/activos", activosRoutes);         // RF01
app.use("/api/ordenes", ordenesRoutes);         // RF03
app.use("/api/tareas", tareasRoutes);           // RF04
app.use("/api/historial", historialRoutes);     // RF06
app.use("/api/kpi", kpiRoutes);                 // RF07

// =========================
// Iniciar servidor
// =========================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend corriendo en puerto ${PORT}`);
  console.log(`👉 RF01 Activos:     http://localhost:${PORT}/api/activos`);
  console.log(`👉 RF03 Órdenes:     http://localhost:${PORT}/api/ordenes`);
  console.log(`👉 RF04 Tareas:      http://localhost:${PORT}/api/tareas`);
  console.log(`👉 RF06 Historial:   http://localhost:${PORT}/api/historial`);
  console.log(`👉 RF07 KPI:         http://localhost:${PORT}/api/kpi/indicadores`);
});
