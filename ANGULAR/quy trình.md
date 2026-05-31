# TÀI LIỆU QUY TRÌNH NGHIỆP VỤ CHI TIẾT VÀ ĐẶC TẢ USE CASE (MÔ HÌNH TO-BE)
**Hệ thống Quản lý Vận tải Tân Xuân Phúc (TXP BUS)**

---

## PHẦN I: CÁC QUY TRÌNH NGHIỆP VỤ CHI TIẾT CHỐT VẬN HÀNH

### 1. Quy trình Đặt vé và Thanh toán
#### 1.1. Mô tả luồng quy trình
* **Bước 1: Tìm kiếm chuyến xe**
    * [cite_start]Khách hàng (hoặc nhân viên bán vé thao tác hộ qua tổng đài/quầy) nhập các thông tin tìm kiếm gồm: điểm đi, điểm đến, ngày khởi hành và ngày về (nếu có), sau đó nhấn "Tìm chuyến"[cite: 497, 521, 554].
    * [cite_start]Hệ thống truy vấn cơ sở dữ liệu và hiển thị danh sách các chuyến xe phù hợp, bao gồm: giờ khởi hành, điểm đi, điểm đến, loại xe (Limousine 22 phòng Premium), số lượng ghế còn trống và giá vé[cite: 9, 166, 522].
* **Bước 2: Chọn chuyến xe và ghế ngồi**
    * [cite_start]Người dùng lựa chọn chuyến xe mong muốn từ danh sách kết quả[cite: 523].
    * [cite_start]Hệ thống hiển thị trang chi tiết chuyến xe với các thông tin: tuyến đường, giờ khởi hành, thời gian di chuyển dự kiến, loại xe và chính sách hủy vé[cite: 524].
    * [cite_start]Người dùng tiến hành lựa chọn ghế ngồi trên sơ đồ hiển thị trạng thái real-time[cite: 525]. [cite_start]Sau khi chọn ghế, hệ thống thực hiện kiểm tra và tạm giữ ghế[cite: 526].
* **Bước 3: Nhập thông tin hành khách và điểm đón**
    * [cite_start]Nếu khách hàng đã đăng nhập, hệ thống tự động điền sẵn họ tên, số điện thoại từ tài khoản hồ sơ[cite: 528]. [cite_start]Nếu chưa đăng nhập, yêu cầu nhập thủ công họ tên và số điện thoại liên hệ[cite: 529].
    * [cite_start]Người dùng chọn phương án di chuyển tại điểm đón/trả: trực tiếp tại bến xe/văn phòng hoặc sử dụng dịch vụ trung chuyển[cite: 530].
    * [cite_start]Nếu chọn trung chuyển, hệ thống kiểm tra phạm vi phục vụ, xác định điểm tập kết cùng thời gian dự kiến đón[cite: 531, 720]. [cite_start]Người dùng bổ sung ghi chú hàng hóa (nếu có) và xác nhận tiếp tục[cite: 532].
* **Bước 4: Xác nhận thông tin đặt vé**
    * [cite_start]Hệ thống hiển thị toàn bộ thông tin đơn hàng để rà soát lần cuối[cite: 533].
    * [cite_start]Người dùng đọc và tích chọn chấp nhận điều khoản đặt vé, sau đó nhấn "Xác nhận đặt vé"[cite: 534, 560].
    * [cite_start]Hệ thống ghi nhận đơn đặt vé với trạng thái "Chờ thanh toán", tạo mã đơn hàng duy nhất và chuyển sang bước thanh toán[cite: 535].
* **Bước 5: Thanh toán và phát hành vé**
    * [cite_start]Hệ thống hiển thị thông tin thanh toán gồm tổng số tiền và phương thức (Mã QR hoặc thẻ nội địa NAPAS)[cite: 536, 537].
    * [cite_start]Hệ thống tự động đối soát giao dịch bất đồng bộ thông qua cổng thanh toán[cite: 538, 723].
    * [cite_start]Khi giao dịch thành công, hệ thống cập nhật trạng thái đơn hàng sang "Chờ khởi hành", xác nhận ghế chính thức, phát hành vé điện tử (kèm mã QR) và gửi thông báo qua SMS/Zalo kèm mã vé đến khách hàng[cite: 539, 692, 724].

#### 1.2. Quy tắc nghiệp vụ (Business Rules) phục vụ dựng Test Case
* [cite_start]**BR_01 (Định danh):** Mỗi đơn hàng và vé điện tử sinh ra phải có mã duy nhất (`MaDonHang`, `MaVe`)[cite: 541, 1802, 1806].
* **BR_02 (Tìm kiếm hợp lệ):** Hệ thống chặn và báo lỗi nếu ngày khởi hành nhập vào là ngày trong quá khứ so với thời gian thực tại hệ thống[cite: 542].
* **BR_03 (Trạng thái chuyến hiển thị):** Chỉ hiển thị các chuyến xe ở trạng thái "Mở bán" và còn ghế trống[cite: 543, 775]. [cite_start]Khi số ghế trống dưới 5, hệ thống phải tự động bật nhãn cảnh báo “Sắp hết chỗ”[cite: 544].
* [cite_start]**BR_04 (Cơ chế giữ chỗ tạm thời):** Ghế được đổi sang trạng thái "Đang giữ" ngay khi người dùng tích chọn[cite: 731]. Thời gian tạm giữ tối đa là **15 phút**[cite: 546]. Hệ thống phải hiển thị bộ đếm ngược thời gian (countdown timer)[cite: 945, 967]. Quá 15 phút không thanh toán thành công, hệ thống áp dụng cơ chế hủy đơn tự động (Timeout), khôi phục trạng thái ghế về “Trống”[cite: 547, 725, 742, 744].
* **BR_05 (Ràng buộc nhập liệu hành khách):** Trường Họ tên và Số điện thoại là bắt buộc. Số điện thoại phải kiểm tra đúng định dạng số tại Việt Nam[cite: 548, 812].
* [cite_start]**BR_06 (Xác nhận giao dịch):** Đơn đặt vé chuyển trạng thái thành "Chờ khởi hành" và sinh mã QR vé khi và chỉ khi nhận tín hiệu IPN xác nhận thành công từ API cổng thanh toán đối tác[cite: 539, 551, 552].

