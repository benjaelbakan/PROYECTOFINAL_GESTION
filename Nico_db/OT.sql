CREATE DATABASE IF NOT EXISTS OT_Nico;
USE OT_Nico;

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

ALTER TABLE orden_trabajo
  ADD COLUMN costo DECIMAL(10,2) NULL AFTER fecha_cierre;

-- 2) Tabla de historial de mantenimiento (solo se INSERTA, no se actualiza)
CREATE TABLE IF NOT EXISTS historial_mantenimiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activo_id INT NOT NULL,
  ot_id INT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha DATE NOT NULL,
  costo DECIMAL(10,2) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hist_activo (activo_id),
  INDEX idx_hist_fecha (fecha),
  INDEX idx_hist_tipo (tipo),
  INDEX idx_hist_costo (costo)
);

CREATE TABLE IF NOT EXISTS activos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  tipo VARCHAR(50) NOT NULL,           -- Vehículo, Máquina, etc.
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  anio INT,
  kilometraje_actual INT,
  horas_uso_actual INT,
  ubicacion VARCHAR(200),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_activo_codigo (codigo),
  INDEX idx_activo_tipo (tipo),
  INDEX idx_activo_marca (marca)
);
