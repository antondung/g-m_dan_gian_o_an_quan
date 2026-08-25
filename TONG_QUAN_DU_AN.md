# Ô Quan: Dựng Nước

> Game chiến thuật xây dựng và thủ thành 3D, phát triển từ luật rải quân của trò chơi dân gian Ô Ăn Quan.

---

## 1. Tổng quan dự án

**Ô Quan: Dựng Nước** biến bàn Ô Ăn Quan thành một lãnh thổ thu nhỏ. Mười ô dân trở thành mười vùng sản xuất hoặc quân sự; hai ô quan trở thành hai thành trì.

Người chơi không kéo từng đơn vị như game RTS thông thường. Mọi hoạt động phân công dân, sản xuất tài nguyên, bố trí phòng tuyến và tiến công đều được thực hiện bằng nước đi Ô Ăn Quan:

1. Chọn một vùng có người.
2. Chọn chiều rải.
3. Toàn bộ người trong vùng được phân lần lượt sang các vùng kế tiếp.
4. Mỗi người thực hiện công việc tại vùng họ đi qua hoặc dừng lại.
5. Thế ô trống có thể tạo phục kích và chiếm vùng địch.

### Câu giới thiệu

**“Mỗi nước rải là một mệnh lệnh toàn quốc: người dân đi qua đâu, nơi đó sản xuất; họ dừng ở đâu, nơi đó trở thành tiền tuyến.”**

### Thể loại

- Chiến thuật theo lượt.
- Xây dựng và quản lý tài nguyên.
- Thủ thành.
- Đối kháng chiến thuật.
- Game dân gian được biến tấu.

### Nền tảng hiện tại

- Web desktop.
- React và TypeScript.
- Vite.
- Three.js qua React Three Fiber.
- Giao diện 2D kết hợp bàn cờ WebGL 3D.
- Hồ sơ được lưu cục bộ bằng `localStorage`.

---

## 2. Mục tiêu thiết kế

Dự án hướng tới bốn mục tiêu:

### 2.1. Giữ bản sắc Ô Ăn Quan

- Giữ cấu trúc hai hàng ô dân và hai ô quan.
- Giữ thao tác chọn ô, chọn chiều và rải lần lượt.
- Giữ giá trị chiến thuật của số quân trong từng ô.
- Giữ vai trò đặc biệt của ô trống và ô quan.
- Không dùng Ô Ăn Quan như lớp hình ảnh phủ lên một game RTS không liên quan.

### 2.2. Tạo cảm giác điều hành một đế chế

Một nước rải không chỉ thay đổi con số. Nó đại diện cho một mệnh lệnh trên toàn lãnh thổ:

- Điều dân tới ruộng.
- Khai thác rừng.
- Vận chuyển vật liệu.
- Bổ sung quân cho doanh trại.
- Tăng phòng thủ tại tháp canh.
- Chuẩn bị chống đợt công thành.
- Tạo thế phục kích quân địch.

### 2.3. Dễ hiểu nhưng có chiều sâu

Điều khiển chỉ gồm chọn vùng và chọn hướng. Chiều sâu đến từ:

- Số người trong mỗi vùng.
- Thứ tự các vùng trên đường rải.
- Tài nguyên cần ưu tiên.
- Nhiệm vụ hiện tại.
- Thời điểm địch công thành.
- Sức mạnh phòng tuyến.
- Khả năng tạo ô trống và chuỗi phục kích.

### 2.4. Văn hóa gắn trực tiếp với gameplay

Yếu tố dân gian không chỉ nằm ở trang trí. Luật Ô Ăn Quan là nền tảng của toàn bộ hệ thống điều hành, sản xuất và chiến đấu.

---

## 3. Bối cảnh và thế giới

Người chơi vào vai một **Thành chủ**, quản lý Đại Thành và năm vùng lãnh thổ. Phía bên kia bàn cờ là địch thành cùng năm vùng đối lập.

Thế giới mang phong cách Việt Nam giả tưởng, lấy cảm hứng từ:

