# Ô Quan: Dựng Nước

Game chiến thuật 3D lấy cảm hứng từ trò chơi dân gian **Ô Ăn Quan**, kết hợp cơ chế rải quân, thu thập tài nguyên, xây dựng lãnh thổ và công thành trong không gian diorama Việt Nam giả tưởng.

## Tính năng

- **Bàn cờ 3D tương tác**: Sử dụng Three.js & React Three Fiber với hiệu ứng ánh sáng, mô hình diorama làng quê và thành lũy cổ truyền Việt Nam.
- **Hệ thống Danh Tướng (Hero System)**: Chọn tướng xuất trận (Trần Hưng Đạo, Quang Trung, Hai Bà Trưng, Lý Thường Kiệt) với bộ nội tại và kỹ năng kích hoạt riêng biệt (Khiên Thiết Giáp 3D, Hành quân thần tốc, Hiệu triệu dân binh, Như Nguyệt trận đồ).
- **Thần Khí & Cổ Vật (Artifacts System)**: Trang bị bảo vật dân tộc (Trống Đồng Ngọc Lũ, Nỏ Thần Kim Quy, Thuận Thiên Kiếm, Nón Ba Tầm, Bình Gốm Chu Đậu) gia tăng chỉ số và sức mạnh chiến thuật.
- **Thời Tiết & Mùa Vụ Động (Dynamic Weather)**: Chu kỳ thời tiết biến chuyển theo trận (Trời Quang, Thủy Triều/Mưa Lũ, Sương Mù Chi Lăng, Hạn Hán, Gió Mùa Đông Bắc) ảnh hưởng trực tiếp đến quy luật bàn cờ và hiệu ứng shader 3D.
- **Chiến Dịch Lịch Sử (Campaign Mode)**: Tái hiện các trận đánh oanh liệt trong sử Việt (Bạch Đằng, Như Nguyệt, Chi Lăng, Ngọc Hồi - Đống Đa) với cốt truyện, boss AI và bản đồ đặc thù.
- **Thế Cờ & Giải Đố (Puzzle Mode)**: 4 ải thế cờ hiểm hóc thách thức tư duy rải quân với số lượt đi giới hạn.
- **Cơ chế rải quân Ô Ăn Quan mở rộng**: Rải thuận/nghịch, gom tài nguyên, công thành hãm địch, phục kích đoạt đất và bẫy chông chiến thuật.
- **Đại sảnh game (Lobby)**: Giao diện sảnh chờ cung điện Đại Việt, bảng vàng danh vọng (Leaderboard), tạo phòng đấu bạn bè (mã 6 số) và đấu xếp hạng toàn quốc.
- **Âm thanh & Audio Manager**: Hiệu ứng tiếng gõ sỏi đá, mõ làng, trống đồng Đông Sơn, tù và báo động và nhạc nền ngũ cung.
- **Bộ model 3D chuẩn hóa**: Tối ưu hệ trục Y-up cho Three.js và tương thích WebGL 2.0.

## Công nghệ

- React 19
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Lucide React

## Yêu cầu

- Node.js 20 trở lên
- npm 10 trở lên
- Trình duyệt hỗ trợ WebGL 2

## Cài đặt

```bash
npm ci
```

## Chạy môi trường phát triển

```bash
npm run dev
```

Mở URL do Vite hiển thị, mặc định `http://localhost:5173`.

## Build production

```bash
npm run build
npm run preview
```

Kết quả build nằm trong `dist/`.

## Cấu trúc chính

```text
.
├── public/
│   └── assets/o-quan-dung-nuoc/   # Model GLB và manifest
├── src/
│   ├── game3d/
│   │   ├── advancedGameTypes.ts   # Kiểu dữ liệu nâng cao (PvP, chiến thuật, audio)
│   │   ├── assetRegistry.ts       # Danh mục asset 3D
│   │   ├── audioManager.ts        # Quản lý âm thanh Web Audio & SFX
│   │   ├── boardLayout.ts         # Tọa độ bàn cờ
│   │   ├── multiplayerManager.ts  # Quản lý kết nối phòng chờ & multiplayer
│   │   ├── tacticsDatabase.ts     # Dữ liệu & hiệu ứng kế sách dân gian
│   │   └── territoryConfig.ts     # Điểm sinh NPC
│   ├── gameplay/                  # Logic và component gameplay bổ trợ
│   ├── App.tsx                    # Gameplay, màn hình và HUD
│   ├── Board3D.tsx                # Scene 3D, model và hiệu ứng
│   ├── LobbyPage.tsx              # Giao diện Đại sảnh / Sảnh chờ
│   ├── main.tsx                   # Entry React
│   ├── styles.css                 # Giao diện chính
│   ├── lobby.css                  # Style giao diện Đại sảnh
│   └── polish.css                 # Hiệu ứng hoàn thiện UI
├── HUONG_DAN_SAN_XUAT_3D.md        # Quy chuẩn sản xuất asset
└── TONG_QUAN_DU_AN.md              # Thiết kế game tổng quan
```

## Điều khiển

1. Tạo hoặc chọn hồ sơ người chơi.
2. Chọn ô dân thuộc lượt hiện tại và còn quân.
3. Chọn hướng rải trái hoặc phải.
4. Theo dõi tài nguyên, quân lực và HP hai thành trên HUD.
5. Dùng chuột để xoay, thu phóng và quan sát chiến trường 3D.

## Asset 3D

Model runtime nằm tại `public/assets/o-quan-dung-nuoc/`. Registry dùng URL `/assets/o-quan-dung-nuoc`.

Model đã được chuẩn hóa theo hệ trục Y-up của Three.js. Không thay bằng bản Z-up cũ nếu chưa chuyển đổi orientation. Chi tiết pipeline nằm trong `HUONG_DAN_SAN_XUAT_3D.md`.

## Tài liệu

- `TONG_QUAN_DU_AN.md`: luật chơi, hệ thống tài nguyên, thiết kế và roadmap.
- `HUONG_DAN_SAN_XUAT_3D.md`: art direction, topology, rig, animation, PBR và tối ưu.
- `README_FIXED.md`: ghi chú kỹ thuật về sửa orientation model GLB.

## Giấy phép

Chưa cấp giấy phép mã nguồn mở. Mọi quyền thuộc chủ dự án.
