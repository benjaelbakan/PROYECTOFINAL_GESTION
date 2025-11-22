const express = require("express");
const cors = require("cors");

// --- 1. IMPORTAMOS TUS RUTAS (LOS MÓDULOS) ---
// Aquí traemos los archivos que creaste en la carpeta 'routes'
const activosRoutes = require('./routes/RF01_activos.routes'); // Gestión de Activos (Lo viejo)
const tareasRoutes = require('./routes/RF04_tareas.routes');   // RF04: Gestión de Tareas (Lo nuevo)

const app = express();

// --- 2. CONFIGURACIONES GENERALES ---
app.use(cors({ origin: "*" })); // Permite que el frontend (React) se conecte sin problemas
app.use(express.json());        // Permite que el servidor entienda datos en formato JSON

// --- 3. RUTA DE PRUEBA (Para verificar que el servidor vive) ---
app.get("/", (req, res) => {
  res.send("API de Mantenimiento Funcionando 🚀");
});

// ==========================================
//   CONEXIÓN DE RUTAS (ENRUTADOR)
// ==========================================

// A. Rutas de Activos
// Cualquier petición a "/api/activos" será manejada por el archivo activos.routes.js
app.use('/api/activos', activosRoutes);

// B. Rutas de Tareas (RF04)
// Cualquier petición a "/api/tareas" será manejada por el archivo tareas.routes.js
app.use('/api/tareas', tareasRoutes);


// ==========================================
//   INICIO DEL SERVIDOR (SERVER START)
// ==========================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend corriendo en puerto ${PORT}`);
  console.log(`   👉 API Activos: http://localhost:${PORT}/api/activos`);
  console.log(`   👉 API Tareas:  http://localhost:${PORT}/api/tareas`);
});