- Thành đất và thành cổ.
- Lũy tre.
- Ruộng lúa.
- Làng nghề.
- Trống lệnh.
- Đình làng.
- Cờ hiệu và kiến trúc truyền thống.

Dự án không tái hiện trực tiếp một cuộc chiến lịch sử. Cách tiếp cận giả tưởng giúp tự do sáng tạo nhưng vẫn cần thống nhất về kiến trúc, trang phục và mỹ thuật.

---

## 4. Cấu trúc bàn cờ

Bàn cờ gồm:

- **10 ô dân:** chia thành hai hàng, mỗi bên năm ô.
- **2 ô quan:** nằm tại hai đầu bàn cờ.
- **Hàng gần:** lãnh thổ người chơi.
- **Hàng xa:** lãnh thổ đối phương.

Trong bản 3D:

- Mỗi ô dân là một mảnh đất có công trình và nhân vật.
- Mỗi ô quan là một thành trì.
- Con số trên nhãn vùng là số người đang có tại đó.
- Màu xanh biểu thị vùng người chơi.
- Màu đỏ hoặc nâu biểu thị vùng địch.
- Vùng đang chọn có vòng sáng màu vàng.

---

## 5. Nhân vật và quân cờ

Mỗi viên quân Ô Ăn Quan được thể hiện bằng một nhân vật 3D.

### Nguyên tắc

- Một quân tương ứng một đơn vị dân số.
- Quân không có nghề cố định.
- Nghề nghiệp phụ thuộc vào vùng nhân vật đang đi qua hoặc dừng lại.
- Cùng một người có thể làm nông dân, thợ khai thác hoặc binh sĩ ở các lượt khác nhau.

### Vai trò theo vùng

| Vùng | Vai trò | Tác dụng |
|---|---|---|
| Ruộng lúa | Nông dân | Sản xuất lương thực |
| Rừng tre | Tiều phu | Thu thập gỗ |
| Xưởng mộc | Thợ xây | Thu thập vật liệu, chuẩn bị công trình |
| Doanh trại | Binh sĩ | Tăng sức mạnh phòng thủ |
| Tháp canh | Quân canh | Bảo vệ thành trước đợt tấn công |
| Ô quan | Cấm quân và thành trì | Mục tiêu cần bảo vệ hoặc đánh chiếm |

---

## 6. Luật chơi cốt lõi

### 6.1. Chọn vùng

Người chơi chỉ được chọn vùng:

- Thuộc quyền kiểm soát của mình.
- Có ít nhất một người.

Sau khi chọn, vùng phát sáng và thanh mệnh lệnh hiển thị số người sẵn sàng xuất phát.

### 6.2. Chọn chiều rải

Người chơi chọn một trong hai hướng:

- **Rải thuận.**
- **Rải ngược.**

Tên gọi này thay cho trái/phải vì hướng trên màn hình có thể thay đổi khi người chơi xoay camera 3D.

### 6.3. Rải quân

Khi mệnh lệnh được ban:

1. Toàn bộ người rời vùng xuất phát.
2. Một người được đặt vào vùng kế tiếp.
3. Người tiếp theo được đặt vào vùng sau đó.
4. Quá trình tiếp tục cho tới khi hết người.
5. Mỗi vùng đi qua được kích hoạt.
6. Vùng cuối cùng trở thành điểm dừng của hành trình.

Ví dụ: vùng có năm người sẽ phân một người vào từng vùng trong năm vùng kế tiếp.

### 6.4. Kích hoạt vùng

Mỗi người đi qua một vùng sẽ tạo hiệu ứng tương ứng:

- Qua Ruộng lúa: tạo lương thực.
- Qua Rừng tre: tạo gỗ.
- Qua Xưởng mộc: tạo đá hoặc điểm xây dựng.
- Qua Doanh trại: đóng góp vào quân sự.
- Qua Tháp canh: đóng góp vào phòng tuyến.

Trong prototype hiện tại:

- Mỗi lần qua Ruộng tạo `2` lương thực.
- Mỗi lần qua Rừng tạo `2` gỗ.
- Mỗi lần qua Xưởng tạo `1` đá.
- Mỗi nước đi tiêu hao `2` lương thực vận hành.

