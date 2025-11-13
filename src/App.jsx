import React, { useState } from 'react';
import EyeTracker from './components/EyeTracker.jsx';
import Calibration from './components/Calibration.jsx';

export default function App(){
  const [running, setRunning] = useState(false);
  const [showCalib, setShowCalib] = useState(false);
  const [cursorColor, setCursorColor] = useState('#2563eb');
  const [showCursor, setShowCursor] = useState(true);
  const [status, setStatus] = useState('Chưa khởi động');
  const [accuracy, setAccuracy] = useState(null);

  const start = () => {
    setRunning(true);
    setStatus('Yêu cầu quyền camera...');
    setShowCalib(true);
    window.dispatchEvent(new Event('start-webgazer'));
  };

  const stop = () => {
    setRunning(false);
    setStatus('Đã dừng');
    window.dispatchEvent(new Event('stop-webgazer'));
    setAccuracy(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Eye Tracker Demo v2</h1>
          <div className="text-sm opacity-90">Theo dõi ánh mắt · Tiếng Việt</div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <section className="lg:col-span-3 bg-white rounded-xl p-6 shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Khu vực theo dõi ánh mắt</h2>
            <div className="text-sm text-gray-500">Trạng thái: <span className="font-semibold">{status}</span></div>
          </div>

          <p className="text-gray-600 mb-4">Nhấn <strong>Bắt đầu</strong>, cho phép camera, rồi thực hiện hiệu chuẩn 12 điểm để con trỏ theo ánh mắt hoạt động tốt hơn.</p>

          <div className="h-[60vh] border-2 border-dashed border-gray-200 rounded-lg relative flex items-center justify-center">
            <div className="text-center z-20">
              <h3 className="text-2xl font-semibold">Hãy nhìn vào các vùng trên màn hình</h3>
              <p className="text-sm text-gray-500 mt-2">Vòng tròn sẽ di chuyển mượt theo ánh mắt sau khi hiệu chuẩn</p>
            </div>

            <EyeTracker color={cursorColor} visible={showCursor} setStatus={setStatus} />
          </div>
        </section>

        <aside className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-medium text-lg mb-4">Điều khiển</h3>
          <div className="space-y-4">
            <button onClick={start} className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded">Bắt đầu</button>
            <button onClick={stop} className="w-full bg-gray-200 py-2 rounded">Dừng lại</button>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Màu vòng tròn vùng nhìn</label>
              <input type="color" value={cursorColor} onChange={(e)=>setCursorColor(e.target.value)} className="w-full h-10 p-0 border rounded"/>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Hiển thị vòng tròn</label>
              <input type="checkbox" checked={showCursor} onChange={()=>setShowCursor(v=>!v)} />
            </div>

            <button onClick={()=>{ setShowCalib(true); window.dispatchEvent(new Event('start-webgazer')); }} className="w-full bg-emerald-500 text-white py-2 rounded">Hiệu chỉnh lại (12 điểm)</button>

            <div className="pt-2">
              <div className="text-xs text-gray-500">Độ chính xác (sai số trung bình):</div>
              <div className="text-xl font-medium text-gray-800">{accuracy === null ? 'Chưa hiệu chỉnh' : `${accuracy.toFixed(1)} px`}</div>
            </div>

            <p className="text-xs text-gray-500 mt-3">Lưu ý: chạy trên localhost hoặc HTTPS để trình duyệt cho phép truy cập camera.</p>
          </div>
        </aside>
      </main>

      <footer className="p-4 text-center text-xs text-gray-500">Eye Tracker Demo v2 · Quyền camera & bảo mật</footer>

      {showCalib && <Calibration onComplete={(acc)=>{ setStatus('Đã hiệu chỉnh'); setAccuracy(acc); setShowCalib(false); }} />}
    </div>
  );
}
