// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Phong Pham
// Danh mục dấu hiệu văn mẫu tiếng Việt — NGUỒN DUY NHẤT.
// CLI đọc trực tiếp file này; tài liệu `skills/vi-humanizer/references/dau-hieu.md` được sinh từ đây
// bằng `npm run docs`, và test chặn việc hai bên lệch nhau.
//
// Quy ước biểu thức:
//  - Viết như chuỗi, dịch với cờ `giu` (+ `m` nếu cần ^/$ theo dòng). Không phân biệt hoa thường.
//  - Ranh giới từ dùng (?<!\p{L}) và (?!\p{L}) thay cho \b, vì \b của JS không hiểu chữ có dấu.
//  - minCount: số lần tối thiểu mới tính là THÓI QUEN. Một chữ "vô cùng" là cách nói; năm lần mới là dấu hiệu.
//  - signal=false: vẫn báo để sửa, nhưng không tính vào mức đánh giá (thường do chép dán, không do cách viết).
//  - raw=true: quét trên văn bản gốc, kể cả trong khối mã / trích dẫn / URL (dùng cho rò rỉ kỹ thuật).

export const GROUPS = {
  'mo-ket': 'Mở bài, kết bài theo mẫu',
  'thoi-phong': 'Thổi phồng, sáo ngữ',
  'dich-may': 'Khuôn câu dịch từ tiếng Anh',
  'cau-truc': 'Khuôn ý lặp',
  'dinh-dang': 'Định dạng',
  'giao-tiep': 'Lời chatbot',
  'ro-ri': 'Rò rỉ kỹ thuật',
};

const L = '(?<!\\p{L})';
const R = '(?!\\p{L})';
const ADDR = '(bạn|anh/chị|anh chị|quý khách|các bạn|mọi người)';

