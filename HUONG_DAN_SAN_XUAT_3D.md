# Ô Quan: Dựng Nước — Hướng dẫn sản xuất nhân vật và hình ảnh 3D

> Tài liệu yêu cầu kỹ thuật và mỹ thuật để chuyển game hiện tại thành game chiến thuật lịch sử Việt Nam dạng miniature diorama, bám sát hai ảnh thiết kế tham chiếu.

---

## 1. Mục tiêu hình ảnh

Sản phẩm cuối cần tạo cảm giác:

> **Một mô hình sa bàn lịch sử Việt Nam thu nhỏ đã trở thành game chiến thuật có thể chơi được.**

Phong cách cần đạt:

- Stylized 3D.
- Miniature diorama.
- Lịch sử Việt Nam giả tưởng.
- Vật liệu PBR cách điệu.
- Màu tự nhiên, trầm và ấm.
- Silhouette nhân vật, công trình rõ ràng.
- Môi trường giàu chi tiết nhưng không che gameplay.
- Camera isometric hoặc pseudo-isometric.
- Hai thành trì tạo hierarchy rõ ràng.

Không sử dụng:

- Kiến trúc châu Âu trung cổ.
- Anime.
- Cyberpunk.
- Sci-fi.
- Neon.
- Vật liệu bóng như nhựa.
- Nhân vật tạo từ capsule, sphere hoặc cylinder.
- Công trình placeholder từ box geometry.

---

## 2. Vai trò của hai ảnh tham chiếu

### Ảnh tham chiếu asset

Quy định:

- Phong cách nhân vật.
- Trang phục.
- Công trình.
- Thành trì.
- Đạo cụ.
- Tài nguyên.
- Màu sắc.
- Vật liệu.
- Tỷ lệ tương đối.

### Ảnh tham chiếu gameplay

Quy định:

- Bố cục bàn cờ.
- Camera.
- Vị trí hai thành.
- Mật độ môi trường.
- Cách phân bố các ô.
- Khoảng trống chiến thuật.
- Hệ thống phân cấp thị giác.

---

## 3. Quy chuẩn tỷ lệ thế giới

Thống nhất:

- `1 Blender unit = 1 mét`.
- Unit Scale: `1.0`.
- Trục đứng khi vào Three.js: `Y-up`.
- Chân model đặt tại `Y = 0`.
- Origin nhân vật nằm giữa hai bàn chân.
- Apply `Location`, `Rotation`, `Scale` trước khi export.

### Tỷ lệ đề xuất

| Đối tượng | Kích thước |
|---|---:|
| Người trưởng thành | 1.65–1.75 m |
| Nhà dân | cao 3–4 m |
| Xưởng | cao 3.5–5 m |
| Doanh trại | cao 4–5 m |
| Tháp canh | cao 7–9 m |
| Thành chính | cao 10–14 m |
| Ô dân | khoảng 12 × 10 m |
| Ô quan | khoảng 18 × 16 m |

### Quan hệ tỷ lệ

- NPC nhỏ hơn nhà.
- Nhà nhỏ hơn tháp.
- Tháp nhỏ hơn thành.
- Đại Thành phải là landmark lớn nhất.
- Địch Thành nhỏ hơn hoặc bằng Đại Thành một chút.
- Prop không được lớn ngang NPC nếu thực tế không như vậy.

---

## 4. Giới hạn polygon

| Asset | Triangle đề xuất |
|---|---:|
| NPC | 4.000–10.000 |
| Prop nhỏ | 100–2.000 |
| Nhà nhỏ | 5.000–15.000 |
| Tháp canh | 10.000–20.000 |
| Thành chính | 40.000–100.000 |
| Cụm tre | 300–1.000 |
| Cụm lúa | 100–500 |

Chất lượng không phụ thuộc hoàn toàn vào polygon. Ưu tiên:

1. Silhouette.
2. Tỷ lệ.
3. Texture.
4. Material.
5. Ánh sáng.
6. Bố cục.

---

# 5. Thiết kế nhân vật

