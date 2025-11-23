import express from "express";
import cors from "cors";

// Importar rutas
import activosRoutes from "./routes/RF01_activos.routes.js";
import tareasRoutes from "./routes/RF04_tareas.routes.js";
import kpiRoutes from "./routes/RF07_kpi.routes.js";

const app = express();

// Configuración general
app.use(cors({ origin: "*" }));
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Mantenimiento Funcionando 🚀");
});

// Rutas principales
app.use("/api/activos", activosRoutes);
app.use("/api/RF04_tareas", tareasRoutes);
app.use("/api/RF07_kpi", kpiRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend corriendo en puerto ${PORT}`);
  console.log(`👉 API Activos:  http://localhost:${PORT}/api/activos`);
  console.log(`👉 API Tareas:   http://localhost:${PORT}/api/RF04_tareas`);
  console.log(`👉 API KPI:      http://localhost:${PORT}/api/RF07_kpi/indicadores`);
});
