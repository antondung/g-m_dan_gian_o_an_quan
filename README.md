# Ô Quan: Dựng Nước

Game chiến thuật 3D lấy cảm hứng từ trò chơi dân gian **Ô Ăn Quan**, kết hợp cơ chế rải quân, thu thập tài nguyên, xây dựng lãnh thổ và công thành trong không gian diorama Việt Nam giả tưởng.

## Tính năng

- Bàn cờ 3D tương tác bằng React Three Fiber.
- Cơ chế chọn ô, rải quân theo hai hướng và phục kích qua ô trống.
- Năm loại lãnh thổ: ruộng lúa, rừng tre, xưởng mộc, doanh trại và tháp canh.
- Hệ thống lương thực, gỗ, đá, quân lực và HP thành trì.
- AI đối phương, hoạt cảnh hành quân, hiệu ứng chiến đấu và nhật ký trận.
- Màn hồ sơ người chơi, hướng dẫn, nhiệm vụ và HUD responsive.
- Bộ model GLB đã chuẩn hóa cho Three.js.

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
│   │   ├── assetRegistry.ts       # Danh mục asset 3D
│   │   ├── boardLayout.ts         # Tọa độ bàn cờ
│   │   └── territoryConfig.ts     # Điểm sinh NPC
│   ├── App.tsx                    # Gameplay, màn hình và HUD
│   ├── Board3D.tsx                # Scene 3D, model và hiệu ứng
│   ├── main.tsx                   # Entry React
│   ├── styles.css                 # Giao diện chính
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
