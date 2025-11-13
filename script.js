// script.js — WebGazer integration and UI
(function(){
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const calibBtn = document.getElementById('calibBtn');
  const statusEl = document.getElementById('status');
  const gazeDot = document.getElementById('gazeDot');
  const toggleDot = document.getElementById('toggleDot');
  const dotColor = document.getElementById('dotColor');
  const calibOverlay = document.getElementById('calibOverlay');

  let running = false;
  let listenerAttached = false;

  function setStatus(t){
    statusEl.textContent = 'Trạng thái: ' + t;
  }

  function ensureDotVisible(){
    if(toggleDot.checked){
      gazeDot.style.display = 'block';
    } else {
      gazeDot.style.display = 'none';
    }
  }

  dotColor.addEventListener('input', e=>{
    gazeDot.style.background = e.target.value;
  });

  toggleDot.addEventListener('change', ensureDotVisible);

  // update dot position from prediction
  function attachListener(){
    if(listenerAttached) return;
    if(typeof webgazer === 'undefined'){
      console.warn('webgazer not loaded');
      return;
    }
    webgazer.setGazeListener(function(data, elapsedTime) {
      if (!data) return;
      const x = data.x;
      const y = data.y;
      // place the dot
      gazeDot.style.left = x + 'px';
      gazeDot.style.top = y + 'px';
      ensureDotVisible();
    });
    listenerAttached = true;
  }

  startBtn.addEventListener('click', async ()=>{
    if (running) return;
    setStatus('Đang khởi động webgazer và yêu cầu quyền camera...');
    try {
      // begin returns a promise when using recent builds
      await webgazer.begin();
      // hide the video preview elements produced by webgazer if any
      const elems = document.querySelectorAll('video, canvas');
      elems.forEach(el=>{
        if(el && el.id && el.id.startsWith('webgazer')) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.position = 'absolute';
          el.style.zIndex = '5';
        }
      });
      attachListener();
      running = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
      setStatus('Đã khởi động — đang nhận dữ liệu');
    } catch(err){
      console.error(err);
      setStatus('Lỗi khi khởi động: ' + (err && err.message ? err.message : err));
    }
  });

  stopBtn.addEventListener('click', ()=>{
    if(!running) return;
    webgazer.pause();
    running = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    setStatus('Đã tạm dừng');
  });

  // Simple calibration: show 9 points sequentially and record clicks (best-effort)
  calibBtn.addEventListener('click', async ()=>{
    if(typeof webgazer === 'undefined'){
      alert('webgazer chưa được nạp. Nhấn Bắt đầu trước.');
      return;
    }
    setStatus('Hiệu chỉnh: Vui lòng chạm/nhấn vào các chấm xuất hiện');
    const points = [
      [10,10],[50,10],[90,10],
      [10,50],[50,50],[90,50],
      [10,90],[50,90],[90,90]
    ];
    // convert percent positions to absolute
    calibOverlay.innerHTML = '';
    calibOverlay.style.pointerEvents = 'auto';
    calibOverlay.style.display = 'block';

    function makePoint(px, py){
      const d = document.createElement('div');
      d.className = 'calib-point';
      d.style.position = 'absolute';
      d.style.width = '18px';
      d.style.height = '18px';
      d.style.borderRadius = '50%';
      d.style.background = '#060bff';
      d.style.opacity = '0.95';
      d.style.transform = 'translate(-50%,-50%)';
      d.style.left = px + '%';
      d.style.top = py + '%';
      d.style.zIndex = 30;
      d.style.pointerEvents = 'auto';
      d.style.display = 'flex';
      d.style.alignItems = 'center';
      d.style.justifyContent = 'center';
      d.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      return d;
    }

    // create points and add listeners
    let clicked = 0;
    const total = points.length;
    for(let i=0;i<points.length;i++){
      const [px,py] = points[i];
      const p = makePoint(px,py);
      p.addEventListener('click', (ev)=>{
        // record screen position if available
        try{
          if(typeof webgazer.recordScreenPosition === 'function'){
            webgazer.recordScreenPosition(ev.clientX, ev.clientY, 'click');
          } else if(typeof webgazer.addClick === 'function'){
            // alternate API names in some versions
            webgazer.addClick(ev.clientX, ev.clientY);
          } else {
            // fallback: call getCurrentPrediction and do nothing else
            // this still provides a user action for training (WebGazer auto-saves clicks in some builds)
            webgazer.getCurrentPrediction();
          }
        }catch(e){
          console.warn('Calibration helper: record API not found', e);
        }
        p.style.background = '#10b981';
        clicked++;
        if(clicked === total){
          finishCalibration();
        }
      });
      calibOverlay.appendChild(p);
    }

    // On mobile, also allow touch events
    calibOverlay.addEventListener('touchstart', function(ev){
      const touch = ev.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if(target && target.classList.contains('calib-point')){
        target.click();
      }
    });

    function finishCalibration(){
      setStatus('Hoàn tất hiệu chỉnh');
      calibOverlay.innerHTML = '';
      calibOverlay.style.pointerEvents = 'none';
    }

  });

  // init UI defaults
  gazeDot.style.background = dotColor.value;
  ensureDotVisible();
  setStatus('Chưa khởi động');

  // minor safety: if webgazer loads after script, attach listener when it becomes available
  if(typeof webgazer !== 'undefined'){
    // nothing yet, wait for user to start
  } else {
    // try to detect when webgazer is ready
    let tries = 0;
    const t = setInterval(()=>{
      tries++;
      if(typeof webgazer !== 'undefined' || tries > 30){
        clearInterval(t);
        if(typeof webgazer !== 'undefined'){
          console.log('webgazer detected');
        } else {
          console.warn('webgazer not detected after wait');
        }
      }
    }, 300);
  }

})();