#### 1.3. Trường hợp ngoại lệ (Exceptions) phục vụ dựng Test Case
* **EX_01:** Không tìm thấy chuyến phù hợp $\rightarrow$ Hiển thị thông báo "Không có chuyến xe nào vào ngày này", gợi ý chọn ngày khác[cite: 555].
* **EX_02:** Chuyến xe đã hết chỗ $\rightarrow$ Hiển thị thông báo "Chuyến này đã hết chỗ", gợi ý chọn chuyến khác[cite: 556].
* **EX_03:** Nhập thông tin hành khách sai/thiếu $\rightarrow$ Báo lỗi inline trực tiếp dưới trường dữ liệu và chặn không cho nhấn tiếp tục[cite: 557, 558].
* **EX_04:** Địa chỉ trung chuyển không khả dụng (ngoài vùng phục vụ) $\rightarrow$ Hiển thị cảnh báo và đề xuất các điểm tập kết/văn phòng gần nhất[cite: 559].
* **EX_05:** Thanh toán thất bại/Người dùng hủy giao dịch tại cổng ngân hàng $\rightarrow$ Hủy đơn, giải phóng ghế lập tức, hiển thị thông báo thanh toán thất bại và hướng dẫn đặt lại[cite: 725, 742, 744, 959].

---

### 2. Quy trình Chỉnh sửa Thông tin Vé
#### 2.1. Mô tả luồng quy trình
* **Bước 1:** Khách hàng đăng nhập, truy cập mục "Lịch sử đặt vé"[cite: 564, 565]. Hệ thống hiển thị danh sách vé sắp xếp mới nhất lên đầu[cite: 565]. Người dùng chọn vé và nhấn “Chỉnh sửa thông tin vé”[cite: 566, 567].
* [cite_start]**Bước 2:** Hệ thống tự động kiểm tra điều kiện chỉnh sửa (trạng thái, thời gian chạy, số lần sửa)[cite: 567]. [cite_start]Nếu hợp lệ, hiển thị biểu mẫu cho phép sửa[cite: 568].
* **Bước 3:** Người dùng sửa các trường dữ liệu: Họ tên hành khách, Số điện thoại liên hệ, Email, Điểm đón, Điểm trả, Ghi chú[cite: 569, 1034]. Với điểm đón/trả, người dùng chọn theo danh bạ cố định của nhà xe (Bến xe/Văn phòng hoặc Trung chuyển)[cite: 570]. Nhấn "Lưu thay đổi"[cite: 571].
* [cite_start]**Bước 4:** Hệ thống chạy hàm validation kiểm tra tính hợp lệ dữ liệu và kiểm tra xem người dùng có thực sự thay đổi thông tin so với dữ liệu cũ không[cite: 572, 573]. [cite_start]Nếu hợp lệ, hiển thị popup tóm tắt thay đổi[cite: 573].
* **Bước 5:** Người dùng xác nhận lưu[cite: 574]. Hệ thống cập nhật CSDL, **tăng bộ đếm số lần chỉnh sửa của vé lên 1**, đồng bộ real-time yêu cầu trung chuyển sang phân hệ nhân viên điều phối, hiển thị popup thành công và gửi SMS/Zalo thông báo thông tin vé mới cho khách hàng[cite: 576, 577, 585].

#### 2.2. Quy tắc nghiệp vụ (Business Rules) phục vụ dựng Test Case
* [cite_start]**BR_07 (Trạng thái vé hợp lệ):** Chỉ cho phép sửa đổi thông tin khi vé đang ở trạng thái **"Chờ khởi hành"**[cite: 578]. [cite_start]Vé ở trạng thái "Đã hủy" hoặc "Đã hoàn thành" phải bị chặn nút chỉnh sửa[cite: 579].
* [cite_start]**BR_08 (Ràng buộc thời gian sửa):** Thời gian hiện tại thực hiện thao tác phải cách giờ khởi hành của chuyến xe **ít nhất 2 tiếng**[cite: 580].
* [cite_start]**BR_09 (Giới hạn số lần chỉnh sửa):** Mỗi một vé xe khách (`MaVe`) chỉ được phép chỉnh sửa thông tin tối đa **2 lần** trong suốt vòng đời của nó[cite: 581]. (Hệ thống kiểm tra trường `SoLanDaSua` trong CSDL) [cite_start][cite: 1807].
* **BR_10 (Ràng buộc lộ trình):** Điểm đón và điểm trả mới được chọn phải nằm trong danh sách các trạm dừng của chuyến xe đó và đảm bảo logic: Điểm đón phải nằm trước điểm trả theo trình tự di chuyển của lịch trình[cite: 1037, 1044].
* **BR_11 (Chi phí nghiệp vụ):** Quy trình chỉnh sửa thông tin liên hệ và trung chuyển này hoàn toàn **không phát sinh phụ phí**[cite: 586].
* **BR_12 (Tính thay đổi thực sự):** Nếu người dùng không thay đổi bất kỳ ký tự hay địa chỉ nào mà bấm Lưu, hệ thống phát hiện và từ chối ghi nhận, thông báo "Thông tin vé không có gì thay đổi"[cite: 583, 584].

#### 2.3. Trường hợp ngoại lệ (Exceptions) phục vụ dựng Test Case
* **EX_06:** Vé đã vượt quá số lần sửa quy định ($>2$ lần) $\rightarrow$ Hệ thống chặn ngay tại Bước 2, thông báo từ chối và hướng dẫn liên hệ Hotline nhà xe[cite: 592].
* **EX_07:** Thời gian đến giờ khởi hành còn dưới 2 tiếng $\rightarrow$ Hệ thống chặn tại Bước 2, thông báo "Vé không đủ điều kiện để chỉnh sửa do quá thời hạn quy định"[cite: 591, 1048].
* **EX_08:** Người dùng bấm nút "Hủy" tại popup xác nhận cuối cùng $\rightarrow$ Đóng popup, hoàn trả giao diện cũ, không lưu dữ liệu vào CSDL, không tăng bộ đếm[cite: 575, 595].

---

