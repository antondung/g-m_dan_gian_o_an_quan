# Source cần để dựng hình — Ô Quan: Dựng Nước

Folder này là bản sao độc lập chứa các file cần thiết để tiếp tục sản xuất và tích hợp hình ảnh 3D.

## Nội dung

### Source runtime

- `src/App.tsx`: game state, luật, nhiệm vụ, tài nguyên và HUD.
- `src/Board3D.tsx`: scene Three.js, camera, ánh sáng, model và animation runtime.
- `src/game3d/assetRegistry.ts`: registry asset GLB.
- `src/game3d/boardLayout.ts`: vị trí 10 ô dân và 2 ô quan.
- `src/styles.css`: style nền.
- `src/polish.css`: style chỉnh giao diện cuối.
- `src/main.tsx`: khởi tạo React.

### Asset runtime

Toàn bộ asset production nằm tại:

`public/assets/o-quan-dung-nuoc/`

Bao gồm:

- 5 diorama ô dân.
- 2 ô quan.
- 6 loại nhân vật.
- Công trình phụ.
- Cờ, trống, xe bò, hàng rào, cọc và thuyền.
- 6 loại tài nguyên.
- `ASSET_COORDINATE_MANIFEST.json`.
- `Board_Full_Demo.glb`.

### Tài liệu

- `TONG_QUAN_DU_AN.md`: game design tổng thể.
- `HUONG_DAN_SAN_XUAT_3D.md`: yêu cầu sản xuất nhân vật và hình ảnh 3D.
- `README_FIXED.md`: thông tin Y-up và asset normalization.
- `thiết kế nhân vật, khung cảnh, cảnh vật.png`: art bible.

### Cấu hình

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `index.html`
- `logo ô quan dựng nước.png`

## Chạy bản sao

Mở terminal tại folder này rồi chạy:

```bash
npm ci
npm run dev
```

Build production:

```bash
npm run build
```

## Lưu ý

- Không copy GLB Z-up cũ đè lên `public/assets/o-quan-dung-nuoc/`.
- Asset runtime phải dùng Y-up và đặt chân model tại `Y = 0`.
- Không chỉnh logic gameplay trong `App.tsx` khi chỉ làm hình ảnh.
- Khai báo asset mới trong `src/game3d/assetRegistry.ts`.
- Chỉnh bố cục hiển thị trong `src/game3d/boardLayout.ts`.
- Không đặt file `.blend` vào `public/`; nên tạo `art-source/blender/` riêng.

## Không được sao chép vào bộ này

- `node_modules/`
- `dist/`
- `tsconfig.tsbuildinfo`
- ZIP source cũ
- Asset prototype cũ trong `public/assets/3d/`
