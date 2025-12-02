DROP DATABASE IF EXISTS dcine_schema;
CREATE DATABASE dcine_schema;
USE dcine_schema;

CREATE TABLE customer (
  customer_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  dob DATE,
  address VARCHAR(255),
  gender ENUM('MALE','FEMALE')
);

CREATE TABLE membership_tier (
  tier_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  min_spending DECIMAL(10,2),
  discount_percent DECIMAL(5,2) DEFAULT 0,
  point_multiplier DECIMAL(5,2) DEFAULT 1,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account (
  account_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT UNIQUE NOT NULL,
  membership_tier_id BIGINT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  role ENUM('ADMIN','CUSTOMER') NOT NULL,
  total_spending DECIMAL(15,2) DEFAULT 0,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE province (
  province_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  province_name VARCHAR(100) NOT NULL
);

CREATE TABLE location (
  location_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  city_name VARCHAR(100) NOT NULL,
  province_id BIGINT NOT NULL
);

CREATE TABLE theater (
  theater_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  address VARCHAR(255),
  location_id BIGINT NOT NULL
);

CREATE TABLE room_type (
  room_type_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE seat_layout (
  seat_layout_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  room_type_id BIGINT NOT NULL,
  name VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  layout_map JSON
);

CREATE TABLE hall (
  hall_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  theater_id BIGINT NOT NULL,
  seat_layout_id BIGINT NOT NULL
);

CREATE TABLE seat_type (
  seat_type_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  price_multiplier DECIMAL(5,2) DEFAULT 1
);

CREATE TABLE seat (
  seat_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  hall_id BIGINT NOT NULL,
  row_label VARCHAR(5) NOT NULL,
  seat_number INT NOT NULL,
  seat_type_id BIGINT
);


CREATE TABLE movie (
  movie_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  original_title VARCHAR(150) NOT NULL,
  synopsis TEXT,
  duration_min INT,
  rating VARCHAR(10),
  age_limit VARCHAR(100),
  release_date DATE,
  end_showing_date DATE,
  early_screening_date DATE,
  poster_url VARCHAR(255),
  banner_url VARCHAR(255),
  trailer_url VARCHAR(255),
  active TINYINT DEFAULT 1,
  status ENUM('soon','now','ended') DEFAULT 'soon',
  language VARCHAR(50)
);

CREATE TABLE genre (
  genre_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE movie_genre (
  movie_id BIGINT NOT NULL,
  genre_id BIGINT NOT NULL,
  PRIMARY KEY(movie_id, genre_id)
);

CREATE TABLE cast_person (
  cast_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  role_type ENUM('ACTOR','DIRECTOR') NOT NULL,
  cast_url VARCHAR(255)
);

CREATE TABLE movie_cast (
  movie_id BIGINT NOT NULL,
  cast_id BIGINT NOT NULL,
  PRIMARY KEY(movie_id, cast_id)
);


CREATE TABLE showtime (
  showtime_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  movie_id BIGINT NOT NULL,
  hall_id BIGINT NOT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  is_early_screening BOOLEAN DEFAULT FALSE
);

CREATE TABLE booking (
  booking_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_id BIGINT NOT NULL,
  showtime_id BIGINT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING','PAID','CANCELLED') DEFAULT 'PENDING',
  qr_code VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_seat (
  booking_id BIGINT NOT NULL,
  seat_id BIGINT NOT NULL,
  price_at_booking DECIMAL(10,2) NOT NULL,
  PRIMARY KEY(booking_id, seat_id)
);


CREATE TABLE concession_item (
  item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  tag VARCHAR(50),
  image_url VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  category ENUM('combo','popcorn','beverage','hot-food','coffee','desserts')
);

CREATE TABLE concession_variant (
  variant_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  item_id BIGINT NOT NULL,
  label VARCHAR(100) NOT NULL,
  value VARCHAR(50) NOT NULL,
  price_diff DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE booking_concession (
  booking_id BIGINT NOT NULL,
  item_id BIGINT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY(booking_id, item_id)
);


CREATE TABLE voucher (
  voucher_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  membership_tier_id BIGINT,
  code VARCHAR(30) UNIQUE NOT NULL,
  type ENUM('PERCENT','AMOUNT') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  start_at DATETIME,
  end_at DATETIME,
  min_order DECIMAL(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0
);

CREATE TABLE booking_voucher (
  booking_id BIGINT NOT NULL,
  voucher_id BIGINT NOT NULL,
  discount_applied DECIMAL(10,2),
  PRIMARY KEY(booking_id, voucher_id)
);


CREATE TABLE payment (
  payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT UNIQUE NOT NULL,
  transaction_id VARCHAR(255),
  provider VARCHAR(50),
  method ENUM('CARD','MOMO','ZALOPAY') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING','PAID','FAILED','REFUNDED','CANCELLED') NOT NULL,
  created_at DATETIME(6),
  paid_at DATETIME(6)
);

CREATE TABLE otp_record (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_id BIGINT,
  identifier VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  request_id VARCHAR(100),
  token VARCHAR(100),
  UNIQUE(identifier, verified)
);


ALTER TABLE account
  ADD FOREIGN KEY(customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
  ADD FOREIGN KEY(membership_tier_id) REFERENCES membership_tier(tier_id) ON UPDATE CASCADE;

ALTER TABLE location
  ADD FOREIGN KEY(province_id) REFERENCES province(province_id);

ALTER TABLE theater
  ADD FOREIGN KEY(location_id) REFERENCES location(location_id);

ALTER TABLE seat_layout
  ADD FOREIGN KEY(room_type_id) REFERENCES room_type(room_type_id);

ALTER TABLE hall
  ADD FOREIGN KEY(theater_id) REFERENCES theater(theater_id),
  ADD FOREIGN KEY(seat_layout_id) REFERENCES seat_layout(seat_layout_id);

ALTER TABLE seat
  ADD FOREIGN KEY(hall_id) REFERENCES hall(hall_id),
  ADD FOREIGN KEY(seat_type_id) REFERENCES seat_type(seat_type_id);

ALTER TABLE movie_genre
  ADD FOREIGN KEY(movie_id) REFERENCES movie(movie_id),
  ADD FOREIGN KEY(genre_id) REFERENCES genre(genre_id);

ALTER TABLE movie_cast
  ADD FOREIGN KEY(movie_id) REFERENCES movie(movie_id),
  ADD FOREIGN KEY(cast_id) REFERENCES cast_person(cast_id);

ALTER TABLE showtime
  ADD FOREIGN KEY(movie_id) REFERENCES movie(movie_id),
  ADD FOREIGN KEY(hall_id) REFERENCES hall(hall_id);

ALTER TABLE booking
  ADD FOREIGN KEY(account_id) REFERENCES account(account_id),
  ADD FOREIGN KEY(showtime_id) REFERENCES showtime(showtime_id);

ALTER TABLE booking_seat
  ADD FOREIGN KEY(booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  ADD FOREIGN KEY(seat_id) REFERENCES seat(seat_id);

ALTER TABLE payment
  ADD FOREIGN KEY(booking_id) REFERENCES booking(booking_id);

ALTER TABLE concession_variant
  ADD FOREIGN KEY(item_id) REFERENCES concession_item(item_id);

ALTER TABLE booking_concession
  ADD FOREIGN KEY(booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  ADD FOREIGN KEY(item_id) REFERENCES concession_item(item_id);

ALTER TABLE voucher
  ADD FOREIGN KEY(membership_tier_id) REFERENCES membership_tier(tier_id);

ALTER TABLE booking_voucher
  ADD FOREIGN KEY(booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  ADD FOREIGN KEY(voucher_id) REFERENCES voucher(voucher_id);

ALTER TABLE otp_record
  ADD FOREIGN KEY(account_id) REFERENCES account(account_id) ON DELETE CASCADE;