## 5.1. Sáu nhóm nhân vật bắt buộc

1. Nông dân.
2. Tiều phu.
3. Thợ mộc.
4. Binh sĩ.
5. Quân canh.
6. Cấm quân.

## 5.2. Phong cách tạo hình

- Đầu hơi lớn hơn tỷ lệ thực.
- Tay và bàn chân rõ silhouette.
- Cơ thể chắc, dễ đọc khi camera xa.
- Mặt có mắt, mũi, lông mày đơn giản.
- Da màu ấm.
- Vải thô, ít bóng.
- Công cụ có kích thước đủ rõ.
- Trang phục mang ngôn ngữ Việt Nam lịch sử giả tưởng.

### Nông dân

- Nón lá.
- Áo nâu hoặc xanh trầm.
- Quần tối màu.
- Cuốc, liềm, giỏ tre hoặc bó lúa.

### Tiều phu

- Khăn buộc đầu.
- Áo ngắn.
- Rìu.
- Dây buộc tre.
- Gùi hoặc bó gỗ.

### Thợ mộc

- Khăn đầu.
- Tạp dề hoặc đai dụng cụ.
- Búa, cưa hoặc ván gỗ.

### Binh sĩ

- Giáp da hoặc giáp vải.
- Mũ trụ.
- Giáo.
- Khiên.
- Màu phe rõ ràng.

### Quân canh

- Giáp nặng hơn binh sĩ thường.
- Giáo dài.
- Trang phục tối hơn.
- Pose đứng gác rõ.

### Cấm quân

- Giáp vàng hoặc đồng.
- Mũ trụ nổi bật.
- Áo choàng hoặc điểm nhấn đỏ.
- Vũ khí trang trọng.

---

## 5.3. Modular character

Không cần tạo sáu model hoàn toàn độc lập. Dùng hệ modular:

```text
Character
├── BaseBody
├── Head_A / Head_B
├── Hair_A / Hair_B
├── Shirt_Farmer
├── Shirt_Worker
├── Armor_Soldier
├── Armor_Elite
├── Hat_Conical
├── HeadScarf
├── Helmet_Guard
├── Helmet_Elite
├── Tool_Hoe
├── Tool_Axe
├── Tool_Hammer
├── Weapon_Spear
└── Shield
```

Lợi ích:

- Dễ tạo biến thể.
- Giảm dung lượng.
- Dùng chung skeleton.
- Đổi nghề theo vùng dễ hơn.

---

## 5.4. Biến thể nhân vật

Mỗi nghề nên có:

- Ít nhất hai khuôn mặt.
- Hai màu áo.
- Hai kiểu tóc hoặc nón.
- Hai bộ phụ kiện.
- Ba mức chiều cao nhỏ.
- Rotation và pose khác nhau khi spawn.

Không xếp NPC thành hàng thẳng trừ cảnh luyện quân có chủ đích.

---

# 6. Rig nhân vật

Tất cả nhân vật nên dùng chung skeleton.

```text
Root
└── Hips
    ├── Spine
    │   ├── Chest
    │   │   ├── Neck
    │   │   │   └── Head
    │   │   ├── UpperArm.L
    │   │   │   └── LowerArm.L
    │   │   │       └── Hand.L
    │   │   └── UpperArm.R
    │   │       └── LowerArm.R
    │   │           └── Hand.R
    ├── UpperLeg.L
    │   └── LowerLeg.L
    │       └── Foot.L
    └── UpperLeg.R
        └── LowerLeg.R
            └── Foot.R
```

## Socket công cụ

```text
RightHandSocket
LeftHandSocket
BackSocket
WaistSocket
```

Không gộp cứng công cụ vào mesh nếu muốn tái sử dụng animation.

---

# 7. Animation nhân vật

## 7.1. Animation chung

- `Idle`
- `Walk`
- `Run`
- `TurnLeft`
- `TurnRight`
- `Celebrate`
- `Hit`
- `Defeated`

## 7.2. Nông dân