### 6.5. Ô trống và phục kích

Sau khi rải xong:

1. Game kiểm tra vùng ngay sau điểm kết thúc.
2. Nếu vùng đó trống, game kiểm tra vùng kế tiếp.
3. Nếu vùng kế tiếp thuộc địch và có quân, phục kích được kích hoạt.
4. Vùng địch bị thu phục.
5. Số quân bị bắt chuyển thành điểm uy danh và sát thương lên địch thành.

Cơ chế này diễn giải luật ăn quân qua ô trống của Ô Ăn Quan thành một cuộc phục kích chiến thuật.

### 6.6. Ô quan và thành trì

Hai ô quan được thể hiện thành:

- **Đại Thành:** thành của người chơi.
- **Địch Thành:** mục tiêu đối phương.

Mỗi thành có `100` HP trong prototype.

- Đại Thành mất HP khi đợt công thành vượt qua phòng tuyến.
- Địch Thành mất HP khi người chơi phục kích và chiếm quân địch.
- Địch Thành về `0` HP: người chơi chiến thắng.
- Đại Thành về `0` HP: người chơi thất bại.

---

## 7. Hệ thống tài nguyên

### 7.1. Lương thực

- Được sản xuất tại Ruộng lúa.
- Dùng để duy trì hoạt động và mệnh lệnh.
- Là tài nguyên nền của kinh tế và quân đội.

### 7.2. Gỗ

- Được khai thác tại Rừng tre.
- Dự kiến dùng để xây tháp, sửa tường và dựng công trình.

### 7.3. Đá

- Được tạo tại Xưởng mộc trong prototype.
- Bản hoàn chỉnh có thể đổi thành mỏ đá hoặc xưởng xây dựng.
- Dự kiến dùng để nâng cấp thành và công trình phòng thủ.

### 7.4. Uy danh

- Nhận từ hoàn thành nhiệm vụ.
- Nhận từ phục kích và thu phục quân địch.
- Đại diện cho điểm thành tích hoặc tài nguyên chính trị.

---

## 8. Hệ thống nhiệm vụ

Nhiệm vụ tạo mục tiêu ngắn hạn cho từng lượt. Chúng buộc người chơi xem xét đường rải thay vì chỉ chọn vùng có nhiều quân.

### Nhiệm vụ hiện có

#### Tích cốc phòng cơ

- Yêu cầu: đưa dân qua Ruộng lúa.
- Phần thưởng: thêm lương thực.

#### Dựng lũy tre xanh

- Yêu cầu: đưa dân qua Rừng tre.
- Phần thưởng: thêm gỗ.

#### Rèn binh giữ cõi

- Yêu cầu: đưa dân qua Doanh trại.
- Phần thưởng: thêm uy danh.

### Nguyên tắc thiết kế nhiệm vụ

Nhiệm vụ tốt phải gắn với nước rải:

- Đi qua một loại vùng.
- Dừng tại một vùng cụ thể.
- Kích hoạt nhiều vùng theo đúng thứ tự.
- Tạo ô trống chiến thuật.
- Hoàn thành trước đợt công thành.
- Giữ đủ quân tại phòng tuyến.

Nhiệm vụ không nên chỉ là danh sách thu thập số lượng lớn hoặc chờ thời gian trôi qua.

---

## 9. Hệ thống thủ thành

### Chu kỳ công thành

Trong prototype, địch tấn công sau mỗi ba lượt của người chơi.

HUD luôn hiển thị:

- Đợt công thành hiện tại.
- Số lượt còn lại để chuẩn bị.
- HP Đại Thành.

### Sức mạnh phòng tuyến

Phòng tuyến được tính từ tổng số người tại:

- Doanh trại.
- Tháp canh.

Càng nhiều người tại hai loại vùng này, sát thương thành phải nhận càng thấp.

### Công thức prototype

Sát thương cơ bản tăng theo số đợt. Sức phòng thủ được trừ khỏi sức tấn công, nhưng Đại Thành luôn nhận ít nhất một lượng sát thương tối thiểu.

Điều này tạo lựa chọn:

- Rải người khỏi tháp để làm kinh tế.
- Giữ người ở phòng tuyến để giảm sát thương.
- Chấp nhận mất HP nhằm chuẩn bị một nước phục kích mạnh.

---

## 10. Chiến thuật chính

### 10.1. Kinh tế hay quân sự

Đưa người qua Ruộng và Rừng giúp tăng tài nguyên nhưng có thể làm Doanh trại và Tháp canh thiếu quân.

### 10.2. Đường rải hay điểm dừng

Một đường rải dài kích hoạt nhiều vùng. Tuy nhiên, điểm dừng quyết định bố trí quân cho lượt tiếp theo.

### 10.3. Gom quân hay phân tán

- Gom nhiều người vào một vùng tạo nước rải dài và linh hoạt.
- Phân tán người giúp nhiều công trình hoạt động và phòng tuyến ổn định.

### 10.4. Tạo ô trống

Ô trống có thể làm kinh tế bị gián đoạn nhưng tạo cơ hội phục kích theo luật ăn quân.

### 10.5. Nhiệm vụ hay an toàn

Hoàn thành nhiệm vụ tạo phần thưởng lớn. Tuy nhiên, đường rải tối ưu cho nhiệm vụ chưa chắc tối ưu cho phòng thủ.

---

## 11. Vòng lặp gameplay

Một vòng chơi tiêu chuẩn:

1. Xem nhiệm vụ hiện tại.
2. Kiểm tra tài nguyên và số lượt trước đợt công thành.
3. Quan sát số người tại từng vùng.
4. Chọn vùng xuất phát.
5. Chọn hướng rải.
6. Nhân vật được phân tới các vùng kế tiếp.
7. Tài nguyên được sản xuất.
8. Nhiệm vụ được kiểm tra.
9. Thế phục kích được xử lý.
10. Đến chu kỳ quy định, địch tấn công Đại Thành.
11. Bàn cờ chuyển sang lượt tiếp theo.

---

## 12. Chế độ chơi định hướng

### 12.1. Thủ thành

- Người chơi xây dựng kinh tế và phòng tuyến.
- Địch tấn công theo từng đợt.
- Mục tiêu là sống sót và đánh sập địch thành.

### 12.2. Tranh hùng

- Người chơi đối đầu AI hoặc người chơi khác.
- Hai bên cùng tuân theo luật rải quân.
- Mục tiêu là chiếm vùng, cắt phòng tuyến và hạ ô quan đối phương.

### 12.3. Chiến dịch

Mỗi màn giới thiệu một hệ thống:

1. Mùa gieo hạt — học rải quân và sản xuất.
2. Dựng lũy tre — học thu thập và phòng thủ.
3. Giữ bến nước — học kiểm soát vùng.
4. Đường tiếp lương — học duy trì chuỗi vùng.
5. Đêm vây thành — chống nhiều đợt tấn công.
6. Tranh Ô Quan — đối đầu một đế chế hoàn chỉnh.

### 12.4. Hợp tác

Hai người cùng quản lý một bàn:

- Một người phụ trách kinh tế.
- Một người phụ trách quân sự.
- Cả hai phải thống nhất nước rải.

---

## 13. Giao diện người dùng

## 13.1. Màn tạo hồ sơ

Khi người chơi vào lần đầu:

- Game hiển thị màn chào mừng.
- Người chơi nhập tên hiệu.
- Hồ sơ được lưu trong `localStorage`.
- Sau khi tạo, khóa hướng dẫn tự động bắt đầu.

Màn hình gồm:

- Logo và tên game.
- Hình thành trì và cảnh quan cách điệu.
- Câu giới thiệu.
- Trường nhập tên hiệu.
- Nút `TẠO HỒ SƠ & BẮT ĐẦU`.
- Thông báo dữ liệu chỉ được lưu trên trình duyệt hiện tại.

> Đây mới là hồ sơ cục bộ, chưa phải hệ thống tài khoản có máy chủ, mật khẩu hoặc đồng bộ đám mây.

## 13.2. Header

Header hiển thị:

- Logo game.
- Tên người chơi.
- Nút mở lại hướng dẫn.
- Nút bắt đầu ván mới.

