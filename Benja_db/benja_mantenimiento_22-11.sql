-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: mantenimiento
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.24.04.1

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
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('VEHICULO','MAQUINARIA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `marca` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modelo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anio` smallint DEFAULT NULL,
  `kilometraje_actual` int DEFAULT NULL,
  `horas_uso_actual` int DEFAULT NULL,
  `ubicacion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('OPERATIVO','EN_MANTENCION','FUERA_DE_SERVICIO','BAJA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPERATIVO',
  `identificador_tag` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_activos_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activos`
--

LOCK TABLES `activos` WRITE;
/*!40000 ALTER TABLE `activos` DISABLE KEYS */;
INSERT INTO `activos` VALUES (1,'VEH-001','VEHICULO','Peru','Audi',2001,4,3,'coronel','OPERATIVO',NULL,'2025-11-22 21:49:57'),(3,'VEH-002','VEHICULO','Toyota','Hilux',2020,0,NULL,'Coronel','OPERATIVO',NULL,'2025-11-23 00:58:20'),(4,'MAQ-001','MAQUINARIA','Caterpillar','Excavadora',2018,0,NULL,'Coronel','OPERATIVO',NULL,'2025-11-23 00:58:20');
/*!40000 ALTER TABLE `activos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidencias`
--

DROP TABLE IF EXISTS `incidencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activo_id` int NOT NULL,
  `fecha_reporte` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `criticidad` enum('BAJA','MEDIA','ALTA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIA',
  `estado` enum('ABIERTA','EN_PROCESO','CERRADA','DESCARTADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ABIERTA',
  PRIMARY KEY (`id`),
  KEY `fk_incidencias_activo` (`activo_id`),
  CONSTRAINT `fk_incidencias_activo` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidencias`
--

LOCK TABLES `incidencias` WRITE;
/*!40000 ALTER TABLE `incidencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `incidencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lecturas_uso`
--

DROP TABLE IF EXISTS `lecturas_uso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lecturas_uso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activo_id` int NOT NULL,
  `fecha_lectura` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `kilometraje` int DEFAULT NULL,
  `horas_uso` int DEFAULT NULL,
  `origen` enum('MANUAL','OT','SISTEMA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MANUAL',
  PRIMARY KEY (`id`),
  KEY `idx_lecturas_activo_fecha` (`activo_id`,`fecha_lectura`),
  CONSTRAINT `fk_lecturas_activo` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lecturas_uso`
--

LOCK TABLES `lecturas_uso` WRITE;
/*!40000 ALTER TABLE `lecturas_uso` DISABLE KEYS */;
/*!40000 ALTER TABLE `lecturas_uso` ENABLE KEYS */;
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
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_programada` date DEFAULT NULL,
  `trabajador_asignado` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ot_activo` (`activo_id`),
  KEY `idx_ot_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden_trabajo`
--

LOCK TABLES `orden_trabajo` WRITE;
/*!40000 ALTER TABLE `orden_trabajo` DISABLE KEYS */;
INSERT INTO `orden_trabajo` VALUES (1,1,'preventiva','Cambio de aceite motor','2025-12-01','Juan Pérez','pendiente','2025-11-23 00:37:27',NULL),(2,2,'correctiva','Reparación de frenos traseros','2025-11-30','María López','en_progreso','2025-11-23 00:37:27',NULL),(3,3,'preventiva','Revisión general','2025-11-28','Carlos Soto','finalizada','2025-11-23 00:37:27',NULL);
/*!40000 ALTER TABLE `orden_trabajo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes_trabajo`
--

DROP TABLE IF EXISTS `ordenes_trabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes_trabajo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_ot` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo_id` int NOT NULL,
  `plan_id` int DEFAULT NULL,
  `incidencia_id` int DEFAULT NULL,
  `tipo` enum('PREVENTIVO','CORRECTIVO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `origen` enum('PLAN','INCIDENCIA','MANUAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MANUAL',
  `prioridad` enum('BAJA','MEDIA','ALTA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIA',
  `estado` enum('PENDIENTE','EN_PROCESO','FINALIZADA','CANCELADA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_programada` datetime DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `usuario_creador_id` int NOT NULL,
  `usuario_responsable_id` int DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `costo_total` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ot_plan` (`plan_id`),
  KEY `fk_ot_incidencia` (`incidencia_id`),
  KEY `fk_ot_usuario_creador` (`usuario_creador_id`),
  KEY `fk_ot_usuario_responsable` (`usuario_responsable_id`),
  KEY `idx_ot_activo` (`activo_id`),
  KEY `idx_ot_estado` (`estado`),
  KEY `idx_ot_fechas` (`fecha_creacion`,`fecha_programada`),
  CONSTRAINT `fk_ot_activo` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ot_incidencia` FOREIGN KEY (`incidencia_id`) REFERENCES `incidencias` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ot_plan` FOREIGN KEY (`plan_id`) REFERENCES `planes_mantenimiento` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ot_usuario_creador` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ot_usuario_responsable` FOREIGN KEY (`usuario_responsable_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes_trabajo`
--

LOCK TABLES `ordenes_trabajo` WRITE;
/*!40000 ALTER TABLE `ordenes_trabajo` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordenes_trabajo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planes_mantenimiento`
--

DROP TABLE IF EXISTS `planes_mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planes_mantenimiento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activo_id` int NOT NULL,
  `basado_en` enum('TIEMPO','KILOMETRAJE','HORAS','MIXTO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TIEMPO',
  `frecuencia_dias` int DEFAULT NULL,
  `frecuencia_km` int DEFAULT NULL,
  `frecuencia_horas` int DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_planes_activo` (`activo_id`),
  CONSTRAINT `fk_planes_activo` FOREIGN KEY (`activo_id`) REFERENCES `activos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planes_mantenimiento`
--

LOCK TABLES `planes_mantenimiento` WRITE;
/*!40000 ALTER TABLE `planes_mantenimiento` DISABLE KEYS */;
INSERT INTO `planes_mantenimiento` VALUES (1,1,'TIEMPO',30,NULL,NULL,'Inspección general cada 30 días',1,'2025-11-23 00:51:38'),(2,1,'KILOMETRAJE',NULL,10000,NULL,'Cambio de aceite cada 10.000 km',1,'2025-11-23 00:51:38'),(6,3,'MIXTO',30,5000,NULL,'Inspección cada 30 días o 5.000 km, lo que ocurra primero',1,'2025-11-23 00:59:35'),(7,4,'HORAS',NULL,NULL,200,'Mantención de maquinaria cada 200 horas',1,'2025-11-23 01:02:45');
/*!40000 ALTER TABLE `planes_mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tareas_ot`
--

DROP TABLE IF EXISTS `tareas_ot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareas_ot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orden_trabajo_id` int NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `horas_trabajo` decimal(5,2) DEFAULT NULL,
  `insumos_usados` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `costo_insumos` decimal(12,2) DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_tareas_ot_orden` (`orden_trabajo_id`),
  CONSTRAINT `fk_tareas_ot` FOREIGN KEY (`orden_trabajo_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tareas_ot`
--

LOCK TABLES `tareas_ot` WRITE;
/*!40000 ALTER TABLE `tareas_ot` DISABLE KEYS */;
/*!40000 ALTER TABLE `tareas_ot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('ADMIN','GERENTE','MECANICO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MECANICO',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-23  2:00:41
