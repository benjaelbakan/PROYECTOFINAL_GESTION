import { useNavigate } from "react-router-dom";
import OTForm from "../../components/RF03_OTForm.jsx"; // Asegúrate de que la ruta sea correcta

export default function CrearOT() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
            
          {/* Botón Volver */}
          <div className="mb-3">
            <button 
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 text-white-50 hover-white"
                onClick={() => navigate('/ordenes_trabajo')}
            >
                <i className="bi bi-arrow-left"></i>
                Volver a Órdenes
            </button>
          </div>

          {/* Tarjeta contenedora */}
          <div className="card bg-dark border border-secondary shadow-lg rounded-4">
            
            {/* Encabezado de la tarjeta */}
            <div className="card-header bg-transparent border-bottom border-secondary p-4">
                <h3 className="text-white mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-clipboard-check text-primary"></i>
                    Gestión de Orden de Trabajo
                </h3>
                <p className="text-secondary small mb-0 mt-1">
                    Complete los detalles para programar o actualizar un mantenimiento.
                </p>
            </div>

            {/* Cuerpo con el formulario */}
            <div className="card-body p-4">
              <OTForm />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}