### 3. Quy trình Hủy vé và Hoàn tiền
#### 3.1. Mô tả luồng quy trình
* **Bước 1:** Khách hàng đăng nhập, vào "Lịch sử đặt vé", chọn vé cần hủy và bấm nút “Hủy vé”[cite: 599, 600, 603].
* [cite_start]**Bước 2:** Hệ thống tiếp nhận lệnh, kiểm tra điều kiện hủy vé dựa trên mốc thời gian thực tế so với giờ chạy[cite: 604, 1079]. [cite_start]Nếu không đủ điều kiện, từ chối và nêu rõ lý do[cite: 604].
* **Bước 3:** Hệ thống tự động tính toán số tiền hoàn trả lại dựa theo chính sách hoàn trả phạt của nhà xe[cite: 606]. Hiển thị chi tiết: Giá vé gốc, mức % phí hủy vé, số tiền thực tế được hoàn lại cho khách[cite: 607, 1080].
* [cite_start]**Bước 4:** Người dùng chọn lý do hủy, nhấn "Xác nhận hủy vé"[cite: 610, 1081]. [cite_start]Hệ thống chạy transaction CSDL: Cập nhật trạng thái vé sang **“Đã hủy”**, ngay lập tức đổi trạng thái ghế trên sơ đồ sang **“Trống”** (Real-time), tạo bản ghi lịch sử hủy vé và gửi yêu cầu hoàn tiền bất đồng bộ sang cổng thanh toán với trạng thái “Đang xử lý”[cite: 612, 613, 614, 1082].
* **Bước 5:** Nhận tín hiệu kết quả xử lý từ cổng thanh toán đối tác[cite: 616]. Cập nhật trạng thái hoàn tiền ("Hoàn tiền thành công" hoặc "Hoàn tiền thất bại"), lưu thông tin đối soát, thông báo popup thành công trên web và gửi tin nhắn xác nhận hoàn tiền qua Zalo/SMS cho hành khách[cite: 617, 618, 619, 620].

#### 3.2. Quy tắc nghiệp vụ (Business Rules) phục vụ dựng Test Case
* [cite_start]**BR_13 (Trạng thái hủy hợp lệ):** Vé phải ở trạng thái "Chờ khởi hành" và đã ghi nhận trạng thái thanh toán là "DaThanhToan"[cite: 624, 1803].
* **BR_14 (Chính sách phí hủy vé & Hoàn tiền):** Hệ thống đối chiếu thời gian bấm hủy với `GioKhoiHanh` của lịch trình để áp dụng công thức[cite: 1079, 1825]:
    * Thời gian hủy trước giờ khởi hành $\ge 24$ tiếng: Hoàn lại **90%** số tiền vé (Phí hủy 10%).
    * [cite_start]Thời gian hủy từ 12 tiếng đến dưới 24 tiếng: Hoàn lại **70%** số tiền vé (Phí hủy 30%).
    * [cite_start]Thời gian hủy dưới 12 tiếng hoặc sau giờ xe chạy: **Không hoàn tiền** (Phí hủy 100%).
* **BR_15 (Ràng buộc khuyến mãi):** Tất cả các mã giảm giá, chiết khấu khuyến mãi đã áp dụng cho vé đó sẽ bị vô hiệu hóa hoàn toàn, không có giá trị quy đổi hoàn tiền mặt[cite: 628].
* **BR_16 (Tính nhất quán dữ liệu - ACID):** Thao tác cập nhật trạng thái vé thành "Đã hủy" và giải phóng ghế về "Trống" phải thực hiện trong cùng một transaction CSDL để đảm bảo ghế trống xuất hiện lập tức cho khách hàng khác mua[cite: 612, 629, 1094].
* **BR_17 (Nguồn tiền hoàn):** Tiền hoàn phải được trả tự động về chính xác tài khoản ngân hàng/ví điện tử ban đầu mà hành khách đã sử dụng để giao dịch mua vé[cite: 630, 1095].

#### 3.3. Trường hợp ngoại lệ (Exceptions) phục vụ dựng Test Case
* **EX_09:** Hủy vé sát giờ chạy (dưới 12 tiếng) $\rightarrow$ Hệ thống hiển thị thông báo: "Rất tiếc, vé của bạn đã quá thời gian được phép hủy hoàn tiền theo chính sách", chặn không tạo yêu cầu hoàn tiền sang cổng thanh toán[cite: 203, 1090].
* **EX_10:** Cổng thanh toán bị lỗi kết nối hoặc phản hồi timeout $\rightarrow$ Hệ thống vẫn thực hiện cập nhật vé "Đã hủy" và giải phóng ghế real-time để nhà xe bán ghế, nhưng ghi nhận trạng thái giao dịch tài chính là “Hoàn tiền thất bại”, đồng thời kích hoạt cảnh báo (Trigger Log) chuyển thông tin sang bộ phận Kế toán của nhà xe tiến hành đối soát và chuyển khoản hoàn tiền thủ công[cite: 621, 636, 1092].

---

### 4. Quy trình Đánh giá Chuyến xe
#### 4.1. Mô tả luồng quy trình
* **Bước 1:** Khách hàng đăng nhập hệ thống, truy cập mục "Lịch sử đặt vé", chọn chuyến đi mong muốn và nhấn nút "Đánh giá chuyến xe"[cite: 638, 1108].
* [cite_start]**Bước 2:** Hệ thống chạy kiểm tra điều kiện (trạng thái vé, mốc ngày hoàn thành)[cite: 640]. [cite_start]Nếu đạt điều kiện, mở form biểu mẫu đánh giá gồm: Chọn mức sao, Viết nhận xét văn bản, Đính kèm hình ảnh[cite: 641].
* **Bước 3:** Khách hàng nhập liệu. Hệ thống liên tục chạy kiểm tra dữ liệu đầu vào theo thời gian thực (Real-time Validation)[cite: 643]. Nút “Gửi đánh giá” ở trạng thái khóa (disabled), chỉ được kích hoạt (enabled) khi toàn bộ các điều kiện bắt buộc thỏa mãn[cite: 644].
* [cite_start]**Bước 4:** Người dùng nhấn “Gửi đánh giá”[cite: 645]. [cite_start]Hệ thống thực hiện quét nội dung tự động qua bảng danh sách từ khóa hạn chế (những từ ngữ thô tục, spam, quảng cáo độc hại)[cite: 645, 659, 660].
* **Bước 5:** Nếu nội dung sạch, hệ thống lưu dữ liệu đánh giá vào CSDL, đổi trạng thái vé thành "Đã đánh giá", tự động tính toán lại điểm số trung bình của chuyến xe, hiển thị popup thông báo thành công và điều hướng khách hàng trở lại giao diện lịch sử đặt vé[cite: 646, 647].

