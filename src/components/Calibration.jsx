import React, { useState } from 'react';
import webgazer from 'webgazer';

// 12 points: 3 columns x 4 rows for wider coverage
const points = [
  { x: '10%', y: '8%' }, { x: '50%', y: '8%' }, { x: '90%', y: '8%' },
  { x: '10%', y: '30%' }, { x: '50%', y: '30%' }, { x: '90%', y: '30%' },
  { x: '10%', y: '52%' }, { x: '50%', y: '52%' }, { x: '90%', y: '52%' },
  { x: '10%', y: '74%' }, { x: '50%', y: '74%' }, { x: '90%', y: '74%' }
];

export default function Calibration({ onComplete }) {
  const [idx, setIdx] = useState(0);
  const [samples, setSamples] = useState([]); // store error distances

  const handleClick = (e) => {
    // get current webgazer prediction
    let pred = null;
    try {
      pred = webgazer.getCurrentPrediction();
    } catch (err) {
      console.warn('getCurrentPrediction not available', err);
    }
    const clickX = e.clientX;
    const clickY = e.clientY;
    if (pred && pred.x && pred.y) {
      const dx = pred.x - clickX;
      const dy = pred.y - clickY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      setSamples(s => [...s, dist]);
    } else {
      // if prediction not ready, add a large value to indicate low confidence
      setSamples(s => [...s, 999]);
    }

    // record calibration for webgazer if available
    try {
      webgazer.recordScreenPosition(clickX, clickY, 'click');
    } catch(err) {
      // ignore if not supported in build
      console.warn('recordScreenPosition error', err);
    }

    if (idx < points.length - 1) {
      setIdx(i => i + 1);
    } else {
      // compute avg error (exclude placeholder 999)
      const valid = samples.concat().filter(v => v < 900);
      const all = valid.length ? valid : samples;
      const sum = all.reduce((a,b) => a + b, 0);
      const avg = all.length ? sum / all.length : 999;
      if (onComplete) onComplete(avg);
    }
  };

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(255,255,255,0.92)', zIndex:1300, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{position:'relative', width:'100%', height:'100%'}} onClick={handleClick}>
        <div style={{position:'absolute', left: points[idx].x, top: points[idx].y, transform:'translate(-50%,-50%)'}}>
          <div style={{width:64, height:64, borderRadius:32, background:'#0ea5e9', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, boxShadow:'0 8px 24px rgba(0,0,0,0.18)'}}>{idx+1}</div>
        </div>
        <div style={{position:'absolute', left:'50%', bottom:'6%', transform:'translateX(-50%)', textAlign:'center', color:'#333'}}>
          <div style={{fontSize:18, fontWeight:700}}>Hiệu chuẩn 12 điểm</div>
          <div style={{fontSize:14, color:'#666', marginTop:8}}>Nhìn vào chấm và <strong>click</strong> để ghi lại dữ liệu.</div>
          <div style={{fontSize:12, color:'#666', marginTop:6}}>Bước {idx+1} / 12</div>
        </div>
      </div>
    </div>
  );
}
