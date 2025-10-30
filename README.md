# 🎬 DCINE - Movie Ticket Booking Web System

> **Môn học - Lập trình hướng đối tượng & Cơ sở dữ liệu - PTIT HCM**
>
> Dự án phát triển **Website đặt vé xem phim trực tuyến** dành cho khách hàng  
> Cho phép người dùng xem lịch chiếu, chọn phim, chọn ghế, thanh toán trực tuyến, và nhận vé điện tử.

---

## Giới thiệu

**DCINE Web** là hệ thống web giúp khách hàng:
- Tìm kiếm và xem thông tin phim đang chiếu & sắp chiếu.
- Đặt vé trực tuyến với sơ đồ ghế tương tác theo thời gian thực.
- Thanh toán nhanh chóng qua ví điện tử (MoMo, VNPay, ZaloPay) hoặc thẻ.
- Nhận vé điện tử có mã QR để soát vé tại rạp.

> Mục tiêu: Xây dựng hệ thống web đặt vé **thân thiện – bảo mật – dễ mở rộng**.

---

## Chức năng chính

| Nhóm chức năng | Mô tả chi tiết |
|----------------|----------------|
| 🎞️ **Quản lý phim** | Hiển thị danh sách phim, trailer, thể loại, thời lượng, đánh giá. |
| 🕒 **Lịch chiếu** | Cho phép người dùng xem lịch chiếu theo rạp, ngày, và phim. |
| 🎟️ **Đặt vé & sơ đồ ghế** | Chọn suất chiếu, ghế ngồi, combo bắp nước, và xác nhận vé. |
| 💳 **Thanh toán trực tuyến** | Tích hợp API thanh toán (VNPay/MoMo/ZaloPay). |
| 📱 **Vé điện tử (QR Code)** | Sau khi thanh toán, khách hàng nhận vé có mã QR để soát vé tại rạp. |
| 👤 **Tài khoản người dùng** | Đăng ký, đăng nhập, xem lịch sử vé, quản lý thông tin cá nhân. |
| 🧾 **Hỗ trợ & phản hồi** | Form liên hệ, đánh giá trải nghiệm người dùng. |

---

## Kiến trúc & Công nghệ

| Thành phần | Mô tả | Công nghệ |
|-------------|--------|-----------|
| **Front-end** | Giao diện người dùng, hiển thị phim, chọn ghế, thanh toán. | HTML, CSS, JavaScript, ReactJS |
| **Back-end** | Xử lý logic nghiệp vụ, giao tiếp DB, xác thực người dùng, API thanh toán. | Java Spring Boot |
| **Database** | Lưu thông tin phim, rạp, ghế, vé, người dùng, thanh toán. | MySQL |
| **Tools** | Quản lý mã nguồn & môi trường phát triển. | GitHub, VS Code, Postman |

---

## 📁 Cấu trúc thư mục
```
DCINE_Movie_Ticket_Booking_System/
│
├── frontend/                              # Giao diện người dùng
│   │
│   ├── components/                        # Thành phần giao diện dùng chung
│   │   ├── header.html                    # Thanh điều hướng trên (Navbar)
│   │   └── footer.html                    # Chân trang
│   │
│   ├── pages/                             # Các trang chức năng của hệ thống
│   │   ├── index.html                     
│   │   ├── D_cine_login.html              
│   │   ├── D_cine_signup.html            
│   │   ├── D_cine_forgot.html            
|   |   ├── ...
│   │   |
|   │   └── assets/                            # Tài nguyên tĩnh
|   │       ├── css/
|   │       │   ├── main.css                   # CSS chung toàn site
|   │       │   ├── login.css                  # CSS riêng cho login
|   │       │   ├── signup.css                 # CSS riêng cho signup
|   │       │   ├── forgot.css                 # CSS riêng cho forgot
|   │       │   └── ...
|   │       │
|   │       ├── js/
|   │       │   ├── main.js                    # Script chung (load header, footer)
|   │       │   ├── login.js                   # Xử lý đăng nhập
|   │       │   ├── signup.js                  # Xử lý đăng ký
|   │       │   └── ...
|   │       │
|   │       └── images/
|   │           ├── icons/                     # Logo, favicon, biểu tượng nhỏ
|   │           │   ├── logo.png
|   │           │   ├── menu_icon.svg
|   │           │   └── favicon.ico
|   │           │
|   │           ├── movies/                    # Ảnh banner, poster, cast phim
|   │           │   ├── avatar_3_lua_va_tro_tan/
|   │           │   │   ├── banner.jpg
|   │           │   │   ├── poster_doc.jpg
|   │           │   │   ├── poster_ngang.jpg
|   │           │   │   ├── cast/
|   │           │   │   │   ├── nguyen_van_a.jpg
|   │           │   │   │   └── tran_thi_b.jpg
|   │           │   ├── ...
|   |           |   |
|   |           |   └── trailer_links.xlsx
|   │           │
|   │           └── ui/                        # Ảnh nền giao diện login/signup/forgot
│   │
│   └── README.md                          # Hướng dẫn cấu trúc & chạy frontend
│
├── backend/                               # Xử lý logic, API và cơ sở dữ liệu
│   ├── src/
│   │   ├── main/java/com/dcine/           # Mã nguồn Java (Spring Boot)
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   └── config/
│   │   └── resources/
│   │       ├── application.properties     # Cấu hình DB, port, API
│   │       └── static/
│   │           └── movies/                # Ảnh tĩnh nếu backend phục vụ trực tiếp
│   │
│   ├── database/
│   │   ├── dcine_schema.sql               # Cấu trúc bảng
│   │   ├── dcine_data.sql                 # Dữ liệu mẫu
│   │   └── README.md
│   │
│   ├── pom.xml
│   └── README.md
│
├── testing/                               # Kiểm thử
│   ├── selenium/                        
│   ├── postman/                         
│   ├── mock_data/                        
│   ├── test_cases.xlsx                  
│   └── README.md                         
│
└── README.md                              # Giới thiệu tổng quan dự án

```
---

