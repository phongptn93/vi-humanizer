# Danh mục quy tắc

<!-- Tệp sinh tự động từ src/ — sửa ở đó rồi chạy `npm run docs`. -->

Mỗi quy tắc có mã cố định (`VI20`) và tên (`mot-cach`). Cấu hình, `--ignore`, `--rule` nhận cả hai.
Mức mặc định: lỗi (sai sự thật, lộ rò rỉ: phải sửa), cảnh báo (văn mẫu: nên sửa), gợi ý (nên biết).
Preset theo thể loại chỉnh mức của từng quy tắc, xem cuối tệp.

<!-- Danh mục trích văn mẫu làm ví dụ ❌, nên tắt quét toàn tệp. -->
<!-- vi-humanizer-disable -->

## Mở bài, kết bài theo mẫu

### VI01 `mo-bai-gioi-thieu` · Mở bài giới thiệu "Dưới đây là…"

*cảnh báo*

- ❌ Dưới đây là báo cáo tình hình sản xuất tuần 46.
- ✅ Tuần 46, xưởng đạt 96% kế hoạch.
- **Sửa:** Bỏ câu giới thiệu, vào thẳng nội dung.

### VI02 `mo-dau-xac-nhan` · Mở đầu xác nhận kiểu chatbot

*cảnh báo*

- ❌ Chắc chắn rồi! Tôi rất vui được hỗ trợ anh về vấn đề này.
- ✅ Anh đổi mật khẩu ở mục Tài khoản › Bảo mật.
- **Sửa:** Bỏ lời xác nhận; câu đầu tiên là câu trả lời.

### VI03 `ket-loi-moi-chung` · Kết bằng lời mời chung chung

*cảnh báo*

- ❌ Hy vọng thông tin trên hữu ích. Đừng ngần ngại liên hệ nếu anh cần thêm hỗ trợ.
- ✅ Anh xác nhận trước thứ Sáu để em đặt lịch.
- **Sửa:** Bỏ câu kết xã giao, hoặc thay bằng một bước tiếp theo cụ thể.

### VI04 `doan-tom-lai` · Đoạn "Tóm lại" nhắc lại thân bài

*cảnh báo*

- ❌ Tóm lại, hệ thống giúp tiết kiệm thời gian và nâng cao hiệu quả.
- ✅ (bỏ đoạn — thân bài đã nói đủ)
- **Sửa:** Bỏ đoạn tóm tắt nếu nó chỉ lặp lại; giữ một câu kết có thông tin mới.
- **Lưu ý:** Ở cuối biên bản hoặc báo cáo dài, một câu kết luận là hợp lý. Chỉ sửa khi nó lặp lại.

### VI05 `loi-ru-cung-tim-hieu` · Lời rủ "Hãy cùng tìm hiểu"

*cảnh báo*

- ❌ Hãy cùng tìm hiểu những lợi ích của phần mềm quản lý kho.
- ✅ Phần mềm quản lý kho giảm thời gian kiểm kê từ hai ngày xuống nửa ngày.
- **Sửa:** Bỏ lời rủ; nói luôn điều cần nói.

### VI06 `loi-chuc-cuoi` · Lời chúc cuối văn bản công việc

*cảnh báo*

- ❌ Chúc anh chị một ngày làm việc hiệu quả!
- ✅ (bỏ)
- **Sửa:** Bỏ lời chúc trong văn bản công việc.

### VI07 `hoi-can-gi-them` · Câu hỏi cuối "Anh/chị cần gì thêm không?"

*cảnh báo*

- ❌ Anh có cần em hỗ trợ gì thêm không?
- ✅ Anh muốn em tách số theo ca hay theo máy?
- **Sửa:** Hỏi một câu cụ thể có lựa chọn, hoặc không hỏi.

## Thổi phồng, sáo ngữ

### VI10 `dong-vai-tro` · "Đóng vai trò quan trọng"

*cảnh báo*

- ❌ Khâu kiểm tra đầu vào đóng vai trò then chốt trong quy trình.
- ✅ Bỏ khâu kiểm tra đầu vào thì lỗi chỉ lộ ra ở thành phẩm.
- **Sửa:** Nói cụ thể nó làm gì: "X quyết định Y", "thiếu X thì Y dừng".

### VI11 `khang-dinh-tuyet-doi` · Khẳng định tuyệt đối không căn cứ

*cảnh báo*

