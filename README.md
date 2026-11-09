# 2zer011-slide
Slide HTML chạy GitHub Pages. Không build, không thư viện, ES5 thuần (chạy Win 7 / trình duyệt cũ).

## Bật Pages
Settings → Pages → Deploy from branch → `main` / `(root)`.
Mở: `https://<user>.github.io/2zer011-slide/`

## Điều khiển
- `→ ↓ Space Enter` / chạm phải / vuốt trái: bước tiếp (hiện dần từng phần rồi sang slide)
- `← ↑ Backspace` / chạm trái 28% / vuốt phải: lùi
- `F` toàn màn hình · `G` mục lục · `B` tối màn hình · `Home/End`
- Điện thoại: tự xoay ngang khi cầm dọc; bấm "Bắt đầu" để vào toàn màn hình (trình duyệt bắt buộc có thao tác chạm).
- iPhone Safari không có Fullscreen API: dùng "Thêm vào MH chính" để chạy toàn màn hình.

## Thêm deck
Copy `decks/toan-co-dai.html`, sửa các `<section class="slide">`, rồi thêm 1 thẻ `<a class="d">` vào `index.html`.
- `data-t="slide|fade|zoom|flip|rise|spin|blur"`: hiệu ứng chuyển trang
- `data-step`: hiện dần theo từng lần bấm
- `fx-fade|up|down|left|right|zoom|spin|reveal` + `d1..d8`: hiệu ứng + độ trễ
- `<path class="draw">`: đường tự vẽ; `<polygon class="morph" data-shapes="6,12,24,48,96">`: biến hình đa giác

## Nền & hình
- `assets/art.js` tự chèn nền SVG động theo class slide: `eg` (Ai Cập), `cn` (Trung Hoa), `in` (Ấn Độ), `dark`. Slide không có class → `eg`. Thêm `data-noart="1"` để tắt.
- Chân dung: `assets/img/*.jpg` + khung `portrait pf-eg|pf-cn|pf-in`.

## Decks
- `decks/lich-su-a1.html` - Lịch sử A1: Hy Lạp & La Mã (theme `gr`/`ro`/`nv` in `assets/classic.css`, art in `assets/art.js`). Ghim đầu `index.html` bằng class `pin`.
- `decks/toan-co-dai.html` - Toán cổ đại.

## Tải về (pptx)

Tab "Tải về" ở trang chủ trỏ tới `downloads/lich-su-a1.pptx`. Tạo lại: chạy `node tools/extract.js lich-su-a1 18` (Playwright, chụp nền + từng khối), rồi `python3 tools/build.py lich-su-a1 downloads/lich-su-a1.pptx kich-ban.txt` (python-pptx). Chữ là ảnh, không sửa được trong PowerPoint.

## Lite mode

Máy yếu / Win 7: phím `L`, nút Lite ở thanh dưới, hoặc `decks/x.html?lite`. Tắt nền động, glow, blur, bóng; hiệu ứng thành fade 0.2s. Nhớ lựa chọn bằng localStorage.

## Deck A1 (Phục hưng)

Chỉ còn khoa học-kĩ thuật / tư tưởng / ý nghĩa. Chuyển slide mới: iris, curtain, drift, diag, warp, blinds, book (engine.css). Nền mới: `rn` vũ trụ, `rm` xưởng cơ khí, `rl` ánh nến (art.js + renaissance.css). pptx đã làm lại cho bản Phục hưng (`node tools/extract.js lich-su-a1 7` rồi `python3 tools/build.py lich-su-a1 downloads/lich-su-a1.pptx kich-ban.txt`).

Deck Toán cũng có pptx: `node tools/extract.js toan-co-dai 14` rồi `python3 tools/build.py toan-co-dai downloads/toan-co-dai.pptx`. Deck Toán đã dùng chuyển slide mới, chữ rơi, thẻ nghiêng 3D, nền thêm đèn lồng / bụi / sao.

## Nâng cấp hiệu ứng v2 (`assets/fx2.css` + `assets/fx2.js`)

Lớp hiệu ứng thêm vào, dùng chung cho cả 2 bài. Gỡ 2 thẻ `<link>`/`<script>` của fx2 là bài quay về như cũ.

**Chuyển slide mới** (`data-t="..."`): `cube` (khối lập phương 3D), `slice` (8 dải dọc), `fold` (gập từ dưới lên), `lens` (vòng tròn mở từ góc dưới phải). Đều có bản chạy ngược khi bấm lùi.

**Hiệu ứng xuất hiện mới** (class, dùng được với `d1..d8` và `data-step`): `fx-flipx` (lật từ trên xuống), `fx-rubber` (co giãn dẻo), `fx-drop` (rơi và nảy), `fx-rise3d` (trồi lên theo chiều sâu). Thẻ `.card` không gắn fx sẽ tự luân phiên up / flipx / rubber.

**Tự động, không cần sửa nội dung bài**
- Gạch chân tiêu đề h2 tự vẽ, có vệt sáng chạy.
- Chữ `<b>` được tô bút dạ lần lượt (chữ trong `data-step` chỉ tô sau khi bấm hiện).
- Chữ tiêu đề lớn `.split` nháy sáng gợn sóng sau khi rơi xuống.
- Hạt nền theo theme: bụi sao (`rn`, `dark`), tia lửa (`rm`), tàn lửa (`rl`), bụi vàng (`eg`, `in`), cánh hoa (`cn`).
- Mỗi lần bấm hiện một khối: vòng sóng + nổ tia lửa tại khối đó.
- Mỗi lần sang slide: tia sáng chéo quét ngang.
- Parallax nền theo chuột và đèn rọi mềm bám con trỏ (chỉ khi có chuột; tự tắt khi đứng yên).
- Thanh tiến trình có đầu sao phát sáng.

**Thuộc tính tùy chọn trên `<section class="slide">`**
- `data-fx="stardust|embers|sparks|dust|petals|none"`: ép kiểu hạt nền.
- `data-finale="1"`: bắn pháo hoa / hoa giấy khi vào slide (đang dùng ở slide "Cảm ơn" của cả 2 bài).

**Tắt hiệu ứng mới**: Lite (`L`, nút Lite, `?lite`) hoặc hệ điều hành bật "giảm chuyển động" sẽ tắt toàn bộ canvas hạt, parallax, đèn rọi, vòng sóng.

**Sửa nhỏ trong engine.js**: có 2 điểm gọi `FX.enter` / `FX.step`; thời gian dọn class chuyển slide giờ tính theo từng kiểu (trước đây warp/book bị cắt cụt 150–300ms); file pptx trong `downloads/` chưa được tạo lại (chữ là ảnh, không có hiệu ứng mới).