#### 4.2. Quy tắc nghiệp vụ (Business Rules) phục vụ dựng Test Case
* [cite_start]**BR_18 (Điều kiện kích hoạt đánh giá):** Chỉ áp dụng với tài khoản khách hàng thành viên đã đăng nhập và vé xe phải ở trạng thái **“Đã hoàn thành”** (Xe đã chạy xong lịch trình thực tế)[cite: 648, 649].
* **BR_19 (Ràng buộc thời gian hiệu lực):** Khách hàng chỉ được phép gửi đánh giá trong vòng tối đa **07 ngày** kể từ thời điểm chuyến xe kết thúc hành trình[cite: 650]. [cite_start]Quá 7 ngày, nút đánh giá sẽ tự động ẩn[cite: 663].
* [cite_start]**BR_20 (Ràng buộc số lượng):** Mỗi một vé điện tử duy nhất (`MaVe`) chỉ được phép tạo một bài đánh giá duy nhất, không cho phép đánh giá đè hoặc sửa đổi sau khi đã gửi[cite: 651].
* **BR_21 (Quy chuẩn dữ liệu đầu vào):**
    * [cite_start]Mức sao: Bắt buộc chọn từ 1 đến 5 sao[cite: 652, 653].
    * Nội dung nhận xét văn bản: Là thông tin bắt buộc, độ dài chuỗi ký tự quy định nghiêm ngặt từ **10 đến 500 ký tự**[cite: 653].
    * [cite_start]Hình ảnh đính kèm: Không bắt buộc, cho phép tải lên **tối đa 03 hình ảnh**[cite: 654]. [cite_start]Định dạng file ảnh hợp lệ: `.jpg`, `.jpeg`, `.png`[cite: 655]. [cite_start]Dung lượng tệp tin tối đa: **$\le$ 5MB** mỗi ảnh[cite: 655].
* [cite_start]**BR_22 (Kiểm duyệt nội dung tự động):** Hệ thống tự động đối chiếu nội dung nhập liệu văn bản với bảng `TU_KHOA_HAN_CHE` trong CSDL[cite: 660]. Nếu chứa từ khóa vi phạm, hệ thống chặn việc ghi nhận vào CSDL[cite: 667].

#### 4.3. Trường hợp ngoại lệ (Exceptions) phục vụ dựng Test Case
* [cite_start]**EX_11:** Người dùng tải ảnh sai định dạng (ví dụ `.gif`, `.pdf`) hoặc ảnh vượt dung lượng 6MB $\rightarrow$ Hệ thống lập tức từ chối file, hiển thị lỗi màu đỏ ngay tại vùng chọn file và không tải tệp lên[cite: 668, 669].
* **EX_12:** Văn bản chứa từ ngữ vi phạm chính sách $\rightarrow$ Hệ thống chặn lưu dữ liệu, bôi đỏ ô nhập liệu, hiển thị cảnh báo yêu cầu khách hàng chỉnh sửa, loại bỏ từ ngữ xấu trước khi cho phép gửi lại[cite: 667].
* **EX_13:** Người dùng vô tình bấm thoát trang hoặc click link khác khi đang viết đánh giá dở dang $\rightarrow$ Hệ thống kích hoạt hiển thị hộp thoại cảnh báo xác nhận (Yes/No Browser Alert) hỏi xem có chắc chắn muốn rời đi không để tránh mất dữ liệu hành khách đang nhập[cite: 672, 673].

---

## PHẦN II: TÀI LIỆU ĐẶC TẢ CHI TIẾT CÁC USE CASE HỆ THỐNG

Dưới đây là đặc tả chi tiết của các Use Case cốt lõi từ Chương 5 của tài liệu để làm căn cứ thiết lập các bước kiểm thử cụ thể (Test Steps), Dữ liệu kiểm thử (Test Data) và Kết quả mong đợi (Expected Results).

### 1. Đặc tả Use Case: ĐĂNG KÝ TÀI KHOẢN (UC-01)
* **Mục đích:** Cho phép khách vãng lai thiết lập tài khoản thành viên trên hệ thống nhằm sử dụng các chức năng yêu cầu đăng nhập[cite: 791].
* [cite_start]**Tác nhân chính:** Khách vãng lai[cite: 792].
* [cite_start]**Tác nhân phụ:** Hệ thống SMS/Zalo Gateway (Bên thứ 3 hỗ trợ gửi tin OTP)[cite: 794].
* **Điều kiện tiên quyết:** Khách vãng lai đang truy cập hệ thống bằng trình duyệt, chưa đăng nhập và thiết bị có kết nối mạng[cite: 797].
* [cite_start]**Điều kiện sau cùng:** Tài khoản mới được tạo trong bảng `KHACH_HANG` với trạng thái Active; số điện thoại được liên kết duy nhất; hệ thống tự động đăng nhập người dùng[cite: 799, 800, 801, 1798].
* **Luồng chính (Main Flow):**
    1. Người dùng bấm vào nút "Đăng ký" trên giao diện trang chủ[cite: 795, 803].
    2. Hệ thống hiển thị biểu mẫu yêu cầu nhập số điện thoại liên hệ[cite: 804].
    3. Người dùng nhập số điện thoại hợp lệ và bấm nút “Gửi mã OTP”[cite: 805].
    4. Hệ thống kiểm tra số điện thoại (chưa tồn tại trong bảng `KHACH_HANG`)[cite: 806].
    5. Hệ thống sinh mã OTP ngẫu nhiên gồm 6 chữ số, lưu tạm thời vào bảng `OTP_XAC_THUC`, kích hoạt API Gateway gửi SMS và hiển thị ô nhập mã OTP kèm bộ đếm ngược thời gian hiệu lực[cite: 807].
    6. Người dùng nhập mã OTP nhận được từ điện thoại vào ô trên màn hình[cite: 808].
    7. Hệ thống đối chiếu và xác thực mã OTP nhập vào trùng khớp và còn hiệu lực[cite: 808].
    8. Hệ thống chuyển hướng hiển thị màn hình thiết lập thông tin bảo mật gồm: Mật khẩu, Họ tên và Email (không bắt buộc)[cite: 809].
    9. Người dùng nhập đầy đủ thông tin hợp lệ và nhấn nút “Hoàn tất”[cite: 810].
    10. Hệ thống tiến hành mã hóa mật khẩu, lưu thông tin chính thức vào CSDL, thông báo “Đăng ký thành công” và tự động đăng nhập[cite: 811].
