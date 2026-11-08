const { JSDOM } = require('jsdom');
const html = require('fs').readFileSync('electronics-basics.html','utf8');
function boot(){ return new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://bench.test/',
  beforeParse(w){ w.scrollTo=()=>{}; w.__raf=[]; w.requestAnimationFrame=cb=>{w.__raf.push(cb);return w.__raf.length;}; w.cancelAnimationFrame=()=>{}; }}).window; }
const frame=(w,ms)=>{ const b=w.__raf.splice(0); b.forEach(cb=>cb(ms)); };          // one frame at an exact timestamp
const run=(w,fromMs,toMs,step=16)=>{ for(let t=fromMs;t<=toMs;t+=step) frame(w,t); };
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
const pts=e=>e.getAttribute('points').trim().split(/\s+/).filter(Boolean).map(p=>p.split(',').map(Number));
setTimeout(()=>{ try{
  // ---------- scope lesson
  let w=boot(), L=w.__learn, D=w.document; L.goNav('The oscilloscope'); run(w,0,500);
  let tr=D.querySelector('#main svg.scope polyline');
  let ys=[...new Set(pts(tr).map(p=>Math.round(p[1])))].sort((a,b)=>a-b);
  ok('square wave: two levels at 2 V/div (9 V → y≈63, 0 V → y=175)', ys.length===2 && Math.abs(ys[0]-62.5)<1.5 && ys[1]===175, JSON.stringify(ys));
  const vs=D.getElementById('osV'); vs.value='5'; vs.dispatchEvent(new w.Event('change'));
  ys=[...new Set(pts(tr).map(p=>Math.round(p[1])))].sort((a,b)=>a-b);
  ok('5 V/div makes the same 9 V shorter (y≈130)', Math.abs(ys[0]-130)<1.5, JSON.stringify(ys));
  const edges=pts(tr).filter((p,i,a)=>i&&a[i-1][0]===p[0]).length;
  ok('square edges are vertical (exact, not sampled)', edges>=8, edges+' vertical edges on 10 s… screen');
  ok('period & frequency readouts at 1 Hz', D.getElementById('osP').textContent==='1 s' && D.getElementById('osFq').textContent==='1.0 Hz', D.getElementById('osP').textContent+' / '+D.getElementById('osFq').textContent);
  const ts=D.getElementById('osT'); ts.value='0.1'; ts.dispatchEvent(new w.Event('change'));
  ok('time/div changes screen width text', D.getElementById('osW').textContent.includes('1 s'), D.getElementById('osW').textContent);
  // switch source
  [...D.querySelectorAll('#main .seg button')].find(b=>b.dataset.k==='sw').click(); const a0=D.getElementById('osA').textContent;
  D.getElementById('osSw').click(); const a1=D.getElementById('osA').textContent;
  ok('switch: amplitude 0 → 9 V when closed', a0==='0' && a1==='9.0', a0+' → '+a1);
  // ---------- capacitor physics: τ = 20k × 100µF = 2 s
  w=boot(); L=w.__learn; D=w.document; L.goNav('Capacitor');
  frame(w,1000); // loop start (t=0)
  run(w,1016,3000);  // t ≈ 2.0 s = 1τ
  const vc=parseFloat(D.getElementById('cVc').textContent);
  ok('capacitor reaches 63% at exactly 1τ in real time', Math.abs(vc-9*0.632)<0.08, vc+' V (expect 5.69)');
  run(w,3016,11000); const v5=parseFloat(D.getElementById('cVc').textContent);
  ok('≈99% after 5τ (10 s)', v5>8.9, v5+' V');
  // trace never drawn past "now"
  w=boot(); L=w.__learn; D=w.document; L.goNav('Capacitor'); frame(w,0); run(w,16,1000);
  const ctr=[...D.querySelectorAll('#main svg.scope polyline')].pop(); const maxX=Math.max(...pts(ctr).map(p=>p[0]));
  ok('capacitor trace stops at “now” (no future drawn)', maxX<20, 'at t=1 s on a 20 s screen, trace ends at x='+maxX.toFixed(1)+' of 320');
  // discharge
  D.querySelectorAll('#main .seg button')[1].click(); run(w,1016,3000); const vd=parseFloat(D.getElementById('cVc').textContent);
  ok('discharge falls toward 0', vd < 1.6, vd+' V');
  // ---------- P2 measured period
  w=boot(); L=w.__learn; D=w.document; L.goNav('P2 · Blinker (timing)'); frame(w,0); run(w,16,600);
  const mp=D.getElementById('mvMP').textContent, exp=2*0.69*47000*10e-6;
  ok('P2 measured period matches 2 × 0.69RC', Math.abs(parseFloat(mp)-exp*1000)<exp*1000*0.01, mp+' (expect '+(exp*1000).toFixed(0)+' ms)');
  const r=D.querySelectorAll('#main input[type=range]'); r[0].value='10'; r[0].dispatchEvent(new w.Event('input')); r[1].value='1'; r[1].dispatchEvent(new w.Event('input'));
  run(w,616,1000);
  const mf=D.getElementById('mvMF').textContent, blur=D.getElementById('mvBlur').style.display;
  ok('fast blink (≈72 Hz) measured correctly, blur note shown', Math.abs(parseFloat(mf)-1/(2*0.69*10000*1e-6))<1 && blur==='block', mf+', note '+blur);
  // ---------- reduced motion: every step still renders, scopes draw a still picture
  w=boot(); L=w.__learn; D=w.document; const rm=D.getElementById('reduceMotion'); rm.checked=true; rm.dispatchEvent(new w.Event('change'));
  let snag=[]; L.STEPS.forEach((s,i)=>{ L.go(i); if(D.querySelector('#main .warnbox')&&D.querySelector('#main .warnbox').textContent.includes('snag')) snag.push(s.nav); });
  L.goNav('Capacitor'); const rc=[...D.querySelectorAll('#main svg.scope polyline')].pop();
  ok('reduced motion: all steps render, capacitor shows full still curve', !snag.length && pts(rc).length>300, snag.join(',')+' '+pts(rc).length+' pts');
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:'')));
console.log(res.every(r=>r[0]==='PASS')?'\nALL PASS ✓':'\nFAILURES ✗');
},300);