## 13.3. Thanh tài nguyên

Hiển thị liên tục:

- Lương thực.
- Gỗ.
- Đá.
- Uy danh.
- Số lượt hiện tại.
- Đợt công thành hiện tại.

## 13.4. Bảng nhiệm vụ bên trái

Hiển thị:

- Tên nhiệm vụ.
- Điều kiện hoàn thành.
- Phần thưởng.
- Tóm tắt cách chơi.

## 13.5. Bản đồ trung tâm

Bản đồ 3D là khu vực tương tác chính:

- Kéo chuột để xoay camera.
- Cuộn chuột để thu phóng.
- Nhấn vùng để chọn.
- Nhãn nổi hiển thị tên vùng và số người.
- La bàn chỉ hướng Bắc.
- Thanh HP địch thành nằm phía trên.

## 13.6. Thanh mệnh lệnh

Nằm dưới bản đồ, gồm:

- Trạng thái lựa chọn hiện tại.
- Số người sẵn sàng xuất phát.
- Giải thích hành động gần nhất.
- Nút `RẢI NGƯỢC`.
- Nút `RẢI THUẬN`.

Hai nút bị vô hiệu hóa nếu chưa chọn vùng hợp lệ.

## 13.7. Bảng phòng tuyến bên phải

Hiển thị:

- Hình Đại Thành.
- HP thành.
- Số lượt trước đợt tấn công tiếp theo.
- Nhật ký các sự kiện gần nhất.

## 13.8. Màn kết quả

Khi một thành về `0` HP:

- Hiện thông báo chiến thắng hoặc thất thủ.
- Cho phép dựng lại cơ đồ và chơi ván mới.

---

## 14. Hướng dẫn người chơi mới

Khóa hướng dẫn gồm năm bước.

### Bước 1 — Nhận biết bàn cờ

Giải thích:

- Bàn Ô Ăn Quan đã trở thành vương quốc 3D.
- Năm vùng gần thuộc người chơi.
- Năm vùng xa thuộc đối phương.
- Có thể xoay và phóng camera.

### Bước 2 — Hiểu quân

Giải thích:

- Mỗi nhân vật là một quân.
- Con số trên vùng là số người hiện có.
- Khi rải, toàn bộ người trong vùng được phân lần lượt.

### Bước 3 — Hiểu công việc

Giải thích:

- Ruộng tạo lương.
- Rừng tạo gỗ.
- Xưởng tạo vật liệu.
- Doanh trại và Tháp canh bảo vệ thành.

### Bước 4 — Chọn đạo quân

Người chơi phải thao tác thật:

- Chọn một vùng thuộc hàng gần.
- Vùng được chọn phát sáng.
- Hướng dẫn chỉ chuyển bước sau khi người chơi chọn thành công.

### Bước 5 — Ban lệnh

Người chơi phải:

- Nhấn `RẢI THUẬN`.
- Quan sát thay đổi quân và tài nguyên.
- Hoàn thành bài học đầu tiên.

Người chơi có thể bỏ qua hoặc mở lại hướng dẫn từ header.

---

## 15. Đồ họa 3D

### Công nghệ

- Scene được render bằng WebGL.
- `three` cung cấp nền tảng 3D.
- `@react-three/fiber` kết nối Three.js với React.
- `@react-three/drei` cung cấp camera control, môi trường và contact shadow.

### Thành phần 3D hiện tại

- Địa hình nền.
- Dòng nước hoặc đường trung tâm.
- Mười vùng dạng khối.
- Ruộng lúa.
- Rừng tre.
- Xưởng và doanh trại.
- Tháp canh.
- Hai thành trì.
- Nhân vật dân hoặc binh sĩ.
- Ánh sáng, bóng đổ và sương xa.
- Nhãn HTML gắn vào thế giới 3D.

### Điều khiển camera

- Giữ và kéo chuột để xoay.
- Cuộn để phóng to hoặc thu nhỏ.
- Camera bị giới hạn góc và khoảng cách để bàn cờ luôn dễ quan sát.
- Không cho kéo camera rời khỏi khu vực chính.