* **Luồng thay thế và ngoại lệ (Alternative & Exception Flows - Thiết kế Test Case nghịch):**
    * *Luồng 3a (SĐT sai định dạng):* Tại bước 3, nhập số điện thoại không đúng đầu số nhà mạng Việt Nam hoặc thiếu/thừa số $\rightarrow$ Hệ thống hiển thị lỗi ngay lập tức, nút gửi OTP bị khóa[cite: 812].
    * [cite_start]*Luồng 4a (SĐT đã tồn tại):* Tại bước 4, hệ thống phát hiện SĐT đã có tài khoản $\rightarrow$ Hiển thị thông báo “Số điện thoại đã tồn tại” kèm nút chuyển hướng nhanh “Đăng nhập ngay”[cite: 820].
    * [cite_start]*Luồng 6a (Yêu cầu gửi lại OTP):* Người dùng bấm “Gửi lại OTP” $\rightarrow$ Vô hiệu hóa bản ghi OTP cũ, sinh bản ghi OTP mới trong bảng `OTP_XAC_THUC` và reset lại bộ đếm countdown về 3 phút[cite: 813, 814].
    * *Luồng 7a (Mã OTP nhập sai):* Người dùng nhập sai mã $\rightarrow$ Thông báo “Mã xác thực không đúng”, yêu cầu nhập lại[cite: 815]. Nếu nhập sai liên tiếp **quá 05 lần**, hệ thống lập tức khóa phiên xác thực OTP này trong vòng 15 phút[cite: 823, 829].
    * [cite_start]*Luồng 7b (Mã OTP hết hạn):* Người dùng nhập đúng mã nhưng bộ countdown đã về `00:00` $\rightarrow$ Thông báo “Mã OTP đã hết hạn”, yêu cầu bấm gửi lại mã[cite: 816, 817].
    * [cite_start]*Luồng 9a (Mật khẩu không đạt chuẩn):* Tại bước 9, nhập mật khẩu ngắn hơn 8 ký tự hoặc thiếu ký tự bắt buộc $\rightarrow$ Báo lỗi mật khẩu không hợp lệ và chặn hoàn tất[cite: 818].
* **Yêu cầu đặc biệt về Dữ liệu để lập Test Case:**
    * [cite_start]Mã OTP phải có độ dài đúng 6 chữ số, thời gian sống tối đa của mã trong bảng `OTP_XAC_THUC` là **03 phút**[cite: 827].
    * [cite_start]Quy chuẩn mật khẩu bắt buộc: Tối thiểu 08 ký tự, bao gồm ít nhất 01 chữ cái, 01 chữ số và 01 kí tự đặc biệt, không chứa khoảng trắng[cite: 830].

---

### 2. Đặc tả Use Case: ĐĂNG NHẬP (UC-02)
* **Mục đích:** Cho phép mọi đối tượng người dùng xác thực danh tính bằng tài khoản để truy cập các phân hệ tương ứng theo phân quyền hệ thống[cite: 842].
* [cite_start]**Tác nhân chính:** Khách thành viên, Nhân viên điều phối, Quản trị viên, Ban quản lý, Nhân viên bán vé[cite: 844].
* [cite_start]**Điều kiện tiên quyết:** Người dùng đã có tài khoản hợp lệ trên hệ thống và tài khoản không ở trạng thái khóa (Active)[cite: 847, 848].
* **Điều kiện sau cùng:** Người dùng đăng nhập thành công, hệ thống tạo Token/Session phiên làm việc, cấp quyền truy cập theo cơ chế RBAC và ghi nhận log vào bảng `NHAT_KY_HE_THONG` (`Activity Log`)[cite: 752, 849, 850, 851, 852].
* **Luồng chính (Main Flow):**
    1. [cite_start]Người dùng chọn chức năng “Đăng nhập” trên giao diện[cite: 846, 854].
    2. [cite_start]Hệ thống hiển thị biểu mẫu gồm hai trường thông tin chính: Số điện thoại và Mật khẩu[cite: 855].
    3. [cite_start]Người dùng điền thông tin tài khoản và bấm nút “Đăng nhập”[cite: 856].
    4. [cite_start]Hệ thống thực hiện giải mã hàm băm mật khẩu, so sánh dữ liệu đối chiếu trong CSDL[cite: 857].
    5. [cite_start]Hệ thống khởi tạo Session phiên đăng nhập thành công, cấp quyền thao tác dựa trên vai trò[cite: 858].
    6. [cite_start]Chuyển hướng người dùng đến đúng trang giao diện làm việc theo phân quyền[cite: 859]. (Ví dụ: Khách hàng về trang chủ/lịch sử; Nhân viên điều phối vào trang lịch trình; Ban quản lý vào trang Dashboard thống kê) [cite_start][cite: 514, 565, 679, 682, 1658].
* **Luồng ngoại lệ (Exceptions - Thiết kế Test Case nghịch):**
    * [cite_start]*Luồng ngoại lệ 1:* Nhập SĐT không tồn tại hoặc sai mật khẩu $\rightarrow$ Hiển thị thông báo chung: "Số điện thoại hoặc mật khẩu không chính xác" (Không báo cụ thể sai trường nào để bảo mật)[cite: 868].
    * *Luồng ngoại lệ 2:* Nhập sai mật khẩu liên tiếp **quá 05 lần** $\rightarrow$ Hệ thống tự động chuyển trạng thái tài khoản sang tạm khóa trong vòng 15 phút và hiển thị thông báo chặn truy cập[cite: 869].
    * [cite_start]*Luồng ngoại lệ 3:* Tài khoản đã bị Admin khóa từ trước (Trạng thái bảng nhân sự/khách hàng là `DaKhoa`/`VoHieuHoa`) $\rightarrow$ Hệ thống chặn đăng nhập lập tức, xuất thông báo: “Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ”[cite: 870, 1798, 1838, 1880].

