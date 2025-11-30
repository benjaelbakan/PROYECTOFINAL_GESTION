CREATE DATABASE IF NOT EXISTS mantenimiento;
USE mantenimiento;

-- Ejemplo de tabla usuarios (modifica según tu schema)
CREATE TABLE IF NOT EXISTS usr_usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL,
  rol VARCHAR(50) DEFAULT 'usuario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Puedes agregar más tablas aquí
