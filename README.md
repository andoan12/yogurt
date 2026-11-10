# Mô Phỏng 3D Quá Trình Lên Men Lactic Làm Sữa Chua (Sinh Học 10)

Ứng dụng web tương tác 3D trực quan hóa quá trình lên men thực phẩm (làm sữa chua) dành cho học sinh và giáo viên lớp 10 (môn Sinh học & Công nghệ).

## Tính năng chính
- **Góc nhìn Kép 3D (Dual-Perspective Three.js)**:
  - **Vĩ mô (Macro 3D)**: Hũ sữa chua thủy tinh trên đế ủ nhiệt thông minh với hiệu ứng sóng sữa lỏng, quá trình đông tụ sữa chua, tách nước (huyết thanh) khi quá nhiệt, cùng nút thử độ sánh bằng muỗng và nghiêng hũ.
  - **Vi mô (Micro 3D — 10.000x)**: Mô phỏng cấu trúc không gian 3 chiều của hạt **Protein Micelle Casein** (với vòng điện tích âm $\kappa$-casein), **Trực khuẩn *Lactobacillus bulgaricus***, **Liên cầu khuẩn *Streptococcus thermophilus***, phân tử **Đường đôi Lactose**, **Axit Lactic** và sự hình thành **Mạng lưới Gel 3D** tại điểm đẳng điện ($\text{pI} \approx 4.6$).
- **Quy trình Tương tác 3 Bước**:
  1. **Chuẩn bị nguyên liệu**: Lựa chọn nền sữa (Sữa tươi tiệt trùng, Sữa đặc pha ấm, Sữa tách béo giàu đạm) và chủng vi khuẩn Lactic.
  2. **Quá trình Lên men & Máy đo pH trực tiếp**: Quan sát phương trình chuyển hóa đường Lactose thành Axit Lactic và theo dõi độ pH giảm từ `6.65` về `4.5`.
  3. **Biến đổi cấu trúc Gel 3D**: Điều chỉnh thanh trượt **Thời gian ủ (0 – 12 giờ)** và **Nhiệt độ (20°C – 60°C)** hoặc chọn các kịch bản thí nghiệm đối chứng trên lớp.

## Cài đặt & Chạy ứng dụng

```bash
npm install
npm run dev
```