- ❌ Không thể phủ nhận rằng chuyển đổi số là xu thế tất yếu.
- ✅ (bỏ câu — hoặc nêu số liệu cụ thể)
- **Sửa:** Bỏ, hoặc đưa căn cứ (số, nguồn).

### VI12 `boi-canh-thoi-dai` · Mở bằng bối cảnh thời đại

*cảnh báo*

- ❌ Trong bối cảnh chuyển đổi số ngày nay, doanh nghiệp cần quản lý dữ liệu tốt hơn.
- ✅ Phòng kế hoạch đang mất hai ngày mỗi tháng để gom số từ năm file Excel.
- **Sửa:** Bỏ câu bối cảnh; người đọc đã biết đang sống ở thời nào.

### VI13 `sao-ngu-quang-cao` · Sáo ngữ quảng cáo

*cảnh báo*

- ❌ Giải pháp đột phá giúp doanh nghiệp bứt phá và nâng tầm vị thế.
- ✅ Sau ba tháng dùng, tỷ lệ giao hàng đúng hẹn tăng từ 82% lên 95%.
- **Sửa:** Thay bằng điều cụ thể đã xảy ra hoặc đo được.

### VI14 `nhan-manh-rong` · Từ nhấn mạnh rỗng dày đặc

*cảnh báo · ≥ 3 lần*

- ❌ Giao diện vô cùng thân thiện, hết sức dễ dùng và cực kỳ nhanh.
- ✅ Người mới dùng được sau mười phút hướng dẫn.
- **Sửa:** Bỏ phần lớn "vô cùng", "hết sức", "cực kỳ"; để con số hoặc sự việc tự nói.

### VI15 `tinh-tu-keu` · Tính từ "kêu" lặp

*cảnh báo · ≥ 3 lần*

- ❌ Giải pháp toàn diện, tối ưu và vượt trội cho doanh nghiệp hàng đầu.
- ✅ Một phần mềm cho cả kho, mua hàng và kế toán.
- **Sửa:** Mỗi tính từ phải có căn cứ; không có thì bỏ.

### VI16 `mang-lai-gia-tri` · "Mang lại giá trị / lợi ích / trải nghiệm"

*cảnh báo · ≥ 2 lần*

- ❌ Hệ thống mang lại giá trị to lớn và mang đến trải nghiệm tốt.
- ✅ Hệ thống cho thủ kho biết ngay mã nào sắp hết.
- **Sửa:** Nói giá trị đó là gì.

## Khuôn câu dịch từ tiếng Anh

### VI20 `mot-cach` · "Một cách + tính từ"

*cảnh báo · ≥ 2 lần*

- ❌ Hệ thống xử lý đơn hàng một cách nhanh chóng và một cách chính xác.
- ✅ Hệ thống xử lý đơn hàng nhanh và đúng.
- **Sửa:** Bỏ "một cách": "xử lý nhanh", không phải "xử lý một cách nhanh chóng".

### VI21 `viec-la-can-thiet` · Danh từ hoá "Việc … là cần thiết"

*cảnh báo*

- ❌ Việc kiểm tra thiết bị định kỳ là vô cùng cần thiết.
- ✅ Nên kiểm tra thiết bị mỗi tuần.
- **Sửa:** Dùng động từ làm chủ: "Nên kiểm tra hằng tuần".

### VI22 `duoc-boi` · Bị động "được … bởi"

*cảnh báo*

- ❌ Báo cáo được tạo tự động bởi hệ thống vào cuối ca.
- ✅ Cuối ca, hệ thống tự tạo báo cáo.
- **Sửa:** Đưa người/vật thực hiện lên đầu: "Hệ thống tạo báo cáo".

### VI23 `tien-hanh-cong-tac` · "Thực hiện việc / tiến hành công tác"

*cảnh báo*

- ❌ Tổ QC sẽ tiến hành công tác kiểm tra chất lượng lô hàng.
- ✅ Tổ QC sẽ kiểm lô hàng.
- **Sửa:** Dùng thẳng động từ: "kiểm tra", không phải "thực hiện việc kiểm tra".

### VI24 `su-dong-tu` · "Sự + động từ" thừa

*cảnh báo · ≥ 2 lần*

- ❌ Sự gia tăng của chi phí dẫn đến sự sụt giảm của lợi nhuận.
- ✅ Chi phí tăng nên lợi nhuận giảm.
- **Sửa:** "Sản lượng tăng", không phải "sự gia tăng của sản lượng".

### VI25 `dieu-nay` · "Điều này" mở câu liên tục

*cảnh báo · ≥ 3 lần*