---

### 3. Đặc tả Use Case: TÌM KIẾM CHUYẾN XE (UC-03)
* [cite_start]**Mục đích:** Cho phép người dùng nhập lộ trình và thời gian để tìm các chuyến xe Limousine 22 phòng còn ghế trống[cite: 9, 887].
* **Tác nhân chính:** Khách hàng thành viên, Khách vãng lai, Nhân viên bán vé[cite: 554, 888].
* **Luồng chính (Main Flow):**
    1. [cite_start]Người dùng truy cập giao diện tìm kiếm chuyến xe tại trang chủ[cite: 891, 899].
    2. [cite_start]Giao diện hiển thị các trường nhập thông tin: Điểm đi, Điểm đến, Ngày khởi hành, Ngày về (nếu có)[cite: 900].
    3. [cite_start]Người dùng chọn điểm đi/đến, chọn ngày trên lịch và bấm “Tìm kiếm”[cite: 901].
    4. [cite_start]Hệ thống chạy câu lệnh query kiểm tra dữ liệu, lọc các chuyến trong bảng `LICH_TRINH` trùng khớp lộ trình, ngày chạy và còn ghế trống trong bảng `GHE_CHUYEN_XE`[cite: 902, 1823, 1840].
    5. [cite_start]Hiển thị danh sách chuyến xe xếp theo thứ tự thời gian khởi hành tăng dần, bao gồm các thông tin: Giờ xuất bến, loại xe, giá vé và số chỗ trống[cite: 522, 903, 917].
    6. [cite_start]Người dùng có thể click chọn thêm bộ lọc nâng cao: Lọc theo khoảng giá vé, Lọc theo khung giờ chạy (Sáng/Chiều/Tối) hoặc vị trí ghế[cite: 904, 918, 922].
    7. [cite_start]Hệ thống tự động cập nhật kết quả danh sách tương ứng real-time[cite: 905].
* **Luồng thay thế và ngoại lệ (Alternative & Exception Flows):**
    * [cite_start]*Luồng 3a (Để trống trường dữ liệu):* Bỏ trống điểm đi/đến hoặc ngày đi mà bấm tìm $\rightarrow$ Hệ thống không gửi request lên server, hiển thị thông báo lỗi màu đỏ bắt buộc nhập đầy đủ dưới chân trường dữ liệu bị thiếu[cite: 907, 908].
    * [cite_start]*Luồng 5a (Không có chuyến xe):* Không tìm thấy chuyến nào khớp dữ liệu ngày/tuyến $\rightarrow$ Xuất thông báo: “Không tìm thấy chuyến xe phù hợp” kèm theo các gợi ý cho khách hàng chọn thử sang các ngày lân cận[cite: 909].

---

### 4. Đặc tả Use Case: CHỈNH SỬA THÔNG TIN VÉ (UC-07)
* **Mục đích:** Cho phép khách hàng hoặc nhân viên bán vé thay đổi thông tin liên lạc hành khách hoặc cập nhật lại địa điểm dịch vụ trung chuyển trên vé đã mua[cite: 588, 1019].
* [cite_start]**Tác nhân chính:** Khách hàng thành viên, Nhân viên bán vé[cite: 588, 1020].
* [cite_start]**Điều kiện tiên quyết:** Người dùng đã đăng nhập hệ thống thành công[cite: 1025]. [cite_start]Vé xe phải đang ở trạng thái **"Chờ khởi hành"** và số lần sửa hiện tại của vé phải thỏa mãn giới hạn nghiệp vụ[cite: 578, 581].
* **Luồng chính (Main Flow):**
    1. [cite_start]Người dùng vào mục "Lịch sử đặt vé" để xem danh sách vé đã đặt[cite: 1031].
    2. [cite_start]Chọn chiếc vé cụ thể cần thay đổi thông tin và nhấn nút "Chỉnh sửa thông tin"[cite: 1032].
    3. Hệ thống thực hiện kiểm tra điều kiện thời gian và số lần đã sửa. [cite_start]Nếu hợp lệ, hiển thị form nhập liệu chứa đầy đủ thông tin hiện tại của vé[cite: 1033].
    4. [cite_start]Người dùng chỉnh sửa các trường thông tin mong muốn: Họ tên, Số điện thoại hành khách, Email hoặc chọn lại điểm đón/trả mới[cite: 1034].
    5. [cite_start]Người dùng nhấn nút "Lưu thay đổi"[cite: 1035].
    6. [cite_start]Hệ thống thực hiện kiểm tra tính hợp lệ của thông tin mới nhập vào và so sánh logic tuyến trạm dừng xem có hợp lý không[cite: 1036, 1037].
    7. [cite_start]Hệ thống hiển thị hộp thoại pop-up tóm tắt thông tin cũ và thông tin mới để xác nhận[cite: 573, 1038].
    8. [cite_start]Người dùng nhấn nút "Xác nhận" trên màn hình popup[cite: 1039].
    9. [cite_start]Hệ thống cập nhật bản ghi trong bảng `VE_DIEN_TU`, **cộng thêm 1 vào trường số lần đã sửa (`SoLanDaSua = SoLanDaSua + 1`)** và đồng bộ dữ liệu điểm trung chuyển mới sang màn hình điều phối[cite: 576, 1039, 1055].
    10. [cite_start]Hiển thị thông báo cập nhật thành công lên màn hình và tự động kích hoạt hệ thống gửi tin nhắn SMS/Zalo thông tin vé mới cho hành khách[cite: 577, 1040].
