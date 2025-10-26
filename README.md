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
| **Front-end** | Giao diện người dùng, hiển thị phim, chọn ghế, thanh toán. | HTML, CSS, JavaScript, ReactJS (hoặc JSP nếu Java Web) |
| **Back-end** | Xử lý logic nghiệp vụ, giao tiếp DB, xác thực người dùng, API thanh toán. | Java Spring Boot *(hoặc Node.js Express)* |
| **Database** | Lưu thông tin phim, rạp, ghế, vé, người dùng, thanh toán. | MySQL |
| **Tools** | Quản lý mã nguồn & môi trường phát triển. | GitHub, IntelliJ / VS Code, Postman |

---

## 📁 Cấu trúc thư mục (đề xuất)
```
DCINE_Web_Booking_System/
│
├── backend/                 # Code xử lý logic & API (Java Spring Boot)
│   ├── src/main/java/com/dcine/
│   └── pom.xml
│
├── frontend/                # Code giao diện web (ReactJS / HTML-CSS-JS)
│   ├── public/
│   ├── src/
│   └── package.json
│
├── database/
│   ├── dcine_schema.sql
│   └── sample_data.sql
│
├── docs/
│   ├── UseCaseDiagram.png
│   ├── ERD.png
│   ├── SprintPlan.md
│   └── Report.docx
│
├── README.md
└── LICENSE
```
---

## ⚙️ Cách chạy dự án

### 🔧 Cách 1 – Chạy với Spring Boot + ReactJS

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

> *“Delivering great cinema experience — one click at a time.”* 🎥

--- 