- `PlantRice`
- `HarvestRice`
- `CarryRice`
- `RestWithHoe`

## 7.3. Tiều phu

- `ChopBamboo`
- `CarryLog`
- `TieBamboo`

## 7.4. Thợ mộc

- `HammerWood`
- `SawWood`
- `CarryPlank`

## 7.5. Binh sĩ

- `SpearPractice`
- `ShieldPractice`
- `March`
- `Salute`

## 7.6. Quân canh

- `GuardIdle`
- `LookAround`
- `RaiseAlarm`
- `TowerPatrol`

## 7.7. Cấm quân

- `RoyalGuardIdle`
- `SpearStand`
- `GatePatrol`

## Quy chuẩn animation

- Loop lao động: 1–3 giây.
- Loop không bị giật tại frame đầu/cuối.
- Root motion tắt cho animation tại chỗ.
- Walk và Run có thể dùng root motion hoặc engine-driven movement.
- Export animation clip có tên rõ ràng.

---

# 8. Material và texture nhân vật

Dùng texture atlas chung:

```text
Characters_BaseColor.png
Characters_Normal.png
Characters_ORM.png
```

ORM:

- R: Ambient Occlusion.
- G: Roughness.
- B: Metallic.

Kích thước:

- Prototype: 1K.
- Production desktop: 2K.

### Giá trị vật liệu

| Vật liệu | Roughness | Metallic |
|---|---:|---:|
| Da | 0.65–0.8 | 0 |
| Vải | 0.7–0.9 | 0 |
| Gỗ | 0.65–0.85 | 0 |
| Đá | 0.75–0.95 | 0 |
| Kim loại | 0.35–0.6 | 0.7–1 |
| Đồng cũ | 0.45–0.7 | 0.7–0.9 |

---

# 9. Kiến trúc mỗi ô dân

Mỗi ô phải là một prefab scene, không phải một model đơn lẻ.

```text
Territory
├── Terrain
│   ├── Soil
│   ├── Grass
│   ├── StoneBorder
│   ├── Moss
│   └── HeightVariation
├── MainStructure
├── Vegetation
├── Props
├── ResourcePile
├── SpawnPoints
├── FactionFlag
└── Effects
```

Mỗi ô cần có:

- Main element.
- Nhân vật.
- Prop.
- Vegetation.
- Ground detail.
- Faction indicator.
- Contact shadow.

---

# 10. Ô Ruộng lúa

## Thành phần

- 12–20 cụm lúa.
- Lúa cao thấp khác nhau.
- Mương nước.
- Đất ẩm.
- Bờ cỏ.
- Bó lúa đã gặt.
- Giỏ tre.
- Cuốc và liềm.
- Xe bò ở mép ruộng.
- Đá nhỏ.

## NPC

- 1 quân: một nông dân.
- 3 quân: ba nông dân phân bố tự nhiên.
- 5+ quân: nhóm nhỏ làm việc.

Nông dân phải đứng trong ruộng hoặc sát bờ ruộng, không đứng giữa nền trống.

## Animation

- Cấy lúa.
- Gặt lúa.
- Mang bó lúa.
- Lúa đung đưa.
- Nước gợn nhẹ.

## Tối ưu

Dùng `InstancedMesh` cho cụm lúa.

---

# 11. Ô Rừng tre

## Thành phần

- 4–7 cụm tre.
- Tre non và tre già.
- Nhiều chiều cao.
- Cỏ chân tre.
- Đá.
- Đường đất nhỏ.
- Gỗ đã chặt.
- Dây buộc.
- Rìu.
- Hàng rào tre.

## NPC

- Tiều phu đứng gần tre hoặc đống gỗ.
- Không đứng ở trung tâm nền trống.

## Animation

- Chặt tre.
- Buộc tre.
- Mang bó tre.
- Lá rơi nhẹ.
- Tre đung đưa.

---

# 12. Ô Xưởng mộc

## Thành phần