---

## 16. Phong cách mỹ thuật

### Màu sắc

- Xanh sẫm: Đại Thành và lãnh thổ người chơi.
- Đỏ đất: địch thành và quân đối phương.
- Vàng đồng: lệnh, phần thưởng và vùng được chọn.
- Nâu gỗ: kiến trúc và bàn cờ.
- Xanh lúa, tre và nước: kinh tế dân gian.

### Giao diện

- HUD tối giúp bàn cờ 3D nổi bật.
- Font `Playfair Display` dùng cho tiêu đề, tạo cảm giác sử thi.
- Font `Be Vietnam Pro` dùng cho nội dung, bảo đảm dễ đọc tiếng Việt.
- Biểu tượng đến từ `lucide-react`.

### Định hướng nâng cấp

- Nhân vật có hoạt ảnh chạy theo đường rải.
- Ruộng thay đổi theo giai đoạn mùa vụ.
- Khói từ xưởng và lửa từ doanh trại.
- Cờ phấp phới trên thành.
- Hiệu ứng chiến đấu và phục kích.
- Âm thanh trống lệnh, tiếng dân làm việc và tiếng công thành.

---

## 17. Cấu trúc kỹ thuật hiện tại

### `src/App.tsx`

Quản lý:

- Hồ sơ người chơi.
- Khóa hướng dẫn.
- Trạng thái bàn cờ.
- Tài nguyên.
- Lượt và đợt công thành.
- HP hai thành.
- Nhiệm vụ.
- Luật rải quân.
- Phục kích.
- HUD và màn kết quả.

### `src/Board3D.tsx`

Quản lý:

- Scene Three.js.
- Camera và điều khiển.
- Ánh sáng, bóng và môi trường.
- Mô hình vùng.
- Mô hình công trình.
- Mô hình nhân vật.
- Mô hình thành trì.
- Nhãn vùng.
- Tương tác chọn vùng.

### `src/styles.css`

Quản lý:

- Màn tạo hồ sơ.
- Header và thanh tài nguyên.
- Bố cục HUD.
- Thanh mệnh lệnh.
- Bảng nhiệm vụ và phòng tuyến.
- Nhãn trong không gian 3D.
- Tutorial overlay.
- Màn thắng hoặc thua.

### `src/main.tsx`

- Khởi tạo React.
- Gắn ứng dụng vào `#root`.
- Nạp stylesheet toàn cục.

### `package.json`

Chứa:

- Script chạy development.
- Script build production.
- React, TypeScript và Vite.
- Three.js, React Three Fiber và Drei.
- Lucide React.

---

## 18. Trạng thái prototype

### Đã có

- Dự án React TypeScript chạy được.
- Bàn cờ 3D tương tác.
- Mười vùng và hai thành.
- Nhân vật thay quân cờ.
- Chọn vùng và chọn hướng rải.
- Sản xuất tài nguyên theo đường rải.
- Ba nhiệm vụ luân phiên.
- Phục kích dựa trên ô trống.
- HP hai thành.
- Đợt công thành sau mỗi ba lượt.
- Phòng thủ dựa trên Doanh trại và Tháp canh.
- Màn tạo hồ sơ cục bộ.
- Tutorial năm bước.
- Màn chiến thắng và thất bại.
- Build production thành công.

### Chưa hoàn chỉnh

- AI chưa tự thực hiện lượt rải như một đối thủ đầy đủ.
- Hai chế độ Thủ thành và Tranh hùng chưa được tách thành vòng chơi riêng.
- Nhân vật chưa chạy theo quỹ đạo rải.
- Công trình chưa có hệ thống xây và nâng cấp.
- Gỗ và đá chưa có nhiều mục đích sử dụng.
- Chưa có âm thanh.
- Chưa có lưu ván chơi.
- Chưa có backend hoặc tài khoản trực tuyến.
- Chưa hỗ trợ multiplayer.
- Luật ăn liên hoàn và ô quan chưa mô phỏng đầy đủ mọi biến thể truyền thống.
- Chưa tối ưu bundle Three.js bằng code splitting.

---