- ❌ Điều này giúp tiết kiệm chi phí. Điều này cũng giảm sai sót. Điều này rất quan trọng.
- ✅ Gom đơn theo tuyến giảm 15% chi phí xe và bớt giao nhầm.
- **Sửa:** Gọi đúng tên sự việc thay cho "Điều này".

### VI26 `no-chi-vat` · "Nó" chỉ vật, dịch từ "it"

*cảnh báo · ≥ 2 lần*

- ❌ Phần mềm có module kho. Nó cho phép theo dõi tồn. Nó giúp lập phiếu nhanh.
- ✅ Module kho theo dõi tồn và lập phiếu nhập, xuất.
- **Sửa:** Nhắc lại tên đối tượng, hoặc bỏ chủ ngữ.

### VI27 `rao-don` · Câu rào đón

*cảnh báo*

- ❌ Có thể thấy rằng doanh thu quý 3 tăng mạnh.
- ✅ Doanh thu quý 3 tăng 18%.
- **Sửa:** Bỏ phần rào, giữ mệnh đề chính.

### VI28 `chuoi-cua` · Chuỗi "của … của"

*cảnh báo*

- ❌ Hiệu suất của máy của xưởng A giảm.
- ✅ Máy ở xưởng A chạy kém đi.
- **Sửa:** Tách câu hoặc đảo thành định ngữ: "hiệu suất máy ở xưởng A".

### VI29 `cho-phep-ban` · "Cho phép bạn / giúp bạn" kiểu tài liệu dịch

*cảnh báo · ≥ 2 lần*

- ❌ Tính năng này cho phép bạn dễ dàng đặt lịch và giúp bạn theo dõi tiến độ.
- ✅ Bạn đặt lịch và xem tiến độ ngay trên một màn hình.
- **Sửa:** Viết chủ động: "Bạn đặt lịch ngay trên màn hình".

## Khuôn ý lặp

### VI30 `khong-chi-ma-con` · "Không chỉ … mà còn" lặp

*cảnh báo · ≥ 2 lần*

- ❌ Không chỉ nhanh mà còn rẻ. Không chỉ tiện mà còn an toàn.
- ✅ Nhanh hơn, rẻ hơn. Dữ liệu được sao lưu mỗi đêm.
- **Sửa:** Giữ tối đa một lần; còn lại viết thành hai câu thường.

### VI31 `phu-dinh-song-song` · Phủ định song song "không phải X, mà là Y"

*cảnh báo*

- ❌ Đây không đơn thuần là một phần mềm, mà là một người đồng hành.
- ✅ Phần mềm kèm một kỹ sư hỗ trợ trong ba tháng đầu.
- **Sửa:** Nói thẳng Y; bỏ vế X dựng lên để bác.

### VI32 `tieu-de-cau-hoi` · Tiêu đề dạng câu hỏi

*cảnh báo*

- ❌ ## Vì sao nên chọn chúng tôi?
- ✅ ## Bảo hành 24 tháng, hỗ trợ tại chỗ trong 4 giờ
- **Sửa:** Đổi tiêu đề thành mệnh đề trả lời.

### VI33 `du-ban-la` · "Dù bạn là … hay …"

*cảnh báo*

- ❌ Dù bạn là doanh nghiệp nhỏ hay tập đoàn lớn, chúng tôi đều có giải pháp.
- ✅ Gói cơ bản dành cho xưởng dưới 50 người.
- **Sửa:** Bỏ; nói với đúng người đang đọc.

### VI34 `khung-thu-nhat` · Khung "Thứ nhất… Thứ hai… Cuối cùng"

*cảnh báo · ≥ 4 lần*

- ❌ Thứ nhất, … Thứ hai, … Bên cạnh đó, … Cuối cùng, …
- ✅ Có ba việc: chốt danh mục, nhập tồn đầu kỳ, đào tạo thủ kho.
- **Sửa:** Ý ngang hàng thì liệt kê ngắn; ý nối nhau thì viết thành đoạn.

## Định dạng

### VI40 `gach-dai` · Gạch dài "—" chèn giữa câu

*cảnh báo · ≥ 2 lần*

- ❌ Báo cáo — được cập nhật hằng ngày — giúp lãnh đạo nắm tình hình.
- ✅ Báo cáo cập nhật hằng ngày, nên lãnh đạo nắm được tình hình.
- **Sửa:** Tiếng Việt dùng dấu phẩy, hai chấm hoặc ngoặc đơn.
- **Lưu ý:** Gạch nối "–" trong cặp, khoảng ("Hà Nội – Hải Phòng") là đúng chuẩn, không bị báo.

