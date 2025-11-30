import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Activos from "./pages/RF01_Activos/RF01_Activos.jsx";
import CrearActivo from "./pages/RF01_Activos/RF01_CrearActivo.jsx";
import ActivoForm from "./components/RF01_ActivoForm.jsx";

// importa otras páginas según necesites

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/activos" element={<Activos />} />
        <Route path="/activos/nuevo" element={<CrearActivo />} />
        <Route path="/activos/editar/:id" element={<ActivoForm />} />
        {/* Rutas adicionales */}
        {/* <Route path="/tareas" element={<Tareas />} /> */}
        {/* <Route path="/usuarios" element={<Usuarios />} /> */}
      </Routes>
  );
}

export default App;
