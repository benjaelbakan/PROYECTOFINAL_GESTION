import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerActivo, actualizarActivo } from "../../services/RF01_activos.service.js";
import ActivoForm from "../../components/RF01_ActivoForm.jsx";

export default function EditarActivo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activo, setActivo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivo = async () => {
      try {
        const data = await obtenerActivo(id);
        setActivo(data);
      } catch (err) {
        console.error("Error al obtener activo:", err);
        alert("No se pudo cargar el activo.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivo();
  }, [id]);

  const handleActualizar = async (data) => {
    try {
      await actualizarActivo(id, data);
      alert("Activo actualizado correctamente");
      navigate("/");
    } catch (err) {
      console.error("Error al actualizar activo:", err);
      alert("No se pudo actualizar el activo.");
    }
  };

  if (loading) return <p className="text-muted">Cargando activo...</p>;
  if (!activo) return <p className="text-danger">Activo no encontrado</p>;

  return (
    <div className="row justify-content-center">
      <div className="col-6">
        <div className="card bg-dark border-secondary shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Editar activo</h5>
            <ActivoForm initialData={activo} onSubmit={handleActualizar} />
          </div>
        </div>
      </div>
    </div>
  );
}