### VI41 `emoji-dau-dong` · Emoji làm đầu dòng

*cảnh báo · ≥ 2 lần*

- ❌ 🚀 Nhanh / ✨ Đẹp / 🔥 Mạnh
- ✅ - Nhanh: … (nêu số đo)
- **Sửa:** Bỏ emoji ở đầu dòng; dùng gạch đầu dòng thường.

### VI42 `lan-ngoac-kep` · Lẫn hai kiểu ngoặc kép

*gợi ý*

- ❌ Chọn “Lưu” rồi bấm "Gửi".
- ✅ Chọn "Lưu" rồi bấm "Gửi".
- **Sửa:** Chọn một kiểu ngoặc kép cho cả văn bản.
- **Lưu ý:** Chỉ báo khi văn bản có cả “ ” và " " (xem analyze.js).

## Lời chatbot

### VI50 `tu-nhan-ai` · Tự nhận là AI / nhắc mốc dữ liệu

*lỗi*

- ❌ Là một mô hình ngôn ngữ, tôi không thể truy cập dữ liệu thời gian thực.
- ✅ (bỏ)
- **Sửa:** Bỏ hẳn khỏi văn bản gửi người khác.

### VI51 `khen-cau-hoi` · Khen câu hỏi / nịnh người hỏi

*cảnh báo*

- ❌ Câu hỏi rất hay! Anh hoàn toàn đúng khi quan tâm tới vấn đề này.
- ✅ (bỏ, vào thẳng câu trả lời)
- **Sửa:** Bỏ; trả lời luôn.

### VI52 `cho-trong` · Chỗ trống chưa điền

*lỗi*

- ❌ Kính gửi [Tên khách hàng], công ty [Tên công ty] xin gửi…
- ✅ Kính gửi anh Minh, Công ty An Phát xin gửi…
- **Sửa:** Điền thông tin thật hoặc hỏi người viết.

### VI53 `xin-loi-kieu-may` · Xin lỗi kiểu máy

*cảnh báo*

- ❌ Tôi xin lỗi vì sự nhầm lẫn này.
- ✅ Số ở dòng 3 bị cộng trùng ca 2; con số đúng là 1.240.
- **Sửa:** Nói đã sai gì và đã sửa thế nào.

## Rò rỉ kỹ thuật

### VI60 `ma-trich-dan-chatbot` · Mã trích dẫn của công cụ chat

*lỗi*

- ❌ Doanh thu tăng 12% citeturn0search3.
- ✅ Doanh thu tăng 12% (Báo cáo tài chính quý 3).
- **Sửa:** Xoá mã; nếu cần nguồn thì ghi nguồn thật.

### VI61 `utm-cong-cu-ai` · Liên kết mang tham số UTM của công cụ AI

*lỗi*

- ❌ https://example.com/bai-viet?utm_source=chatgpt.com
- ✅ https://example.com/bai-viet
- **Sửa:** Cắt phần ?utm_source=… khỏi liên kết.

### VI62 `ky-tu-an` · Ký tự ẩn (zero-width, BOM)

*gợi ý · không tính vào chỉ số văn mẫu*

- ❌ Mã⟨U+200B⟩SP01
- ✅ MãSP01
- **Sửa:** Xoá ký tự ẩn; chúng làm hỏng tìm kiếm và so khớp. `vi-humanizer clean` làm việc này.

## Cấu trúc (đo bằng số)

### VS01 `cau-deu-nhau` · Câu dài đều nhau

*cảnh báo*

- Đo: từ 6 câu và hệ số biến thiên độ dài câu dưới 0,25.
- **Sửa:** Xen câu ngắn (3–8 chữ) với câu dài; tách hoặc gộp vài câu.

### VS02 `in-dam-day` · In đậm dày đặc

*cảnh báo*

- Đo: từ 4 cụm in đậm và nhiều hơn một cụm mỗi 40 chữ.
- **Sửa:** Chỉ in đậm điều người đọc phải thấy đầu tiên; mỗi đoạn tối đa một chỗ.

### VS03 `gach-dau-dong-tran-lan` · Gần hết văn bản là gạch đầu dòng

*cảnh báo*

- Đo: từ 6 dòng và ít nhất 70% là gạch đầu dòng.
- **Sửa:** Ý có quan hệ nhân quả thì viết thành câu; chỉ liệt kê khi các mục ngang hàng.

