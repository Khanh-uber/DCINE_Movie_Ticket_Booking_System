-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: dcine_schema
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `account_id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `membership_tier_id` bigint DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `role` enum('ADMIN','CUSTOMER') NOT NULL,
  `loyalty_points` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `customer_id` (`customer_id`),
  KEY `membership_tier_id` (`membership_tier_id`),
  CONSTRAINT `account_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  CONSTRAINT `account_ibfk_2` FOREIGN KEY (`membership_tier_id`) REFERENCES `membership_tier` (`tier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,1,NULL,'thuc123','$2a$10$WeoU/b8.T62hlAzBfelyNOKXFsWSKdwHghlJ9A2lXeur0e1eiLLkm','thucthcsll2@gmail.com',NULL,'ACTIVE','CUSTOMER',0,'2025-11-03 14:26:44');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `booking_id` bigint NOT NULL AUTO_INCREMENT,
  `account_id` bigint NOT NULL,
  `showtime_id` bigint NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','PAID','CANCELLED') DEFAULT 'PENDING',
  `qr_code` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`booking_id`),
  KEY `account_id` (`account_id`),
  KEY `showtime_id` (`showtime_id`),
  CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`showtime_id`) REFERENCES `showtime` (`showtime_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_concession`
--

DROP TABLE IF EXISTS `booking_concession`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_concession` (
  `booking_id` bigint NOT NULL,
  `concession_id` bigint NOT NULL,
  `qty` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`booking_id`,`concession_id`),
  KEY `concession_id` (`concession_id`),
  CONSTRAINT `booking_concession_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  CONSTRAINT `booking_concession_ibfk_2` FOREIGN KEY (`concession_id`) REFERENCES `concession` (`concession_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_concession`
--

LOCK TABLES `booking_concession` WRITE;
/*!40000 ALTER TABLE `booking_concession` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_concession` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_seat`
--

DROP TABLE IF EXISTS `booking_seat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_seat` (
  `booking_id` bigint NOT NULL,
  `seat_id` bigint NOT NULL,
  `price_at_booking` decimal(10,2) NOT NULL,
  PRIMARY KEY (`booking_id`,`seat_id`),
  KEY `seat_id` (`seat_id`),
  CONSTRAINT `booking_seat_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  CONSTRAINT `booking_seat_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seat` (`seat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_seat`
--

LOCK TABLES `booking_seat` WRITE;
/*!40000 ALTER TABLE `booking_seat` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_seat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_voucher`
--

DROP TABLE IF EXISTS `booking_voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_voucher` (
  `booking_id` bigint NOT NULL,
  `voucher_id` bigint NOT NULL,
  `discount_applied` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`booking_id`,`voucher_id`),
  KEY `voucher_id` (`voucher_id`),
  CONSTRAINT `booking_voucher_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  CONSTRAINT `booking_voucher_ibfk_2` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`voucher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_voucher`
--

LOCK TABLES `booking_voucher` WRITE;
/*!40000 ALTER TABLE `booking_voucher` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_voucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cast_person`
--

DROP TABLE IF EXISTS `cast_person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cast_person` (
  `cast_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role_type` enum('ACTOR','DIRECTOR') NOT NULL,
  PRIMARY KEY (`cast_id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cast_person`
--

LOCK TABLES `cast_person` WRITE;
/*!40000 ALTER TABLE `cast_person` DISABLE KEYS */;
INSERT INTO `cast_person` VALUES (1,'Băng Di','ACTOR'),(2,'Khương Ngọc','DIRECTOR'),(3,'Hồng Đào','ACTOR'),(4,'Hữu Châu','ACTOR'),(5,'Lâm Thanh Mỹ','ACTOR'),(6,'Việt Hương','ACTOR'),(7,'Anh Tú Atus','ACTOR'),(8,'Trần Hữu Tấn','DIRECTOR'),(9,'Hoàng Linh Chi','ACTOR'),(10,'Lương Thế Thành','ACTOR'),(11,'Huỳnh Thanh Trực','ACTOR'),(12,'Rima Thanh Vy','ACTOR'),(13,'Giovanni Ribisi','ACTOR'),(14,'James Cameron','DIRECTOR'),(15,'Kate Winslet','ACTOR'),(16,'Zoe Saldaña','ACTOR'),(17,'Diane Lane','ACTOR'),(18,'Jan Komasa','DIRECTOR'),(19,'Kyle Chandler','ACTOR'),(20,'Zoey Deutch','ACTOR'),(21,'Phoebe Dynevor','ACTOR'),(22,'Lương Gia Huy','ACTOR'),(23,'Hoàng Thơ','DIRECTOR'),(24,'Thái Trà My','ACTOR'),(25,'Dũng Bino','ACTOR'),(26,'Bích Ngọc','ACTOR'),(27,'Ethan Hawke','ACTOR'),(28,'Scott Derrickson','DIRECTOR'),(29,'Mason Thames','ACTOR'),(30,'Madeleine McGraw','ACTOR'),(31,'Demián Bichir','ACTOR'),(32,'Arianna Rivas','ACTOR'),(33,'G-DRAGON','ACTOR'),(34,'JINHO BYUN','DIRECTOR'),(35,'TAEYANG','ACTOR'),(36,'DAESUNG','ACTOR'),(37,'CL','ACTOR'),(38,'Yunita Siregar','ACTOR'),(39,'Hadrah Daeng Ratu','DIRECTOR'),(40,'Dinda Kanyadewi','ACTOR'),(41,'Tarra Budiman','ACTOR'),(42,'Mckenna Grace','ACTOR'),(43,'Emma Tammi','DIRECTOR'),(44,'Josh Hutcherson','ACTOR'),(45,'Matthew Lillard','ACTOR'),(46,'Quang Tuấn','ACTOR'),(47,'Trương Dũng','DIRECTOR'),(48,'Huỳnh Đông','ACTOR'),(49,'Vân Trang','ACTOR'),(50,'Hoàng Kim Ngọc','ACTOR'),(51,'Lan Thy','ACTOR'),(52,'Ái Như','ACTOR'),(53,'Nguyễn Thanh Bình','DIRECTOR'),(54,'Huy Khánh','ACTOR'),(55,'Tín Nguyễn','ACTOR'),(56,'Bé Sam','ACTOR'),(57,'Ngọc Sơn','ACTOR'),(58,'Jason Bateman','ACTOR'),(59,'Jared Bush','DIRECTOR'),(60,'Quinta Brunson','ACTOR'),(61,'Byron Howard','DIRECTOR'),(62,'Fortune Feimster','ACTOR'),(63,'Huỳnh Phương','ACTOR'),(64,'Ngụy Minh Khang','DIRECTOR'),(65,'Lý Hùng','ACTOR'),(66,'Phương Lan','ACTOR'),(67,'Cát Phượng','ACTOR'),(68,'Kim Tuyến','ACTOR'),(69,'Elle Fanning','ACTOR'),(70,'Dan Trachtenberg','DIRECTOR'),(71,'Dimitrius Schuster-Koloamatangi','ACTOR'),(72,'Nadech Kugimiya','ACTOR'),(73,'Narit Yuvaboon','DIRECTOR'),(74,'Denise Jelilcha Kapaun','ACTOR'),(75,'Mim Rattawadee Wongthong','ACTOR'),(76,'Junior Kajbhunditt Jaidee','ACTOR'),(77,'Friend Peerakrit Phacharaboonyakiat','ACTOR'),(78,'Minh Ngọc','ACTOR'),(79,'Trần Nhân Kiên','DIRECTOR'),(80,'Minh Phượng','ACTOR'),(81,'Hồng Thanh','ACTOR'),(82,'Tạ Lâm','ACTOR'),(83,'Ngọc Tưởng','ACTOR'),(84,'Quách Ngọc Ngoan','ACTOR'),(85,'Quốc Công','DIRECTOR'),(86,'Xuân Văn','ACTOR'),(87,'Nhật Linh','ACTOR'),(88,'Việt Hưng','ACTOR'),(89,'Glen Powell','ACTOR'),(90,'Edgar Wright','DIRECTOR'),(91,'William H. Macy','ACTOR'),(92,'Lee Pace','ACTOR'),(93,'Emilia Jones','ACTOR'),(94,'Michael Cera','ACTOR'),(95,'Liên Bỉnh Phát','ACTOR'),(96,'Kiều Oanh','ACTOR'),(97,'Lê Hải','ACTOR'),(98,'Mai Cát Vi','ACTOR'),(100,'Rima Thanh Vy','ACTOR'),(101,'Thúy Hạnh','ACTOR'),(102,'Hoàng Phúc','ACTOR'),(103,'Kiều Trinh','ACTOR'),(104,'Tam Triều Dâng','ACTOR'),(105,'Margot Robbie','ACTOR'),(106,'Jacob Elordi','ACTOR'),(107,'Hong Chau','ACTOR'),(108,'Shazad Latif','ACTOR'),(109,'Alison Oliver','ACTOR'),(110,'Kim Phương','ACTOR'),(111,'Yada Narilya Gulmongkolpech','ACTOR'),(112,'\"Krist\" Perawat Sangpotirat','ACTOR'),(113,'Choosak Iamsook','ACTOR'),(114,'Pongsak Pongsuwan','ACTOR'),(115,'Phetthai Vongkumlao','ACTOR'),(116,'Ma Ran Đô','ACTOR'),(117,'Nguyên Thảo','ACTOR'),(118,'Thanh Nam','ACTOR'),(119,'Oscar Dương','DIRECTOR'),(120,'Thắng Vũ','DIRECTOR'),(121,'Emerald Fennell','DIRECTOR'),(122,'Trần Duy Linh','DIRECTOR'),(123,'Phạm Trung Hiếu','DIRECTOR'),(124,' Choosak Iamsook','DIRECTOR'),(125,'Dương Minh Chiến','DIRECTOR'),(126,'Kim Hải','ACTOR');
/*!40000 ALTER TABLE `cast_person` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `concession`
--

DROP TABLE IF EXISTS `concession`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `concession` (
  `concession_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`concession_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concession`
--

LOCK TABLES `concession` WRITE;
/*!40000 ALTER TABLE `concession` DISABLE KEYS */;
INSERT INTO `concession` VALUES (1,'Bắp rang bơ nhỏ',45000.00),(2,'Bắp rang bơ lớn',65000.00),(3,'Combo bắp + nước',85000.00),(4,'Combo đôi',150000.00),(5,'Pepsi lon',35000.00);
/*!40000 ALTER TABLE `concession` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `customer_id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  PRIMARY KEY (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Pham Minh Thuc',NULL,NULL),(2,'Phạm Minh Thức','0901234567','2004-05-12'),(3,'Nguyễn Hồng Khánh','0908889999','2004-08-20'),(4,'Trần Văn Kiên','0911222333','2003-12-15');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genre`
--

DROP TABLE IF EXISTS `genre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genre` (
  `genre_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`genre_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genre`
--

LOCK TABLES `genre` WRITE;
/*!40000 ALTER TABLE `genre` DISABLE KEYS */;
INSERT INTO `genre` VALUES (6,'Hài hước'),(1,'Hành động'),(5,'Hoạt hình'),(8,'Khoa học viễn tưởng'),(4,'Kinh dị'),(2,'Phiêu lưu'),(7,'Tâm lý'),(3,'Tình cảm');
/*!40000 ALTER TABLE `genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hall`
--

DROP TABLE IF EXISTS `hall`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hall` (
  `hall_id` bigint NOT NULL AUTO_INCREMENT,
  `theater_id` bigint NOT NULL,
  `name` varchar(50) NOT NULL,
  `capacity` int NOT NULL,
  PRIMARY KEY (`hall_id`),
  KEY `theater_id` (`theater_id`),
  CONSTRAINT `hall_ibfk_1` FOREIGN KEY (`theater_id`) REFERENCES `theater` (`theater_id`)
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hall`
--

LOCK TABLES `hall` WRITE;
/*!40000 ALTER TABLE `hall` DISABLE KEYS */;
INSERT INTO `hall` VALUES (1,1,'Phòng 1 - DEXP',256),(2,1,'Phòng 2 - 4DX',120),(3,1,'Phòng 3 - 3D',120),(4,1,'Phòng 4 - 2D',170),(5,1,'Phòng 5 - Standard',120),(6,1,'Phòng 6 - Standard',120),(7,1,'Phòng 7 - SUPER CLASS',60),(8,2,'Phòng 1 - DEXP',256),(9,2,'Phòng 2 - 3D',120),(10,2,'Phòng 3 - 2D',170),(11,2,'Phòng 4 - Standard',120),(12,2,'Phòng 5 - SUPER CLASS',60),(13,3,'Phòng 1 - DEXP',256),(14,3,'Phòng 2 - 3D',120),(15,3,'Phòng 3 - 2D',170),(16,3,'Phòng 4 - Standard',120),(17,3,'Phòng 5 - Standard',120),(18,4,'Phòng 1 - 2D',170),(19,4,'Phòng 2 - Standard',120),(20,4,'Phòng 3 - 3D',120),(21,5,'Phòng 1 - DEXP',256),(22,5,'Phòng 2 - 4DX',120),(23,5,'Phòng 3 - 3D',120),(24,5,'Phòng 4 - 2D',170),(25,5,'Phòng 5 - Standard',120),(26,5,'Phòng 6 - SUPER CLASS',60),(27,6,'Phòng 1 - DEXP',256),(28,6,'Phòng 2 - 4DX',120),(29,6,'Phòng 3 - 3D',120),(30,6,'Phòng 4 - 2D',170),(31,6,'Phòng 5 - Standard',120),(32,6,'Phòng 6 - Standard',120),(33,6,'Phòng 7 - SUPER CLASS',60),(34,7,'Phòng 1 - 2D',170),(35,7,'Phòng 2 - Standard',120),(36,7,'Phòng 3 - 3D',120),(37,8,'Phòng 1 - DEXP',256),(38,8,'Phòng 2 - 3D',120),(39,8,'Phòng 3 - 2D',170),(40,8,'Phòng 4 - Standard',120),(41,8,'Phòng 5 - SUPER CLASS',60),(42,9,'Phòng 1 - DEXP',256),(43,9,'Phòng 2 - 4DX',120),(44,9,'Phòng 3 - 3D',120),(45,9,'Phòng 4 - 2D',170),(46,9,'Phòng 5 - Standard',120),(47,9,'Phòng 6 - Standard',120),(48,9,'Phòng 7 - SUPER CLASS',60),(49,10,'Phòng 1 - 3D',120),(50,10,'Phòng 2 - Standard',120),(51,10,'Phòng 3 - 2D',170),(52,11,'Phòng 1 - DEXP',256),(53,11,'Phòng 2 - 3D',120),(54,11,'Phòng 3 - 2D',170),(55,11,'Phòng 4 - Standard',120),(56,11,'Phòng 5 - SUPER CLASS',60),(57,12,'Phòng 1 - DEXP',256),(58,12,'Phòng 2 - 4DX',120),(59,12,'Phòng 3 - 3D',120),(60,12,'Phòng 4 - 2D',170),(61,12,'Phòng 5 - Standard',120),(62,12,'Phòng 6 - Standard',120),(63,12,'Phòng 7 - SUPER CLASS',60),(64,13,'Phòng 1 - DEXP',256),(65,13,'Phòng 2 - 3D',120),(66,13,'Phòng 3 - 2D',170),(67,13,'Phòng 4 - Standard',120),(68,13,'Phòng 5 - SUPER CLASS',60),(69,14,'Phòng 1 - 2D',170),(70,14,'Phòng 2 - Standard',120),(71,14,'Phòng 3 - 3D',120),(72,15,'Phòng 1 - 2D',170),(73,15,'Phòng 2 - Standard',120),(74,15,'Phòng 3 - 3D',120),(75,15,'Phòng 4 - SUPER CLASS',60),(76,16,'Phòng 1 - 2D',170),(77,16,'Phòng 2 - Standard',120),(78,17,'Phòng 1 - 2D',170),(79,17,'Phòng 2 - Standard',120),(80,18,'Phòng 1 - 3D',120),(81,18,'Phòng 2 - 2D',170),(82,19,'Phòng 1 - Standard',120),(83,20,'Phòng 1 - 2D',170),(84,20,'Phòng 2 - Standard',120),(85,21,'Phòng 1 - DEXP',256),(86,21,'Phòng 2 - 3D',120),(87,21,'Phòng 3 - 2D',170),(88,21,'Phòng 4 - Standard',120),(89,22,'Phòng 1 - 3D',120),(90,22,'Phòng 2 - 2D',170),(91,22,'Phòng 3 - Standard',120),(92,23,'Phòng 1 - 2D',170),(93,23,'Phòng 2 - Standard',120),(94,24,'Phòng 1 - Standard',120),(95,25,'Phòng 1 - 3D',120),(96,25,'Phòng 2 - 2D',170),(97,25,'Phòng 3 - Standard',120),(98,25,'Phòng 4 - SUPER CLASS',60),(99,26,'Phòng 1 - DEXP',256),(100,26,'Phòng 2 - 4DX',120),(101,26,'Phòng 3 - 3D',120),(102,26,'Phòng 4 - 2D',170),(103,26,'Phòng 5 - Standard',120),(104,26,'Phòng 6 - Standard',120),(105,26,'Phòng 7 - SUPER CLASS',60),(106,27,'Phòng 1 - 3D',120),(107,27,'Phòng 2 - 2D',170),(108,27,'Phòng 3 - Standard',120),(109,27,'Phòng 4 - SUPER CLASS',60),(110,28,'Phòng 1 - 3D',120),(111,28,'Phòng 2 - 2D',170),(112,28,'Phòng 3 - Standard',120),(113,28,'Phòng 4 - SUPER CLASS',60),(114,29,'Phòng 1 - 3D',120),(115,29,'Phòng 2 - 2D',170),(116,29,'Phòng 3 - Standard',120),(117,29,'Phòng 4 - SUPER CLASS',60),(118,30,'Phòng 1 - DEXP',256),(119,30,'Phòng 2 - 3D',120),(120,30,'Phòng 3 - 2D',170),(121,30,'Phòng 4 - Standard',120),(122,30,'Phòng 5 - SUPER CLASS',60),(123,31,'Phòng 1 - 3D',120),(124,31,'Phòng 2 - 2D',170),(125,31,'Phòng 3 - Standard',120),(126,31,'Phòng 4 - SUPER CLASS',60),(127,32,'Phòng 1 - 3D',120),(128,32,'Phòng 2 - 2D',170),(129,32,'Phòng 3 - Standard',120),(130,32,'Phòng 4 - SUPER CLASS',60),(131,33,'Phòng 1 - 2D',170),(132,33,'Phòng 2 - Standard',120),(133,34,'Phòng 1 - DEXP',256),(134,34,'Phòng 2 - 4DX',120),(135,34,'Phòng 3 - 3D',120),(136,34,'Phòng 4 - 2D',170),(137,34,'Phòng 5 - Standard',120),(138,34,'Phòng 6 - Standard',120),(139,34,'Phòng 7 - SUPER CLASS',60),(140,35,'Phòng 1 - 3D',120),(141,35,'Phòng 2 - 2D',170),(142,35,'Phòng 3 - Standard',120),(143,36,'Phòng 1 - 3D',120),(144,36,'Phòng 2 - 2D',170),(145,36,'Phòng 3 - Standard',120),(146,36,'Phòng 4 - SUPER CLASS',60),(147,37,'Phòng 1 - 3D',120),(148,37,'Phòng 2 - 2D',170),(149,37,'Phòng 3 - Standard',120),(150,37,'Phòng 4 - SUPER CLASS',60),(151,38,'Phòng 1 - 3D',120),(152,38,'Phòng 2 - 2D',170),(153,38,'Phòng 3 - Standard',120),(154,38,'Phòng 4 - SUPER CLASS',60);
/*!40000 ALTER TABLE `hall` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `location_id` bigint NOT NULL AUTO_INCREMENT,
  `city_name` varchar(100) NOT NULL,
  `province_id` bigint NOT NULL,
  PRIMARY KEY (`location_id`),
  KEY `province_id` (`province_id`),
  CONSTRAINT `location_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `province` (`province_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES (1,'Quận 1',1),(2,'Bình Thạnh',1),(3,'Thủ Đức',1),(4,'Hóc Môn',1),(5,'Quận 7',1),(6,'Gò Vấp',1),(7,'Bình Dương',1),(8,'Vũng Tàu',1),(9,'Hà Đông',2),(10,'Tây Hồ',2),(11,'Đống Đa',2),(12,'Cầu Giấy',2),(13,'Hải Phòng',3),(14,'Ninh Bình',3),(15,'Bắc Ninh',3),(16,'Hưng Yên',3),(17,'Lào Cai',4),(18,'Thái Nguyên',4),(19,'Tuyên Quang',4),(20,'Phú Thọ',4),(21,'Thanh Hóa',5),(22,'Nghệ An',5),(23,'Hà Tĩnh',5),(24,'Quảng Trị',5),(25,'Huế',5),(26,'Đà Nẵng',6),(27,'Quảng Ngãi',6),(28,'Gia Lai',6),(29,'Đắk Lắk',6),(30,'Khánh Hòa',6),(31,'Lâm Đồng',6),(32,'Đồng Nai',7),(33,'Tây Ninh',7),(34,'Cần Thơ',8),(35,'An Giang',8),(36,'Vĩnh Long',8),(37,'Đồng Tháp',8),(38,'Cà Mau',8);
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membership_tier`
--

DROP TABLE IF EXISTS `membership_tier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membership_tier` (
  `tier_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `min_spending` decimal(10,2) DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `point_multiplier` decimal(5,2) DEFAULT '1.00',
  `last_update` timestamp NULL DEFAULT (now()),
  PRIMARY KEY (`tier_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership_tier`
--

LOCK TABLES `membership_tier` WRITE;
/*!40000 ALTER TABLE `membership_tier` DISABLE KEYS */;
INSERT INTO `membership_tier` VALUES (1,'Standard','Thành viên cơ bản',0.00,0.00,1.00,'2025-11-07 09:37:21'),(2,'Silver','Khách hàng thân thiết',1000000.00,5.00,1.20,'2025-11-07 09:37:21'),(3,'Gold','Khách hàng VIP',3000000.00,10.00,1.50,'2025-11-07 09:37:21');
/*!40000 ALTER TABLE `membership_tier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movie`
--

DROP TABLE IF EXISTS `movie`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movie` (
  `movie_id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `synopsis` text,
  `duration_min` int DEFAULT NULL,
  `rating` varchar(10) DEFAULT NULL,
  `age_limit` varchar(50) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `end_showing_date` date DEFAULT NULL,
  `early_screening_date` date DEFAULT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `trailer_url` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `status` enum('soon','now','ended') DEFAULT 'soon',
  PRIMARY KEY (`movie_id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie`
--

LOCK TABLES `movie` WRITE;
/*!40000 ALTER TABLE `movie` DISABLE KEYS */;
INSERT INTO `movie` VALUES (1,'TEE YOD: Quỷ Ăn Tạng Phần 3','Tee Yod 3 kể về cuộc chiến mới của Yak và gia đình khi em gái út Yee đột ngột mất tích, buộc họ phải đến khu rừng ma ám \"Bong Sa Noh Bian\" để tìm em, đồng thời vén màn bí mật về lời nguyền Tee Yod, nguồn gốc của hận thù và bi kịch giữa con người với chiến tranh.',104,'8.2','T16 (Từ đủ 16 tuổi trở lên)','2025-10-10','2025-11-16','2025-10-08','/assets/images/movies/tee_yod_quy_an_tang_phan_3/poster_doc.jpg','https://youtu.be/DXV3x2Htbyg?si=sb8URmHmGf2CWVVw',1,'now'),(2,'Cục Vàng Của Ngoại','\"Cục Vàng Của Ngoại\" là một bộ phim tâm lý gia đình ấm áp, kể về tình cảm sâu nặng giữa bà Hậu (Việt Hương) và cô cháu gái Su, người trở thành \"cục vàng\" duy nhất trong cuộc đời bà sau khi con gái bỏ đi. Phim miêu tả cuộc sống mộc mạc, những hy sinh thầm lặng, những va chạm thế hệ và hành trình chữa lành, dạy cho người xem về tình yêu thương vô bờ bến trong gia đình qua lăng kính của một xóm nhỏ Sài Gòn.',119,'8.0','T13 (Từ đủ 13 tuổi trở lên)','2025-10-17','2025-11-16','2025-10-12','/assets/images/movies/cuc_vang_cua_ngoai/poster_doc.jpg','https://youtu.be/_cj77qa_wMc?si=N6ONr9MfZmjNnkhr',1,'now'),(3,'Nhà Ma Xó','Nhà Ma Xó là một bộ phim kinh dị tâm linh Việt Nam, kể về bà Hiền và các con sống trong cảnh nghèo khó, gặp biến cố sau khi con trai giữa vô tình nhặt được một chiếc khạp bí ẩn dưới sông. Từ đó, hàng loạt hiện tượng siêu nhiên và mâu thuẫn nội bộ gia đình xảy ra, hé lộ những bí mật bị chôn vùi, đặt ra câu hỏi về nguồn gốc của \"ma xó\" và sự rạn nứt gia đình.',108,'8.0','T16 (Từ đủ 16 tuổi trở lên)','2025-10-24','2025-11-25','2025-10-22','/assets/images/movies/nha_ma_xo/poster_doc.jpg','https://youtu.be/ZEq0D-Y0VeU?si=bdGOVAfAhJyRYNGe',1,'now'),(4,'Phá Đám Sinh Nhật Mẹ','Phá Đám Sinh Nhật Mẹ là một bộ phim bi hài kịch gia đình xoay quanh kế hoạch làm đám tang giả của Y Đức để lừa tiền bảo hiểm cho mẹ. Bộ phim khám phá những tổn thương, định kiến thế hệ và khao khát được thấu hiểu trong các mối quan hệ gia đình Việt, đặt ra câu hỏi về sự thật và kỳ vọng. ',91,'7.8','T16 (Từ đủ 16 tuổi trở lên)','2025-10-31','2025-12-01','2025-10-27','/assets/images/movies/pha_dam_sinh_nhat_me/poster_doc.jpg','https://youtu.be/auO0QxMjTlc?si=k8hCvuxead91UzaW',1,'now'),(5,'Cải Mã','Cải Mã là một bộ phim kinh dị tâm linh Việt Nam, khai thác đề tài cải táng (bốc mộ), kể về gia đình họ Đỗ gặp vận xui sau khi động mồ động mả tổ tiên, vô tình đánh thức một bí mật tày đình và thứ tà ma ám lấy gia đình, gây ra nhiều tai ương.',115,'8.6','T16 (Từ đủ 16 tuổi trở lên)','2025-10-31','2025-12-02','2025-10-28','/assets/images/movies/cai_ma/poster_doc.jpg','https://youtu.be/KxvLXJqFCPY?si=_B4HuIY_0IUYx9ZO',1,'now'),(6,'Bí Mật Sau Bữa Tiệc','Phim kể về một câu chuyện nhỏ tưởng chừng gói gọn trong không gian gia đình nhưng lại mở ra góc nhìn sâu sắc về xã hội đương đại.',112,'7.6','T18 (Từ đủ 18 tuổi trở lên)','2025-10-31','2025-12-05','2025-10-28','/assets/images/movies/bi_mat_sau_bua_tiec/poster_doc.jpg','https://youtu.be/kW4sYsN1_cc?si=6YXhuGXOPEsARdRx',1,'now'),(7,'Bịt Mắt Bắt Nai','Bịt Mắt Bắt Nai kể về Trang, một nhân viên bất động sản, lo sợ bạn trai Hiệp sẽ chia tay sau khi cô bị cưỡng bức, nên đã rủ anh đến một homestay để cầu hôn, nhưng tại đây, cô lại đối mặt với Long - kẻ bạo hành cô.',92,'7.5','T16 (Từ đủ 16 tuổi trở lên)','2025-10-31','2025-12-10','2025-10-29','/assets/images/movies/bit_mat_bat_nai/poster_doc.jpg','https://youtu.be/AVm6gVRaOQE?si=0UBBnQy9h9hzq3rp',1,'now'),(8,'Điện Thoại Đen 2','Điện Thoại Đen 2 (The Black Phone 2) xoay quanh Finney và Gwen nhiều năm sau vụ bắt cóc, khi chiếc điện thoại đen lại reo lên ám ảnh họ, đưa hai anh em đến một trại đông lạnh để khám phá mối liên hệ kinh hoàng giữa The Grabber và quá khứ gia đình họ, buộc họ phải đối mặt với kẻ sát nhân mạnh mẽ hơn sau cái chết. ',114,'8.6','T18 (Từ đủ 18 tuổi trở lên)','2025-10-31','2025-11-30','2025-10-29','/assets/images/movies/dien_thoai_den_2/poster_doc.jpg','https://youtu.be/K4Ml_YDwfoU?si=sH0damf21UmYmt8n',1,'now'),(9,'Trái Tim Què Quặt','Một vụ án mạng tàn bạo làm chấn động thị trấn yên bình. Khi thi thể người phụ nữ bị sát hại dã man được phát hiện, mọi nghi ngờ đổ dồn vào Sơn — có thể là người tình của nạn nhân. Triết, một nhà điêu khắc danh tiếng, rơi vào giằng xé giữa nghi ngờ và tình thân khi anh cùng vợ mình cố gắng tìm cách minh oan cho em trai. Rốt cuộc, Sơn là kẻ giết người, nạn nhân của định mệnh nghiệt ngã, hay một trái tim lạc lối bị cuốn vào tình yêu đến mức tự hủy diệt.',102,'8.2','T18 (Từ đủ 18 tuổi trở lên)','2025-11-07','2025-12-20','2025-11-01','/assets/images/movies/trai_tim_que_quat/poster_doc.jpg','https://youtu.be/iMjjqsP9_nk?si=lH7b209c5hJd715A',1,'now'),(10,'Tình Người Duyên Ma','Lấy cảm hứng từ truyền thuyết dân gian Thái Lan về hồn ma Mae Nak, Tình Người Duyên Ma: Nhắm Mak Yêu Luôn kể câu chuyện tình vượt thời gian giữa nàng Nak và chàng Mak. Xuyên không đến 200 năm sau, Nak bất ngờ được vào vai nữ chính trong chính bộ phim về truyền thuyết của mình. Tình cờ thay, vai nam chính lại được thủ bởi Mak - lúc này đã là một nam diễn viên nổi tiếng toàn quốc. Ở đây, Nak phải chinh phục lại trái tim Mak trong vòng 30 ngày mà không được dùng đến ma lực, để có thể ở bên anh trọn đời trọn kiếp.',104,'8.7','T13 (Từ đủ 13 tuổi trở lên)','2025-11-07','2025-12-10','2025-11-05','/assets/images/movies/tinh_nguoi_duyen_ma/poster_doc.jpg','https://youtu.be/TpUvaW2ymeg?si=A6jdTCUr-R7ncon7',1,'now'),(11,'Thai Chiêu Tài','Nhơn, một doanh nhân thành đạt nhờ thủ đoạn và mưu mẹo, tìm đến thứ tà thuật mang tên “Thai Chiêu Tài” để giữ lấy tài khí đã vô tình khơi dậy những ám ảnh từ quá khứ và sang chấn liên thế hệ.',104,'8.2','T18 (Từ đủ 18 tuổi trở lên)','2025-11-07','2025-12-10','2025-11-03','/assets/images/movies/thai_chieu_tai/poster_doc.jpg','https://youtu.be/4QLv7aJq1Wg?si=c9td6U9QRjNkx-Lk',1,'now'),(12,'Quái Thú Vô Hình: Vùng Đất Chết Chóc','Quái Thú Vô Hình: Vùng Đất Chết Chóc (Predator: Badlands) đưa khán giả đến một hành tinh xa xôi, mở rộng thế giới của loài thợ săn huyền thoại với câu chuyện sinh tồn và tìm lại bản sắc đầy cảm xúc.',107,'8.8','T16 (Từ đủ 16 tuổi trở lên)','2025-11-07','2025-12-10','2025-11-04','/assets/images/movies/quai_thu_vo_hinh_vung_dat_chet_choc/poster_doc.jpg','https://youtu.be/AzBi73ddou4?si=8UW6wY8PeQAa8pqB',1,'now'),(13,'Lọ Lem Chơi Ngải','Bộ phim xoay quanh Yuli - cô gái mồ côi phải sống như người hầu trong gia đình của Ambar và mang danh “tiểu tam”. Từ một người hiền lành và chân thành, Yuli dần biến thành kẻ độc ác và nuôi quyết tâm trả thù bằng cách tàn nhẫn nhất.',98,'8.1','T18 (Từ đủ 18 tuổi trở lên)','2025-11-07','2025-12-10','2025-11-05','/assets/images/movies/lo_lem_choi_ngai/poster_doc.jpg','https://youtu.be/T6ty2iYxeT4?si=xlXBWoyFeKR_-HnM',1,'now'),(14,'Trốn Chạy Tử Thần','Trốn Chạy Tử Thần (The Running Man) là câu chuyện về Ben Richards, một người lao động nghèo tham gia chương trình truyền hình sinh tồn tàn khốc để kiếm tiền chữa bệnh cho con gái, phải trốn chạy 30 ngày khỏi những sát thủ chuyên nghiệp, trong khi cả đất nước theo dõi trực tiếp và ngày càng nghiện cảm giác hồi hộp khi anh đối mặt với nguy hiểm cận kề. ',NULL,'0',NULL,'2025-11-14','2025-12-20','2025-11-11','/assets/images/movies/tron_chay_tu_than/poster_doc.jpg','https://youtu.be/A0HOepo6xQI?si=Vye5CeoQ6Cq_w3tI',1,'soon'),(15,'Truy Tìm Long Diên Hương','Truy Tìm Long Diên Hương là phim hài hành động xoay quanh hành trình truy tìm báu vật thiêng Long Diên Hương bị đánh cắp của hai anh em Tâm (Quang Tuấn) và Tuấn (Ma Ran Đô). Trên đường tìm lại báu vật, họ phải đối mặt với băng nhóm xã hội đen của Cường Liều (Doãn Quốc Đam), trải qua những pha hành động nghẹt thở, hài hước và dần nhận ra giá trị của tình thân, lòng trung thành. ',103,'0','T16 (Từ đủ 16 tuổi trở lên)','2025-11-14','2025-12-15','2025-11-10','/assets/images/movies/truy_tim_long_dien_huong/poster_doc.jpg','https://youtu.be/-wmBoUIJ9uo?si=PGlY2d7zYWRfbcOO',1,'soon'),(16,'G-Dragon In Cinema','G-Dragon In Cinema là bộ phim tài liệu về buổi hòa nhạc năm 2025 giới thiệu chuyến lưu diễn toàn cầu đầu tiên của siêu sao K-pop sau tám năm, chuyến lưu diễn Übermensch của anh.',103,'0','T13 (Từ đủ 13 tuổi trở lên)','2025-11-11','2026-01-10','2025-11-09','/assets/images/movies/g_dragon_in_cinema/poster_doc.jpg','https://youtu.be/r9dVQC_UjBo?si=Ry864i8j3--94z1J',1,'soon'),(17,'Bẫy Tiền','Bẫy Tiền kể về Đăng Thức, người bị cuốn vào một vụ lừa đảo qua điện thoại đầy nguy hiểm, khiến anh phải đối mặt với lựa chọn khó khăn giữa tiền bạc, tình thân và niềm tin, nơi mọi quyết định đều đánh đổi bằng những người anh yêu thương.',NULL,'0',NULL,'2025-11-21','2026-01-30','2025-11-18','/assets/images/movies/bay_tien/poster_doc.jpg','https://youtu.be/0wuVwkK-Vsc?si=e4WvUPwUPqJaUpwn',1,'soon'),(18,'Phi Vụ Động Trời 2','Trong Phi Vụ Động Trời 2 (Zootopia 2), hai thám tử Judy Hopps và Nick Wilde đối mặt với một vụ án mới khi một sinh vật bò sát bí ẩn tên Gary xuất hiện, gây náo loạn thành phố Zootopia và đảo lộn trật tự xã hội động vật.',120,'0',NULL,'2025-11-26','2025-12-20','2025-11-20','/assets/images/movies/phi_vu_dong_troi_2/poster_doc.jpg','https://youtu.be/EutV2x9GEZo?si=1sKRDXkpUXwyukGr',1,'soon'),(19,'Phòng Trọ Ma Bầu','Phòng Trọ Ma Bàu kể về hai người bạn thân (do Huỳnh Phương và Anh Tú thủ vai) trốn chạy khỏi trách nhiệm khi bạn gái của một trong hai người mang thai, thuê phải một căn phòng trọ cũ kỹ ở vùng quê và liên tục gặp phải các hiện tượng siêu nhiên, đối mặt với hồn ma \"ma bầu\" mang câu chuyện bi kịch và tình mẫu tử thiêng liêng.',120,'0',NULL,'2025-11-28','2025-12-30','2025-11-25','/assets/images/movies/phong_tro_ma_bau/poster_doc.jpg','https://youtu.be/jgZM5IhnzDA?si=QKyRFWWiJAO1TT4a',1,'soon'),(20,'Hoàng Tử Quỷ','Hoàng Tử Quỷ kể về Thân Đức, một hoàng tử mang dòng máu quỷ, trốn khỏi cung cấm để thực hiện âm mưu giải thoát cha mình là Quỷ Xương Cuồng bằng cách tìm kiếm Du Hồn Giả và Bạch Hổ Nguyên Âm tại làng Hủi, nơi anh đối đầu với trưởng làng Lỗ Đạt trong cuộc chiến giữa chính nghĩa và tà niệm.',NULL,'0',NULL,'2025-12-05','2026-01-05','2025-12-01','/assets/images/movies/hoang_tu_quy/poster_doc.jpg','https://youtu.be/Qzymh0WVyN8?si=-tGoQp2pYnLSAtju',1,'soon'),(21,'Năm Đêm Kinh Hoàng 2','Năm Đêm Kinh Hoàng 2 (Five Nights at Freddy\'s 2) lấy bối cảnh một năm sau phần đầu, khi thị trấn tổ chức lễ hội Fazfest dựa trên truyền thuyết về các animatronic, nhưng bí mật về chúng vẫn bị che giấu. Khi cô bé Abby lén đến gặp Freddy, Bonnie, Chica và Foxy, một chuỗi sự kiện kinh hoàng xảy ra, hé lộ nguồn gốc thực sự của Freddy\'s và đánh thức một nỗi kinh hoàng bị lãng quên.',120,'0',NULL,'2025-12-05','2025-01-27','2025-12-02','/assets/images/movies/nam_dem_kinh_hoang_2/poster_doc.jpg','https://youtu.be/HccJNOYMBjM?si=pscIV4qWv7fHceSK',0,'soon'),(22,'Nhà \"Hai\" Chủ','Nhà \"Hai\" Chủ là một bộ phim kinh dị Việt Nam kể về một gia đình trẻ chuyển đến sống trong một căn nhà cũ, nơi người dân đồn đoán về những điều tâm linh kỳ lạ. Mua nhà nhầm vào ngày dữ, hai vợ chồng trẻ đối mặt với chuỗi hiện tượng rùng rợn. Lời cảnh báo “nhà làm vào ngày Tam Nương”, “nhà này có ma” chỉ là khởi đầu cho những điềm gở kinh hoàng sắp xảy ra. Những điều kỳ lạ liên tục xuất hiện khiến gia chủ không lường, dường như có ai đó không muốn họ ở đây.',NULL,'0',NULL,'2025-12-05','2026-01-10','2025-12-02','/assets/images/movies/nha_hai_chu/poster_doc.jpg','https://youtu.be/ZZZUfZzX0ZU?si=xRMQa03E8Zax0108',1,'soon'),(23,'Avatar 3: Lửa Và Tro Tàn','Avatar 3: Fire and Ash theo chân gia đình Sully khi họ vật lộn với nỗi đau sau cái chết của Neteyam, dẫn đến cuộc chạm trán với Người Ash hung hãn do Varang cầm đầu.',NULL,'0',NULL,'2025-12-19','2026-02-20','2025-12-13','/assets/images/movies/avatar_3_lua_va_tro_tan/poster_doc.jpg','https://youtu.be/nb_fFj_0rq8?si=gNKJvIbJP3NymfFS',1,'soon'),(24,'Đồi Gió Hú','Đồi Gió Hú (2026) là bản chuyển thể mới nhất từ tiểu thuyết kinh điển của Emily Brontë, tập trung vào câu chuyện tình yêu ám ảnh, dữ dội giữa Catherine Earnshaw và Heathcliff trên vùng đồng cỏ Yorkshire',NULL,'0',NULL,'2026-03-13','2026-04-25','2026-03-05','/assets/images/movies/doi_gio_hu/poster_doc.jpg','https://youtu.be/TjAJ7cOjwjg?si=OEUP3OR4lWQQMTxo',1,'soon');
/*!40000 ALTER TABLE `movie` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movie_cast`
--

DROP TABLE IF EXISTS `movie_cast`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movie_cast` (
  `movie_id` bigint NOT NULL,
  `cast_id` bigint NOT NULL,
  KEY `movie_id` (`movie_id`),
  KEY `cast_id` (`cast_id`),
  CONSTRAINT `movie_cast_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`),
  CONSTRAINT `movie_cast_ibfk_2` FOREIGN KEY (`cast_id`) REFERENCES `cast_person` (`cast_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie_cast`
--

LOCK TABLES `movie_cast` WRITE;
/*!40000 ALTER TABLE `movie_cast` DISABLE KEYS */;
INSERT INTO `movie_cast` VALUES (1,72),(1,73),(1,74),(1,75),(1,76),(1,77),(2,1),(2,2),(2,3),(2,4),(2,5),(2,6),(3,46),(3,47),(3,48),(3,49),(3,50),(3,51),(4,4),(4,52),(4,53),(4,54),(4,55),(4,56),(4,57),(5,100),(5,101),(5,102),(5,103),(5,126),(5,120),(6,17),(6,18),(6,19),(6,20),(6,21),(7,22),(7,23),(7,24),(7,25),(7,26),(8,27),(8,28),(8,29),(8,30),(8,31),(8,32),(9,84),(9,85),(9,86),(9,87),(9,88),(10,111),(10,112),(10,113),(10,114),(10,115),(10,124),(11,78),(11,79),(11,80),(11,81),(11,82),(11,83),(12,69),(12,70),(12,71),(13,38),(13,39),(13,40),(13,41),(14,89),(14,90),(14,91),(14,92),(14,93),(14,94),(15,46),(15,116),(15,117),(15,118),(15,125),(16,33),(16,34),(16,35),(16,36),(16,37),(17,95),(17,104),(17,96),(17,97),(17,98),(17,119),(18,58),(18,59),(18,60),(18,61),(18,62),(19,63),(19,64),(19,65),(19,66),(19,67),(19,68),(20,7),(20,8),(20,9),(20,10),(20,11),(20,12),(21,42),(21,43),(21,44),(21,45),(22,126),(22,82),(22,110),(22,122),(22,123),(23,13),(23,14),(23,15),(23,16),(24,105),(24,106),(24,107),(24,108),(24,109),(24,121);
/*!40000 ALTER TABLE `movie_cast` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movie_genre`
--

DROP TABLE IF EXISTS `movie_genre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movie_genre` (
  `movie_id` bigint NOT NULL,
  `genre_id` bigint NOT NULL,
  PRIMARY KEY (`movie_id`,`genre_id`),
  KEY `genre_id` (`genre_id`),
  CONSTRAINT `movie_genre_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`),
  CONSTRAINT `movie_genre_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genre` (`genre_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie_genre`
--

LOCK TABLES `movie_genre` WRITE;
/*!40000 ALTER TABLE `movie_genre` DISABLE KEYS */;
INSERT INTO `movie_genre` VALUES (1,1),(3,1),(4,1),(8,1),(10,1),(3,2),(5,2),(9,2),(10,2),(5,3),(6,3),(7,3),(2,5),(9,5),(2,6),(4,6),(7,6),(6,7),(1,8),(8,8);
/*!40000 ALTER TABLE `movie_genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_record`
--

DROP TABLE IF EXISTS `otp_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `identifier` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `request_id` varchar(100) DEFAULT NULL,
  `token` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_record`
--

LOCK TABLES `otp_record` WRITE;
/*!40000 ALTER TABLE `otp_record` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `method` enum('CARD','MOMO','ZALOPAY') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `provider_txn_id` varchar(100) DEFAULT NULL,
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL,
  `paid_at` datetime DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `province`
--

DROP TABLE IF EXISTS `province`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `province` (
  `province_id` bigint NOT NULL AUTO_INCREMENT,
  `province_name` varchar(100) NOT NULL,
  PRIMARY KEY (`province_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `province`
--

LOCK TABLES `province` WRITE;
/*!40000 ALTER TABLE `province` DISABLE KEYS */;
INSERT INTO `province` VALUES (1,'TP. Hồ Chí Minh'),(2,'Hà Nội'),(3,'ĐB Sông Hồng'),(4,'Đông Bắc, Tây Bắc'),(5,'Bắc Miền Trung'),(6,'Nam Miền Trung'),(7,'Đông Nam Bộ'),(8,'Tây Nam Bộ');
/*!40000 ALTER TABLE `province` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seat`
--

DROP TABLE IF EXISTS `seat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seat` (
  `seat_id` bigint NOT NULL AUTO_INCREMENT,
  `hall_id` bigint NOT NULL,
  `row_label` varchar(5) NOT NULL,
  `seat_number` int NOT NULL,
  `seat_type_id` bigint DEFAULT NULL,
  PRIMARY KEY (`seat_id`),
  KEY `hall_id` (`hall_id`),
  KEY `seat_type_id` (`seat_type_id`),
  CONSTRAINT `seat_ibfk_1` FOREIGN KEY (`hall_id`) REFERENCES `hall` (`hall_id`),
  CONSTRAINT `seat_ibfk_2` FOREIGN KEY (`seat_type_id`) REFERENCES `seat_type` (`seat_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seat`
--

LOCK TABLES `seat` WRITE;
/*!40000 ALTER TABLE `seat` DISABLE KEYS */;
INSERT INTO `seat` VALUES (1,1,'A',1,1),(2,1,'A',2,1),(3,1,'A',3,2),(4,1,'B',1,1),(5,1,'B',2,2),(6,2,'A',1,1),(7,2,'A',2,2),(8,2,'B',1,1),(9,2,'B',2,3),(10,3,'A',1,1),(11,3,'A',2,1),(12,3,'B',1,2),(13,3,'B',2,3),(14,4,'A',1,1),(15,4,'A',2,1),(16,4,'B',1,2),(17,4,'B',2,3),(18,5,'A',1,1),(19,5,'A',2,1),(20,5,'B',1,2),(21,5,'B',2,3),(22,6,'A',1,1),(23,6,'A',2,2),(24,6,'B',1,3),(25,6,'B',2,1);
/*!40000 ALTER TABLE `seat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seat_type`
--

DROP TABLE IF EXISTS `seat_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seat_type` (
  `seat_type_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `price_multiplier` decimal(5,2) DEFAULT '1.00',
  PRIMARY KEY (`seat_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seat_type`
--

LOCK TABLES `seat_type` WRITE;
/*!40000 ALTER TABLE `seat_type` DISABLE KEYS */;
INSERT INTO `seat_type` VALUES (1,'Ghế thường',1.00),(2,'Ghế VIP',1.20),(3,'Ghế đôi Couple',1.50);
/*!40000 ALTER TABLE `seat_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `showtime`
--

DROP TABLE IF EXISTS `showtime`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `showtime` (
  `showtime_id` bigint NOT NULL AUTO_INCREMENT,
  `movie_id` bigint NOT NULL,
  `hall_id` bigint NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`showtime_id`),
  KEY `movie_id` (`movie_id`),
  KEY `hall_id` (`hall_id`),
  CONSTRAINT `showtime_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`),
  CONSTRAINT `showtime_ibfk_2` FOREIGN KEY (`hall_id`) REFERENCES `hall` (`hall_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `showtime`
--

LOCK TABLES `showtime` WRITE;
/*!40000 ALTER TABLE `showtime` DISABLE KEYS */;
INSERT INTO `showtime` VALUES (1,1,1,'2025-11-08 09:00:00','2025-11-08 11:45:00',90000.00),(2,2,2,'2025-11-08 13:00:00','2025-11-08 14:40:00',75000.00),(3,3,3,'2025-11-08 15:00:00','2025-11-08 16:50:00',80000.00),(4,4,4,'2025-11-08 17:30:00','2025-11-08 19:35:00',95000.00),(5,5,5,'2025-11-08 20:00:00','2025-11-08 22:10:00',85000.00),(6,6,1,'2025-11-09 09:30:00','2025-11-09 11:35:00',85000.00),(7,7,2,'2025-11-09 12:30:00','2025-11-09 14:15:00',75000.00),(8,8,3,'2025-11-09 15:00:00','2025-11-09 17:05:00',95000.00),(9,9,4,'2025-11-09 18:00:00','2025-11-09 20:00:00',70000.00),(10,10,5,'2025-11-09 20:30:00','2025-11-09 22:25:00',85000.00);
/*!40000 ALTER TABLE `showtime` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `theater`
--

DROP TABLE IF EXISTS `theater`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `theater` (
  `theater_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `location_id` bigint NOT NULL,
  PRIMARY KEY (`theater_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `theater_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theater`
--

LOCK TABLES `theater` WRITE;
/*!40000 ALTER TABLE `theater` DISABLE KEYS */;
INSERT INTO `theater` VALUES (1,'Dcine Quận 1','135 Hai Bà Trưng, P.Bến Nghé, Q.1',1),(2,'Dcine Bình Thạnh','30 Ung Văn Khiêm, P.25, Q.Bình Thạnh',2),(3,'Dcine Thủ Đức','185 Đặng Văn Bi, Bình Thọ, Thủ Đức, TP. HCM',3),(4,'Dcine Hóc Môn','200 Phan Văn Hớn, Xuân Thới Thượng, Hóc Môn',4),(5,'Dcine Quận 7','101 Tôn Dật Tiên, Tân Phú, Q.7',5),(6,'Dcine Gò Vấp','687 Quang Trung, P.11, Gò Vấp',6),(7,'Dcine Bình Dương','Đại lộ Tự Do, KCN VSIP, Thuận An, Bình Dương',7),(8,'Dcine Vũng Tàu','100 Thùy Vân, P.2, Vũng Tàu',8),(9,'Dcine Hà Đông','110 Trần Phú, Mộ Lao, Hà Đông',9),(10,'Dcine Tây Hồ','55 Thụy Khuê, Tây Hồ',10),(11,'Dcine Đống Đa','88 Chùa Bộc, Đống Đa',11),(12,'Dcine Cầu Giấy','241 Xuân Thủy, Cầu Giấy',12),(13,'Dcine Hải Phòng','115 Lạch Tray, Ngô Quyền, Hải Phòng',13),(14,'Dcine Ninh Bình','35 Trần Hưng Đạo, P.Tân Thành, Ninh Bình',14),(15,'Dcine Bắc Ninh','200 Nguyễn Đăng Đạo, Bắc Ninh',15),(16,'Dcine Hưng Yên','10 Nguyễn Văn Linh, Hưng Yên',16),(17,'Dcine Lào Cai','28 Hoàng Liên, Sapa, Lào Cai',17),(18,'Dcine Thái Nguyên','50 Lương Ngọc Quyến, Thái Nguyên',18),(19,'Dcine Tuyên Quang','115 Bình Thuận, Tuyên Quang',19),(20,'Dcine Phú Thọ','1800 Hùng Vương, Việt Trì, Phú Thọ',20),(21,'Dcine Thanh Hóa','25 Lê Lợi, P.Nguyễn Trãi, Thanh Hóa',21),(22,'Dcine Nghệ An','12 Quang Trung, TP.Vinh, Nghệ An',22),(23,'Dcine Hà Tĩnh','60 Phan Đình Phùng, Hà Tĩnh',23),(24,'Dcine Quảng Trị','25 Quốc lộ 9, Đông Hà, Quảng Trị',24),(25,'Dcine Huế','70 Hùng Vương, TP.Huế',25),(26,'Dcine Đà Nẵng','100 Nguyễn Văn Linh, Đà Nẵng',26),(27,'Dcine Quảng Ngãi','200 Phạm Văn Đồng, Quảng Ngãi',27),(28,'Dcine Gia Lai','50 Hai Bà Trưng, Pleiku, Gia Lai',28),(29,'Dcine Đắk Lắk','10 Nguyễn Tất Thành, BMT, Đắk Lắk',29),(30,'Dcine Khánh Hòa','60 Trần Phú, Nha Trang, Khánh Hòa',30),(31,'Dcine Lâm Đồng','10 Hồ Tùng Mậu, Đà Lạt, Lâm Đồng',31),(32,'Dcine Đồng Nai','100 QL1A, P.Hố Nai, Biên Hòa, Đồng Nai',32),(33,'Dcine Tây Ninh','50 CMT8, P.3, Tây Ninh',33),(34,'Dcine Cần Thơ','1 Nguyễn Trãi, Ninh Kiều, Cần Thơ',34),(35,'Dcine An Giang','30 Tôn Đức Thắng, Long Xuyên, An Giang',35),(36,'Dcine Vĩnh Long','100 QL1A, P.1, Vĩnh Long',36),(37,'Dcine Đồng Tháp','20 Phạm Hữu Lầu, Cao Lãnh, Đồng Tháp',37),(38,'Dcine Cà Mau','50 Phan Ngọc Hiển, P.5, Cà Mau',38);
/*!40000 ALTER TABLE `theater` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher`
--

DROP TABLE IF EXISTS `voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher` (
  `voucher_id` bigint NOT NULL AUTO_INCREMENT,
  `membership_tier_id` bigint DEFAULT NULL,
  `code` varchar(30) NOT NULL,
  `type` enum('PERCENT','AMOUNT') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `min_order` decimal(10,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  PRIMARY KEY (`voucher_id`),
  UNIQUE KEY `code` (`code`),
  KEY `membership_tier_id` (`membership_tier_id`),
  CONSTRAINT `voucher_ibfk_1` FOREIGN KEY (`membership_tier_id`) REFERENCES `membership_tier` (`tier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher`
--

LOCK TABLES `voucher` WRITE;
/*!40000 ALTER TABLE `voucher` DISABLE KEYS */;
INSERT INTO `voucher` VALUES (1,1,'WELCOME10','PERCENT',10.00,'2025-01-01 00:00:00','2025-12-31 00:00:00',100000.00,1000,0),(2,2,'SILVER20K','AMOUNT',20000.00,'2025-01-01 00:00:00','2025-12-31 00:00:00',150000.00,500,0),(3,3,'GOLD15','PERCENT',15.00,'2025-01-01 00:00:00','2025-12-31 00:00:00',200000.00,300,0),(4,NULL,'SUMMER25','PERCENT',25.00,'2025-05-01 00:00:00','2025-08-31 00:00:00',100000.00,200,0),(5,NULL,'MOVIE50K','AMOUNT',50000.00,'2025-03-01 00:00:00','2025-06-30 00:00:00',250000.00,100,0);
/*!40000 ALTER TABLE `voucher` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-11 13:24:13