## ⚙️ Cách chạy dự án

### Chạy với Spring Boot + ReactJS

**Yêu cầu:**  
- JDK 17 trở lên  
- Node.js + npm  
- MySQL

**Các bước:**

#### Database
1. Tạo database 'dcine_db'
2. Chạy script:
   database/dcine_schema.sql
   database/sample_data.sql

#### Backend (Spring Boot)

cd backend
mvn spring-boot:run

→ Server mặc định chạy ở 'http://localhost:8080'

#### Frontend (ReactJS)

cd frontend
npm install
npm start

→ Website chạy ở 'http://localhost:3000'

---

## 🧑‍💻 Thành viên nhóm

| STT | Họ và tên             | Vai trò                             | Mã sinh viên |
| --- | --------------------- | ----------------------------------- | ------------ |
| 1   | **Nguyễn Minh Khánh** | Trưởng nhóm, Database | N23DCCN165   |
| 2   | **Lâm Thụy Khương**         | Frontend (UI/UX, ReactJS)           | N23DCCN169   |
| 3   | **Nguyễn Phạm Minh Thức**   | Backend, API tích hợp              | N23DCCN129   |
| 4   | **Phan Trung Kiên**     | Kiểm thử        | N23DCCN170   |

## Giấy phép

Dự án được phát triển phục vụ **mục đích học tập tại PTIT HCM**,
Không sử dụng cho mục đích thương mại.

---

## Liên hệ

**Nguyễn Minh Khánh – Trưởng nhóm**
📧 [minhkhanh2005py@gmail.com](mailto:minhkhanh2005py@gmail.com)

---

## Hướng phát triển trong tương lai

Hệ thống hiện tại tập trung vào **luồng đặt vé cho khách hàng**, tuy nhiên vẫn còn nhiều tiềm năng mở rộng. Trong tương lai, nhóm dự kiến phát triển thêm các tính năng sau:

### 🔹 1. Mở rộng chức năng quản trị
- Xây dựng **dashboard cho quản lý rạp**, thống kê doanh thu, suất chiếu và lượng khách đặt vé.  
- Cho phép **quản lý phim, phòng chiếu, giá vé và nhân viên** thông qua giao diện riêng.

### 🔹 2. Nâng cao trải nghiệm người dùng
- Tích hợp **đăng nhập bằng mạng xã hội** (Google, Facebook).  
- Thêm tính năng **gợi ý phim theo sở thích cá nhân**, dựa trên lịch sử đặt vé.  
- Cải thiện tốc độ tải trang và tối ưu trải nghiệm trên thiết bị di động (Mobile-first).

### 🔹 3. Tích hợp công nghệ mới
- Hỗ trợ **thanh toán bằng ví điện tử nâng cao** (Apple Pay, Samsung Pay).  
- Áp dụng **AI Chatbot** để tư vấn phim, suất chiếu và khuyến mãi.  
- Sử dụng **Cloud Storage** (Firebase, AWS S3) để lưu trữ poster và video trailer.  

### 🔹 4. Mở rộng hệ sinh thái
- Phát triển **ứng dụng di động (Mobile App)** cho Android/iOS. 
- Cho phép người dùng **đánh giá phim, bình luận và chia sẻ trải nghiệm**.

## Tóm tắt
> Dự án hiện tại là **phiên bản nền tảng** của hệ thống đặt vé xem phim, hoàn thiện đầy đủ quy trình đặt vé cho khách hàng.  
> Trong tương lai, nhóm mong muốn biến nó thành **một hệ sinh thái quản lý rạp chiếu phim thông minh**, hỗ trợ đầy đủ cho cả khách hàng và nhân viên quản lý, đồng thời tích hợp công nghệ mới nhằm nâng cao trải nghiệm người dùng.

---

📅 *Cập nhật lần cuối: 30/10/2025*  
✍️ *Nhóm 3KT PTIT – Movie Ticket Booking System*

> *“Delivering great cinema experience — one click at a time.”* 🎥

--- 
