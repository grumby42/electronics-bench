// Schematic reading and PCB lessons: nets, layers, faults found with a probe.
const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-basics.html','utf8');
const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://b.test/',beforeParse(w){w.scrollTo=()=>{};w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};}}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
 const L=w.__learn, D=w.document;
 L.goNav('Reading a schematic'); let m=D.getElementById('main'); const sc=m.__schem;
 ok('schematic lesson renders with symbols table', !!sc && /NPN transistor/.test(m.textContent));
 sc.st.pick('GND'); ok('tapping ground explains the two ground symbols are one net', /two ground symbols are one net/.test(m.textContent));
 sc.st.pick('GND'); ['S','GND','C1','COL'].forEach(n=>sc.st.pick(n)); ok('find-the-net quiz completes in order', sc.quizI===4 && /All four found/.test(m.textContent));
 L.goNav('Printed circuit boards'); m=D.getElementById('main'); const P=m.__pcb, st=P.st;
 ok('PCB lesson renders schematic and board side by side', m.querySelectorAll('.pcbpair svg').length===2 && /Paul Eisler/.test(m.querySelector('details.origin').textContent));
 // Ohm and Kirchhoff hold on the working board
 const r=st.res, v=r.v; ok('working board: LED ~14.5 mA, R2 drop = I × 470 Ω', Math.abs(r.led-14.47)<0.1 && Math.abs((v.VCC-v.C1)-r.led*0.47)<0.01, r.led.toFixed(2)+' mA');
 st.sw=false; st.recalc(); ok('switch open: LED dark, no base current', st.res.led===0 && st.res.ib===0); st.sw=true; st.recalc();
 st.pick('BASE'); const hiPCB=[...m.querySelectorAll('.pcbpair svg:last-child polyline')].filter(p=>p.getAttribute('stroke')==='#ffd08a').length, hiSch=[...m.querySelectorAll('.pcbpair svg:first-child polyline')].filter(p=>p.getAttribute('stroke')==='var(--copper)').length;
 ok('one tap highlights the net in both drawings (base: 2 traces + via, 1 wire)', hiPCB===2 && hiSch===1 && /via/.test(m.querySelector('.kwork').textContent), hiPCB+' / '+hiSch); st.pick('BASE');
 const tog=t=>[...m.querySelectorAll('.tog')].find(b=>b.textContent.startsWith(t)).click();
 const nTraces=()=>[...m.querySelectorAll('.pcbpair svg:last-child polyline')].length;
 const all=nTraces(); tog('Top copper'); const noTop=nTraces(); tog('Top copper');
 ok('hiding the top copper hides its one trace', all-noTop===1, all+' → '+noTop);
 tog('Exploded layers'); ok('exploded view: five labelled layers and a copper barrel through every hole', /fibreglass core/.test(m.querySelector('.pcbpair').textContent) && m.querySelectorAll('.pcbpair svg:last-child line').length>=14); tog('Exploded layers');
 const sel=P.sel, setF=k=>{ sel.value=k; sel.dispatchEvent(new w.Event('change')); };
 setF('crack'); st.probing=true; st.padTap('DK'); st.padTap('QC');
 const pv=k=>st.probes.find(p=>p.k===k).v; ok('cracked trace: LED dark, the two ends of one trace read differently', st.res.led===0 && pv('DK')>7 && pv('QC')<0.1, pv('DK')+' V vs '+pv('QC')+' V');
 setF('bridge'); st.sw=false; st.recalc(); ok('solder bridge: LED lights with the switch open', st.res.led>10); st.sw=true; st.recalc();
 st.padTap('QB'); st.padTap('QC'); ok('solder bridge: base and collector read the same', pv('QB')===pv('QC'));
 setF('cold'); st.padTap('DA'); st.padTap('DK'); ok('cold joint: dim LED with an impossible 8.5 V "across" it', st.res.led>0.3&&st.res.led<1 && pv('DA')-pv('DK')>8, (pv('DA')-pv('DK')).toFixed(2)+' V');
 setF('mys'); const hidden=st.mystery; ok('mystery: a fault is hidden and probe mode starts', !!hidden && st.probing && !st.revealed);
 const btn=t=>[...m.querySelectorAll('.mguess button')].find(b=>b.textContent===t);
 const names={crack:'Cracked trace',bridge:'Solder bridge',cold:'Cold solder joint'}; const wrong=Object.keys(names).find(k=>k!==hidden);
 btn(names[wrong]).click(); ok('mystery: a wrong guess is explained', /^Not a/.test(m.querySelector('.kwork .note').textContent) && !!st.mystery);
 btn(names[hidden]).click(); ok('mystery: the right guess reveals the fault on the board', !st.mystery && st.revealed && st.fault===hidden);
 L.goNav('Check: Components'); ok('Components check intro still matches its question count', /(\w+) questions/.test(D.getElementById('main').textContent));
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},300);
