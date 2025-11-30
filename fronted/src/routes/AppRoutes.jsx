import { Routes, Route } from "react-router-dom";

// RF01 - Activos
import Activos from "../pages/RF01_Activos/RF01_Activos";
import CrearActivo from "../pages/RF01_Activos/RF01_CrearActivo";
import EditarActivo from "../pages/RF01_Activos/RF01_EditarActivo";

// RF03 - OT
import GenerarOT from "../pages/RF03_OT/GenerarOT";

// RF04 - Tareas
import RegistroTarea from "../pages/RF04_Tareas/RegistroTarea";
import ListaTareas from "../pages/RF04_Tareas/ListaTareas";

// RF07 - KPI
import RF07_KPI from "../pages/RF07_KPI/RF07_KPI";

export default function AppRoutes() {
  return (
    <Routes>
      {/* RF01 Activos */}
      <Route path="/" element={<Activos />} />
      <Route path="/activos/nuevo" element={<CrearActivo />} />
      <Route path="/activos/:id/editar" element={<EditarActivo />} />

      {/* RF03 OT */}
      <Route path="/ot/nueva" element={<GenerarOT />} />

      {/* RF04 Tareas */}
      <Route path="/tareas/registro" element={<RegistroTarea />} />
      <Route path="/tareas/lista" element={<ListaTareas />} />

      {/* RF07 KPI */}
      <Route path="/kpi" element={<RF07_KPI />} />
    </Routes>
  );
}
