/*CREATE DATABASE IF NOT EXISTS OT_Nico;*/
/*USE OT_Nico;*/ 

CREATE TABLE IF NOT EXISTS orden_trabajo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  activo_id INT NOT NULL,
  tipo VARCHAR(20) NOT NULL,             -- 'preventiva' o 'correctiva'
  descripcion TEXT NOT NULL,
  fecha_programada DATE NULL,

  trabajador_asignado VARCHAR(100) NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',  -- pendiente / en_progreso / finalizada

  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre TIMESTAMP NULL,

  INDEX idx_ot_activo (activo_id),
  INDEX idx_ot_estado (estado)
);

INSERT INTO orden_trabajo (activo_id, tipo, descripcion, fecha_programada, trabajador_asignado, estado) VALUES
(1, 'preventiva', 'Cambio de aceite motor', '2025-12-01', 'Juan Pérez', 'pendiente'),
(2, 'correctiva', 'Reparación de frenos traseros', '2025-11-30', 'María López', 'en_progreso'),
(3, 'preventiva', 'Revisión general', '2025-11-28', 'Carlos Soto', 'finalizada');
