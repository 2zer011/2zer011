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
