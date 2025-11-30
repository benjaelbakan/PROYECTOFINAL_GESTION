import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarOTs, eliminarOT } from "../../services/RF03_OT.service.js";
import OTTable from "../../components/RF03_OTTable.jsx";

export default function OTs() {
  const [ots, setOTs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarOTs = async () => {
      try {
        const data = await listarOTs();
        setOTs(data);
      } catch (err) {
        console.error("Error al cargar OTs:", err);
      }
    };
    cargarOTs();
  }, []);

  const handleEliminar = async (id) => {
    if (!confirm("¿Desea eliminar esta OT?")) return;
    try {
      await eliminarOT(id);
      setOTs(ots.filter((ot) => ot.id !== id));
    } catch (err) {
      console.error("Error al eliminar OT:", err);
    }
  };

  const handleNuevaOT = () => {
    navigate("/ordenes_trabajo/nuevo");
  };

  return (
    <div className="container mt-4">
      <h3>Órdenes de Trabajo</h3>
      <button className="btn btn-success mb-3" onClick={handleNuevaOT}>
        Nueva Orden de Trabajo
      </button>
      <OTTable ots={ots} onEliminar={handleEliminar} />
    </div>
  );
}