/** @type {Array<{id:string,group:string,label:string,fix:string,re:string,flags?:string,minCount?:number,signal?:boolean,raw?:boolean,truoc:string,sau:string,note?:string}>} */
export const PATTERNS = [
  // ─── Mở / kết ──────────────────────────────────────────────────────────────────────────────────
  {
    id: 'VI01', group: 'mo-ket', label: 'Mở bài giới thiệu "Dưới đây là…"',
    fix: 'Bỏ câu giới thiệu, vào thẳng nội dung.',
    re: `^\\s*(dưới đây là|sau đây là|dưới đây (mình|tôi|em) (xin )?(gửi|tổng hợp|liệt kê))${R}`, flags: 'm',
    truoc: 'Dưới đây là báo cáo tình hình sản xuất tuần 46.',
    sau: 'Tuần 46, xưởng đạt 96% kế hoạch.',
  },
  {
    id: 'VI02', group: 'mo-ket', label: 'Mở đầu xác nhận kiểu chatbot',
    fix: 'Bỏ lời xác nhận; câu đầu tiên là câu trả lời.',
    re: `${L}(chắc chắn rồi|tất nhiên rồi|rất vui được (hỗ trợ|giúp|trả lời)|tôi rất sẵn lòng|đây là một (câu hỏi|chủ đề) (hay|thú vị))${R}`,
    truoc: 'Chắc chắn rồi! Tôi rất vui được hỗ trợ anh về vấn đề này.',
    sau: 'Anh đổi mật khẩu ở mục Tài khoản › Bảo mật.',
  },
  {
    id: 'VI03', group: 'mo-ket', label: 'Kết bằng lời mời chung chung',
    fix: 'Bỏ câu kết xã giao, hoặc thay bằng một bước tiếp theo cụ thể.',
    re: `${L}((hy|hi) vọng (thông tin|câu trả lời|những chia sẻ|bài viết)|đừng ngần ngại|nếu ${ADDR} (cần|có) (thêm )?(thông tin|hỗ trợ|chi tiết|câu hỏi))${R}`,
    truoc: 'Hy vọng thông tin trên hữu ích. Đừng ngần ngại liên hệ nếu anh cần thêm hỗ trợ.',
    sau: 'Anh xác nhận trước thứ Sáu để em đặt lịch.',
  },
  {
    id: 'VI04', group: 'mo-ket', label: 'Đoạn "Tóm lại" nhắc lại thân bài',
    fix: 'Bỏ đoạn tóm tắt nếu nó chỉ lặp lại; giữ một câu kết có thông tin mới.',
    re: `(^\\s*|[.!?]\\s+)(tóm lại|nói tóm lại|nhìn chung|tổng kết lại|kết luận lại|tựu trung lại)\\s*[,:]`, flags: 'm',
    truoc: 'Tóm lại, hệ thống giúp tiết kiệm thời gian và nâng cao hiệu quả.',
    sau: '(bỏ đoạn — thân bài đã nói đủ)',
    note: 'Ở cuối biên bản hoặc báo cáo dài, một câu kết luận là hợp lý. Chỉ sửa khi nó lặp lại.',
  },
  {
    id: 'VI05', group: 'mo-ket', label: 'Lời rủ "Hãy cùng tìm hiểu"',
    fix: 'Bỏ lời rủ; nói luôn điều cần nói.',
    re: `${L}(hãy cùng|cùng (mình|tôi|em)) (tìm hiểu|khám phá|điểm qua|đi sâu|phân tích|xem xét)${R}`,
    truoc: 'Hãy cùng tìm hiểu những lợi ích của phần mềm quản lý kho.',
    sau: 'Phần mềm quản lý kho giảm thời gian kiểm kê từ hai ngày xuống nửa ngày.',
  },
  {
    id: 'VI06', group: 'mo-ket', label: 'Lời chúc cuối văn bản công việc',
    fix: 'Bỏ lời chúc trong văn bản công việc.',
    re: `${L}chúc ${ADDR} (thành công|một ngày|làm việc hiệu quả|có trải nghiệm)`,
    truoc: 'Chúc anh chị một ngày làm việc hiệu quả!',
    sau: '(bỏ)',
  },
  {
    id: 'VI07', group: 'mo-ket', label: 'Câu hỏi cuối "Anh/chị cần gì thêm không?"',
    fix: 'Hỏi một câu cụ thể có lựa chọn, hoặc không hỏi.',
    re: `${L}(bạn|anh|chị|anh/chị|anh chị|quý khách|mọi người) (có )?(cần|muốn) (tôi|mình|em) (giúp|hỗ trợ|làm) (gì )?thêm( gì)?( nữa)?( không)?\\s*\\?`,
    truoc: 'Anh có cần em hỗ trợ gì thêm không?',
    sau: 'Anh muốn em tách số theo ca hay theo máy?',
  },

  // ─── Thổi phồng ────────────────────────────────────────────────────────────────────────────────
  {
    id: 'VI10', group: 'thoi-phong', label: '"Đóng vai trò quan trọng"',
    fix: 'Nói cụ thể nó làm gì: "X quyết định Y", "thiếu X thì Y dừng".',
    re: `${L}đóng (một )?vai trò (rất |vô cùng |hết sức )?(quan trọng|then chốt|chủ chốt|cốt lõi|thiết yếu)`,
    truoc: 'Khâu kiểm tra đầu vào đóng vai trò then chốt trong quy trình.',
    sau: 'Bỏ khâu kiểm tra đầu vào thì lỗi chỉ lộ ra ở thành phẩm.',
  },
  {
    id: 'VI11', group: 'thoi-phong', label: 'Khẳng định tuyệt đối không căn cứ',
    fix: 'Bỏ, hoặc đưa căn cứ (số, nguồn).',
    re: `${L}(không thể phủ nhận|không thể bàn cãi|không thể chối cãi|ai cũng biết rằng|hiển nhiên là)${R}`,
    truoc: 'Không thể phủ nhận rằng chuyển đổi số là xu thế tất yếu.',
    sau: '(bỏ câu — hoặc nêu số liệu cụ thể)',
  },
  {
    id: 'VI12', group: 'thoi-phong', label: 'Mở bằng bối cảnh thời đại',
    fix: 'Bỏ câu bối cảnh; người đọc đã biết đang sống ở thời nào.',
    re: `${L}(trong bối cảnh [^.!?\\n]{0,40}(ngày nay|hiện nay)|trong thời đại (số|công nghệ|4\\.0|ngày nay)|kỷ nguyên (số|mới)|thời đại 4\\.0|cuộc cách mạng công nghiệp)`,
    truoc: 'Trong bối cảnh chuyển đổi số ngày nay, doanh nghiệp cần quản lý dữ liệu tốt hơn.',
    sau: 'Phòng kế hoạch đang mất hai ngày mỗi tháng để gom số từ năm file Excel.',
  },
  {
    id: 'VI13', group: 'thoi-phong', label: 'Sáo ngữ quảng cáo',
    fix: 'Thay bằng điều cụ thể đã xảy ra hoặc đo được.',
    re: `${L}(bức tranh (toàn cảnh|tổng thể)|hành trình (chuyển đổi|số hoá|số hóa|phát triển)|chìa (khoá|khóa) (vàng|thành công)|đòn bẩy|nâng tầm|bứt phá|giải pháp đột phá|khẳng định vị thế|mở ra (kỷ nguyên|chương mới|cánh cửa)|góp phần không nhỏ|trải nghiệm (vượt trội|liền mạch))${R}`,
    truoc: 'Giải pháp đột phá giúp doanh nghiệp bứt phá và nâng tầm vị thế.',
    sau: 'Sau ba tháng dùng, tỷ lệ giao hàng đúng hẹn tăng từ 82% lên 95%.',
  },
  {
    id: 'VI14', group: 'thoi-phong', label: 'Từ nhấn mạnh rỗng dày đặc',
    fix: 'Bỏ phần lớn "vô cùng", "hết sức", "cực kỳ"; để con số hoặc sự việc tự nói.',
    re: `${L}(vô cùng|hết sức|cực kỳ|cực kì|thực sự rất|vô vàn|tuyệt vời|siêu)${R}`, minCount: 3,
    truoc: 'Giao diện vô cùng thân thiện, hết sức dễ dùng và cực kỳ nhanh.',
    sau: 'Người mới dùng được sau mười phút hướng dẫn.',
  },
  {
    id: 'VI15', group: 'thoi-phong', label: 'Tính từ "kêu" lặp',
    fix: 'Mỗi tính từ phải có căn cứ; không có thì bỏ.',
    re: `${L}(toàn diện|tối ưu|liền mạch|vượt trội|đa chiều|sâu sắc|mạnh mẽ|hiệu quả cao|đáng kể|tối đa hoá|tối đa hóa|chuyên nghiệp|hàng đầu)${R}`, minCount: 3,
    truoc: 'Giải pháp toàn diện, tối ưu và vượt trội cho doanh nghiệp hàng đầu.',
    sau: 'Một phần mềm cho cả kho, mua hàng và kế toán.',
  },
  {
    id: 'VI16', group: 'thoi-phong', label: '"Mang lại giá trị / lợi ích / trải nghiệm"',
    fix: 'Nói giá trị đó là gì.',
    re: `${L}mang (lại|đến) (những )?(giá trị|lợi ích|trải nghiệm|hiệu quả)${R}`, minCount: 2,
    truoc: 'Hệ thống mang lại giá trị to lớn và mang đến trải nghiệm tốt.',
    sau: 'Hệ thống cho thủ kho biết ngay mã nào sắp hết.',
  },

  // ─── Dịch máy ──────────────────────────────────────────────────────────────────────────────────
  {
    id: 'VI20', group: 'dich-may', label: '"Một cách + tính từ"',
    fix: 'Bỏ "một cách": "xử lý nhanh", không phải "xử lý một cách nhanh chóng".',
    re: `${L}một cách (?!(khác|nào|đó|này)${R})\\p{L}+`, minCount: 2,
    truoc: 'Hệ thống xử lý đơn hàng một cách nhanh chóng và một cách chính xác.',
    sau: 'Hệ thống xử lý đơn hàng nhanh và đúng.',
  },
  {
    id: 'VI21', group: 'dich-may', label: 'Danh từ hoá "Việc … là cần thiết"',
    fix: 'Dùng động từ làm chủ: "Nên kiểm tra hằng tuần".',
    re: `${L}việc \\p{L}+[^.!?\\n]{0,60}${L}là (rất |vô cùng |hết sức )?(cần thiết|quan trọng|thiết yếu|cần)${R}`,
    truoc: 'Việc kiểm tra thiết bị định kỳ là vô cùng cần thiết.',
    sau: 'Nên kiểm tra thiết bị mỗi tuần.',
  },
  {
    id: 'VI22', group: 'dich-may', label: 'Bị động "được … bởi"',
    fix: 'Đưa người/vật thực hiện lên đầu: "Hệ thống tạo báo cáo".',
    re: `${L}được [^.!?\\n,]{1,40}?${L}bởi${R}`,
    truoc: 'Báo cáo được tạo tự động bởi hệ thống vào cuối ca.',
    sau: 'Cuối ca, hệ thống tự tạo báo cáo.',
  },
  {
    id: 'VI23', group: 'dich-may', label: '"Thực hiện việc / tiến hành công tác"',
    fix: 'Dùng thẳng động từ: "kiểm tra", không phải "thực hiện việc kiểm tra".',
    re: `${L}(thực hiện|tiến hành) (việc|công tác|hoạt động)${R}`,
    truoc: 'Tổ QC sẽ tiến hành công tác kiểm tra chất lượng lô hàng.',
    sau: 'Tổ QC sẽ kiểm lô hàng.',
  },
  {
    id: 'VI24', group: 'dich-may', label: '"Sự + động từ" thừa',
    fix: '"Sản lượng tăng", không phải "sự gia tăng của sản lượng".',
    re: `${L}sự (gia tăng|sụt giảm|thay đổi|cải thiện|phát triển|hỗ trợ|tham gia|xuất hiện|kết hợp|đóng góp)${R}`, minCount: 2,
    truoc: 'Sự gia tăng của chi phí dẫn đến sự sụt giảm của lợi nhuận.',
    sau: 'Chi phí tăng nên lợi nhuận giảm.',
  },
  {
    id: 'VI25', group: 'dich-may', label: '"Điều này" mở câu liên tục',
    fix: 'Gọi đúng tên sự việc thay cho "Điều này".',
    re: `(^|[.!?]\\s+)điều này${R}`, flags: 'm', minCount: 3,
    truoc: 'Điều này giúp tiết kiệm chi phí. Điều này cũng giảm sai sót. Điều này rất quan trọng.',
    sau: 'Gom đơn theo tuyến giảm 15% chi phí xe và bớt giao nhầm.',
  },
  {
    id: 'VI26', group: 'dich-may', label: '"Nó" chỉ vật, dịch từ "it"',
    fix: 'Nhắc lại tên đối tượng, hoặc bỏ chủ ngữ.',
    re: `(^|[.!?]\\s+)nó (là|giúp|cho phép|mang lại|cung cấp|đảm bảo|hỗ trợ)${R}`, flags: 'm', minCount: 2,
    truoc: 'Phần mềm có module kho. Nó cho phép theo dõi tồn. Nó giúp lập phiếu nhanh.',
    sau: 'Module kho theo dõi tồn và lập phiếu nhập, xuất.',
  },
  {
    id: 'VI27', group: 'dich-may', label: 'Câu rào đón',
    fix: 'Bỏ phần rào, giữ mệnh đề chính.',
    re: `${L}(có thể nói rằng|có thể thấy rằng|cần lưu ý rằng|điều đáng chú ý là|điều quan trọng là|không thể không nhắc đến|điều đáng nói là|như chúng ta đã biết)${R}`,
    truoc: 'Có thể thấy rằng doanh thu quý 3 tăng mạnh.',
    sau: 'Doanh thu quý 3 tăng 18%.',
  },
  {
    id: 'VI28', group: 'dich-may', label: 'Chuỗi "của … của"',
    fix: 'Tách câu hoặc đảo thành định ngữ: "hiệu suất máy ở xưởng A".',
    re: `${L}của \\p{L}+( \\p{L}+)? của${R}`,
    truoc: 'Hiệu suất của máy của xưởng A giảm.',
    sau: 'Máy ở xưởng A chạy kém đi.',
  },
  {
    id: 'VI29', group: 'dich-may', label: '"Cho phép bạn / giúp bạn" kiểu tài liệu dịch',
    fix: 'Viết chủ động: "Bạn đặt lịch ngay trên màn hình".',
    re: `${L}(cho phép|giúp) (bạn|người dùng|quý khách)( dễ dàng)?${R}`, minCount: 2,
    truoc: 'Tính năng này cho phép bạn dễ dàng đặt lịch và giúp bạn theo dõi tiến độ.',
    sau: 'Bạn đặt lịch và xem tiến độ ngay trên một màn hình.',
  },

  // ─── Cấu trúc ──────────────────────────────────────────────────────────────────────────────────
  {
    id: 'VI30', group: 'cau-truc', label: '"Không chỉ … mà còn" lặp',
    fix: 'Giữ tối đa một lần; còn lại viết thành hai câu thường.',
    re: `${L}không (chỉ|những) [^.!?\\n]{1,80}?${L}mà còn${R}`, minCount: 2,
    truoc: 'Không chỉ nhanh mà còn rẻ. Không chỉ tiện mà còn an toàn.',
    sau: 'Nhanh hơn, rẻ hơn. Dữ liệu được sao lưu mỗi đêm.',
  },
  {
    id: 'VI31', group: 'cau-truc', label: 'Phủ định song song "không phải X, mà là Y"',
    fix: 'Nói thẳng Y; bỏ vế X dựng lên để bác.',
    re: `${L}không (chỉ |đơn thuần |đơn giản )?(là|phải là) [^.!?\\n]{1,50}?, mà (là|chính là)${R}`,
    truoc: 'Đây không đơn thuần là một phần mềm, mà là một người đồng hành.',
    sau: 'Phần mềm kèm một kỹ sư hỗ trợ trong ba tháng đầu.',
  },
  {
    id: 'VI32', group: 'cau-truc', label: 'Tiêu đề dạng câu hỏi',
    fix: 'Đổi tiêu đề thành mệnh đề trả lời.',
    re: `^#{1,6} [^\\n]*\\?\\s*$`, flags: 'm',
    truoc: '## Vì sao nên chọn chúng tôi?',
    sau: '## Bảo hành 24 tháng, hỗ trợ tại chỗ trong 4 giờ',
  },
  {
    id: 'VI33', group: 'cau-truc', label: '"Dù bạn là … hay …"',
    fix: 'Bỏ; nói với đúng người đang đọc.',
    re: `${L}(dù|cho dù|bất kể) ${ADDR} là [^.!?\\n]{1,60}${L}hay${R}`,
    truoc: 'Dù bạn là doanh nghiệp nhỏ hay tập đoàn lớn, chúng tôi đều có giải pháp.',
    sau: 'Gói cơ bản dành cho xưởng dưới 50 người.',
  },
  {
    id: 'VI34', group: 'cau-truc', label: 'Khung "Thứ nhất… Thứ hai… Cuối cùng"',
    fix: 'Ý ngang hàng thì liệt kê ngắn; ý nối nhau thì viết thành đoạn.',
    re: `(^\\s*|[.!?…]\\s+)(thứ nhất|thứ hai|thứ ba|cuối cùng|trước hết|bên cạnh đó|ngoài ra)\\s*,`, flags: 'm', minCount: 4,
    truoc: 'Thứ nhất, … Thứ hai, … Bên cạnh đó, … Cuối cùng, …',
    sau: 'Có ba việc: chốt danh mục, nhập tồn đầu kỳ, đào tạo thủ kho.',
  },

  // ─── Định dạng ─────────────────────────────────────────────────────────────────────────────────
  {
    id: 'VI40', group: 'dinh-dang', label: 'Gạch dài "—" chèn giữa câu',
    fix: 'Tiếng Việt dùng dấu phẩy, hai chấm hoặc ngoặc đơn.',
    // Chỉ gạch dài "—". Gạch nối "–" có dấu cách là đúng chuẩn cho cặp và khoảng: "Hà Nội – Hải Phòng", "2020 – 2025".
    re: `\\s—\\s|\\p{L}—\\p{L}`, minCount: 2,
    note: 'Gạch nối "–" trong cặp, khoảng ("Hà Nội – Hải Phòng") là đúng chuẩn, không bị báo.',
    truoc: 'Báo cáo — được cập nhật hằng ngày — giúp lãnh đạo nắm tình hình.',
    sau: 'Báo cáo cập nhật hằng ngày, nên lãnh đạo nắm được tình hình.',
  },
  {
    id: 'VI41', group: 'dinh-dang', label: 'Emoji làm đầu dòng',
    fix: 'Bỏ emoji ở đầu dòng; dùng gạch đầu dòng thường.',
    re: `^\\s*([-*•]\\s*)?(✅|❌|🚀|✨|🔥|💡|👉|📌|🎯|⭐|🔹|🔸|▶️|📊|📈)`, flags: 'm', minCount: 2,
    truoc: '🚀 Nhanh\n✨ Đẹp\n🔥 Mạnh',
    sau: '- Nhanh: … (nêu số đo)',
  },
  {
    id: 'VI42', group: 'dinh-dang', label: 'Lẫn hai kiểu ngoặc kép',
    fix: 'Chọn một kiểu ngoặc kép cho cả văn bản.',
    re: `[“”]`, minCount: 1,
    truoc: 'Chọn “Lưu” rồi bấm "Gửi".',
    sau: 'Chọn "Lưu" rồi bấm "Gửi".',
    note: 'Chỉ báo khi văn bản có cả “ ” và " " (xem analyze.js).',
  },

  // ─── Giao tiếp chatbot ─────────────────────────────────────────────────────────────────────────
  {
    id: 'VI50', group: 'giao-tiep', label: 'Tự nhận là AI / nhắc mốc dữ liệu',
    fix: 'Bỏ hẳn khỏi văn bản gửi người khác.',
    re: `${L}(là một (mô hình ngôn ngữ|trợ lý ảo|trợ lý AI|AI)|tôi không (có khả năng|thể) truy cập|(dữ liệu|kiến thức) (của tôi )?(được )?cập nhật (đến|tới))${R}`,
    truoc: 'Là một mô hình ngôn ngữ, tôi không thể truy cập dữ liệu thời gian thực.',
    sau: '(bỏ)',
  },
  {
    id: 'VI51', group: 'giao-tiep', label: 'Khen câu hỏi / nịnh người hỏi',
    fix: 'Bỏ; trả lời luôn.',
    re: `${L}(câu hỏi (rất |thật )?(hay|tuyệt vời|thú vị|xuất sắc)|${ADDR} (hoàn toàn đúng|nói rất đúng|thật tinh tế))${R}`,
    truoc: 'Câu hỏi rất hay! Anh hoàn toàn đúng khi quan tâm tới vấn đề này.',
    sau: '(bỏ, vào thẳng câu trả lời)',
  },
  {
    id: 'VI52', group: 'giao-tiep', label: 'Chỗ trống chưa điền',
    fix: 'Điền thông tin thật hoặc hỏi người viết.',
    re: `\\[(tên|họ tên|họ và tên|công ty|tên công ty|ngày|địa chỉ|số điện thoại|email|chức vụ|sản phẩm)[^\\]]{0,30}\\]|\\{\\{[^}\\n]{1,40}\\}\\}`,
    truoc: 'Kính gửi [Tên khách hàng], công ty [Tên công ty] xin gửi…',
    sau: 'Kính gửi anh Minh, Công ty An Phát xin gửi…',
  },
  {
    id: 'VI53', group: 'giao-tiep', label: 'Xin lỗi kiểu máy',
    fix: 'Nói đã sai gì và đã sửa thế nào.',
    re: `${L}(xin lỗi vì (sự )?(nhầm lẫn|bất tiện|thiếu sót) (này|đó)|tôi xin lỗi nếu)${R}`,
    truoc: 'Tôi xin lỗi vì sự nhầm lẫn này.',
    sau: 'Số ở dòng 3 bị cộng trùng ca 2; con số đúng là 1.240.',
  },

  // ─── Rò rỉ kỹ thuật ────────────────────────────────────────────────────────────────────────────
  {
    id: 'VI60', group: 'ro-ri', label: 'Mã trích dẫn của công cụ chat',
    fix: 'Xoá mã; nếu cần nguồn thì ghi nguồn thật.',
    re: `citeturn\\d|oai_citation|\\[cite:\\s*\\d+\\]|grok_card|【\\d+†[^】]*】|:contentReference\\[`, raw: true,
    truoc: 'Doanh thu tăng 12% citeturn0search3.',
    sau: 'Doanh thu tăng 12% (Báo cáo tài chính quý 3).',
  },
  {
    id: 'VI61', group: 'ro-ri', label: 'Liên kết mang tham số UTM của công cụ AI',
    fix: 'Cắt phần ?utm_source=… khỏi liên kết.',
    re: `utm_source=(chatgpt|openai|perplexity|copilot|gemini|claude)`, raw: true,
    truoc: 'https://example.com/bai-viet?utm_source=chatgpt.com',
    sau: 'https://example.com/bai-viet',
  },
  {
    id: 'VI62', group: 'ro-ri', label: 'Ký tự ẩn (zero-width, BOM)',
    fix: 'Xoá ký tự ẩn; chúng làm hỏng tìm kiếm và so khớp. `vi-humanizer clean` làm việc này.',
    re: `[\\u200B-\\u200D\\u2060\\uFEFF]`, raw: true, signal: false,
    truoc: 'Mã\u200BSP01',
    sau: 'MãSP01',
  },
];

