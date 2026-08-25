# Log cuộc trò chuyện — Ô Quan: Dựng Nước — Sản xuất 3D

> Ngày: 2026-08-24

---

## 1. Đọc tài liệu và ảnh tham chiếu

**Yêu cầu:** Đọc `HUONG_DAN_SAN_XUAT_3D.md` và xem hai ảnh thiết kế trong folder.

**Thực hiện:**

- Đọc toàn bộ `HUONG_DAN_SAN_XUAT_3D.md` (37 mục, ~800 dòng).
- Xem `thiết kế bàn cờ.png` — bố cục bàn cờ isometric chéo, hai thành ở hai đầu.
- Xem `thiết kế nhân vật, khung cảnh, cảnh vật.png` — art bible nhân vật, kiến trúc, props.

**Nhận định:**

- Phong cách: stylized 3D miniature diorama, Việt Nam lịch sử giả tưởng.
- Camera isometric, PBR cách điệu, màu trầm ấm.
- Sáu nhóm nhân vật: Nông dân, Tiều phu, Thợ mộc, Binh sĩ, Quân canh, Cấm quân.
- Năm loại ô dân: Ruộng lúa, Rừng tre, Xưởng mộc, Doanh trại, Tháp canh.
- Hai thành trì: Đại Thành (mái đỏ, vàng) và Địch Thành (mái xanh, sắc lạnh).

---

## 2. Đọc folder source cần để dựng hình

**Yêu cầu:** Đọc folder `source cần để dựng hình` mới được thêm.

**Thực hiện:**

- Đọc `package.json`: React + TypeScript + Vite + Three.js + R3F + Drei.
- Đọc `README_SOURCE_DUNG_HINH.md`: hướng dẫn chạy và quy tắc asset.
- Đọc `README_FIXED.md`: lỗi Z-up đã sửa thành Y-up.
- Đọc `TONG_QUAN_DU_AN.md`: game design tổng thể (22 mục).
- Đọc `ASSET_COORDINATE_MANIFEST.json`: kích thước 31 GLB + Board_Full_Demo.
- Đọc `src/App.tsx`: gameplay, HUD, tutorial, rải quân, phục kích, công thành.
- Đọc `src/Board3D.tsx`: scene 3D, camera, ánh sáng, NPC, chọn ô.
- Đọc `src/game3d/assetRegistry.ts`: registry 31 asset GLB.
- Đọc `src/game3d/boardLayout.ts`: vị trí 10 ô dân + 2 thành.

**Asset hiện có (31 GLB):**

- 5 diorama ô dân + 2 ô quan.
- 6 nhân vật + 4 công trình phụ.
- 8 props + 6 tài nguyên.
- Tất cả đã chuẩn hóa Y-up, chân tại Y=0.

**Chênh lệch với ảnh tham chiếu:**

1. Bố cục hai hàng ngang, chưa chéo isometric.
2. Camera perspective, chưa orthographic.
3. NPC xếp lưới, chưa spawn point tự nhiên.
4. Chưa có animation GLB, shader gió, LOD, instancing.
5. Liên kết giữa các ô còn yếu.

---

## 3. Xác nhận hiểu dự án

**Yêu cầu:** Xác nhận đã hiểu toàn bộ.

**Trả lời:** Đã hiểu mục tiêu, pipeline, thứ tự triển khai. Bắt đầu bằng vertical slice Ruộng lúa, khóa pipeline, rồi áp dụng cho toàn bàn.

---

## 4. Bắt đầu triển khai

### 4.1. Kiểm tra baseline

- Chạy `npm ci` — 86 packages, 0 vulnerabilities.
- Chạy `npm run build` — TypeScript OK, Vite build OK.
- Cảnh báo: `@import` font sai vị trí, bundle 1.26 MB, logo 2.08 MB.

### 4.2. Khóa bố cục và camera

**File sửa:** `src/game3d/boardLayout.ts`

- Chuyển từ hai hàng ngang sang bố cục chéo diagonal.
- Đại Thành phía phải sau, Địch Thành phía trái trước.
- Rotation nhẹ -0.08 rad cho hàng player, Math.PI-0.08 cho hàng enemy.

**File sửa:** `src/Board3D.tsx`

- Chuyển `Canvas` sang `orthographic`.
- Camera position `[11,13,16]`, zoom 52 (sau tăng lên 82).
- Giới hạn `OrbitControls`: polar 0.68–0.82, azimuth ±0.35, zoom 38–105.
- Ánh sáng: ambient 0.8, hemisphere xanh xám, directional ấm 2.7.
- Fog xanh xám `#53645b`, 24–42.
- `ContactShadows` frames={1} giảm GPU.

**Build:** Thành công, không lỗi TypeScript.

### 4.3. Vertical slice Ruộng lúa

**File tạo:** `src/game3d/territoryConfig.ts`

- Spawn point data-driven cho 5 loại ô.
- Mỗi ô 5 điểm spawn với position, rotation, activity.
- Tháp canh có spawn trên sàn cao (Y=2.08).

**File sửa:** `src/Board3D.tsx`

- Thay `DynamicOccupants` từ lưới sang spawn point.
- Ô trống (soldiers=0) không hiển thị NPC.
- Thêm `RiceDetails`: nền đất ẩm, mương nước, bờ cỏ, 18 cụm lúa đung đưa, xe bò, đống lương thực.
- Lúa dùng `planeGeometry` DoubleSide với vertex animation sin().

**Build:** Thành công.

### 4.4. Hoàn thiện bốn ô còn lại

