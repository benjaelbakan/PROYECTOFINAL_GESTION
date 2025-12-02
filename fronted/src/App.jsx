import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";

// RF01 - Activos
import Activos from "./pages/RF01_Activos/RF01_Activos.jsx";
import CrearActivo from "./pages/RF01_Activos/RF01_CrearActivo.jsx";
import ActivoForm from "./components/RF01_ActivoForm.jsx";

// RF02 - Planes de Mantenimiento
import ListaPlanes from "./pages/RF02_Planes/RF02_ListaPlanes.jsx";
import CrearPlan from "./pages/RF02_Planes/RF02_CrearPlan.jsx";
import EditarPlan from "./pages/RF02_Planes/RF02_EditarPlan.jsx";

// RF03 - Órdenes de Trabajo
import OTs from "./pages/RF03_OT/RF03_OTs.jsx";
import OTForm from "./components/RF03_OTForm.jsx";

// RF04 - Tareas
import Tareas from "./pages/RF04_Tareas/RF04_ListaTareas.jsx";
import CrearTareas from "./pages/RF04_Tareas/RF04_RegistroTarea.jsx";
import EditarTarea from "./pages/RF04_Tareas/RF04_RegistroTarea.jsx";


function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />

        {/* RF01 - Activos */}
        <Route path="/activos" element={<Activos />} />
        <Route path="/activos/nuevo" element={<CrearActivo />} />
        <Route path="/activos/editar/:id" element={<ActivoForm />} />

        {/* RF02 - Planes de Mantenimiento */}
        <Route path="/planes" element={<ListaPlanes />} />               {/* lista de planes */}
        <Route path="/planes/nuevo" element={<CrearPlan />} />           {/* crear plan */}
        <Route path="/planes/editar/:id" element={<EditarPlan />} />     {/* editar plan */}

        {/* RF03 - Órdenes de Trabajo */}
        <Route path="/ordenes_trabajo" element={<OTs />} />
        <Route path="/ordenes_trabajo/nuevo" element={<OTForm />} />
        <Route path="/ordenes_trabajo/editar/:id" element={<OTForm />} />

        {/* RF04 - Tareas */}
        <Route path="/tareas" element={<Tareas />} />
        <Route path="/tareas/nueva" element={<CrearTareas />} />
        <Route path="/tareas/editar/:id" element={<EditarTarea />} />

      </Routes>
  );
}

export default App;
