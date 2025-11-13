Eye Tracker Demo — WebGazer.js
================================

Contents:
- index.html       -> Main demo page (loads WebGazer via CDN)
- style.css        -> Styles
- script.js        -> JavaScript controlling WebGazer and UI
- (other files)    -> Any assets that were in your uploaded eye-tracker-demo-v2.zip

How to run:
1. Extract the folder and host via a local server that supports HTTPS or use localhost.
   Example using Python (for quick localhost test):
     python -m http.server 8000
   Note: Some browsers only allow camera access over HTTPS or for localhost. If camera access is blocked,
   use a proper HTTPS local server (mkcert + http-server or similar).

2. Open the page (https://localhost:8000 or http://localhost:8000 if testing on localhost).
3. Click "Bắt đầu" and cho phép trình duyệt truy cập camera.
4. (Optional) Click "Hiệu chỉnh (Calibrate)" and bấm vào các chấm để cải thiện mô hình.

Caveats:
- Calibration behavior may vary between WebGazer builds. The demo attempts to call common calibration helper APIs if available.
- If the CDN version changes API names, minor edits to script.js may be required.

Enjoy!
