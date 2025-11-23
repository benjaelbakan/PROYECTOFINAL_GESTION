const KPIModel = require('../models/RF07_kpi.models');

const KPIService = {
  async obtenerIndicadores() {
    const costos = await KPIModel.obtenerCostosPorActivo();
    const mtbf = await KPIModel.obtenerMTBF();

    // Combinar indicadores por activo si quieres un solo objeto
    const indicadores = costos.map(c => {
      const mtbf_activo = mtbf.find(m => m.activo === c.activo);
      return {
        ...c,
        mtbf_dias: mtbf_activo ? mtbf_activo.mtbf_dias : null,
        numero_fallas: mtbf_activo ? mtbf_activo.numero_fallas : 0
      };
    });

    return indicadores;
  }
};

module.exports = KPIService;
