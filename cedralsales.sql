-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: cedralsales
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin','$2y$10$4a9z7Xz6Y9Z6g9Z6Y9Z6YeZ6Y9Z6Y9Z6Y9Z6Y9Z6Y9Z6Y9Z6Y9Z6','2025-05-26 17:40:09'),(2,'isaicass','$2y$10$MXsYmPuDqjJvbjEOqD51fecIeqNq3OH0JUM6eTy1hn.nc2xL0jFPi','2025-05-26 18:48:14');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,'Victor Isai Caceres Ramirez','isaicaceresramirez@gmail.com','9997632818','me interesa','2025-05-27 02:40:02'),(2,'Victor Isai Caceres Ramirez','rustika@gmail.com',NULL,'Me interesa una casa','2025-05-28 17:16:16'),(3,'Victor Isai Caceres Ramirez','rustika@gmail.com','999 763 2818','hola','2025-05-28 17:22:26');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `experiences`
--

DROP TABLE IF EXISTS `experiences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `experiences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `location_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `experiences_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `experiences`
--

LOCK TABLES `experiences` WRITE;
/*!40000 ALTER TABLE `experiences` DISABLE KEYS */;
INSERT INTO `experiences` VALUES (12,19,'Tour a Isla Mujeres en Catamarán','Navega por las aguas turquesas del Caribe a bordo de un catamarán hasta Isla Mujeres. Incluye esnórquel, barra libre y tiempo libre en la isla.','assets/images/experiences/1750993861_exp.jpg','2025-06-27 03:11:01'),(13,19,'Esnórquel en el Museo Subacuático (MUSA)','Explora esculturas sumergidas mientras nadas entre peces tropicales en una experiencia única de arte bajo el mar.','assets/images/experiences/1750993938_exp1.jpg','2025-06-27 03:12:18'),(14,19,'Nado con Delfines','Vive la experiencia de interactuar y nadar con delfines en instalaciones seguras dentro de Cancún. Ideal para familias.','assets/images/experiences/1750993990_exp2.jpg','2025-06-27 03:13:10'),(15,19,'Visita a Zona Arqueológica El Rey','Descubre ruinas mayas dentro de la ciudad hotelera. Un paseo corto lleno de historia y vegetación.','assets/images/experiences/1750994031_exp3.jpg','2025-06-27 03:13:51'),(16,19,'Tarde en Playa Delfines (Mirador)','Relájate en una de las playas públicas más famosas de Cancún. Ideal para fotos con el icónico letrero de la ciudad.','assets/images/experiences/1750994093_exp4.jpg','2025-06-27 03:14:53'),(17,20,'Zona Arqueológica de Tulum frente al mar','Recorre las ruinas mayas más emblemáticas frente al Mar Caribe. Un lugar lleno de historia y vistas impresionantes.','assets/images/experiences/1750994263_exp5.jpg','2025-06-27 03:17:43'),(18,20,'Baño en el Cenote Dos Ojos','Nada o bucea en uno de los cenotes más famosos de la Riviera Maya, con aguas cristalinas y cavernas subterráneas.','assets/images/experiences/1750994335_exp6.jpg','2025-06-27 03:18:55'),(19,20,'Tour en bicicleta por el centro y la selva','Descubre Tulum de forma ecológica pedaleando entre el pueblo, ruinas y caminos naturales rodeados de selva.','assets/images/experiences/1750994409_exp7.jpg','2025-06-27 03:20:09'),(20,20,'Día de relajación en un beach club de Tulum','Disfruta de camas balinesas, cocteles y mar cristalino en alguno de los exclusivos clubs de playa frente al mar.','assets/images/experiences/1750994452_exp8.avif','2025-06-27 03:20:52'),(21,20,'Puesta de sol desde la Laguna Kaan Luum','Un paraíso escondido con una laguna de colores intensos, ideal para nadar y relajarse viendo el atardecer.','assets/images/experiences/1750994813_exp9.webp','2025-06-27 03:26:53'),(22,27,'Puesta de sol desde la Laguna Kaan Luum','fasfsdhfsdhfdjhdfjfgjkgfjfj','assets/images/experiences/1751062555_holbox-experience1.jpg','2025-06-27 22:15:55');
/*!40000 ALTER TABLE `experiences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hero_images`
--

DROP TABLE IF EXISTS `hero_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hero_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_path` varchar(255) NOT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_images`
--

LOCK TABLES `hero_images` WRITE;
/*!40000 ALTER TABLE `hero_images` DISABLE KEYS */;
INSERT INTO `hero_images` VALUES (1,'assets/images/hero/placeholder.jpg',1,'2025-07-12 19:30:18'),(2,'assets/images/hero/placeholder2.jpg',2,'2025-07-12 19:30:18'),(3,'assets/images/hero/placeholder3.jpg',3,'2025-07-12 19:30:18'),(4,'assets/images/hero/placeholder4.jpg',4,'2025-07-12 19:30:18'),(5,'assets/images/hero/placeholder5.jpg',5,'2025-07-12 19:30:18');
/*!40000 ALTER TABLE `hero_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `municipality` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (19,'CANCUN','Benito Juárez','2025-06-27 03:05:52'),(20,'TULUM','Tulum','2025-06-27 03:16:10'),(21,'ISLA MUJERES','Isla Mujeres','2025-06-27 03:27:42'),(22,'COZUMEL','Cozumel','2025-06-27 03:27:51'),(23,'PLAYA DEL CARMEN','Playa del Carmen','2025-06-27 03:28:21'),(24,'HOLBOX','Lázaro Cárdenas','2025-06-27 03:28:41'),(26,'COBA','Tulum','2025-06-27 03:30:37'),(27,'CEDRAL','Lázaro Cárdenas','2025-06-27 03:30:44');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `images` json DEFAULT NULL,
  `information` text NOT NULL,
  `sources` text,
  `is_main` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `display_order` int DEFAULT '999',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (5,'Trayectoria del huracán Erick: dónde está y hacia dónde se dirige','2025-06-17','[\"https://media.cnn.com/api/v1/images/stellar/prod/imgtray1750251526.jpg?q=w_1160,c_fill/f_webp\"]','Dónde está y hacia dónde se dirige\r\nEste miércoles de mañana, según el NHC, Erick se encontraba a 255 km de Puerto Ángel y 440 km de Punta Maldonado, y avanzaba en dirección noroeste a 120 km/h.\r\n\r\nHay una zona de prevención por efectos de huracán desde Acapulco hasta Puerto Ángel y una zona de vigilancia por efectos de huracán desde el oeste de Acapulco hasta Técpan de Galeana, en Guerrero, y desde el este de Puerto Ángel hasta Bahías de Huatulco, en Oaxaca. También hay una zona de prevención por efectos de tormenta tropical desde el este de Puerto Ángel hasta Salina Cruz, en Oaxaca.','https://cnnespanol.cnn.com/2025/06/17/mexico/tormenta-tropical-erick-trayectoria-donde-esta-dirige-orix',0,'2025-06-18 17:12:40',4),(7,'Murió Isabel Turrent','2025-06-17','[\"https://iphonegr.reforma.com/libre/online07/imagetransformer2/ImageTransformer.aspx?img=https://img.gruporeforma.com/imagenes/960x640/6/973/5972081.jpg&imagencompleta=1\"]','Isabel Turrent fue editorialista del periódico Reforma. Colaboró regularmente con el diario, escribiendo sobre temas de política internacional, cultura y análisis global. Crédito: Grupo REFORMA\r\n','https://www.reforma.com/murio-isabel-turrent/ar3024297',1,'2025-06-18 17:15:21',3),(8,'Ya se acabó la paciencia, dice Trump sobre Irán','2025-06-17','[\"https://iphonegr.reforma.com/libre/online07/imagetransformer2/ImageTransformer.aspx?img=https://img.gruporeforma.com/imagenes/960x640/6/973/5972091.jpg&imagencompleta=1\"]','El Presidente Trump contestó preguntas en la instalación de astas banderas en la Casa Blanca. Crédito: AP\r\n\r\nEl Presidente de Estados Unidos, Donald Trump, dijo que su paciencia se acabó en el tema de Irán y cuestionado sobre la declaración del Líder Supremo iraní de que no se rendirán le deseó \"buena suerte\".','https://www.reforma.com/ya-se-acabo-la-paciencia-dice-trump-sobre-iran/ar3024323?grrecs=1&widget=articulo-trending-reforma&reftype=art%C3%ADculo&ckrecommendationid=RID-97-48e7-a712-656db7c7d9d4-CID-35d8cf',0,'2025-06-18 17:15:58',1),(9,'Sheinbaum afirma que ONU debe llamar a la construcción de la paz; \"la guerra es el mayor fracaso de la humanidad\"','2025-06-20','[\"https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1H7hjP.img?w=768&h=473&m=6&x=455&y=141&s=213&d=213\", \"https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1HcEps.img?w=768&h=576&m=6&x=78&y=232&s=326&d=326\", \"https://s.france24.com/media/display/51d9cb62-98c2-11ef-affe-005056a90284/w:1280/p:16x9/2024-10-28T154725Z_2038132720_RC26CAAWKYZK_RTRMADP_3_MEXICO-BOLIVIA.JPG\"]','Claudia Sheinbaum en su conferencia matutina del 20 de junio de 2025. Foto: Carlos Mejía / EL UNIVERSAL Tras el ataque de Estados Unidos a instalaciones nucleares de Irán, la presidenta Claudia Sheinbaum Pardo indicó que, la Organización de Naciones Unidas (ONU) deber ser hoy la institución que llame a la construcción de la paz.\r\n\r\nEn redes sociales, la Mandataria federal se pronunció ante el ataque que ordenó el presidente estadounidense Donald Trump a Irán, este sábado, ello recordando una frase del Papa Francisco: “La guerra es el mayor fracaso de la humanidad. No hay futuro en la destrucción, sino en la fraternidad. La paz no es solo ausencia de guerra, es la construcción de la justicia”.','https://www.msn.com/es-mx/noticias/mundo/sheinbaum-afirma-que-onu-debe-llamar-a-la-construcci%C3%B3n-de-la-paz-la-guerra-es-el-mayor-fracaso-de-la-humanidad/ar-AA1HcxHl?ocid=BingNewsSerp',0,'2025-06-22 19:19:19',2),(10,'Yuridia anuncia el nacimiento de su tercer hijo, el segundo con Matías Aranda','2025-06-29','[\"https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1HEvDS.img?w=768&h=576&m=6&x=273&y=168&s=408&d=226\"]','Yuridia y su esposo Matías Aranda compartieron con sus seguidores una noticia muy especial: se convirtieron en padres nuevamente. Con tiernas imágenes publicadas en sus redes sociales, la pareja celebró la llegada de Noah Valentín, su segundo hijo, el tercero para la famosa.\r\n\r\nFue Matías Aranda quien primero anunció la noticia por medio de una historia en Instagram.\r\n\r\n“Nació Noah Valentín. Mucho amor por aquí”.\r\n\r\nTe recomendamos: ¡Querida socia! Yuridia sorprende al pedirle a su esposo que bese a una fan en concierto\r\n\r\nPoco después, ambos publicaron algunas fotografías, entre ellas una en la que se ve un pizarrón con el mensaje: “Bienvenido hermano, Noah. Te quiero”.','https://www.msn.com/es-mx/entretenimiento/tv/yuridia-anuncia-el-nacimiento-de-su-tercer-hijo-el-segundo-con-mat%C3%ADas-aranda/ar-AA1HEt5t?ocid=BingNewsSerp',0,'2025-06-30 01:49:49',5);
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `category` enum('terrenos','casas','departamentos','desarrollos') NOT NULL,
  `listing_type` enum('venta','renta') NOT NULL DEFAULT 'venta',
  `main_image` varchar(255) DEFAULT NULL,
  `thumbnail1` varchar(255) DEFAULT NULL,
  `thumbnail2` varchar(255) DEFAULT NULL,
  `thumbnail3` varchar(255) DEFAULT NULL,
  `thumbnail4` varchar(255) DEFAULT NULL,
  `thumbnail5` varchar(255) DEFAULT NULL,
  `thumbnail6` varchar(255) DEFAULT NULL,
  `thumbnail7` varchar(255) DEFAULT NULL,
  `thumbnail8` varchar(255) DEFAULT NULL,
  `thumbnail9` varchar(255) DEFAULT NULL,
  `thumbnail10` varchar(255) DEFAULT NULL,
  `thumbnail11` varchar(255) DEFAULT NULL,
  `thumbnail12` varchar(255) DEFAULT NULL,
  `thumbnail13` varchar(255) DEFAULT NULL,
  `thumbnail14` varchar(255) DEFAULT NULL,
  `thumbnail15` varchar(255) DEFAULT NULL,
  `location` enum('Cozumel','Felipe Carrillo Puerto','Isla Mujeres','Othón P. Blanco','Benito Juárez','José María Morelos','Lázaro Cárdenas','Playa del Carmen','Tulum','Bacalar','Puerto Morelos') NOT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `features` json DEFAULT NULL,
  `status` enum('disponible','vendido') DEFAULT 'disponible',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (7,'casa Moderna cancun','Casa En Cancun moderna xD',20000.02,'casas','venta','../assets/images/casademo.avif','../assets/images/Casa En Puerto Cancun En Venta 8.jpeg','../assets/images/diseno.de.casas.22.jpg','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Benito Juárez',21.164680,-86.820830,'{\"banos\": \"3\", \"alberca\": \"Sí\", \"niveles\": \"2\", \"terraza\": \"Sí\", \"amueblada\": \"Sí\", \"recamaras\": \"5\", \"estacionamientos\": \"2\", \"superficie_total\": \"50m\", \"superficie_construida\": \"50m\"}','disponible','2025-05-27 02:15:45'),(8,'casa en holbox','ccasa ',2000000.00,'casas','venta','../assets/images/imagen1.jpeg','../assets/images/imagn2.jpg','../assets/images/imagen3.jpg','../assets/images/imagen4.jpg',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Lázaro Cárdenas',21.525730,-87.378350,'{\"descripcion\": \"{&#34;recamaras&#34;:&#34;1&#34;,&#34;banos&#34;:&#34;1&#34;,&#34;estacionamientos&#34;:&#34;5&#34;,&#34;superficie_total&#34;:&#34;3&#34;}\"}','disponible','2025-05-28 22:40:02'),(9,'casa en sdsd','increible mansion',300000.00,'casas','venta','../assets/images/casademo.avif','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Benito Juárez',NULL,NULL,'{\"banos\": \"1\", \"alberca\": \"Sí\", \"niveles\": \"2\", \"terraza\": \"Sí\", \"amueblada\": \"Sí\", \"recamaras\": \"1\", \"estacionamientos\": \"1\", \"superficie_total\": \"123\", \"superficie_construida\": \"2\"}','disponible','2025-06-01 01:58:37'),(10,'Terreno cedral','Increible terrenno en el magnifico pueblo del cedral camino a HOLBOX',250000.00,'terrenos','venta','../assets/images/terreno ejemplo.jpg','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Lázaro Cárdenas',20.950810,-87.550860,'{\"fondo\": \"100\", \"frente\": \"50\", \"servicios\": {\"luz\": \"Sí\", \"agua\": \"Sí\", \"drenaje\": \"No\"}, \"tipo_suelo\": \"plano\", \"tipo_propiedad\": \"ejidal\", \"superficie_total\": \"2Hectareas\"}','disponible','2025-06-03 19:16:27'),(11,'casa Moderna cancun 85','d',50000.00,'casas','venta','assets/images/property_11/Casa En Puerto Cancun En Venta 8.jpeg','assets/images/property_11/casademo.avif','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Benito Juárez',NULL,NULL,'{\"banos\": \"2\", \"alberca\": \"Sí\", \"niveles\": \"2\", \"terraza\": \"Sí\", \"amueblada\": \"No\", \"recamaras\": \"2\", \"estacionamientos\": \"3\", \"superficie_total\": \"50m\", \"superficie_construida\": \"50m\"}','disponible','2025-06-04 19:27:22'),(12,'Desarrollo en HOLBOX','Increíble desarrollo para rentas Airbnb',5000000.00,'desarrollos','venta','assets/images/property_12/imagen4.jpg','assets/images/property_12/Casa En Puerto Cancun En Venta 8.jpeg','assets/images/property_12/imagn2.jpg','assets/images/property_12/casademo.avif','assets/images/property_12/imagn2.jpg','assets/images/property_12/imagen3.jpg','assets/images/property_12/diseno.de.casas.22.jpg','assets/images/property_12/imagen3.jpg','assets/images/property_12/Casa En Puerto Cancun En Venta 8.jpeg','','','','','','','','Lázaro Cárdenas',21.510170,-87.395350,'{\"etapas\": \"en_construccion\", \"amenidades\": {\"alberca\": \"Sí\", \"gimnasio\": \"Sí\", \"areas_verdes\": \"Sí\"}, \"rango_banos\": \"2\", \"num_unidades\": \"6\", \"pet_friendly\": \"Sí\", \"superficie_max\": \"50m\", \"superficie_min\": \"50m\", \"rango_recamaras\": \"4\", \"entrega_estimada\": \"Mayo 2026\"}','disponible','2025-06-05 19:12:49'),(13,'casa Moderna playa 329','depa cool ',200000.00,'departamentos','venta','assets/images/property_13/Casa En Puerto Cancun En Venta 8.jpeg','assets/images/property_13/imagn2.jpg','assets/images/property_13/imagen3.jpg','','','','','','','','','','','','','','Playa del Carmen',NULL,NULL,'{\"piso\": \"4\", \"banos\": \"1\", \"terraza\": \"Sí\", \"elevador\": \"No\", \"recamaras\": \"1\", \"amenidades\": {\"alberca\": \"Sí\", \"gimnasio\": \"Sí\", \"salon_eventos\": \"No\"}, \"estacionamientos\": \"1\", \"superficie_total\": \"25\"}','disponible','2025-06-07 19:18:35'),(14,'Casa Moderna 85 tulum','casa en el centro de tulum',28000000.00,'casas','venta','assets/images/property_14/Casa En Puerto Cancun En Venta 8.jpeg','assets/images/property_14/imagen4.jpg','assets/images/property_14/imagen3.jpg','','','','','','','','','','','','','','Tulum',NULL,NULL,'{\"banos\": \"4\", \"alberca\": \"Sí\", \"niveles\": \"2\", \"terraza\": \"Sí\", \"amueblada\": \"Sí\", \"recamaras\": \"4\", \"estacionamientos\": \"1\", \"superficie_total\": \"50\", \"superficie_construida\": \"50\"}','disponible','2025-06-08 14:12:52'),(15,'Casa en Cedral','Casa en cedral de 2 niveles cerca de una tienda',300000.00,'casas','venta','assets/images/property_15/imagn2.jpg','assets/images/property_15/diseno.de.casas.22.jpg','assets/images/property_15/709539-2953x1967-desktop-hd-cozumel-background.jpg','assets/images/property_15/casademo.avif','','','','','','','','','','','','','Lázaro Cárdenas',NULL,NULL,'{\"banos\": \"2\", \"alberca\": \"Sí\", \"niveles\": \"2\", \"terraza\": \"Sí\", \"amueblada\": \"Sí\", \"recamaras\": \"4\", \"estacionamientos\": \"1\", \"superficie_total\": \"50\", \"superficie_construida\": \"45\"}','disponible','2025-06-15 03:32:29'),(16,'Casa en renta en jardines','Increible mansion en renta precio unico',25000.00,'casas','renta','assets/images/property_16/Casa-moderna-un-piso.jpg','assets/images/property_16/pexels-falling4utah-2724749.jpg','assets/images/property_16/pexels-sebastians-731082.jpg','','','','','','','','','','','','','','Benito Juárez',NULL,NULL,'{\"banos\": \"2\", \"alberca\": \"Sí\", \"niveles\": \"2\", \"terraza\": \"Sí\", \"amueblada\": \"Sí\", \"recamaras\": \"2\", \"estacionamientos\": \"3\", \"superficie_total\": \"25\", \"superficie_construida\": \"25\"}','disponible','2025-07-02 03:23:39'),(17,'depa en renta Moderna cancun 85','Increible depa',25000.00,'departamentos','renta','assets/images/property_17/pexels-sebastians-731082.jpg','assets/images/property_17/Casa-moderna-un-piso.jpg','assets/images/property_17/pexels-itsterrymag-2635038.jpg','','','','','','','','','','','','','','Felipe Carrillo Puerto',NULL,NULL,'{\"piso\": \"4\", \"banos\": \"2\", \"terraza\": \"Sí\", \"elevador\": \"Sí\", \"recamaras\": \"2\", \"amenidades\": {\"alberca\": \"Sí\", \"gimnasio\": \"Sí\", \"salon_eventos\": \"Sí\"}, \"estacionamientos\": \"2\", \"superficie_total\": \"25\"}','disponible','2025-07-02 03:26:33'),(18,'casa grande en holbox','Casa grande de lujo',6000.00,'casas','renta','assets/images/property_18/pexels-falling4utah-2724749.jpg','assets/images/property_18/Casa-moderna-un-piso.jpg','assets/images/property_18/pexels-sebastians-731082.jpg','assets/images/property_18/3f58c106a8b75efcb9ec52f200e49d33.jpg','','','','','','','','','','','','','Lázaro Cárdenas',NULL,NULL,'{\"banos\": \"4\", \"alberca\": \"No\", \"niveles\": \"3\", \"terraza\": \"Sí\", \"amueblada\": \"Sí\", \"recamaras\": \"1\", \"estacionamientos\": \"3\", \"superficie_total\": \"25\", \"superficie_construida\": \"50m\"}','disponible','2025-07-02 03:27:43');
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-12 14:45:49
