import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Activos from "./pages/RF01_Activos/RF01_Activos.jsx";
import CrearActivo from "./pages/RF01_Activos/RF01_CrearActivo.jsx";
import ActivoForm from "./components/RF01_ActivoForm.jsx";

import OTs from "./pages/RF03_OT/RF03_OTs.jsx";
import OTForm from "./components/RF03_OTForm.jsx";

import Tareas from "./pages/RF04_Tareas/RF04_ListaTareas.jsx";
import CrearTareas from "./pages/RF04_Tareas/RF04_RegistroTarea.jsx";
import EditarTarea from "./pages/RF04_Tareas/RegistroTarea.jsx";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/activos" element={<Activos />} />
        <Route path="/activos/nuevo" element={<CrearActivo />} />
        <Route path="/activos/editar/:id" element={<ActivoForm />} />

        <Route path="/ordenes_trabajo" element={<OTs />} />           {/* lista de OTs */}
        <Route path="/ordenes_trabajo/nuevo" element={<OTForm />} />  {/* crear OT */}
        <Route path="/ordenes_trabajo/editar/:id" element={<OTForm />} /> {/* editar OT */}
        
        <Route path="/tareas" element={<Tareas />} />
        <Route path="/tareas/nueva" element={<CrearTareas />} />
        <Route path="/tareas/editar/:id" element={<EditarTarea />} /> 
        {/* Rutas adicionales */}
        {/* <Route path="/tareas" element={<Tareas />} /> */}
        {/* <Route path="/usuarios" element={<Usuarios />} /> */}
      </Routes>
  );
}

export default App;
