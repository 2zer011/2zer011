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
