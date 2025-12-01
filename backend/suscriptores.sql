-- Crea la tabla `suscriptores` para permitir que usuarios se suscriban a alertas
-- Campos:
--  id: PK
--  email: correo del suscriptor
--  nombre: nombre opcional
--  activo_id: si se especifica, suscriptor sólo recibe alertas del activo indicado; NULL => recibe todas
--  created_at: timestamp de creación

CREATE TABLE IF NOT EXISTS suscriptores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) DEFAULT NULL,
  activo_id INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_suscriptor_email_activo (email, activo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