### VS04 `tieu-de-viet-hoa` · Tiêu đề viết hoa mọi chữ

*cảnh báo*

- ❌ `# Kế Hoạch Sản Xuất Tháng 11` · ✅ `# Kế hoạch sản xuất tháng 11` (Nghị định 30/2020/NĐ-CP, Phụ lục II).
- **Sửa:** Tiếng Việt chỉ viết hoa chữ đầu tiêu đề và tên riêng.

### VI63 `chu-to-hop-nfd` · Chữ có dấu ở dạng tổ hợp (NFD)

*gợi ý · không tính vào chỉ số văn mẫu*

- Thường do chép từ macOS hoặc PDF.
- **Sửa:** Chuẩn hoá về NFC (`vi-humanizer fix` hoặc `clean`); chữ dạng tổ hợp làm tìm kiếm và sắp xếp sai.

## Chính tả, trình bày

Kiểm tính nhất quán trong cả văn bản. Không tính vào chỉ số văn mẫu: lỗi chính tả không làm văn bản "giống văn mẫu" hơn.

### CT01 `lan-kieu-bo-dau` · Lẫn hai kiểu bỏ dấu (hoà / hòa)

*cảnh báo · không tính vào chỉ số văn mẫu*

- ❌ Hoà giải xong, sức khỏe ổn, hồ sơ hòa hợp.
- ✅ Hòa giải xong, sức khỏe ổn, hồ sơ hòa hợp.
- **`fix` tự sửa:** có
- **Sửa:** Chọn một kiểu cho cả văn bản. `vi-humanizer fix` đổi theo kiểu đang dùng nhiều hơn.

### CT02 `lan-i-y` · Lẫn i và y trong cùng một từ (lý / lí)

*cảnh báo · không tính vào chỉ số văn mẫu*

- ❌ Kỹ thuật viên lập hồ sơ kĩ thuật.
- ✅ Kỹ thuật viên lập hồ sơ kỹ thuật.
- **`fix` tự sửa:** có
- **Sửa:** Chọn một cách viết cho cả văn bản. `vi-humanizer fix` đổi theo cách đang dùng nhiều hơn.

### CT03 `khoang-trang-dau-cau` · Khoảng trắng sai quanh dấu câu

*cảnh báo · không tính vào chỉ số văn mẫu*

- ❌ Đã giao hàng ,chờ xác nhận .
- ✅ Đã giao hàng, chờ xác nhận.
- **`fix` tự sửa:** có
- **Sửa:** Không cách trước dấu phẩy, chấm, chấm phẩy, hai chấm, chấm hỏi, chấm than; có một dấu cách sau dấu phẩy.

### CT04 `hai-dau-cach` · Nhiều dấu cách liền nhau giữa chữ

*gợi ý · không tính vào chỉ số văn mẫu*

- ❌ Báo cáo  tháng 11.
- ✅ Báo cáo tháng 11.
- **`fix` tự sửa:** có
- **Sửa:** Một dấu cách giữa hai chữ.

### CT05 `so-kieu-anh` · Số viết kiểu Anh (1,405,712)

*cảnh báo · không tính vào chỉ số văn mẫu*

- ❌ Doanh thu 1,405,712.5 nghìn đồng.
- ✅ Doanh thu 1.405.712,5 nghìn đồng.
- **`fix` tự sửa:** không (cần người viết xác nhận)
- **Sửa:** Tiếng Việt dùng dấu chấm phân cách nghìn, dấu phẩy thập phân: 1.405.712; 12,5. Không tự sửa: cần người viết xác nhận.

### CT06 `ngay-kieu-my` · Ngày viết kiểu Mỹ (tháng/ngày/năm)

*lỗi · không tính vào chỉ số văn mẫu*

- ❌ Hạn nộp 11/25/2026.
- ✅ Hạn nộp 25/11/2026.
- **`fix` tự sửa:** không (cần người viết xác nhận)
- **Sửa:** Viết ngày/tháng/năm: 25/11/2026. Không tự sửa: cần người viết xác nhận đúng ngày nào.

### CT07 `lap-tu` · Lặp hư từ ("của của", "là là")

*cảnh báo · không tính vào chỉ số văn mẫu*

- ❌ Báo cáo của của phòng kế hoạch.
- ✅ Báo cáo của phòng kế hoạch.
- **`fix` tự sửa:** có
- **Sửa:** Xoá từ lặp.