- Xưởng mái ngói hoặc mái gỗ.
- Bàn làm việc.
- Khúc gỗ.
- Ván gỗ.
- Cưa.
- Búa.
- Thùng.
- Hộp dụng cụ.
- Mùn cưa.
- Xe kéo.

## NPC

- Thợ đóng búa cạnh bàn.
- Thợ cưa cạnh ván.
- Thợ mang gỗ gần kho.

## Animation

- Đóng búa.
- Cưa gỗ.
- Mang ván.
- Bụi gỗ.
- Khói nhẹ từ lò.

---

# 13. Ô Doanh trại

## Thành phần

- Lều chính.
- Lều nhỏ.
- Cờ phe.
- Trống lệnh.
- Giá giáo.
- Khiên.
- Hình nộm tập luyện.
- Hàng rào.
- Thùng tiếp tế.
- Đống lửa.

## NPC

- 3–5 binh sĩ.
- Pose và rotation khác nhau.
- Một người luyện giáo.
- Một người cầm khiên.
- Một người đứng gần trống.

## Animation

- Luyện giáo.
- Đỡ khiên.
- Đi tuần.
- Đánh trống.
- Cờ bay.
- Lửa trại.

---

# 14. Ô Tháp canh

## Thành phần

- Tháp gỗ cao.
- Cầu thang.
- Sàn quan sát.
- Mái cong Việt.
- Cờ.
- Hàng rào chân tháp.
- Cọc phòng thủ.
- Đá và bụi cây.

## Spawn point

```text
Guard_Top
Guard_Base
Guard_Path_A
Guard_Path_B
```

Ít nhất một lính phải đứng trên sàn cao.

## Animation

- Đứng gác.
- Nhìn quanh.
- Đi tuần.
- Báo động.

---

# 15. Đại Thành

Đại Thành là landmark chính.

## Module cần có

```text
Fortress
├── MainGate
├── Wall_Straight
├── Wall_Corner
├── Tower_Small
├── Tower_Large
├── MainHall
├── Roof_Red
├── Staircase
├── Battlement
├── Flags
├── GuardSpawns
├── Vegetation
├── Rocks
└── Moss
```

## Yêu cầu

- Diện tích gấp 2–2.5 lần ô dân.
- Cao gấp 2–3 lần nhà dân.
- Cổng chính hướng về camera.
- Hai tháp hai bên.
- Chính điện cao phía sau.
- Mái ngói đỏ.
- Cờ đỏ và vàng.
- Tường đá xám nâu.
- Bậc thang lớn.
- Rêu ở chân thành.
- Cỏ giữa khe đá.
- 4–8 Cấm quân.

Không dùng một cube gắn mái.

---

# 16. Địch Thành

Dùng cùng ngôn ngữ kiến trúc với Đại Thành.

Khác biệt:

- Cờ xanh.
- Mái xanh đậm.
- Accent lạnh hơn.
- Ít vàng hơn.
- Ánh sáng hơi xanh.

Không tạo phong cách kiến trúc khác hoàn toàn.

---

# 17. Prop môi trường

Cần sử dụng có mục đích:

- Cờ.
- Trống.
- Hàng rào.
- Cọc gỗ.
- Xe bò.
- Thuyền.
- Thùng.
- Giỏ.
- Hòm.
- Gỗ.
- Đá.
- Công cụ.
- Khiên.
- Giáo.
- Bia tập.
- Đống tài nguyên.

Không scatter ngẫu nhiên toàn bộ prop.

---

# 18. Terrain

Không dùng hộp chữ nhật phẳng làm ô cuối cùng.

Terrain cần có:

- Đất.
- Cỏ.
- Viền đá.
- Rêu.
- Vết bùn.
- Đá nhỏ.
- Vegetation nhỏ.
- Height variation nhẹ.

Ranh giới gameplay vẫn đọc được bằng:

- Viền đá.
- Chênh cao nhẹ.
- Highlight hover.
- Vòng chọn.

---

# 19. Bố cục bàn cờ

Dùng bố cục diagonal/isometric:

