# Ô QUAN: DỰNG NƯỚC — FIXED DROP-IN GAME PACKAGE

## Quan trọng: lỗi làm bàn cờ thành "hàng rào" đã được sửa

### Nguyên nhân
Các GLB trong bộ asset trước được xuất theo hệ trục **Z-up**:
- Z = chiều cao
- X/Y = mặt đất

Trong Three.js:
- Y = chiều cao
- X/Z = mặt đất

Source `Board3D.tsx` của game lại xử lý GLB theo Y-up. Vì vậy khi asset Z-up được đưa thẳng vào Three.js, các công trình/nhân vật bị nằm nghiêng theo mặt bàn và nhìn thành những dãy tường/khối kéo dài.

### Cách sửa
Toàn bộ 32 GLB trong:
`public/assets/o-quan-dung-nuoc/`

đã được chuẩn hóa:
- Z-up -> Y-up
- chân model về Y = 0
- giữ nguyên kích thước/silhouette
- giữ nguyên vị trí X/Z tương đối trong từng diorama

`src/game3d/assetRegistry.ts` vẫn dùng:
`/assets/o-quan-dung-nuoc`

nên không cần đổi đường dẫn asset trong `Board3D.tsx`.

## Cấu trúc
- `src/App.tsx` — logic game/HUD hiện tại
- `src/Board3D.tsx` — bàn 3D, NPC, rải quân, camera
- `src/game3d/assetRegistry.ts` — registry asset
- `src/game3d/boardLayout.ts` — bố trí 10 ô dân + 2 ô quan
- `public/assets/o-quan-dung-nuoc/` — GLB đã chuẩn hóa

## Asset
31 asset gameplay + `Board_Full_Demo.glb`.

## Cách chạy
```bash
npm install
npm run dev
```

Sau đó mở URL Vite hiển thị, thường là:
`http://localhost:5173`

## Lưu ý
Không copy lại các GLB Z-up cũ đè vào:
`public/assets/o-quan-dung-nuoc/`

Nếu muốn thay asset mới sau này, asset mới phải được xuất theo **Y-up** hoặc được normalize trước khi đưa vào thư mục này.
