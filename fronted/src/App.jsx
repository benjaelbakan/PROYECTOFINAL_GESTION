import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";

import Login from "./pages/Login.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

// RF01 - Activos
import Activos from "./pages/RF01_Activos/RF01_Activos.jsx";
import CrearActivo from "./pages/RF01_Activos/RF01_CrearActivo.jsx";
import ActivoForm from "./components/RF01_ActivoForm.jsx";

// RF02 - Planes
import ListaPlanes from "./pages/RF02_Planes/RF02_ListaPlanes.jsx";
import CrearPlan from "./pages/RF02_Planes/RF02_CrearPlan.jsx";
import EditarPlan from "./pages/RF02_Planes/RF02_EditarPlan.jsx";

// RF03 - OT
import OTs from "./pages/RF03_OT/RF03_OTs.jsx";
// import OTForm from "./components/RF03_OTForm.jsx"; // Ya no lo usamos directamente en rutas
import EscanerMovil from "./pages/RF03_OT/RF03_Escaneo.jsx";
import CrearOT from './pages/RF03_OT/RF03_CrearOT.jsx'; // Importamos la NUEVA página contenedora

// RF04 - Tareas
import Tareas from "./pages/RF04_Tareas/RF04_ListaTareas.jsx";
import CrearTareas from "./pages/RF04_Tareas/RF04_RegistroTarea.jsx";
import EditarTarea from "./pages/RF04_Tareas/RF04_RegistroTarea.jsx";

// Dashboard
import GerenteDashboard from "./pages/RF06_Dashboard/RF06_GerenteDashboard.jsx";


// ---------------------------------------------------------------
// 🔐 PROTECCIÓN DE RUTAS POR ROL
// ---------------------------------------------------------------
function RoleRoute({ children, allowed }) {
  const role = localStorage.getItem("rol");

  if (!role) return <Navigate to="/login" replace />;

  if (!allowed.includes(role)) return <Navigate to="/home" replace />;

  return children;
}


// ---------------------------------------------------------------
// APP PRINCIPAL
// ---------------------------------------------------------------
function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* REDIRECCIÓN AUTOMÁTICA A LOGIN */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* HOME (acceso sólo si está logueado) */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />

      {/* ---------------------- RF01 - ACTIVOS ---------------------- */}
      <Route
        path="/activos"
        element={
          <RoleRoute allowed={["admin", "gerente"]}>
            <Activos />
          </RoleRoute>
        }
      />

      <Route
        path="/activos/nuevo"
        element={
          <RoleRoute allowed={["admin", "gerente"]}>
            <CrearActivo />
          </RoleRoute>
        }
      />

      <Route
        path="/activos/editar/:id"
        element={
          <RoleRoute allowed={["admin", "gerente"]}>
            <ActivoForm />
          </RoleRoute>
        }
      />

      {/* ---------------------- RF02 - PLANES ---------------------- */}
      <Route
        path="/planes"
        element={
          <RoleRoute allowed={["admin", "gerente"]}>
            <ListaPlanes />
          </RoleRoute>
        }
      />

      <Route
        path="/planes/nuevo"
        element={
          <RoleRoute allowed={["admin", "gerente"]}>
            <CrearPlan />
          </RoleRoute>
        }
      />

      <Route
        path="/planes/editar/:id"
        element={
          <RoleRoute allowed={["admin", "gerente"]}>
            <EditarPlan />
          </RoleRoute>
        }
      />

      {/* ---------------------- RF03 - OT ---------------------- */}
      <Route
        path="/ordenes_trabajo"
        element={
          <RoleRoute allowed={["admin", "mecanico"]}>
            <OTs />
          </RoleRoute>
        }
      />

      {/* ✅ AQUÍ ESTABA EL ERROR: Cambiamos OTForm por CrearOT */}
      <Route
        path="/ordenes_trabajo/nuevo"
        element={
          <RoleRoute allowed={["admin", "mecanico"]}>
            <CrearOT /> 
          </RoleRoute>
        }
      />

      {/* ✅ AQUÍ TAMBIÉN: Usamos CrearOT para editar porque reutiliza el formulario */}
      <Route
        path="/ordenes_trabajo/editar/:id"
        element={
          <RoleRoute allowed={["admin", "mecanico"]}>
            <CrearOT />
          </RoleRoute>
        }
      />

      <Route
        path="/escaner"
        element={
          <RoleRoute allowed={["admin", "mecanico"]}>
            <EscanerMovil />
          </RoleRoute>
        }
      />

      {/* ---------------------- RF04 - TAREAS ---------------------- */}
      <Route
        path="/tareas"
        element={
          <RoleRoute allowed={["admin", "gerente"]}>
            <Tareas />
          </RoleRoute>
        }
      />

      <Route
        path="/tareas/nueva"
        element={
          <RoleRoute allowed={["admin", "gerente"]}>
            <CrearTareas />
          </RoleRoute>
        }
      />

      <Route
        path="/tareas/editar/:id"
        element={
          <RoleRoute allowed={["admin", "gerente"]}>
            <EditarTarea />
          </RoleRoute>
        }
      />

      {/* ---------------------- DASHBOARD GERENTE ---------------------- */}
      <Route
        path="/gerente-dashboard"
        element={
          <RoleRoute allowed={["admin", "gerente"]}>
            <GerenteDashboard />
          </RoleRoute>
        }
      />

      {/* RUTA NO ENCONTRADA (Debe ser siempre la última) */}
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
}

export default App;