**File sửa:** `src/Board3D.tsx`

- `BambooDetails`: 4 cụm tre (cylinder), đá, hàng rào, đống gỗ.
- `WorkshopDetails`: nhà kho GLB, bàn gỗ, khúc gỗ, xe kéo.
- `BarracksDetails`: trại huấn luyện GLB, trống lệnh, cọc, 3 giáo đứng.
- `TowerDetails`: cọc phòng thủ, hàng rào, đá chân tháp.
- `TerritoryDetails`: dispatcher component theo building type.
- Label tháp canh nâng lên Y=3.35.

**Build:** Thành công.

### 4.5. Hoàn thiện hai thành trì

**File sửa:** `src/Board3D.tsx`

- `FortressGround`: nền bát giác (cylinder 8 cạnh), đá và cây chân thành.
- `Flag`: cờ chuyển động sin().
- `QuanTile` mới: 5 Cấm quân rotation khác nhau, 2 cờ mỗi thành, props phe riêng (trống đồng cho ta, sắt cho địch).
- Label thành nâng lên Y=2.65.

**Build:** Thành công.

### 4.6. Animation và VFX

**File sửa:** `src/Board3D.tsx`

- `WorkEffect`: sphere nhỏ nhấp nháy theo màu nghề (vàng ruộng, xanh rừng, cam xưởng, đỏ trại, xanh lạnh tháp).
- `Fireflies`: 24 hạt sáng vàng nhẹ, xoay chậm, opacity nhấp nháy.
- Đường đá chéo nối các ô.
- Cầu gỗ nhỏ giữa vùng.
- Mặt nước trầm hơn (#597b76).

### 4.7. Tối ưu và QA

- Tăng zoom mặc định từ 52 lên 82.
- Sửa `@import` font lên đầu `styles.css`.
- Build production: thành công, không cảnh báo PostCSS.
- Bundle JS giảm từ 1.26 MB xuống ~1.27 MB (thêm code nhưng bỏ Environment/ContactShadows).

---

## 5. Sửa lỗi nháy đen

**Yêu cầu:** Màn hình nháy đen liên tục. Video ghi lại tại `20260824-1131-19.0507263.mp4`.

**Phân tích:**

- Trích 20 frame từ video bằng ffmpeg.
- Frame cho thấy: HUD ổn, canvas WebGL biến mất rồi hiện lại.
- Nguyên nhân: quá nhiều render target (`Environment` dùng PMREM, `ContactShadows` dùng FBO), shadow map 2048, DPR 1.5 gây GPU overload hoặc context loss.

**Sửa trong `src/Board3D.tsx`:**

- Bỏ `Environment preset="forest"` (loại PMREM render target).
- Bỏ `ContactShadows` (loại FBO render target).
- Giảm shadow map từ 2048 xuống 1024.
- Giảm DPR từ `[1,1.5]` xuống `1`.
- Thêm `gl` config: `alpha:false`, `powerPreference:'default'`, `failIfMajorPerformanceCaveat:false`.
- Thêm `webglcontextlost` event listener với `preventDefault()`.
- Tăng ambient và hemisphere bù sáng cho việc mất Environment.

**Kiểm thử:**

- Stress test 20 giây qua Playwright: 20/20 sample đều `lost:false`.
- WebGL context loss counter: `0 lost`, `0 restored`.
- Scene hiển thị liên tục, không nháy.

**Build:** Thành công. Bundle giảm ~55 KB do bỏ Environment/ContactShadows.

---

## 6. Đánh giá khoảng cách với ảnh tham chiếu

**Đã đạt (runtime code):**

- Bố cục chéo isometric.
- Camera orthographic với giới hạn hợp lý.
- Hai thành ở hai đầu với hierarchy rõ.
- Mỗi ô có diorama riêng với props kể chuyện.
- NPC spawn tự nhiên theo nghề.
- Vegetation chuyển động (lúa, cờ).
- Ánh sáng ấm–lạnh.
- Liên kết bàn bằng đường đá, cầu, nước.
- VFX lao động nhẹ.
- Không nháy đen.

**Chưa đạt (cần asset production từ Blender):**

- Mesh GLB hiện tại là prototype, hình học đơn giản.
- Chưa có texture PBR 2K (base color, normal, ORM).
- Chưa có rig skeleton chung và animation clip nghề nghiệp.
- Chưa có sculpt chi tiết mặt, trang phục, vũ khí.
- Chưa có mái cong Việt Nam chi tiết trên thành.
- Chưa có instancing runtime cho lúa/tre/cỏ từ mesh thật.
- Chưa có LOD theo zoom.
- Chưa có shader gió vertex cho vegetation GLB.

**Kết luận:** Code runtime đã sẵn sàng nhận asset production. Khoảng cách còn lại nằm ở chất lượng mesh, texture và animation trong file GLB — cần pipeline Blender.

---

## Tổng kết file đã tạo/sửa

| File | Hành động |
|---|---|
| `src/game3d/boardLayout.ts` | Sửa — bố cục chéo |
| `src/game3d/territoryConfig.ts` | Tạo mới — spawn point |
| `src/Board3D.tsx` | Sửa — camera, ánh sáng, diorama, thành, VFX, sửa nháy |
| `src/styles.css` | Sửa — @import font lên đầu |
| `src/App.tsx` | Không thay đổi |
| `src/game3d/assetRegistry.ts` | Không thay đổi |

## Lệnh chạy

```bash
cd "source cần để dựng hình"
npm ci
npm run dev
npm run build
```