// Tên quy tắc (dùng được thay mã trong cấu hình, như eslint) và mức nghiêm trọng mặc định.
// error: sai sự thật hoặc lộ rò rỉ, phải sửa · warning: văn mẫu nên sửa · info: nên biết
const META = {
  VI01: ['mo-bai-gioi-thieu'], VI02: ['mo-dau-xac-nhan'], VI03: ['ket-loi-moi-chung'], VI04: ['doan-tom-lai'],
  VI05: ['loi-ru-cung-tim-hieu'], VI06: ['loi-chuc-cuoi'], VI07: ['hoi-can-gi-them'],
  VI10: ['dong-vai-tro'], VI11: ['khang-dinh-tuyet-doi'], VI12: ['boi-canh-thoi-dai'], VI13: ['sao-ngu-quang-cao'],
  VI14: ['nhan-manh-rong'], VI15: ['tinh-tu-keu'], VI16: ['mang-lai-gia-tri'],
  VI20: ['mot-cach'], VI21: ['viec-la-can-thiet'], VI22: ['duoc-boi'], VI23: ['tien-hanh-cong-tac'], VI24: ['su-dong-tu'],
  VI25: ['dieu-nay'], VI26: ['no-chi-vat'], VI27: ['rao-don'], VI28: ['chuoi-cua'], VI29: ['cho-phep-ban'],
  VI30: ['khong-chi-ma-con'], VI31: ['phu-dinh-song-song'], VI32: ['tieu-de-cau-hoi'], VI33: ['du-ban-la'], VI34: ['khung-thu-nhat'],
  VI40: ['gach-dai'], VI41: ['emoji-dau-dong'], VI42: ['lan-ngoac-kep', 'info'],
  VI50: ['tu-nhan-ai', 'error'], VI51: ['khen-cau-hoi'], VI52: ['cho-trong', 'error'], VI53: ['xin-loi-kieu-may'],
  VI60: ['ma-trich-dan-chatbot', 'error'], VI61: ['utm-cong-cu-ai', 'error'], VI62: ['ky-tu-an', 'info'],
};
for (const p of PATTERNS) {
  const [slug, severity = 'warning'] = META[p.id] ?? [];
  if (!slug) throw new Error(`${p.id} thiếu tên quy tắc`);
  p.slug = slug;
  p.severity = severity;
}

/** Biên dịch biểu thức của một dấu hiệu. */
export function compile(p) {
  return new RegExp(p.re, 'gu' + (p.flags?.includes('m') ? 'm' : '') + 'i');
}
