create database dcine_cinema;
use dcine_schema;
CREATE TABLE `account` (
  `account_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `membership_tier_id` bigint DEFAULT null,
  `username` varchar(50) UNIQUE NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) UNIQUE DEFAULT null,
  `phone` varchar(20) UNIQUE DEFAULT null,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `role` enum('ADMIN','CUSTOMER') NOT NULL,
  `loyalty_points` int DEFAULT 0,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `membership_tier` (
  `tier_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(50) UNIQUE NOT NULL,
  `description` text DEFAULT null,
  `min_spending` decimal(10,2) DEFAULT null,
  `discount_percent` decimal(5,2) DEFAULT 0,
  `point_multiplier` decimal(5,2) DEFAULT 1,
  `last_update` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `customer` (
  `customer_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT null,
  `dob` date DEFAULT null
);

CREATE TABLE `theater` (
  `theater_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `address` varchar(255) DEFAULT null,
  `location_id` bigint NOT NULL
);

CREATE TABLE `location` (
  `location_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `city_name` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL
);

CREATE TABLE `hall` (
  `hall_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `theater_id` bigint NOT NULL,
  `name` varchar(50) NOT NULL,
  `capacity` int NOT NULL
);

CREATE TABLE `seat_type` (
  `seat_type_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `price_multiplier` decimal(5,2) DEFAULT 1
);

CREATE TABLE `seat` (
  `seat_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `hall_id` bigint NOT NULL,
  `row_label` varchar(5) NOT NULL,
  `seat_number` int NOT NULL,
  `seat_type_id` bigint
);

CREATE TABLE `movie` (
  `movie_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `synopsis` text DEFAULT null,
  `duration_min` int DEFAULT null,
  `rating` varchar(10) DEFAULT null,
  `release_date` date DEFAULT null,
  `poster_url` varchar(255) DEFAULT null,
  `trailer_url` varchar(255) DEFAULT null
);

CREATE TABLE `genre` (
  `genre_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(50) UNIQUE NOT NULL
);

CREATE TABLE `movie_genre` (
  `movie_id` bigint NOT NULL,
  `genre_id` bigint NOT NULL,
  PRIMARY KEY (`movie_id`, `genre_id`)
);

CREATE TABLE `cast_person` (
  `cast_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role_type` enum('ACTOR','DIRECTOR') NOT NULL
);

CREATE TABLE `movie_cast` (
  `movie_id` bigint NOT NULL,
  `cast_id` bigint NOT NULL
);

CREATE TABLE `showtime` (
  `showtime_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `movie_id` bigint NOT NULL,
  `hall_id` bigint NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `base_price` decimal(10,2) NOT NULL
);

CREATE TABLE `booking` (
  `booking_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `account_id` bigint NOT NULL,
  `showtime_id` bigint NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','PAID','CANCELLED') DEFAULT 'PENDING',
  `qr_code` varchar(255) DEFAULT null,
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `booking_seat` (
  `booking_id` bigint NOT NULL,
  `seat_id` bigint NOT NULL,
  `price_at_booking` decimal(10,2) NOT NULL,
  PRIMARY KEY (`booking_id`, `seat_id`)
);

CREATE TABLE `payment` (
  `payment_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `booking_id` bigint UNIQUE NOT NULL,
  `method` enum('CARD','MOMO','ZALOPAY') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `provider_txn_id` varchar(100) DEFAULT null,
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL,
  `paid_at` datetime DEFAULT null
);

CREATE TABLE `voucher` (
  `voucher_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `membership_tier_id` bigint DEFAULT null,
  `code` varchar(30) UNIQUE NOT NULL,
  `type` enum('PERCENT','AMOUNT') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `start_at` datetime DEFAULT null,
  `end_at` datetime DEFAULT null,
  `min_order` decimal(10,2) DEFAULT null,
  `usage_limit` int DEFAULT null,
  `used_count` int DEFAULT 0
);

CREATE TABLE `booking_voucher` (
  `booking_id` bigint NOT NULL,
  `voucher_id` bigint NOT NULL,
  `discount_applied` decimal(10,2) DEFAULT null,
  PRIMARY KEY (`booking_id`, `voucher_id`)
);

CREATE TABLE `concession` (
  `concession_id` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL
);

CREATE TABLE `booking_concession` (
  `booking_id` bigint NOT NULL,
  `concession_id` bigint NOT NULL,
  `qty` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`booking_id`, `concession_id`)
);

ALTER TABLE `account` ADD FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`);

ALTER TABLE `account` ADD FOREIGN KEY (`membership_tier_id`) REFERENCES `membership_tier` (`tier_id`);

ALTER TABLE `theater` ADD FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`);

ALTER TABLE `hall` ADD FOREIGN KEY (`theater_id`) REFERENCES `theater` (`theater_id`);

ALTER TABLE `seat` ADD FOREIGN KEY (`hall_id`) REFERENCES `hall` (`hall_id`);

ALTER TABLE `seat` ADD FOREIGN KEY (`seat_type_id`) REFERENCES `seat_type` (`seat_type_id`);

ALTER TABLE `movie_genre` ADD FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`);

ALTER TABLE `movie_genre` ADD FOREIGN KEY (`genre_id`) REFERENCES `genre` (`genre_id`);

ALTER TABLE `movie_cast` ADD FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`);

ALTER TABLE `movie_cast` ADD FOREIGN KEY (`cast_id`) REFERENCES `cast_person` (`cast_id`);

ALTER TABLE `showtime` ADD FOREIGN KEY (`movie_id`) REFERENCES `movie` (`movie_id`);

ALTER TABLE `showtime` ADD FOREIGN KEY (`hall_id`) REFERENCES `hall` (`hall_id`);

ALTER TABLE `booking` ADD FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`);

ALTER TABLE `booking` ADD FOREIGN KEY (`showtime_id`) REFERENCES `showtime` (`showtime_id`);

ALTER TABLE `booking_seat` ADD FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`);

ALTER TABLE `booking_seat` ADD FOREIGN KEY (`seat_id`) REFERENCES `seat` (`seat_id`);

ALTER TABLE `payment` ADD FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`);

ALTER TABLE `voucher` ADD FOREIGN KEY (`membership_tier_id`) REFERENCES `membership_tier` (`tier_id`);

ALTER TABLE `booking_voucher` ADD FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`);

ALTER TABLE `booking_voucher` ADD FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`voucher_id`);

ALTER TABLE `booking_concession` ADD FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`);

ALTER TABLE `booking_concession` ADD FOREIGN KEY (`concession_id`) REFERENCES `concession` (`concession_id`);
