import { Routes, Route } from "react-router-dom";
import Activos from "./pages/Activos";
import CrearActivo from "./pages/CrearActivo";
import EditarActivo from "./pages/EditarActivo";
import logoVictor from "./assets/victor-morales-logo.png";
import GenerarOT from "./pages/GenerarOT";
import OrdenesTrabajo from "./pages/OrdenesTrabajo.jsx";
import DetalleOT from "./pages/DetalleOT.jsx";
import Planificacion from "./pages/Planificacion";
import HistorialAlertas from "./pages/HistorialAlertas";
import SuscribirAlertas from "./pages/SuscribirAlertas";
import GerenteDashboard from "./pages/GerenteDashboard";
import DashboardLayout from "./components/DashboardLayout";
import LoginGerente from './pages/LoginGerente';

function App() {
  return (
    <Routes>
      <Route path="/login-gerente" element={<LoginGerente />} />

      {/* Rutas que usan el layout principal (sidebar + topbar) */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Activos />} />
        <Route path="/activos/nuevo" element={<CrearActivo />} />
        <Route path="/activos/:id/editar" element={<EditarActivo />} />
        <Route path="/planificacion" element={<Planificacion />} />
        <Route path="/ot/nueva" element={<GenerarOT />} />
        <Route path="/ot" element={<OrdenesTrabajo />} />
        <Route path="/ot/:id" element={<DetalleOT />} />
        <Route path="/historial-alertas" element={<HistorialAlertas />} />
        <Route path="/suscribir-alertas" element={<SuscribirAlertas />} />
        <Route path="/gerente" element={<GerenteDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
