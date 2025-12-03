-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: mantenimiento
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activos`
--

DROP TABLE IF EXISTS `activos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `marca` varchar(100) NOT NULL,
  `modelo` varchar(100) NOT NULL,
  `anio` int DEFAULT NULL,
  `kilometraje_actual` int DEFAULT NULL,
  `horas_uso_actual` int DEFAULT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_marca` (`marca`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activos`
--

LOCK TABLES `activos` WRITE;
/*!40000 ALTER TABLE `activos` DISABLE KEYS */;
INSERT INTO `activos` VALUES (1,'ACT-001','Vehiculo','Toyota','Hilux',2020,2000,1000,'Bodega Central','2025-11-30 17:23:58'),(2,'ACT-002','Maquinaria','Caterpillar','D6R',2018,2000,1200,'Obra Norte','2025-11-30 17:23:58'),(3,'ACT-003','Vehculo','Ford','Ranger',2019,38000,5,'Taller Sur','2025-11-30 17:23:58'),(4,'ACT-004','Equipo de Oficina','Dell','OptiPlex 7070',2021,NULL,NULL,'Oficina Admin','2025-11-30 17:23:58'),(7,'ACT-005','Maquinaria','Komatsu	','PC200',2017,2500,10,'Obra Este','2025-11-30 19:30:58');
/*!40000 ALTER TABLE `activos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_mantenimiento`
--

DROP TABLE IF EXISTS `historial_mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_mantenimiento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activo_id` int NOT NULL,
  `ot_id` int NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha` date NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `km_programado` int DEFAULT NULL,
  `horas_programado` int DEFAULT NULL,
  `estado` enum('pendiente','completado','retrasado') DEFAULT 'pendiente',
  PRIMARY KEY (`id`),
  KEY `idx_hist_activo` (`activo_id`),
  KEY `idx_hist_fecha` (`fecha`),
  KEY `idx_hist_tipo` (`tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_mantenimiento`
--

LOCK TABLES `historial_mantenimiento` WRITE;
/*!40000 ALTER TABLE `historial_mantenimiento` DISABLE KEYS */;
INSERT INTO `historial_mantenimiento` VALUES (1,1,1,'Preventivo','Aceite cambiado y revisin completa','2025-01-15','2025-11-30 17:24:22',NULL,NULL,'pendiente'),(2,2,2,'Correctivo','Motor hidrulico reparado','2025-03-20','2025-11-30 17:24:22',NULL,NULL,'pendiente'),(3,3,3,'Preventivo','Frenos ajustados, neumticos revisados','2025-04-10','2025-11-30 17:24:22',NULL,NULL,'pendiente'),(4,4,4,'Correctivo','Disco duro reemplazado','2025-05-05','2025-11-30 17:24:22',NULL,NULL,'pendiente');
/*!40000 ALTER TABLE `historial_mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orden_trabajo`
--

DROP TABLE IF EXISTS `orden_trabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orden_trabajo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activo_id` int NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_programada` date DEFAULT NULL,
  `trabajador_asignado` varchar(100) DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_activo` (`activo_id`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden_trabajo`
--

LOCK TABLES `orden_trabajo` WRITE;
/*!40000 ALTER TABLE `orden_trabajo` DISABLE KEYS */;
INSERT INTO `orden_trabajo` VALUES (1,1,'Preventivo','Prueba update','2025-12-10','Juan','pendiente','2025-11-30 17:24:11',NULL,120.00),(2,2,'Correctivo','Reparacin de motor hidrulico','2025-12-10','Carlos Gmez','pendiente','2025-11-30 17:24:11',NULL,950.00),(3,3,'Preventivo','Revisin frenos y neumticos','2025-12-08','Ana Torres','pendiente','2025-11-30 17:24:11',NULL,200.00),(6,1,'Maquinaria','Prueba update','2002-02-12','Juan','pendiente','2025-11-30 21:21:30',NULL,125.00);
/*!40000 ALTER TABLE `orden_trabajo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tar_tareas_realizadas`
--

DROP TABLE IF EXISTS `tar_tareas_realizadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tar_tareas_realizadas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orden_id` int NOT NULL,
  `descripcion` text,
  `insumos` text,
  `horas` decimal(5,2) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_tarea_orden` (`orden_id`),
  CONSTRAINT `fk_tarea_orden` FOREIGN KEY (`orden_id`) REFERENCES `orden_trabajo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tar_tareas_realizadas`
--

LOCK TABLES `tar_tareas_realizadas` WRITE;
/*!40000 ALTER TABLE `tar_tareas_realizadas` DISABLE KEYS */;
INSERT INTO `tar_tareas_realizadas` VALUES (12,1,'Revisin de frenos','Lquido DOT-4, Herramientas varias',1.80,38000.00,'2025-12-01 20:12:15'),(13,2,'Reemplazo de batera','Batera 75Ah',0.70,65000.00,'2025-12-01 20:12:15'),(14,2,'Diagnstico elctrico general','Scanner OBD2',1.10,22000.00,'2025-12-01 20:12:15'),(15,2,'Revisin sistema de carga','Multmetro, herramienta manual',0.90,18000.00,'2025-12-01 20:12:15'),(16,3,'Cambio de correa de distribucin','Correa, Tensor',3.50,120000.00,'2025-12-01 20:12:15'),(17,3,'Ajuste de vlvulas','Juego herramientas',2.00,55000.00,'2025-12-01 20:12:15'),(18,6,'Reemplazo de pastillas de freno','Pastillas delanteras',1.40,48000.00,'2025-12-01 20:12:15'),(19,6,'Alineacin y balanceo','Pesas de balanceo',0.80,25000.00,'2025-12-01 20:12:15');
/*!40000 ALTER TABLE `tar_tareas_realizadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usr_usuarios`
--

DROP TABLE IF EXISTS `usr_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usr_usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password` varchar(200) NOT NULL,
  `rol` varchar(50) DEFAULT 'usuario',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usr_usuarios`
--

LOCK TABLES `usr_usuarios` WRITE;
/*!40000 ALTER TABLE `usr_usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `usr_usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03  1:14:24