* **Luồng ngoại lệ (Exceptions - Phục vụ thiết kế kịch bản test lỗi):**
    * [cite_start]*Luồng 6a (Nhập sai định dạng):* Nhập họ tên trống hoặc số điện thoại thiếu số $\rightarrow$ Xuất thông báo lỗi inline màu đỏ, vô hiệu hóa nút Lưu[cite: 1042].
    * *Luồng 6b (Sửa trạm dừng sai lộ trình chuyến):* Chọn điểm đón mới nằm sau điểm trả theo chiều chạy xe $\rightarrow$ Hệ thống báo lỗi dữ liệu: "Điểm đón/trả không hợp lệ hoặc không thuộc lộ trình chuyến xe", khóa chặn không cho lưu[cite: 1044, 1045].
    * [cite_start]*Luồng 7a (Dữ liệu trùng khít thông tin cũ):* Không thay đổi bất kỳ ký tự nào mà bấm Lưu $\rightarrow$ Báo lỗi cảnh báo: "Thông tin không có sự thay đổi" và không ghi nhận thao tác vào CSDL[cite: 1046].
    * [cite_start]*Luồng 10a (Quá giới hạn số lần sửa):* Hệ thống phát hiện trường dữ liệu `SoLanDaSua` của vé đã bằng giá trị giới hạn cấu hình trong tài liệu nghiệp vụ $\rightarrow$ Chặn ngay từ bước 2, xuất lỗi: "Mỗi vé chỉ được phép chỉnh sửa tối đa [Số lần quy định]"[cite: 1033, 1050]. [cite_start]*(Lưu ý: Đối chiếu giữa mốc phân tích chương 4 quy định tối đa 2 lần, đặc tả chương 5 quy định tối đa 1 lần $\rightarrow$ Thiết kế kịch bản Test Case kiểm thử cấu hình động tham số này trong bảng `CHINH_SACH`)[cite: 581, 1050, 1857].*

---

### 5. Đặc tả Use Case: HỦY VÉ VÀ HOÀN TIỀN (UC-08)
* [cite_start]**Mục đích:** Xử lý nghiệp vụ hủy vé khi khách hàng thay đổi kế hoạch di chuyển, tự động tính toán phí phạt hoàn tiền và giải phóng ghế trống lập tức[cite: 1065, 1066].
* [cite_start]**Tác nhân chính:** Khách hàng thành viên, Nhân viên bán vé[cite: 1068].
* **Tác nhân phụ:** API Cổng thanh toán đối tác[cite: 1069].
* [cite_start]**Điều kiện tiên quyết:** Vé xe phải ở trạng thái "Chờ khởi hành", giao dịch mua vé trước đó đã ở trạng thái thanh toán thành công[cite: 1072].
* **Luồng chính (Main Flow):**
    1. [cite_start]Người dùng truy cập danh mục "Lịch sử đặt vé"[cite: 1077].
    2. [cite_start]Chọn chiếc vé cần hủy bỏ lịch trình và nhấn nút "Hủy vé"[cite: 1078].
    3. [cite_start]Hệ thống gọi hàm đối chiếu thời gian thực hiện thao tác so với `GioKhoiHanh` của chuyến xe để tính toán số tiền hoàn trả áp dụng theo chính sách khấu trừ phần trăm[cite: 1079].
    4. [cite_start]Hệ thống hiển thị bảng chi tiết tài chính lên màn hình: Giá vé gốc ban đầu, Mức % phí phạt hủy vé áp dụng, Số tiền thực tế khách hàng sẽ nhận được và phương thức hoàn tiền[cite: 1080].
    5. [cite_start]Người dùng chọn lý do hủy vé trong danh sách thả xuống và nhấn nút "Xác nhận hủy vé"[cite: 1081].
    6. [cite_start]Hệ thống thực hiện một Transaction CSDL: Đổi trạng thái vé trong bảng `VE_DIEN_TU` thành "Đã hủy", đồng thời đổi trạng thái ghế trong bảng `GHE_CHUYEN_XE` về lại trạng thái "Trong"[cite: 1082, 1807, 1842].
    7. [cite_start]Hệ thống tự động gọi API chuyển yêu cầu lệnh hoàn tiền sang cổng thanh toán đối tác[cite: 1083].
    8. [cite_start]Cổng thanh toán trả về mã giao dịch và tín hiệu phản hồi đã tiếp nhận lệnh thành công[cite: 1084].
    9. [cite_start]Giao diện hiển thị thông báo: "Hủy vé thành công, tiền sẽ được hoàn trả lại trong vòng 48h", đồng thời gửi tin nhắn SMS/Zalo xác nhận hủy đơn hoàn tất cho hành khách[cite: 1085].
* **Luồng ngoại lệ (Exceptions):**
    * [cite_start]*Luồng 3a (Chặn thời gian hủy vé):* Khách hàng bấm hủy vé khi mốc thời gian thực tại đã rơi vào khung giờ xe chuẩn bị chạy không được phép hoàn tiền theo rule nhà xe $\rightarrow$ Hệ thống hiển thị cảnh báo lỗi: "Rất tiếc, vé của bạn đã quá thời gian được phép hủy theo chính sách", kết thúc quy trình[cite: 1090, 1091].
    * [cite_start]*Luồng 8a (Lỗi cổng thanh toán đối tác):* Cổng thanh toán trả về mã lỗi kết nối hệ thống hoặc timeout $\rightarrow$ Hệ thống đảm bảo giữ nguyên thao tác giải phóng ghế trống để bán cho khách khác, cập nhật trạng thái vé là "Đã hủy", nhưng trạng thái dòng tiền ghi nhận là "Hoàn tiền thất bại", đồng thời tự động bắn log cảnh báo đến tài khoản của nhân viên Kế toán để thực hiện quy trình hoàn tiền thủ công cho khách bằng tay qua Mobile Banking[cite: 1092].

---

