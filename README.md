# MCLv2 - Modern Custom Minecraft Launcher 🚀

Launcher Minecraft độc lập, mượt mà, hiệu suất cực cao và giao diện hiện đại được xây dựng bằng **Tauri 2.0 (Rust) + React 19 + TypeScript + TailwindCSS**, thiết kế riêng cho nhóm bạn bè và máy chủ nội bộ.

---

## 🌟 Điểm Nổi Bật & Tính Năng

### 1. 👕 3D Skin Studio & "Nhìn Thấy Skin Của Nhau Trong Game"
* **Xem trước Skin 3D tương tác**: Tích hợp công nghệ WebGL xoay 360°, zoom, đổi chuyển động (đứng yên, đi bộ, chạy), hỗ trợ cả kiểu nhân vật **Classic (Steve)** và **Slim (Alex)**.
* **Cơ chế Skin Đồng Đội In-Game**: Tự động cấu hình **CustomSkinLoader** khi tạo hoặc khởi chạy phiên bản. Dù bạn bè dùng tài khoản không có bản quyền (Offline/Cracked), tất cả mọi người trong server vẫn nhìn thấy skin 3D và áo choàng của nhau, không bị biến thành Steve/Alex mặc định!

### 2. ⚡ Chọn Phiên Bản & Mod Loader Đa Dạng
* Tự động đồng bộ danh sách phiên bản từ **Mojang API** (từ các bản cổ điển đến 1.21.4 mới nhất, hỗ trợ cả bản Snapshot thử nghiệm).
* Cài đặt 1-click cho các Mod Loader hàng đầu:
  * 🧵 **Fabric** (Tối ưu, nhẹ nhàng, hỗ trợ Sodium, Iris)
  * 🔨 **Forge** (Tương thích kho mod khổng lồ)
  * ⚡ **NeoForge** (Mod loader hiện đại thế hệ mới)
  * 🪶 **Quilt** (Kế thừa & mở rộng từ Fabric)
  * 🧱 **Vanilla** (Bản gốc tiêu chuẩn)
* Tự động gợi ý và liên kết phiên bản Java tương ứng (Java 8 cho bản cũ, Java 17 cho 1.18 - 1.20.4, Java 21 cho 1.20.5 - 1.21+).

### 3. 🌐 Server Hub & Trạng Thái Trực Tiếp (Live SLP Ping)
* Theo dõi trạng thái Server bạn bè thời gian thực: **Độ trễ Ping (ms)**, **Số người chơi online/tối đa**, **MOTD** và IP máy chủ.
* Nút **"CHƠI NGAY"** nổi bật: Tự động khởi chạy đúng phiên bản mod và nhảy thẳng vào server.

### 4. 🧩 Quản Lý Mods & Tích Hợp Kho Modrinth
* Tìm kiếm trực tiếp hàng ngàn mod, shaders, texture packs từ **Modrinth API** ngay trong launcher.
* Quản lý mod cục bộ: Kéo thả file `.jar` từ máy tính vào để cài đặt ngay, bật/tắt mod nhanh với nút gạt (toggle).

### 5. ⚙️ Hiệu Năng Vượt Trội & Tùy Biến Hệ Thống
* Tự động quét và nhận diện các bản cài đặt **Java Runtime** trên Windows.
* Thanh trượt phân bổ RAM trực quan từ 2GB đến 16GB.
* Tích hợp sẵn bộ cờ tối ưu hóa JVM (Aikar's Flags) giúp game mượt mà, chống giật lag.
* Cửa sổ xem log thời gian thực (Console Log Viewer) khi game chạy.

---

## 🛠️ Công Nghệ Phát Triển (Tech Stack)

* **Core Backend**: [Tauri 2.0](https://v2.tauri.app/) (Rust) - Tối ưu tài nguyên, chiếm chỉ ~20MB RAM, khởi động tức thì.
* **Frontend**: React 19, TypeScript, Vite.
* **Styling**: TailwindCSS, Lucide Icons, Glassmorphism Cyber Theme.
* **3D Engine**: `skinview3d` (Three.js WebGL).
* **Protocol**: Minecraft Server List Ping (SLP) over TCP trong Rust.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Môi Trường:
* **Node.js**: Phiên bản 18+ (Đã hỗ trợ tốt trên Node 24)
* **Rust & Cargo**: Phiên bản 1.77+ (Đã hỗ trợ tốt trên Rust 1.90)
* **Java**: Khuyên dùng Java 21 LTS

### 1. Cài đặt các gói phụ thuộc:
```bash
npm install
```

### 2. Chạy thử nghiệm giao diện (Web Mode):
```bash
npm run dev
```

### 3. Khởi chạy Launcher hoàn chỉnh với Tauri:
```bash
npm run tauri dev
```

### 4. Đóng gói file cài đặt (.msi / .exe):
```bash
npm run tauri build
```
File cài đặt sẽ được tạo ra tại thư mục `src-tauri/target/release/bundle/`.

---

## 📜 Bản Quyền
Dự án được xây dựng và duy trì bởi **pecora31** dành cho cộng đồng Minecraft bạn bè.
