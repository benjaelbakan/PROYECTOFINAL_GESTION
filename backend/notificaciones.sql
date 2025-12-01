-- Tabla para historial de notificaciones/alertas
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(32) NOT NULL DEFAULT 'alerta',
  destinatarios VARCHAR(255),
  asunto VARCHAR(255),
  cuerpo TEXT,
  alertas_json TEXT,
  enviado BOOL DEFAULT 0,
  error_envio TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
