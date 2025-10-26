-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: cinema_db
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
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `role` enum('ADMIN','CUSTOMER') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'admin01','$2a$10$G3xHh0FxcDfFiWLOCgIDiOIWfK3KQPaXLAz/z8VpOF2uFT1WINsIe','admin01@cinema.com',NULL,'ACTIVE','ADMIN','2025-10-23 03:10:31'),(2,'john_doe','$2a$10$sS4siUf6Beeax0zrs43Be.E8RQ0Etl4MDK6tMubpyWaArx6TIvV12','john@example.com','0905123456','ACTIVE','CUSTOMER','2025-10-23 03:10:31'),(3,'jane_smith','$2a$10$h9uNBd79hzeN8mYPstD8eegRnFv/nnyACwdRluBBzcFv6My/An40W','jane@example.com','0912345678','ACTIVE','CUSTOMER','2025-10-23 03:10:31'),(4,'mike_nguyen','$2a$10$cPd0o4ZMTC5pncBNnwzHG.KTPrp0jQDeTqMTvqjHVFSA5RkwSRegi','mike@example.com','0987654321','INACTIVE','CUSTOMER','2025-10-23 03:10:31'),(6,'thuc123','$2a$10$z.H871bds8iilv8ndCJS4.FKMZzdTEFNrKkfVN/wPqDAacrFvoUzu','thucthcsll2@gmail.com','0901234567','ACTIVE','CUSTOMER','2025-10-23 07:26:24'),(7,'khuong123','$2a$10$yeIsLeoaBDAg0rlaAPM.p.YjrtCihBgbjOxKcHKhqKbabcHU525k6','khuongcay123@gmail.com',NULL,'ACTIVE','CUSTOMER','2025-10-26 04:11:39'),(8,'khanh123','$2a$10$xYN5Yix3wPItMpPdiG0czO5uAADPRV143dGAJQKmf9Ziftos.drN.','khanhleader123@gmail.com',NULL,'ACTIVE','CUSTOMER','2025-10-26 04:21:13'),(9,'kien123','$2a$10$Pe.6J5Fj50KToVOpM01k7uOeJ0vK6mD4tIiJhIf0Asdz58PCODqqq','kien123@gmail.com',NULL,'ACTIVE','CUSTOMER','2025-10-26 04:59:00');
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
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
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
  `name` varchar(150) DEFAULT NULL,
  `role_type` enum('ACTOR','DIRECTOR') NOT NULL,
  PRIMARY KEY (`cast_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cast_person`
--

LOCK TABLES `cast_person` WRITE;
/*!40000 ALTER TABLE `cast_person` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concession`
--

LOCK TABLES `concession` WRITE;
/*!40000 ALTER TABLE `concession` DISABLE KEYS */;
/*!40000 ALTER TABLE `concession` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `account_id` bigint DEFAULT NULL,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `account_id` (`account_id`),
  CONSTRAINT `fk_customer_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'John Doe','0905123456','1995-07-21',2),(2,'Jane Smith','0912345678','1998-02-14',3),(3,'Mike Nguyen','0987654321','2000-05-10',4),(5,'Nguyễn Minh Thức','0901234567','2002-05-01',6),(6,'Nguyen Minh Khanh',NULL,NULL,8),(7,'Phan Trung Kien',NULL,NULL,9);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genre`
--

LOCK TABLES `genre` WRITE;
/*!40000 ALTER TABLE `genre` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hall`
--

LOCK TABLES `hall` WRITE;
/*!40000 ALTER TABLE `hall` DISABLE KEYS */;
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
  `province` varchar(100) NOT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
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
  `release_date` date DEFAULT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `trailer_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`movie_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie`
--

LOCK TABLES `movie` WRITE;
/*!40000 ALTER TABLE `movie` DISABLE KEYS */;
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
  PRIMARY KEY (`movie_id`,`cast_id`),
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
/*!40000 ALTER TABLE `movie_genre` ENABLE KEYS */;
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
  `status` enum('SUCCESS','FAILED') NOT NULL,
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
  `seat_type_id` bigint NOT NULL,
  PRIMARY KEY (`seat_id`),
  UNIQUE KEY `hall_id` (`hall_id`,`row_label`,`seat_number`),
  KEY `seat_type_id` (`seat_type_id`),
  CONSTRAINT `seat_ibfk_1` FOREIGN KEY (`hall_id`) REFERENCES `hall` (`hall_id`),
  CONSTRAINT `seat_ibfk_2` FOREIGN KEY (`seat_type_id`) REFERENCES `seat_type` (`seat_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seat`
--

LOCK TABLES `seat` WRITE;
/*!40000 ALTER TABLE `seat` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seat_type`
--

LOCK TABLES `seat_type` WRITE;
/*!40000 ALTER TABLE `seat_type` DISABLE KEYS */;
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
  `base_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`showtime_id`),
  UNIQUE KEY `hall_id` (`hall_id`,`start_at`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `showtime_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`),
  CONSTRAINT `showtime_ibfk_2` FOREIGN KEY (`hall_id`) REFERENCES `hall` (`hall_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `showtime`
--

LOCK TABLES `showtime` WRITE;
/*!40000 ALTER TABLE `showtime` DISABLE KEYS */;
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
  KEY `fk_location` (`location_id`),
  CONSTRAINT `fk_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theater`
--

LOCK TABLES `theater` WRITE;
/*!40000 ALTER TABLE `theater` DISABLE KEYS */;
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
  `code` varchar(30) NOT NULL,
  `type` enum('PERCENT','AMOUNT') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `min_order` decimal(10,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  PRIMARY KEY (`voucher_id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher`
--

LOCK TABLES `voucher` WRITE;
/*!40000 ALTER TABLE `voucher` DISABLE KEYS */;
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

-- Dump completed on 2025-10-26 12:27:19