### CT08 `lan-dinh-dang-ngay` · Lẫn hai định dạng ngày (25/11/2026 và 2026-11-25)

*gợi ý · không tính vào chỉ số văn mẫu*

- ❌ Từ 20/11/2026 đến 2026-11-25.
- ✅ Từ 20/11/2026 đến 25/11/2026.
- **`fix` tự sửa:** không (cần người viết xác nhận)
- **Sửa:** Chọn một định dạng ngày cho cả văn bản. Trong văn bản tiếng Việt nên dùng ngày/tháng/năm.

## Xưng hô

### XH01 `xung-ban-trang-trong` · "Bạn" trong văn bản trang trọng

*tắt (bật qua preset) · không tính vào chỉ số văn mẫu*

- ❌ Bạn vui lòng xem xét đề nghị của Công ty.
- ✅ Đề nghị Quý Ban xem xét.
- **Sửa:** Gọi "Quý cơ quan", "Quý công ty", "anh/chị", hoặc gọi theo vai trò. Xem references/xung-ho.md.

## Thuật ngữ của tổ chức

Sinh từ `.vihumanizerrc.json`:

- **TN01 `tu-cam`:** cụm trong `banned`.
- **TN02 `thuat-ngu`:** chữ không dùng trong `terms` (vd `{ "phiếu lĩnh": ["phiếu xuất vật tư"] }`). `fix` tự thay, giữ hoa đầu câu.

## Chỉ số văn mẫu

Tổng 0–100, tất định. Không phải xác suất "do AI viết".

| Thành phần | Tối đa | Đo |
|---|---|---|
| Khuôn sáo | 45 | dấu hiệu khác nhau (trừ định dạng); lỗi ×1,5, cảnh báo ×1, gợi ý ×0,5; bão hoà ở 8 |
| Nhịp câu | 20 | hệ số biến thiên độ dài câu: 0,55 trở lên = 0, 0,15 trở xuống = tối đa (cần ≥ 4 câu) |
| Lặp cụm | 15 | tỷ lệ cụm 3 âm tiết lặp lại: 3% = 0, 20% = tối đa |
| Từ vựng | 10 | MATTR trên cặp âm tiết (cửa sổ 40): 0,97 = 0, 0,80 = tối đa |
| Định dạng | 10 | dấu hiệu định dạng; bão hoà ở 3 |

Dải: 0–20 sạch · 21–39 còn khuôn sáo · 40–100 văn mẫu rõ. Hiệu chỉnh trên bộ eval của repo.

## Preset theo thể loại

| Preset | Thể loại | Chữ tối thiểu | Chỉnh mức |
|---|---|---|---|
| `cong-van` | Công văn, tờ trình, quyết định | 40 | XH01 lỗi, VI41 lỗi, VI40 lỗi, VS02 lỗi, VI07 lỗi, VI14 lỗi, VI13 lỗi, VI02 lỗi, VI03 lỗi, VI06 lỗi, VI51 lỗi, CT05 lỗi, CT08 cảnh báo |
| `email` | Email công việc | 30 | VI03 lỗi, VI06 lỗi, VI02 lỗi, VI41 lỗi, VS04 gợi ý |
| `bao-cao` | Báo cáo cho lãnh đạo | 60 | VI04 lỗi, VI27 lỗi, VI12 lỗi, VI01 lỗi, CT05 lỗi, CT08 cảnh báo, VS03 gợi ý |
| `thong-bao` | Thông báo nội bộ | 30 | VI12 lỗi, VI13 lỗi, VI06 lỗi, VS04 lỗi |
| `tin-nhan` | Tin nhắn Zalo / chat | 15 | VS04 lỗi, VS02 lỗi, VI41 cảnh báo, VS03 tắt (bật qua preset), CT04 tắt (bật qua preset), CT08 tắt (bật qua preset) |
| `gioi-thieu` | Bài giới thiệu, bán hàng | 60 | VI13 lỗi, VI15 lỗi, VI33 lỗi, VI16 lỗi, VI11 lỗi |
| `huong-dan` | Hướng dẫn sử dụng | 60 | VI29 lỗi, VI26 lỗi, VI22 lỗi, VS03 tắt (bật qua preset) |

## Vùng không quét

Frontmatter YAML, vùng giữa `<!-- vi-humanizer-disable -->` và `<!-- vi-humanizer-enable -->`, khối mã, mã trong dòng, dòng trích dẫn (`> …`), URL và chú thích HTML được che trước khi quét, trừ nhóm rò rỉ kỹ thuật.