```text
                         [ĐẠI THÀNH]
                [THÁP] [DOANH TRẠI]
          [RỪNG] [XƯỞNG] [RUỘNG]

          [RUỘNG] [XƯỞNG] [RỪNG]
                [DOANH TRẠI] [THÁP]
[ĐỊCH THÀNH]
```

Luật game vẫn dùng ID `0–9`. Chỉ thay vị trí hiển thị.

---

# 20. Liên kết toàn bàn

Để các ô thuộc cùng một thế giới:

- Nền nước hoặc nền đất chung.
- Đường đá nối ô.
- Cầu nhỏ.
- Thuyền.
- Cụm cỏ giữa các ô.
- Fog hòa mép.
- Màu đất và đá thống nhất.

---

# 21. Camera

Ưu tiên `OrthographicCamera`.

## Góc nhìn

- Azimuth: 35–45°.
- Elevation: 30–40°.
- Đại Thành phía phải sau.
- Địch Thành phía trái trước.

## Zoom

- Toàn bàn: zoom khoảng 45–60.
- Cận một ô: zoom khoảng 120–180.
- Giới hạn để camera không chui vào model.

## Điều khiển

- Wheel: zoom.
- Drag: xoay giới hạn.
- Pan chỉ mở khi zoom gần.
- Double-click ô: focus camera.
- Nút `Về toàn cảnh`.
- `Esc`: quay lại toàn cảnh.

---

# 22. Ánh sáng

## Key light

- Directional light màu ấm.
- Từ trái trên.
- Intensity khoảng 2–3.
- Shadow map 2048 hoặc 4096.

## Fill light

- Hemisphere light xanh xám.
- Intensity 0.7–1.2.

## Rim light

- Từ phía sau.
- Màu xanh lạnh.
- Cường độ thấp.

## Shadow

- NPC và công trình phải có contact rõ với đất.
- Contact shadow tĩnh dùng `frames={1}`.
- NPC động dùng shadow map thường.

---

# 23. Background

- Xanh xám hoặc xanh lục xám.
- Sương nhẹ.
- Núi xa dạng silhouette.
- Cây xa.
- Mây thấp.
- Vignette nhẹ.

Background không được cạnh tranh với bàn cờ.

---

# 24. Bảng màu

| Mục | Màu gợi ý |
|---|---|
| Deep navy | `#101A24` |
| Friendly blue | `#31536B` |
| Earth | `#70593A` |
| Grass | `#6F8145` |
| Rice | `#C79A2D` |
| Stone | `#777467` |
| Wood | `#76502F` |
| Terracotta | `#9B3B2F` |
| Enemy red | `#A8322A` |
| Aged gold | `#D3A84D` |
| Atmosphere | `#53645B` |

---

# 25. Shader vegetation

Lúa và tre nên đung đưa bằng vertex shader:

$$
x' = x + \sin(t \cdot s + y \cdot f + p) \cdot a
$$

Trong đó:

- $t$: thời gian.
- $s$: tốc độ.
- $f$: tần số theo chiều cao.
- $p$: phase của instance.
- $a$: biên độ.

Chân cây ít chuyển động, ngọn cây chuyển động nhiều hơn.

---

# 26. VFX

## Chọn ô

- Vòng vàng.
- Viền đá sáng nhẹ.
- Tăng brightness 5–8%.
- Không dùng neon.

## Rải quân

1. Đường đi phát sáng.
2. NPC chạy theo spline.
3. Một người dừng tại mỗi ô.
4. Bụi nhỏ tại điểm dừng.
5. Cập nhật quân theo từng bước hoặc cuối animation.

## Sản xuất

- Ruộng: icon lương thực.
- Rừng: lá hoặc bụi.
- Xưởng: tia lửa nhỏ.
- Doanh trại: trống.
- Tháp: hiệu ứng quan sát.

---

# 27. Âm thanh

- Gió qua tre.
- Nước.
- Chim.
- Cuốc.
- Rìu.
- Búa.
- Giáo và khiên.
- Trống lệnh.
- Chọn ô.
- Rải quân.
- Công thành.

