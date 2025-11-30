import { useState } from "react";

export default function ActivoForm({ initialData = {}, onSubmit }) {
  const [activo, setActivo] = useState({
    codigo: initialData.codigo || "",
    tipo: initialData.tipo || "",
    marca: initialData.marca || "",
    modelo: initialData.modelo || "",
    ubicacion: initialData.ubicacion || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(activo);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Código</label>
        <input
          type="text"
          name="codigo"
          className="form-control"
          value={activo.codigo}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Tipo</label>
        <input
          type="text"
          name="tipo"
          className="form-control"
          value={activo.tipo}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Marca</label>
        <input
          type="text"
          name="marca"
          className="form-control"
          value={activo.marca}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Modelo</label>
        <input
          type="text"
          name="modelo"
          className="form-control"
          value={activo.modelo}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Ubicación</label>
        <input
          type="text"
          name="ubicacion"
          className="form-control"
          value={activo.ubicacion}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Guardar
      </button>
    </form>
  );
}