## 19. Lộ trình phát triển đề xuất

### Giai đoạn 1 — Hoàn thiện vòng lặp

- Hiển thị trước đường rải.
- Làm hoạt ảnh nhân vật di chuyển từng vùng.
- Thêm trạng thái đi qua và dừng lại.
- Làm luật ăn liên hoàn.
- Thêm AI có lượt chơi riêng.
- Cân bằng tài nguyên và sát thương.

### Giai đoạn 2 — Xây dựng đế chế

- Xây hoặc đổi công trình trên từng vùng.
- Nâng cấp Ruộng, Rừng, Xưởng, Doanh trại và Tháp.
- Dùng gỗ và đá để sửa thành.
- Thêm tuyến tiếp tế.
- Thêm tinh thần và dân số.

### Giai đoạn 3 — Chiến đấu trực quan

- Quân địch xuất hiện thành từng đợt.
- Hoạt ảnh thủ thành thời gian thực ngắn.
- Cung thủ, dân binh và thợ sửa thành.
- Hiệu ứng phục kích và chiếm vùng.
- Trống lệnh và kỹ năng khẩn cấp.

### Giai đoạn 4 — Nội dung

- Chiến dịch nhiều màn.
- Sự kiện mùa vụ.
- Nhiệm vụ có cốt truyện.
- Nhiều loại bản đồ và cách bố trí vùng.
- Độ khó và AI khác nhau.

### Giai đoạn 5 — Sản phẩm hoàn chỉnh

- Backend tài khoản.
- Lưu tiến trình trên máy chủ.
- Thành tựu và bảng xếp hạng.
- Đối kháng hoặc hợp tác trực tuyến.
- Tối ưu desktop và thiết bị di động.
- Kiểm thử người dùng và accessibility.

---

## 20. Nguyên tắc cần giữ khi phát triển

1. Mọi hệ thống lớn phải liên quan tới thao tác rải quân.
2. Không cho điều quân tự do theo kiểu kéo-thả nếu làm mất bản sắc Ô Ăn Quan.
3. Mỗi lượt phải tạo một lựa chọn chiến thuật dễ hiểu.
4. Văn hóa phải ảnh hưởng tới luật và bối cảnh, không chỉ là skin.
5. Giao diện phải cho biết rõ vùng nào chọn được và kết quả dự kiến.
6. Đồ họa 3D không được che khuất số quân hoặc đường rải.
7. Nhiệm vụ phải hướng người chơi tới quyết định thú vị, không thành việc vặt.
8. Sản xuất, phòng thủ và tiến công phải cạnh tranh cùng một nguồn dân số.
9. Người chơi mới phải hiểu nước đi đầu tiên mà không cần đọc tài liệu ngoài game.
10. Luật gốc và phần biến tấu cần được phân biệt rõ trong phần giới thiệu văn hóa.

---

## 21. Điểm nổi bật của dự án

- Biến thao tác rải quân thành hệ thống phân công dân trên toàn lãnh thổ.
- Dùng ô trống làm cơ chế phục kích thay vì vị trí vô dụng.
- Biến ô quan thành mục tiêu thành chiến.
- Kết hợp game dân gian, quản lý tài nguyên và thủ thành.
- Quân cờ được thể hiện thành nhân vật có công việc.
- Bàn cờ 3D vẫn giữ bố cục quen thuộc của Ô Ăn Quan.
- Điều khiển đơn giản nhưng tạo nhiều lựa chọn kinh tế và quân sự.

---

## 22. Tóm tắt ngắn

**Ô Quan: Dựng Nước** là game chiến thuật 3D dùng nguyên lý rải quân của Ô Ăn Quan để điều hành một vương quốc. Mỗi người dân đi qua một vùng sẽ lao động, sản xuất hoặc phòng thủ. Người chơi phải cân bằng kinh tế, nhiệm vụ, bố trí quân và thời điểm công thành. Ô trống tạo phục kích; hai ô quan trở thành hai thành trì. Người mới được dẫn qua màn tạo hồ sơ và khóa hướng dẫn tương tác năm bước trước khi bước vào vòng chơi chính.
