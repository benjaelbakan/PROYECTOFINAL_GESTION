import { useNavigate } from "react-router-dom";
import { crearActivo } from "../../services/RF01_activos.service.js";
import ActivoForm from "../../components/RF01_ActivoForm.jsx";


export default function CrearActivo() {
  const navigate = useNavigate();

  const handleCrear = async (data) => {
    try {
      await crearActivo(data);
      alert("Activo creado correctamente");
      navigate("/");
    } catch (err) {
      console.error("Error al crear activo:", err);
      alert("No se pudo crear el activo.");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-6">
        <div className="card bg-dark border-secondary shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Crear nuevo activo</h5>
            <ActivoForm onSubmit={handleCrear} />
          </div>
        </div>
      </div>
    </div>
  );
}
