import React, { useEffect, useRef } from 'react';
import webgazer from 'webgazer';

export default function EyeTracker({ color='#2563eb', visible=true, setStatus }) {
  const cursorRef = useRef(null);
  const lastPos = useRef({ x: window.innerWidth/2, y: window.innerHeight/2 });

  useEffect(()=>{
    const cur = cursorRef.current;
    if (cur) cur.style.background = color;
  }, [color]);

  useEffect(()=>{
    function start(){
      webgazer.setGazeListener((data) => {
        if(!data) return;
        const targetX = data.x;
        const targetY = data.y;
        const alpha = 0.22;
        const lx = lastPos.current.x; const ly = lastPos.current.y;
        const nx = lx + (targetX - lx) * alpha; const ny = ly + (targetY - ly) * alpha;
        lastPos.current = { x: nx, y: ny };
        const cur = cursorRef.current;
        if(cur && visible){
          cur.style.left = nx + 'px';
          cur.style.top = ny + 'px';
        }
      }).begin()
      .then(()=> setStatus && setStatus('WebGazer đã chạy — chờ hiệu chuẩn'))
      .catch((err)=> { console.error('webgazer begin error', err); setStatus && setStatus('Lỗi khởi động camera hoặc quyền bị từ chối');});
    }

    function stop(){
      try{ webgazer.pause(); webgazer.stop(); }catch(e){}
      setStatus && setStatus('WebGazer dừng');
    }

    window.addEventListener('start-webgazer', start);
    window.addEventListener('stop-webgazer', stop);

    return ()=>{
      window.removeEventListener('start-webgazer', start);
      window.removeEventListener('stop-webgazer', stop);
      try{ webgazer.clearGazeListener(); webgazer.end(); }catch(e){}
    };
  }, [visible, setStatus]);

  return <div ref={cursorRef} className="gaze-cursor" style={{left: lastPos.current.x + 'px', top: lastPos.current.y + 'px', background: color}} />;
}
