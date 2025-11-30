import * as OTService from "../services/RF03_OT.service.js";

export const crear = async (req, res) => {
  try {
    const id = await OTService.crear(req.body);
    res.status(201).json({ id, message: "OT creada correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al crear OT" });
  }
};

export const listar = async (req, res) => {
  try {
    const data = await OTService.listar(req.query.estado);
    res.json(data);
  } catch {
    res.status(500).json({ message: "Error al obtener OT" });
  }
};

export const obtener = async (req, res) => {
  try {
    const ot = await OTService.obtener(req.params.id);
    if (!ot) return res.status(404).json({ message: "OT no encontrada" });
    res.json(ot);
  } catch {
    res.status(500).json({ message: "Error al obtener OT" });
  }
};

export const actualizarEstado = async (req, res) => {
  try {
    const { estado, trabajadorAsignado } = req.body;

    const ok = await OTService.actualizarEstado(
      req.params.id,
      estado,
      trabajadorAsignado
    );

    if (!ok) return res.status(404).json({ message: "OT no encontrada" });

    if (estado?.toLowerCase() === "finalizada") {
      const ot = await OTService.obtener(req.params.id);
      await OTService.guardarHistorial(ot);
    }

    res.json({ message: "OT actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar OT" });
  }
};