### 6. Đặc tả Use Case: QUẢN LÝ TÀI XẾ VÀ PHỤ XE (UC-15)
* **Mục đích:** Cho phép nhân viên điều phối cập nhật hồ sơ, quản lý trạng thái và theo dõi thời hạn hiệu lực bằng lái của đội ngũ tài xế, phụ xe làm căn cứ gán chuyến chạy[cite: 1424].
* [cite_start]**Tác nhân chính:** Nhân viên điều phối[cite: 1425].
* [cite_start]**Điều kiện tiên quyết:** Nhân viên đã đăng nhập thành công bằng tài khoản thuộc nhóm được phân quyền quản lý nhân sự vận hành[cite: 1429].
* **Luồng chính (Main Flow):**
    1. Nhân viên chọn phân hệ chức năng "Quản lý tài xế và phụ xe" trên menu điều hành nội bộ[cite: 1427, 1435].
    2. Hệ thống hiển thị danh sách toàn bộ hồ sơ nhân sự vận hành đang lưu trong bảng `TAI_XE_PHU_XE` (bao gồm các thông tin: Họ tên, Số điện thoại, CCCD, loại bằng lái và trạng thái làm việc)[cite: 1436, 1837].
    3. Nhân viên click chọn nút chức năng tương ứng:
        * [cite_start]**Thêm mới:** Mở form trống để nhập thông tin nhân sự mới (Họ tên, Số điện thoại, Số CCCD, Hạng bằng lái, Ngày hết hạn bằng lái)[cite: 1438].
        * [cite_start]**Cập nhật:** Chọn một nhân sự cụ thể trong bảng để chỉnh sửa thông tin hoặc thay đổi trạng thái hoạt động (Ví dụ chuyển đổi trạng thái từ "Sẵn sàng" sang "Nghỉ phép")[cite: 1439].
        * **Vô hiệu hóa:** Chọn nhân sự xin nghỉ việc hẳn và bấm nút "Vô hiệu hóa" trên thanh công cụ[cite: 1440].
    4. Nhân viên hoàn tất nhập dữ liệu và nhấn nút "Lưu" trên giao diện[cite: 1441].
    5. Hệ thống chạy hàm validation kiểm tra định dạng dữ liệu đầu vào và các ràng buộc trùng lặp[cite: 1441].
    6. Hệ thống thực hiện lưu dữ liệu thay đổi vào bảng `TAI_XE_PHU_XE` trong CSDL và ghi nhận vết thao tác vào nhật ký hệ thống `Activity Log`[cite: 1442].
    7. Tải lại danh sách bảng hiển thị và xuất popup thông báo: "Thao tác dữ liệu thành công"[cite: 1443].
* **Quy tắc kiểm thử đặc biệt (Crucial Test Cases):**
    * **Test Case Cảnh báo thông minh (Hạn bằng lái):** Thiết kế Test Data một tài xế có thời hạn bằng lái (`ThoiHanBangLai`) còn cách ngày hiện tại của hệ thống dưới **30 ngày** $\rightarrow$ Kết quả mong đợi: Hệ thống phải tự động bôi đỏ dòng thông tin của tài xế đó trên giao diện danh sách kèm theo icon cảnh báo để nhắc nhở nhân viên điều phối đổi bằng[cite: 1457, 1838].
    * [cite_start]**Test Case Xóa mềm (Soft Delete):** Khi bấm chức năng xóa nhân sự nghỉ việc $\rightarrow$ Kết quả mong đợi: Hệ thống tuyệt đối không được dùng lệnh `DELETE` xóa cứng dòng dữ liệu khỏi bảng CSDL, mà phải sử dụng lệnh `UPDATE` cập nhật trường trạng thái làm việc chuyển thành `DaKhoa`/`VoHieuHoa`[cite: 1191, 1458, 1838]. [cite_start]Điều này giúp bảo toàn tính toàn vẹn dữ liệu, không làm lỗi hiển thị thông tin lịch sử các chuyến xe mà tài xế này đã từng lái trong quá khứ trên các báo cáo thống kê doanh thu[cite: 516, 1458].
    * **Test Case Chặn thay đổi trạng thái (Đang chạy chuyến):** Thiết kế Test Data chọn một tài xế đang được gán tên vào một chuyến xe trong bảng `PHAN_CONG_CHUYEN` có trạng thái chuyến xe là "ConCho" hoặc "HetCho" (Chuyến xe sắp chạy hoặc chưa hoàn thành) rồi thực hiện bấm chuyển trạng thái tài xế sang "Nghỉ phép" hoặc "Vô hiệu hóa" $\rightarrow$ Kết quả mong đợi: Hệ thống từ chối thực hiện lệnh, hiển thị popup thông báo lỗi: "Không thể thay đổi trạng thái! Nhân sự này đang được phân công lịch trình sắp tới. Vui lòng gỡ lịch trình trước khi thao tác"[cite: 681, 1455, 1825, 1831].

---

### 7. Đặc tả Bảng Kho dữ liệu (Data Stores) phục vụ chuẩn bị Test Data
Để viết phần dữ liệu đầu vào cho các Test Case (Test Data Input), bạn hãy dựa trực tiếp vào cấu trúc các trường thuộc tính của các kho dữ liệu cốt lõi sau[cite: 674, 675]:

* [cite_start]**D04: Sơ đồ ghế / Trạng thái ghế (`GHE_CHUYEN_XE`)[cite: 686, 1840]:**
    * [cite_start]*Thuộc tính:* `MaGheChuyen`, `MaLichTrinh`, `MaGhe`, `TrangThaiGhe` (Nhận 1 trong các giá trị bắt buộc: `Trong` / `DangGiu` / `DaBan` / `DaKhoa`), `ThoiGianCapNhatTrangThai`, `ThoiGianHetHanGiu`[cite: 688, 1841, 1842].
* **D05: Đơn hàng & Vé điện tử (`DON_HANG` và `VE_DIEN_TU`)[cite: 690, 1800, 1804]:**
    * *Thuộc tính đơn hàng:* `MaDonHang`, `MaKhachHang`, `ThoiGianDat`, `TongTien`, `TrangThaiDonHang` (`ChoThanhToan` / `DaThanhToan` / `DaHuy`)[cite: 691, 1803].
    * [cite_start]*Thuộc tính vé điện tử:* `MaVe`, `MaDonHang`, `MaLichTrinh`, `MaGheChuyen`, `ĐiểmĐón`, `ĐiểmTrả`, `HoTenHanhKhach`, `SoDienThoai`, `GiaVe`, `TrangThaiVe` (`ConHieuLuc` / `DaSuDung` / `DaHuy`), `SoLanDaSua`, `MaQRVe`[cite: 692, 1806, 1807].
* [cite_start]**D08: Giao dịch tài chính (`THANH_TOAN`)[cite: 700, 1843]:**
    * [cite_start]*Thuộc tính:* `MaGiaoDich`, `MaDonHang`, `LoaiGiaoDich` (`ThanhToan` / `HoanTien`), `PhuongThucThanhToan`, `SoTien`, `ThoiGianGiaoDich`, `TrangThaiGiaoDich` (`Thành công` / `Thất bại` / `Đang xử lý`)[cite: 701, 1845].