Giới hạn số nguồn spatial audio hoạt động đồng thời.

---

# 28. Kiến trúc code đề xuất

```text
src/game3d/
├── BoardScene.tsx
├── camera/
│   ├── GameCamera.tsx
│   └── CameraController.ts
├── territories/
│   ├── Territory.tsx
│   ├── RiceTerritory.tsx
│   ├── BambooTerritory.tsx
│   ├── WorkshopTerritory.tsx
│   ├── BarracksTerritory.tsx
│   └── WatchtowerTerritory.tsx
├── fortress/
│   └── Fortress.tsx
├── characters/
│   ├── Character.tsx
│   ├── CharacterAnimator.tsx
│   └── equipment.ts
├── effects/
│   ├── SelectionEffect.tsx
│   ├── MarchEffect.tsx
│   └── ProductionEffect.tsx
├── environment/
│   ├── Water.tsx
│   ├── Atmosphere.tsx
│   └── Vegetation.tsx
├── data/
│   ├── territoryConfig.ts
│   ├── spawnPoints.ts
│   └── assetTransforms.ts
└── assetRegistry.ts
```

---

# 29. Data-driven territory

```ts
type TerritoryDefinition = {
  id: number
  type: 'rice' | 'bamboo' | 'workshop' | 'camp' | 'tower'
  position: [number, number, number]
  rotation: [number, number, number]
  faction: 'player' | 'enemy'
  dioramaAsset: string
  npcAsset: string
  resourceAsset: string
  spawnPoints: SpawnPoint[]
  propPlacements: PropPlacement[]
}
```

Không hardcode toàn bộ model trực tiếp trong JSX.

---

# 30. Spawn point xác định trước

```ts
const riceSpawns = [
  { position: [-0.6, 0, -0.2], rotation: 0.5 },
  { position: [0.2, 0, 0.4], rotation: -2.1 },
  { position: [0.6, 0, -0.3], rotation: 2.4 },
]
```

Yêu cầu:

- Không dùng random mỗi render.
- Không xếp NPC thẳng hàng.
- NPC phải tương tác với môi trường.
- Lính trên tháp dùng spawn point có Y cao.

---

# 31. LOD và hiệu năng

## Zoom xa

- 1–3 NPC mỗi ô.
- Ẩn prop nhỏ.
- Giảm shadow NPC.
- Animation đơn giản.

## Zoom gần

- Hiện NPC theo quân số.
- Hiện công cụ nhỏ.
- Animation đầy đủ.
- Hiện hiệu ứng công việc.

## Instancing

Dùng `InstancedMesh` cho:

- Lúa.
- Tre.
- Cỏ.
- Đá nhỏ.
- Cọc.
- Giáo.
- Hàng rào.

---

# 32. Export GLB

Trong Blender:

1. Apply transforms.
2. Kiểm tra Y-up khi vào Three.js.
3. Chân model tại Y = 0.
4. Tên node rõ ràng.
5. Xóa camera/light không cần thiết.
6. Pack texture hoặc dùng URI hợp lệ.
7. Export animation cần thiết.
8. Kiểm tra GLB bằng glTF Viewer.

Sau export dùng glTF Transform:

- `prune`
- `dedup`
- `weld`
- Meshopt hoặc Draco.
- Resize texture.

---

# 33. Công cụ

## Blender

- Modeling.
- UV.
- Rig.
- Animation.
- LOD.
- GLB export.

## Substance Painter / ArmorPaint

- Base color.
- Dirt.
- Moss.
- Edge wear.
- Roughness.
- Metallic.

## Mixamo

Chỉ dùng làm nền cho:

- Idle.
- Walk.
- Run.

Animation nghề nghiệp cần tự làm.

## glTF Transform

- Optimize.
- Compress.
- Deduplicate.
- Prune.

---

# 34. Lộ trình triển khai

## Milestone 1 — Vertical slice Ruộng lúa

Làm hoàn chỉnh:

