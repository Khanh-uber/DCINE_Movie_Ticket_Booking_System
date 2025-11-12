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
  `seat_layout_id` bigint NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`hall_id`),
  KEY `theater_id` (`theater_id`),
  KEY `seat_layout_id` (`seat_layout_id`),
  CONSTRAINT `hall_ibfk_1` FOREIGN KEY (`theater_id`) REFERENCES `theater` (`theater_id`),
  CONSTRAINT `hall_ibfk_2` FOREIGN KEY (`seat_layout_id`) REFERENCES `seat_layout` (`seat_layout_id`)
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hall`
--

LOCK TABLES `hall` WRITE;
/*!40000 ALTER TABLE `hall` DISABLE KEYS */;
INSERT INTO `hall` VALUES (1,1,0,'Phòng 1 - DEXP'),(2,1,0,'Phòng 2 - 4DX'),(3,1,0,'Phòng 3 - 3D'),(4,1,0,'Phòng 4 - 2D'),(5,1,0,'Phòng 5 - Standard'),(6,1,0,'Phòng 6 - Standard'),(7,1,0,'Phòng 7 - SUPER CLASS'),(8,2,0,'Phòng 1 - DEXP'),(9,2,0,'Phòng 2 - 3D'),(10,2,0,'Phòng 3 - 2D'),(11,2,0,'Phòng 4 - Standard'),(12,2,0,'Phòng 5 - SUPER CLASS'),(13,3,0,'Phòng 1 - DEXP'),(14,3,0,'Phòng 2 - 3D'),(15,3,0,'Phòng 3 - 2D'),(16,3,0,'Phòng 4 - Standard'),(17,3,0,'Phòng 5 - Standard'),(18,4,0,'Phòng 1 - 2D'),(19,4,0,'Phòng 2 - Standard'),(20,4,0,'Phòng 3 - 3D'),(21,5,0,'Phòng 1 - DEXP'),(22,5,0,'Phòng 2 - 4DX'),(23,5,0,'Phòng 3 - 3D'),(24,5,0,'Phòng 4 - 2D'),(25,5,0,'Phòng 5 - Standard'),(26,5,0,'Phòng 6 - SUPER CLASS'),(27,6,0,'Phòng 1 - DEXP'),(28,6,0,'Phòng 2 - 4DX'),(29,6,0,'Phòng 3 - 3D'),(30,6,0,'Phòng 4 - 2D'),(31,6,0,'Phòng 5 - Standard'),(32,6,0,'Phòng 6 - Standard'),(33,6,0,'Phòng 7 - SUPER CLASS'),(34,7,0,'Phòng 1 - 2D'),(35,7,0,'Phòng 2 - Standard'),(36,7,0,'Phòng 3 - 3D'),(37,8,0,'Phòng 1 - DEXP'),(38,8,0,'Phòng 2 - 3D'),(39,8,0,'Phòng 3 - 2D'),(40,8,0,'Phòng 4 - Standard'),(41,8,0,'Phòng 5 - SUPER CLASS'),(42,9,0,'Phòng 1 - DEXP'),(43,9,0,'Phòng 2 - 4DX'),(44,9,0,'Phòng 3 - 3D'),(45,9,0,'Phòng 4 - 2D'),(46,9,0,'Phòng 5 - Standard'),(47,9,0,'Phòng 6 - Standard'),(48,9,0,'Phòng 7 - SUPER CLASS'),(49,10,0,'Phòng 1 - 3D'),(50,10,0,'Phòng 2 - Standard'),(51,10,0,'Phòng 3 - 2D'),(52,11,0,'Phòng 1 - DEXP'),(53,11,0,'Phòng 2 - 3D'),(54,11,0,'Phòng 3 - 2D'),(55,11,0,'Phòng 4 - Standard'),(56,11,0,'Phòng 5 - SUPER CLASS'),(57,12,0,'Phòng 1 - DEXP'),(58,12,0,'Phòng 2 - 4DX'),(59,12,0,'Phòng 3 - 3D'),(60,12,0,'Phòng 4 - 2D'),(61,12,0,'Phòng 5 - Standard'),(62,12,0,'Phòng 6 - Standard'),(63,12,0,'Phòng 7 - SUPER CLASS'),(64,13,0,'Phòng 1 - DEXP'),(65,13,0,'Phòng 2 - 3D'),(66,13,0,'Phòng 3 - 2D'),(67,13,0,'Phòng 4 - Standard'),(68,13,0,'Phòng 5 - SUPER CLASS'),(69,14,0,'Phòng 1 - 2D'),(70,14,0,'Phòng 2 - Standard'),(71,14,0,'Phòng 3 - 3D'),(72,15,0,'Phòng 1 - 2D'),(73,15,0,'Phòng 2 - Standard'),(74,15,0,'Phòng 3 - 3D'),(75,15,0,'Phòng 4 - SUPER CLASS'),(76,16,0,'Phòng 1 - 2D'),(77,16,0,'Phòng 2 - Standard'),(78,17,0,'Phòng 1 - 2D'),(79,17,0,'Phòng 2 - Standard'),(80,18,0,'Phòng 1 - 3D'),(81,18,0,'Phòng 2 - 2D'),(82,19,0,'Phòng 1 - Standard'),(83,20,0,'Phòng 1 - 2D'),(84,20,0,'Phòng 2 - Standard'),(85,21,0,'Phòng 1 - DEXP'),(86,21,0,'Phòng 2 - 3D'),(87,21,0,'Phòng 3 - 2D'),(88,21,0,'Phòng 4 - Standard'),(89,22,0,'Phòng 1 - 3D'),(90,22,0,'Phòng 2 - 2D'),(91,22,0,'Phòng 3 - Standard'),(92,23,0,'Phòng 1 - 2D'),(93,23,0,'Phòng 2 - Standard'),(94,24,0,'Phòng 1 - Standard'),(95,25,0,'Phòng 1 - 3D'),(96,25,0,'Phòng 2 - 2D'),(97,25,0,'Phòng 3 - Standard'),(98,25,0,'Phòng 4 - SUPER CLASS'),(99,26,0,'Phòng 1 - DEXP'),(100,26,0,'Phòng 2 - 4DX'),(101,26,0,'Phòng 3 - 3D'),(102,26,0,'Phòng 4 - 2D'),(103,26,0,'Phòng 5 - Standard'),(104,26,0,'Phòng 6 - Standard'),(105,26,0,'Phòng 7 - SUPER CLASS'),(106,27,0,'Phòng 1 - 3D'),(107,27,0,'Phòng 2 - 2D'),(108,27,0,'Phòng 3 - Standard'),(109,27,0,'Phòng 4 - SUPER CLASS'),(110,28,0,'Phòng 1 - 3D'),(111,28,0,'Phòng 2 - 2D'),(112,28,0,'Phòng 3 - Standard'),(113,28,0,'Phòng 4 - SUPER CLASS'),(114,29,0,'Phòng 1 - 3D'),(115,29,0,'Phòng 2 - 2D'),(116,29,0,'Phòng 3 - Standard'),(117,29,0,'Phòng 4 - SUPER CLASS'),(118,30,0,'Phòng 1 - DEXP'),(119,30,0,'Phòng 2 - 3D'),(120,30,0,'Phòng 3 - 2D'),(121,30,0,'Phòng 4 - Standard'),(122,30,0,'Phòng 5 - SUPER CLASS'),(123,31,0,'Phòng 1 - 3D'),(124,31,0,'Phòng 2 - 2D'),(125,31,0,'Phòng 3 - Standard'),(126,31,0,'Phòng 4 - SUPER CLASS'),(127,32,0,'Phòng 1 - 3D'),(128,32,0,'Phòng 2 - 2D'),(129,32,0,'Phòng 3 - Standard'),(130,32,0,'Phòng 4 - SUPER CLASS'),(131,33,0,'Phòng 1 - 2D'),(132,33,0,'Phòng 2 - Standard'),(133,34,0,'Phòng 1 - DEXP'),(134,34,0,'Phòng 2 - 4DX'),(135,34,0,'Phòng 3 - 3D'),(136,34,0,'Phòng 4 - 2D'),(137,34,0,'Phòng 5 - Standard'),(138,34,0,'Phòng 6 - Standard'),(139,34,0,'Phòng 7 - SUPER CLASS'),(140,35,0,'Phòng 1 - 3D'),(141,35,0,'Phòng 2 - 2D'),(142,35,0,'Phòng 3 - Standard'),(143,36,0,'Phòng 1 - 3D'),(144,36,0,'Phòng 2 - 2D'),(145,36,0,'Phòng 3 - Standard'),(146,36,0,'Phòng 4 - SUPER CLASS'),(147,37,0,'Phòng 1 - 3D'),(148,37,0,'Phòng 2 - 2D'),(149,37,0,'Phòng 3 - Standard'),(150,37,0,'Phòng 4 - SUPER CLASS'),(151,38,0,'Phòng 1 - 3D'),(152,38,0,'Phòng 2 - 2D'),(153,38,0,'Phòng 3 - Standard'),(154,38,0,'Phòng 4 - SUPER CLASS');
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
  `original_title` varchar(150) NOT NULL,
  `synopsis` text,
  `duration_min` int DEFAULT NULL,
  `rating` varchar(10) DEFAULT NULL,
  `age_limit` varchar(50) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `end_showing_date` date DEFAULT NULL,
  `early_screening_date` date DEFAULT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `banner_url` varchar(255) DEFAULT NULL,
  `trailer_url` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `status` enum('soon','now','ended') DEFAULT 'soon',
  `language` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`movie_id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie`
--

LOCK TABLES `movie` WRITE;
/*!40000 ALTER TABLE `movie` DISABLE KEYS */;
INSERT INTO `movie` VALUES (1,'TEE YOD: Quỷ Ăn Tạng Phần 3','ธี่หยด 3','Tiếp nối mạch phim kinh dị Thái Lan ăn khách, phần 3 đưa gia đình Yak trở lại đối mặt với thế lực tà ác mới. Khi cô em út Yee bị thế lực quỷ dữ bí ẩn bắt cóc, Yak và những người bạn buộc phải dấn thân vào một hành trình tuyệt vọng để giải cứu cô. Cuộc tìm kiếm dẫn họ đến Bong Sa Noh Bian — một khu rừng bị ma ám đầy rẫy những bí mật đen tối và linh hồn báo thù. Tại đây, họ không chỉ chiến đấu với những sinh vật siêu nhiên mà còn phải đối mặt với nguồn gốc của linh hồn Hắc ám. Sự sinh tồn trở thành cuộc chiến chống lại những thế lực vượt ngoài tầm kiểm soát của con người.',104,'8.2','T16 (Từ đủ 16 tuổi trở lên)','2025-10-10','2025-11-20','2025-10-08','/assets/images/movies/tee_yod_quy_an_tang_phan_3/poster_doc.jpg','/assets/images/movies/tee_yod_quy_an_tang_phan_3/poster_ngang.jpg','https://youtu.be/DXV3x2Htbyg?si=sb8URmHmGf2CWVVw',1,'now','Tiếng Thái | Phụ đề Tiếng Việt'),(2,'Cục Vàng Của Ngoại','Cục Vàng Của Ngoại','Phim khai thác chủ đề tình cảm gia đình ấm áp nhưng cũng đầy những day dứt giữa bà và cháu. Thông qua những lát cắt đời thường, bộ phim gợi cho người xem những ký ức về ông bà, cha mẹ và chính mình. Mỗi diễn viên, đặc biệt là Việt Hương và Hồng Đào, đều bùng nổ cảm xúc, mang đến một món quà tình cảm nhẹ nhàng mà rưng rức cho khán giả.',119,'8.0','T13 (Từ đủ 13 tuổi trở lên)','2025-10-17','2025-11-27','2025-10-12','/assets/images/movies/cuc_vang_cua_ngoai/poster_doc.jpg','/assets/images/movies/cuc_vang_cua_ngoai/poster_ngang.jpg','https://youtu.be/_cj77qa_wMc?si=N6ONr9MfZmjNnkhr',1,'now','Tiếng Việt | Phụ đề Tiếng Anh'),(3,'Nhà Ma Xó','Nhà Ma Xó','Phim xoay quanh gia đình bà Hiền, người mẹ đơn thân nuôi ba người con sau tai nạn của chồng. Mọi chuyện kỳ quái bắt đầu khi người con trai giữa vớt được một chiếc khạp sành đậy kín nắp khi đang thả lưới bắt cá dưới sông. Từ đó, hàng loạt hiện tượng bí ẩn, rùng rợn liên tiếp xảy ra, làm rạn nứt các mối quan hệ trong gia đình và dần hé lộ những bí mật động trời bị chôn giấu từ lâu.',108,'8.0','T16 (Từ đủ 16 tuổi trở lên)','2025-10-24','2025-12-04','2025-10-22','/assets/images/movies/nha_ma_xo/poster_doc.jpg','/assets/images/movies/nha_ma_xo/poster_ngang.jpg','https://youtu.be/ZEq0D-Y0VeU?si=bdGOVAfAhJyRYNGe',1,'now','Tiếng Việt | Phụ đề Tiếng Anh'),(4,'Phá Đám Sinh Nhật Mẹ','Phá Đám Sinh Nhật Mẹ','Y Đức - một người con trai bất hiếu đang bị giang hồ đe dọa. Trong lúc túng quẫn, anh nảy ra một kế hoạch điên rồ: tổ chức đám ma giả cho chính mẹ mình để lừa tiền bảo hiểm. Tuy nhiên, kế hoạch này liên tục bị \"phá đám\" bởi hàng loạt những vị khách không mời và những tình huống dở khóc dở cười. Trớ trêu thay, ngày anh đưa mẹ vào hòm lại chính là ngày sinh nhật lần thứ 60 của bà.',91,'7.8','T16 (Từ đủ 16 tuổi trở lên)','2025-10-31','2025-12-11','2025-10-27','/assets/images/movies/pha_dam_sinh_nhat_me/poster_doc.jpg','/assets/images/movies/pha_dam_sinh_nhat_me/poster_ngang.jpg','https://youtu.be/auO0QxMjTlc?si=k8hCvuxead91UzaW',1,'now','Tiếng Việt | Phụ đề Tiếng Anh'),(5,'Cải Mã','Cải Mã','Đại gia đình ông Quang, những người trở về quê để thực hiện nghi lễ cải táng (bốc mộ) đã bị trì hoãn quá lâu. Tưởng chừng đây chỉ là một nghĩa vụ hậu sự bình thường, nhưng việc làm này vô tình khơi dậy vòng xoáy nghiệp báo truyền đời và những bí mật đen tối bị chôn vùi. Hàng loạt tai ương và hiện tượng bí ẩn liên tục giáng xuống các thành viên trong gia đình, đẩy họ vào sự sợ hãi tột độ.',115,'8.6','T16 (Từ đủ 16 tuổi trở lên)','2025-10-31','2025-12-11','2025-10-28','/assets/images/movies/cai_ma/poster_doc.jpg','/assets/images/movies/cai_ma/poster_ngang.jpg','https://youtu.be/KxvLXJqFCPY?si=_B4HuIY_0IUYx9ZO',1,'now','Tiếng Việt | Phụ đề Tiếng Anh'),(6,'Bí Mật Sau Bữa Tiệc','Anniversary','Bộ phim mở đầu bằng bữa tiệc kỷ niệm 25 năm ngày cưới ấm áp của Ellen và Paul Taylor, nhưng mọi thứ nhanh chóng rạn nứt khi con trai họ giới thiệu vị hôn thê mới là Liz. Liz, một cựu sinh viên có tư tưởng cực đoan của Ellen, mang theo một phong trào chính trị gây tranh cãi tên là \"Sự Thay Đổi\" (The Change) xâm nhập vào gia đình. Xuyên suốt năm năm đầy biến động, bộ phim phơi bày những rạn nứt thế hệ, sự đấu đá quyền lực và những phản bội riêng tư khi lòng trung thành của các thành viên gia đình bị thử thách bởi bối cảnh chính trị ngày càng hỗn loạn và độc đoán của đất nước. ',112,'7.6','T18 (Từ đủ 18 tuổi trở lên)','2025-10-31','2025-12-11','2025-10-28','/assets/images/movies/bi_mat_sau_bua_tiec/poster_doc.jpg','/assets/images/movies/bi_mat_sau_bua_tiec/poster_ngang.jpg','https://youtu.be/kW4sYsN1_cc?si=6YXhuGXOPEsARdRx',1,'now','Tiếng Anh | Phụ đề Tiếng Việt'),(7,'Bịt Mắt Bắt Nai','Bịt Mắt Bắt Nai','Một nhóm bạn trẻ vô tình dấn thân vào trò chơi sinh tồn đầy ám ảnh sau khi bước vào một ngôi nhà bí ẩn. Khi trò chơi \"bịt mắt\" không còn là trò đùa, mỗi bước đi sai lầm đều phải trả giá bằng máu và nước mắt. Tình bạn, tình yêu và lòng thù hận đan xen, đẩy các nhân vật vào những lựa chọn sinh tử.',92,'7.5','T16 (Từ đủ 16 tuổi trở lên)','2025-10-31','2025-12-11','2025-10-29','/assets/images/movies/bit_mat_bat_nai/poster_doc.jpg','/assets/images/movies/bit_mat_bat_nai/poster_ngang.jpg','https://youtu.be/AVm6gVRaOQE?si=0UBBnQy9h9hzq3rp',1,'now','Tiếng Việt | Phụ đề Tiếng Anh'),(8,'Điện Thoại Đen 2','The Black Phone 2','Bốn năm sau khi thoát khỏi tên sát nhân hàng loạt The Grabber, Finney Blake và cô em gái có năng lực ngoại cảm Gwen đang cố gắng cân bằng lại cuộc sống bình thường của mình. Tuy nhiên, ký ức kinh hoàng vẫn ám ảnh họ. Mọi chuyện chưa dừng lại khi Gwen bắt đầu gặp những giấc mơ khủng khiếp và nhận được các cuộc gọi bí ẩn từ một chiếc điện thoại đen không dây, liên quan đến những vụ mất tích mới tại khu cắm trại hồ Alpine. Để tìm ra sự thật và chấm dứt chuỗi bi kịch, hai anh em buộc phải đối mặt với sự trở lại đầy thù hận của linh hồn The Grabber, kẻ thề sẽ trả thù Finney vì đã kết liễu mạng sống của hắn ở phần trước. ',114,'8.6','T18 (Từ đủ 18 tuổi trở lên)','2025-10-31','2025-12-11','2025-10-29','/assets/images/movies/dien_thoai_den_2/poster_doc.jpg','/assets/images/movies/dien_thoai_den_2/poster_ngang.jpg','https://youtu.be/K4Ml_YDwfoU?si=sH0damf21UmYmt8n',1,'now','Tiếng Anh | Phụ đề Tiếng Việt'),(9,'Trái Tim Què Quặt','Trái Tim Què Quặt','Phim được lấy cảm hứng từ tiểu thuyết kinh điển À Cloche Coeur của nhà văn Pháp Catherine Arley, và xoay quanh một vụ án mạng tàn bạo làm chấn động thị trấn yên bình Đà Lạt. Khi thi thể người phụ nữ bị sát hại dã man được phát hiện, mọi nghi ngờ đổ dồn vào Sơn, người được cho là tình nhân của nạn nhân. Bên cạnh Sơn là Triết, anh trai anh và một nhà điêu khắc danh tiếng. Câu chuyện về những tình yêu méo mó, sự chiếm hữu và thao túng, liệu một tình yêu tưởng chừng hoàn hảo có thể che giấu những góc khuất đáng sợ nào không? ',102,'8.2','T18 (Từ đủ 18 tuổi trở lên)','2025-11-07','2025-12-18','2025-11-01','/assets/images/movies/trai_tim_que_quat/poster_doc.jpg','/assets/images/movies/trai_tim_que_quat/poster_ngang.jpg','https://youtu.be/iMjjqsP9_nk?si=lH7b209c5hJd715A',1,'now','Tiếng Việt | Phụ đề Tiếng Anh'),(10,'Tình Người Duyên Ma','Nak Rak Mak','Lấy cảm hứng từ truyền thuyết dân gian Thái Lan về hồn ma Mae Nak, Tình Người Duyên Ma: Nhắm \"Mak\" Yêu Luôn kể câu chuyện tình vượt thời gian giữa nàng Nak và chàng Mak. Xuyên không đến 200 năm sau, Nak bất ngờ được vào vai nữ chính trong chính bộ phim về truyền thuyết của mình. Tình cờ thay, vai nam chính lại được thủ bởi Mak - lúc này đã là một nam diễn viên nổi tiếng toàn quốc. Ở đây, Nak phải chinh phục lại trái tim Mak trong vòng 30 ngày mà không được dùng đến ma lực, để có thể ở bên anh trọn đời trọn kiếp.',104,'8.7','T13 (Từ đủ 13 tuổi trở lên)','2025-11-07','2025-12-18','2025-11-05','/assets/images/movies/tinh_nguoi_duyen_ma/poster_doc.jpg','/assets/images/movies/tinh_nguoi_duyen_ma/poster_ngang.jpg','https://youtu.be/TpUvaW2ymeg?si=A6jdTCUr-R7ncon7',1,'now','Tiếng Thái | Phụ đề Tiếng Việt'),(11,'Thai Chiêu Tài','Thai Chiêu Tài','Một nhóm bạn trẻ, vì nợ nần và túng quẫn, đã tìm đến một thầy bùa để thỉnh \"Thai Chiêu Tài\" – một loại bùa ngải được cho là mang lại sự giàu có nhanh chóng. Tuy nhiên, sự giàu có không đến dễ dàng khi họ phải đối mặt với những lời nguyền rùng rợn và thế lực tà ác đi kèm với bùa ngải. Họ bị cuốn vào một vòng xoáy của sự sợ hãi, phải tìm mọi cách để thoát khỏi sự đeo bám của linh hồn quỷ dữ và bảo vệ mạng sống của mình.',104,'8.2','T18 (Từ đủ 18 tuổi trở lên)','2025-11-07','2025-12-18','2025-11-03','/assets/images/movies/thai_chieu_tai/poster_doc.jpg','/assets/images/movies/thai_chieu_tai/poster_ngang.jpg','https://youtu.be/4QLv7aJq1Wg?si=c9td6U9QRjNkx-Lk',1,'now','Tiếng Việt | Phụ đề Tiếng Anh'),(12,'Quái Thú Vô Hình: Vùng Đất Chết Chóc','Predator: Badlands','Dek, một chiến binh Predator trẻ tuổi bị ruồng bỏ, dấn thân vào hành trình săn lùng một sinh vật nguy hiểm trên hành tinh Genna để khôi phục danh dự. Anh tình cờ gặp Thia, một người máy bị hư hại của tập đoàn Weyland-Yutani, và họ buộc phải hợp tác để sinh tồn. Cả hai không chỉ đối mặt với kẻ thù tối thượng mà còn phải chống lại các mối đe dọa từ hành tinh khắc nghiệt và lực lượng truy đuổi của con người.',107,'8.8','T16 (Từ đủ 16 tuổi trở lên)','2025-11-07','2025-12-18','2025-11-04','/assets/images/movies/quai_thu_vo_hinh_vung_dat_chet_choc/poster_doc.jpg','/assets/images/movies/quai_thu_vo_hinh_vung_dat_chet_choc/poster_ngang.jpg','https://youtu.be/AzBi73ddou4?si=8UW6wY8PeQAa8pqB',1,'now','Tiếng Anh | Phụ đề Tiếng Việt'),(13,'Lọ Lem Chơi Ngải','Kitab Sijjin & Illiyyin','Yuli, một cô gái mồ côi phải sống như người hầu trong gia đình Ambar và chịu đựng sự sỉ nhục suốt nhiều năm. Quá uất hận, Yuli quyết tâm trả thù bằng cách tàn nhẫn nhất: tìm đến thầy pháp yểm bùa hắc ám để hủy hoại từng thành viên trong gia đình Ambar. Cô thực hiện một nghi lễ ghê rợn là ghi tên những người bị nguyền rủa lên xác chết vừa qua đời. Tuy nhiên, Yuli có một tuần để hoàn tất giao kèo với quỷ dữ, nếu không sẽ phải gánh chịu hậu quả khủng khiếp, đẩy cô vào vòng xoáy sinh tử đầy rùng rợn. ',98,'8.1','T18 (Từ đủ 18 tuổi trở lên)','2025-11-07','2025-12-18','2025-11-05','/assets/images/movies/lo_lem_choi_ngai/poster_doc.jpg','/assets/images/movies/lo_lem_choi_ngai/poster_ngang.jpg','https://youtu.be/T6ty2iYxeT4?si=xlXBWoyFeKR_-HnM',1,'now','Tiếng Indonesia | Phụ đề Tiếng Việt'),(14,'Trốn Chạy Tử Thần','The Running Man','Lấy bối cảnh tương lai hỗn loạn, Ben Richards, một người cha túng quẫn, tuyệt vọng tìm tiền cứu con gái bệnh nặng. Không còn cách nào khác, Ben buộc phải tham gia vào \"The Running Man\" – một trò chơi sinh tử đẫm máu phát sóng trực tiếp toàn quốc. Anh trở thành con mồi bị săn đuổi bởi những \"thợ săn\" chuyên nghiệp. Cuộc trốn chạy của anh dần biến thành một cuộc chiến chống lại sự thao túng truyền thông và xã hội độc hại.',NULL,'0',NULL,'2025-11-14','2025-12-25','2025-11-11','/assets/images/movies/tron_chay_tu_than/poster_doc.jpg','/assets/images/movies/tron_chay_tu_than/poster_ngang.jpg','https://youtu.be/A0HOepo6xQI?si=Vye5CeoQ6Cq_w3tI',1,'soon','Tiếng Anh | Phụ đề Tiếng Việt'),(15,'Truy Tìm Long Diên Hương','Truy Tìm Long Diên Hương','Một nhóm người với những tính cách khác biệt tình cờ đụng độ và phải hợp tác trong một phi vụ bất đắc dĩ. Mục tiêu của họ là truy tìm Long Diên Hương, một loại báu vật quý giá và cực hiếm được mệnh danh là \"vàng nổi\". Hành trình tìm kiếm đầy rẫy những tình huống dở khóc dở cười, những pha hành động kịch tính và những âm mưu bất ngờ.',103,'0','T16 (Từ đủ 16 tuổi trở lên)','2025-11-14','2025-12-25','2025-11-10','/assets/images/movies/truy_tim_long_dien_huong/poster_doc.jpg','/assets/images/movies/truy_tim_long_dien_huong/poster_ngang.jpg','https://youtu.be/-wmBoUIJ9uo?si=PGlY2d7zYWRfbcOO',1,'soon','Tiếng Việt | Phụ đề Tiếng Anh'),(16,'G-Dragon In Cinema','G-DRAGON IN CINEMA [Übermensch]','\"G-Dragon In Cinema\" là một bộ phim tài liệu âm nhạc Hàn Quốc ghi lại hành trình lưu diễn thế giới \"ACT III, M.O.T.T.E.\" của nghệ sĩ G-Dragon (Kwon Ji-yong). Với tiêu đề phụ [Übermensch], bộ phim khám phá sâu sắc hai mặt con người anh: G-Dragon hào nhoáng trên sân khấu và Kwon Ji-yong đời thường, nội tâm. Khán giả được chứng kiến những khoảnh khắc biểu diễn bùng nổ cùng những thước phim hậu trường chân thực, gần gũi.',103,'8.5','T13 (Từ đủ 13 tuổi trở lên)','2025-11-11','2025-12-22','2025-11-09','/assets/images/movies/g_dragon_in_cinema/poster_doc.jpg','/assets/images/movies/g_dragon_in_cinema/poster_ngang.jpg','https://youtu.be/r9dVQC_UjBo?si=Ry864i8j3--94z1J',1,'now','Tiếng Hàn | Phụ đề Tiếng Việt'),(17,'Bẫy Tiền','Bẫy Tiền','Phim xoay quanh Đăng Thức - một nhân viên tài chính tưởng chừng có cuộc sống ổn định, bỗng chốc bị cuốn vào một vòng xoáy nguy hiểm. Mọi chuyện bắt đầu từ một vụ lừa đảo qua điện thoại bất ngờ ập đến, khiến cuộc sống của anh đảo lộn. Đăng Thức phải đối mặt với những lựa chọn khó khăn giữa tiền bạc, tình thân và niềm tin, nơi mỗi quyết định đều phải đánh đổi bằng chính những người anh yêu thương.',NULL,'0',NULL,'2025-11-21','2026-01-01','2025-11-18','/assets/images/movies/bay_tien/poster_doc.jpg','/assets/images/movies/bay_tien/poster_ngang.jpg','https://youtu.be/0wuVwkK-Vsc?si=e4WvUPwUPqJaUpwn',1,'soon','Tiếng Việt | Phụ đề Tiếng Anh'),(18,'Phi Vụ Động Trời 2','Zootopia 2','\"Phi Vụ Động Trời 2\" (Zootopia 2) tiếp tục câu chuyện về cặp đôi cảnh sát thỏ Judy Hopps và cáo Nick Wilde, những người đã trở thành cộng sự chính thức tại Sở Cảnh sát Zootopia. Mối quan hệ hợp tác của họ đối mặt với thử thách mới khi một con rắn bí ẩn tên Gary De\'Snake xuất hiện, gây náo loạn thành phố. Để phá án, Judy và Nick buộc phải thâm nhập vào những khu vực hoàn toàn mới của Zootopia, bao gồm cả Chợ Đầm lầy (Marsh Market), và làm việc bí mật để điều tra một âm mưu lớn hơn.',120,'0',NULL,'2025-11-26','2026-01-06','2025-11-22','/assets/images/movies/phi_vu_dong_troi_2/poster_doc.jpg','/assets/images/movies/phi_vu_dong_troi_2/poster_ngang.jpg','https://youtu.be/EutV2x9GEZo?si=1sKRDXkpUXwyukGr',1,'soon','Tiếng Anh | Phụ đề Tiếng Việt'),(19,'Phòng Trọ Ma Bầu','Phòng Trọ Ma Bầu','Hai người bạn thân thuê một căn phòng trọ cũ kỹ, nơi liên tục xảy ra những hiện tượng kỳ bí. Trong hành trình tìm hiểu sự thật, họ đối mặt với hồn ma của một người phụ nữ mang thai – \"ma bầu\". Ẩn sau nỗi ám ảnh rùng rợn là một bi kịch và câu chuyện cảm động về tình yêu mẫu tử thiêng liêng, nơi sự hy sinh của người mẹ trở thành sợi dây kết nối những thế hệ.',120,'0',NULL,'2025-11-28','2026-01-08','2025-11-25','/assets/images/movies/phong_tro_ma_bau/poster_doc.jpg','/assets/images/movies/phong_tro_ma_bau/poster_ngang.jpg','https://youtu.be/jgZM5IhnzDA?si=QKyRFWWiJAO1TT4a',1,'soon','Tiếng Việt | Phụ đề Tiếng Anh'),(20,'Hoàng Tử Quỷ','Hoàng Tử Quỷ','Thân Đức - một hoàng tử được sinh ra nhờ tà thuật, mang trong mình tham vọng trở thành Quỷ Xương Cuồng. Sau khi trốn thoát khỏi cung cấm, Thân Đức tìm cách giải thoát Quỷ Xương Cuồng khỏi Ải Mắt Người để khôi phục giáo phái hắc ám. Để ngăn chặn âm mưu này, một nhóm người phải đối đầu với thế lực tà thuật và tham vọng đẫm máu của kẻ nửa người nửa quỷ. ',NULL,'0',NULL,'2025-12-05','2026-01-15','2025-12-01','/assets/images/movies/hoang_tu_quy/poster_doc.jpg','/assets/images/movies/hoang_tu_quy/poster_ngang.jpg','https://youtu.be/Qzymh0WVyN8?si=-tGoQp2pYnLSAtju',1,'soon','Tiếng Việt | Phụ đề Tiếng Anh'),(21,'Năm Đêm Kinh Hoàng 2','Five Nights at Freddy\'s 2','Phim lấy bối cảnh một năm sau cơn ác mộng siêu nhiên tại tiệm Pizza Freddy Fazbear. Cựu nhân viên bảo vệ Mike cố gắng giữ bí mật về số phận những con thú máy khỏi cô em gái Abby 11 tuổi. Tuy nhiên, Abby lén ra ngoài để gặp lại Freddy, Bonnie, Chica và Foxy, vô tình khơi mào hàng loạt sự kiện kinh hoàng mới. Bộ phim hé lộ những bí mật đen tối về nguồn gốc thật sự của Freddy Fazbear\'s Pizza.',120,'0',NULL,'2025-12-05','2026-01-15','2025-12-02','/assets/images/movies/nam_dem_kinh_hoang_2/poster_doc.jpg','/assets/images/movies/nam_dem_kinh_hoang_2/poster_ngang.jpg','https://youtu.be/HccJNOYMBjM?si=pscIV4qWv7fHceSK',1,'soon','Tiếng Anh | Phụ đề Tiếng Việt'),(22,'Nhà \"Hai\" Chủ','Nhà \"Hai\" Chủ','Một cặp vợ chồng mua một căn nhà mới, tưởng chừng đây là khởi đầu cho cuộc sống yên ổn, hạnh phúc. Tuy nhiên, sự xuất hiện của họ tại ngôi nhà này lại khơi mào cho một \"cuộc chiến không hồi kết\". Sau những bức tường lạnh lẽo của căn nhà ẩn chứa vô số bí mật oan trái và những câu chuyện chưa được hé lộ về \"chủ cũ\" và \"chủ mới\". Bộ phim đào sâu vào những rạn nứt gia đình căng thẳng và thông điệp về việc giữ gìn những giá trị truyền thống để tìm kiếm sự bình an trong cuộc sống hiện đại.',NULL,'0',NULL,'2025-12-05','2026-01-15','2025-12-02','/assets/images/movies/nha_hai_chu/poster_doc.jpg','/assets/images/movies/nha_hai_chu/poster_ngang.jpg','https://youtu.be/ZZZUfZzX0ZU?si=xRMQa03E8Zax0108',1,'soon','Tiếng Việt | Phụ đề Tiếng Anh'),(23,'Avatar 3: Lửa Và Tro Tàn','Avatar 3: Fire and Ash','“Avatar 3: Lửa Và Tro Tàn” tiếp tục câu chuyện gia đình Sully và hành trình khám phá Pandora. Phần phim giới thiệu \"Tộc Lửa\", một bộ lạc Na\'vi hung dữ sống ở vùng núi lửa, mang đến khía cạnh đen tối hơn cho thế giới này. Jake và Neytiri phải đối mặt với những thách thức mới khi đạo diễn James Cameron hứa hẹn sẽ \"đảo ngược tình thế\" và mở rộng đáng kể vũ trụ Na\'vi.',NULL,'0',NULL,'2025-12-19','2026-01-29','2025-12-13','/assets/images/movies/avatar_3_lua_va_tro_tan/poster_doc.jpg','/assets/images/movies/avatar_3_lua_va_tro_tan/poster_ngang.jpg','https://youtu.be/nb_fFj_0rq8?si=gNKJvIbJP3NymfFS',1,'soon','Tiếng Anh | Phụ đề Tiếng Việt'),(24,'Đồi Gió Hú','Wuthering Heights','Câu chuyện về tình yêu mãnh liệt nhưng đầy hủy diệt giữa Heathcliff và Catherine Earnshaw. Tình yêu của họ bị chia cắt bởi định kiến giai cấp, khiến Heathcliff trở về với dã tâm trả thù tàn khốc. Bản phim này hứa hẹn giữ nguyên sự hỗn loạn cảm xúc nguyên thủy của tác phẩm gốc nhưng thêm thắt yếu tố kinh dị Gothic.',NULL,'0',NULL,'2026-03-13','2026-04-23','2026-03-05','/assets/images/movies/doi_gio_hu/poster_doc.jpg','/assets/images/movies/doi_gio_hu/poster_ngang.jpg','https://youtu.be/TjAJ7cOjwjg?si=OEUP3OR4lWQQMTxo',1,'soon','Tiếng Anh | Phụ đề Tiếng Việt');
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
-- Table structure for table `room_type`
--

DROP TABLE IF EXISTS `room_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_type` (
  `room_type_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  PRIMARY KEY (`room_type_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_type`
--

LOCK TABLES `room_type` WRITE;
/*!40000 ALTER TABLE `room_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `room_type` ENABLE KEYS */;
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
-- Table structure for table `seat_layout`
--

DROP TABLE IF EXISTS `seat_layout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seat_layout` (
  `seat_layout_id` bigint NOT NULL AUTO_INCREMENT,
  `room_type_id` bigint NOT NULL,
  `name` varchar(50) NOT NULL,
  `capacity` int NOT NULL,
  PRIMARY KEY (`seat_layout_id`),
  KEY `room_type_id` (`room_type_id`),
  CONSTRAINT `seat_layout_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_type` (`room_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seat_layout`
--

LOCK TABLES `seat_layout` WRITE;
/*!40000 ALTER TABLE `seat_layout` DISABLE KEYS */;
/*!40000 ALTER TABLE `seat_layout` ENABLE KEYS */;
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

-- Dump completed on 2025-11-12 22:42:07
