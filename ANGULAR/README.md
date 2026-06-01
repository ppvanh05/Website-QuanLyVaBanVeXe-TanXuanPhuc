# Website Quản Lý và Bán Vé Xe Khách Tân Xuân Phúc

## Giới thiệu

Đây là dự án được thực hiện trong học phần Kiến tập, nhằm xây dựng hệ thống quản lý và bán vé xe khách cho nhà xe Tân Xuân Phúc.

Hệ thống hỗ trợ số hóa quy trình bán vé, quản lý chuyến xe, quản lý khách hàng và điều hành hoạt động vận tải, góp phần nâng cao hiệu quả quản lý và trải nghiệm của khách hàng.

---

## Công nghệ sử dụng

### Frontend

* Angular
* TypeScript
* HTML/CSS

### Backend

* NestJS
* Node.js
* TypeScript
* Prisma ORM
* JWT Authentication

### Database

* PostgreSQL
* Supabase

### Triển khai

* Frontend: Vercel
* Backend: Render
* Database: Supabase
* Source Control: GitHub

---

## Kiến trúc hệ thống

Frontend (Angular)

↓ RESTful API

Backend (NestJS)

↓ Prisma ORM

PostgreSQL (Supabase)

---

## Chức năng chính

### Khách hàng

* Đăng ký tài khoản
* Đăng nhập
* Quên mật khẩu và xác thực OTP
* Quản lý thông tin cá nhân
* Tìm kiếm chuyến xe
* Đặt vé xe trực tuyến
* Tra cứu vé
* Xem tin tức và chính sách
* Đánh giá dịch vụ

### Quản trị viên và nhân viên

* Quản lý khách hàng
* Quản lý nhân viên
* Quản lý phân quyền
* Quản lý chuyến xe
* Quản lý tuyến xe
* Quản lý vé xe
* Quản lý tin tức
* Quản lý chính sách
* Thống kê và báo cáo

---

## Cài đặt và chạy dự án

### Frontend

```bash
cd ANGULAR/kien-tap
npm install
ng serve
```

### Backend

```bash
cd ANGULAR/backend
npm install
npm run start:dev
```


## Demo hệ thống

### Website khách hàng

https://kien-tap-code.vercel.app/

### Website admin
https://kien-tap-code.vercel.app/admin-login

Để thuận tiện cho việc đánh giá và kiểm thử hệ thống, nhóm cung cấp tài khoản quản trị mẫu như sau:
#### Quản trị viên
Email: admin@txpbus.vn
Mật khẩu: Admin@123
#### Nhân viên bán vé
Email: banve1@txpbus.vn
Mật khẩu: Banve@123
#### Ban quản lý
Email: quanly1@txpbus.vn
Mật khẩu: Quanly@123
#### Điều phối viên
Email: dp1@txpbus.vn
Mật khẩu: Dieuphoi@123

### Backend API

Triển khai trên Render
### Tài liệu kiểm thử hệ thống

Nhóm đã xây dựng bộ Test Case và thực hiện kiểm thử cho cả hai phân hệ khách hàng và quản trị viên.

#### Test Case - Phân hệ Khách hàng

https://docs.google.com/spreadsheets/d/1LpVeGJt6VRG0DTLelY3Gw_kgWx0U3vYh/edit?usp=drive_link&ouid=103633915798122050137&rtpof=true&sd=true

#### Test Case - Phân hệ Quản trị viên

https://docs.google.com/spreadsheets/d/1Ago7BRBg_yu0HyazT1Liukth5GZjKDwl/edit?usp=drive_link&ouid=103633915798122050137&rtpof=true&sd=true

Các tài liệu kiểm thử bao gồm:

* Danh sách Test Case.
* Điều kiện kiểm thử.
* Dữ liệu kiểm thử.
* Kết quả mong đợi.
* Kết quả thực tế.
* Trạng thái Pass/Fail của từng chức năng.

---

## Thành viên thực hiện

* Phan Phạm Vân Anh
* Huỳnh Nguyễn Kim Lê
* Trần Ngọc Bảo Nghi
* Nguyễn Thị Quỳnh Như
* Đỗ Thị Phương


---

## Mục đích sử dụng

Dự án được phát triển phục vụ mục đích học tập, nghiên cứu và thực hiện học phần Kiến tập tại Trường Đại học Kinh tế - Luật (UEL).

Mọi dữ liệu trong hệ thống chỉ mang tính chất minh họa và phục vụ cho việc đánh giá kết quả thực hiện dự án.