- Terrain.
- Lúa instanced.
- Nông dân rigged.
- Animation cấy hoặc gặt.
- Props.
- Shader gió.
- Camera gần.
- Lighting.
- Shadow.
- LOD.

## Milestone 2 — Rừng tre và Xưởng

Tái sử dụng:

- Skeleton.
- Shader vegetation.
- Spawn system.
- Material library.

## Milestone 3 — Doanh trại và Tháp

- Binh sĩ.
- Cờ.
- Trống.
- Weapon props.
- Guard spawn trên cao.

## Milestone 4 — Hai thành

- Fortress modular.
- Cổng.
- Tường.
- Tháp.
- Mái.
- Cấm quân.

## Milestone 5 — Toàn bàn

- Bố cục chéo.
- Camera orthographic.
- Water.
- Background.
- Fog.
- UI.

## Milestone 6 — VFX và âm thanh

- Selection.
- March.
- Production.
- Siege.
- Ambient audio.

---

# 35. Tiêu chí vertical slice Ruộng lúa

- Nhìn xa nhận ra ngay ruộng lúa.
- Zoom gần thấy nông dân cấy hoặc gặt.
- Nông dân không nổi trên mặt đất.
- Lúa chuyển động tự nhiên.
- Có bó lúa, giỏ, công cụ và mương nước.
- Shadow tiếp xúc rõ.
- FPS ổn khi có hai ô ruộng.
- Spawn theo quân số hoạt động.
- Chọn ô và rải quân không bị phá.

---

# 36. Checklist QA cuối

## Nhân vật

- [ ] Đúng tỷ lệ.
- [ ] Đúng Y-up.
- [ ] Chân chạm đất.
- [ ] Dùng skeleton chung.
- [ ] Animation loop tốt.
- [ ] Công cụ gắn đúng tay.
- [ ] Trang phục đúng vai trò.

## Territory

- [ ] Có terrain.
- [ ] Có main element.
- [ ] Có NPC.
- [ ] Có prop.
- [ ] Có vegetation.
- [ ] Có resource.
- [ ] Có spawn point.
- [ ] Có contact shadow.

## Thành trì

- [ ] Lớn hơn ô dân.
- [ ] Có cổng.
- [ ] Có tường.
- [ ] Có tháp.
- [ ] Có mái Việt.
- [ ] Có cờ.
- [ ] Có Cấm quân.
- [ ] Có cây, đá và rêu.

## Camera

- [ ] Isometric.
- [ ] Hai thành đều thấy rõ.
- [ ] Toàn bàn chiếm phần lớn viewport.
- [ ] Zoom gần xem rõ một ô.
- [ ] Zoom xa xem đủ bàn.
- [ ] Không chui xuống nền.

## Ánh sáng

- [ ] Key light ấm.
- [ ] Fill light lạnh nhẹ.
- [ ] Shadow rõ.
- [ ] Không có vật thể nổi.
- [ ] Fog không che gameplay.

## Hiệu năng

- [ ] GLTF cache.
- [ ] Instancing vegetation.
- [ ] NPC count có giới hạn.
- [ ] LOD theo zoom.
- [ ] Không clone material thừa.
- [ ] Không render contact shadow đắt mỗi frame.

---

# 37. Kết luận

Để đạt gần chất lượng hai ảnh tham chiếu, cần tập trung vào:

1. Tỷ lệ nhất quán.
2. Nhân vật rigged có animation nghề nghiệp.
3. Mỗi ô là một diorama có câu chuyện.
4. Vegetation và props đủ dày.
5. Hai thành có hierarchy rõ.
6. Camera orthographic đúng bố cục.
7. Ánh sáng ấm–lạnh có chiều sâu.
8. Material PBR cách điệu đồng nhất.
9. Spawn point xác định trước.
10. LOD và instancing để giữ hiệu năng.

Bước đầu tiên nên làm là:

> **Xây một ô Ruộng lúa production-ready, khóa toàn bộ pipeline nhân vật–animation–terrain–vegetation–lighting–LOD, sau đó áp dụng cùng hệ thống cho các ô còn lại.**
