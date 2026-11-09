const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-trainer.html','utf8').replace(/<\/script>(?![\s\S]*<\/script>)/,'\nwindow.__dbg={get state(){return state;},loadProject,recompute,PROJECTS,setBreak,clearBrk,diagnosis,ledmA,ledList,renderProjCtl};\n</script>');
const param=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://t.test/',beforeParse(w){w.AudioContext=class{constructor(){this.destination={};this.currentTime=0;}createOscillator(){return{frequency:param(),connect(){return this;},start(){},stop(){},disconnect(){}};}createGain(){return{gain:param(),connect(){return this;},disconnect(){}};}resume(){return Promise.resolve();}};w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};}}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
 const g=w.__dbg, S=g.state, D=w.document; D.getElementById('powerBtn').click();
 const mA=(i=0)=>g.ledmA(g.ledList()[i],S.lastSol);
 const run=(id,ctl)=>{ g.loadProject(id); Object.assign(S.ctl,ctl||{}); if(ctl&&(('tap' in ctl)||('line' in ctl))){ S.wires=[];S.parts=[];g.PROJECTS[id].build(); } g.recompute(); };
 // L1 stacking
 const l1={}; for(const t of ['V1','V2','V4','V6']){ run('L1',{tap:t}); l1[t]=mA(); }
 ok('L1: 1 cell can’t light it; more cells = more current; 6 cells ≈ 20 mA', l1.V1<0.1 && l1.V2>1 && l1.V2<8 && l1.V4>l1.V2 && Math.abs(l1.V6-20.1)<0.5, JSON.stringify(Object.fromEntries(Object.entries(l1).map(([k,v])=>[k,+v.toFixed(1)]))));
 // L2 knob → meter
 run('L2',{pot:0.5}); const m5=S.lastSol.res.v[S.lastSol.find('spn:59')]; run('L2',{pot:0.8}); const m8=S.lastSol.res.v[S.lastSol.find('spn:59')];
 ok('L2: knob at half = 4.5 V, knob up = needle up', Math.abs(m5-4.5)<0.05 && m8>m5, m5.toFixed(2)+' V → '+m8.toFixed(2)+' V');
 // L3 telegraph fade
 const l3={}; for(const L of [0,1000,4700,22000]){ run('L3',{line:L,s1:true}); l3[L]=mA(); } run('L3',{line:0,s1:false});
 ok('L3: key up = off; longer line = fainter; 22 kΩ ≈ dark', mA()<0.1 && l3[0]>l3[1000] && l3[1000]>l3[4700] && l3[22000]<0.5, JSON.stringify(Object.fromEntries(Object.entries(l3).map(([k,v])=>[k,+v.toFixed(2)]))));
 // L4 relay beats the line
 run('L4',{line:100000,s1:true}); const on4=mA(); run('L4',{line:100000,s1:false}); const off4=mA();
 ok('L4: even through 100 kΩ the relay drives the LED bright; key up = off', on4>8 && off4<0.1, on4.toFixed(1)+' / '+off4.toFixed(1)+' mA');
 // truth tables
 const tt=(id,i=0)=>[[0,0],[0,1],[1,0],[1,1]].map(([a,b])=>{ run(id,{s1:!!a,s2:!!b}); return mA(i)>3?1:0; }).join('');
 ok('L5 is AND (0001)', tt('L5')==='0001', tt('L5'));
 ok('L6 is OR (0111)', tt('L6')==='0111', tt('L6'));
 ok('L8 is NOR (1000)', tt('L8')==='1000', tt('L8'));
 // L7 steering
 run('L7',{s1:true,s2:false}); const a=mA(0),b=mA(1),c=mA(2);
 ok('L7: S1 lights A and C, not B', a>8&&c>8&&b<0.1, [a,b,c].map(x=>x.toFixed(1)).join(' / '));
 // L9 armed night light & fixed kit #19
 const l9=(L,s)=>{ run('L9',{light:L,s1:s}); return mA()>3?1:0; };
 ok('L9: lamp = dark AND armed', l9(0.2,true)===1 && l9(0.9,true)===0 && l9(0.2,false)===0);
 const k19=L=>{ run(19,{light:L}); return mA(); };
 ok('kit #19 fixed: on in the dark, off in bright light', k19(0.2)>8 && k19(0.9)<0.1, k19(0.2).toFixed(1)+' mA dark / '+k19(0.9).toFixed(1)+' mA bright');
 // ---- break-it diagnoses
 const txt=()=>D.querySelector('#projCtl .diag')?.textContent||'';
 run('L1',{tap:'V6'}); const r1=S.parts.find(p=>p.type==='res'); g.setBreak('rmP',r1.id);
 ok('Break: remove resistor → open, gap ≈ 9 V, LED 0', /Open circuit/.test(txt()) && /9\.0 V/.test(txt()) && mA()<0.1, txt().match(/meter across the gap reads [\d.]+ V/)?.[0]);
 g.setBreak('shP',r1.id); ok('Break: short resistor → too much current (~257 mA)', /Short circuit/.test(txt()) && mA()>200, mA().toFixed(0)+' mA');
 run('L4',{line:22000,s1:false}); g.setBreak('shP','q1'); ok('Break: short transistor → stuck on with key up', /Stuck on/.test(txt()) && mA()>8);
 run('L7',{s1:true,s2:false}); const d2=S.parts.filter(p=>p.type==='diode')[1]; g.setBreak('shP',d2.id);
 ok('Break: short D2 → LED B lights wrongly', /turned on that shouldn/.test(txt()) && mA(1)>3, 'LED B '+mA(1).toFixed(1)+' mA');
 run('L3',{line:0,s1:true}); g.setBreak('rmW',0); ok('Break: cut a wire → open', /Open circuit/.test(txt()) && mA()<0.1);
 D.querySelector('#projCtl .brk-fix').click(); ok('Repair restores the circuit', mA()>15 && !S.lastBreak);
 run('L1',{tap:'V6'}); D.getElementById('powerBtn').click(); g.setBreak('rmP',S.parts[0].id); ok('Break with power off explains why nothing shows', /Switch POWER on/.test(D.querySelector('#projCtl .breakit').textContent)); D.getElementById('powerBtn').click();
 run(29); ok('timed projects list their capacitors in break-it', /10 µF capacitor/.test(D.querySelector('#projCtl .breakit').textContent));
 // ---- flip-flop memory
 const ff=()=>[mA(0)>3?1:0, mA(1)>3?1:0].join('');
 g.loadProject('L10'); g.recompute(); const s0=ff();
 S.ctl.s1=true; g.recompute(); const s1d=ff(); S.ctl.s1=false; g.recompute(); const s1u=ff();
 S.ctl.s2=true; g.recompute(); const s2d=ff(); S.ctl.s2=false; g.recompute(); const s2u=ff();
 ok('L10 flip-flop: starts 1-0, S1 sets 0-1 and holds after release, S2 resets and holds', s0==='10'&&s1d==='01'&&s1u==='01'&&s2d==='10'&&s2u==='10', [s0,s1d,s1u,s2d,s2u].join(' → '));
 const link=S.parts.find(p=>p.type==='res'&&p.value===10000&&p.a==='bb:D10'); S.brk.rmP.add(link.id); S.ctl.s1=true; g.recompute(); S.ctl.s1=false; g.recompute();
 ok('L10: cut a cross-link and it forgets (returns to LED 1 after release)', ff()==='10', ff()); S.brk.rmP.clear();
 S.ctl.s1=true; g.recompute(); S.ctl.s1=false; g.recompute(); D.getElementById('powerBtn').click(); D.getElementById('powerBtn').click(); g.recompute();
 ok('L10: power off wipes the memory (wakes in its start state)', ff()==='10', ff());
 // ---- tab & content
 const L=D.querySelectorAll('#lineList .lin-p').length, F=D.querySelectorAll('#lineList .fcard').length;
 ok('Lineage tab: Era 0 + 10 builds in 8 eras + 5 frontier cards', L===10 && D.querySelectorAll('#lineList .era').length===10 && F===6 && D.querySelectorAll('#lineList .e0link').length===4, L+' builds, '+D.querySelectorAll('#lineList .era').length+' era blocks');
 ok('Lineage tab in both tab bars', D.querySelectorAll('.tabs button[data-tab=lineage], #mtabs button[data-tab=lineage]').length===2);
 run('L5'); ok('each lineage build shows story, push challenge and break-it', D.querySelector('#projCtl .lin') && D.querySelector('#projCtl .push') && D.querySelector('#projCtl .breakit'));
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},400);
