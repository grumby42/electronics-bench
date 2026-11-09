// Kit projects 24–29, 32 and 1 are wired on the board and run on the solver (they used to be behaviour models).
const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-trainer.html','utf8').replace(/<\/script>(?![\s\S]*<\/script>)/,'\nwindow.__dbg={get state(){return state;},loadProject,recompute,ledmA,ledList,simStep,simRate,measureTone,buildNodeMap,flowSolve,setBreak,PROJECTS};\n</script>');
const param=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://t.test/',beforeParse(w){w.AudioContext=class{constructor(){this.destination={};this.currentTime=0;}createOscillator(){return{frequency:param(),connect(){return this;},start(){},stop(){},disconnect(){}};}createGain(){return{gain:param(),connect(){return this;},disconnect(){}};}resume(){return Promise.resolve();}};w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};}}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
 const g=w.__dbg,S=g.state,D=w.document; D.getElementById('powerBtn').click();
 const lit=()=>g.ledmA(g.ledList()[0],S.lastSol)>3?1:0;
 const table=(n,k)=>{ g.loadProject(n); const o=[]; for(const [a,b] of [[0,0],[0,1],[1,0],[1,1]]){ S.ctl[k[0]]=k[0]==='sw'?(a?'up':'down'):!!a; S.ctl[k[1]]=!!b; g.recompute(); o.push(lit()); } return o.join(''); };
 g.loadProject(24); S.ctl.s1=false; g.recompute(); const n0=lit(); S.ctl.s1=true; g.recompute();
 ok('#24 NOT: 0→1, 1→0', n0===1&&lit()===0);
 const want={25:['s1','s2','0111','OR'],26:['sw','s1','0001','AND'],27:['sw','s1','1000','NOR'],28:['sw','s1','1110','NAND']};
 for(const n in want){ const [a,b,t,name]=want[n]; const got=table(+n,[a,b]); ok(`#${n} ${name} truth table ${t}`, got===t, got); }
 ok('gate projects are wired with real transistors', [24,25,26,27,28].every(n=>{ g.loadProject(n); return S.parts.some(p=>p.type==='npn'); }));
 // order must not matter: no part may hold itself on from an earlier input
 g.loadProject(28); S.ctl.sw='up'; S.ctl.s1=true; g.recompute(); S.ctl.s1=false; g.recompute();
 ok('NAND after releasing a key goes back to 1 (no stuck transistor)', lit()===1);
 // astable: rate from the circuit
 const blink=pot=>{ g.loadProject(29); S.ctl.pot=pot; g.recompute(); const f=g.buildNodeMap(S.brk); for(let i=0;i<4000;i++) g.simStep(0.002,f); return g.simRate()||0; };
 const lo=blink(0), hi=blink(1);
 // swing-aware theory: base kicked to 0.65 − (9 − 1.8) and charges toward 9 V, crossing 0.6 V: t = RC·ln(15.45/8.4)
 const th=pot=>1/(Math.log(15.45/8.4)*((22000+(1-pot)*50000)+47000)*10e-6);
 ok('#29 blinks at the rate its RC parts predict (±8%)', Math.abs(lo/th(0)-1)<0.08 && Math.abs(hi/th(1)-1)<0.08, `${lo.toFixed(2)} vs ${th(0).toFixed(2)} Hz; ${hi.toFixed(2)} vs ${th(1).toFixed(2)} Hz`);
 g.loadProject(29); g.recompute(); const f29=g.buildNodeMap(S.brk); let on1=0,on2=0,both=0; for(let i=0;i<2000;i++){ const s=g.simStep(0.002,f29); const a=g.ledmA(g.ledList()[0],s)>3, b=g.ledmA(g.ledList()[1],s)>3; on1+=a; on2+=b; both+=a&&b; }
 ok('#29 the two LEDs take turns (brief overlap while a capacitor recharges through the LED is real)', on1>300 && on2>300 && both<0.1*Math.min(on1,on2), `LED1 ${on1}, LED2 ${on2}, both ${both} of 2000 steps`);
 const stops=(kind,pick)=>{ g.loadProject(29); g.recompute(); const p=S.parts.find(pick); g.setBreak(kind,p.id); S.sim={t:0,edges:[]}; const f=g.buildNodeMap(S.brk); for(let i=0;i<3000;i++) g.simStep(0.002,f); return S.sim.edges.length<2; };
 ok('break-it: removing a timing capacitor stops the blinking', stops('rmP',p=>p.type==='cap'));
 ok('break-it: shorting a timing capacitor stops the blinking', stops('shP',p=>p.type==='cap'));
 ok('break-it: shorting a charging resistor stops the blinking', stops('shP',p=>p.type==='res'&&/^bb:P/.test(p.b)));
 ok('break-it text for timed circuits explains it over time', /Changes over time/.test(D.querySelector('#projCtl .breakit').textContent));
 // audio oscillator: pitch from the circuit
 const tone=(n,ctl)=>{ g.loadProject(n); Object.assign(S.ctl,ctl); g.measureTone(); return S.tone; };
 const t0=tone(32,{pot:0}), t1=tone(32,{pot:1});
 const th32=pot=>1/(0.693*((10000+(1-pot)*50000)+22000)*0.05e-6);
 ok('#32 pitch matches 0.69 RC within 10%', Math.abs(t0.f/th32(0)-1)<0.1 && Math.abs(t1.f/th32(1)-1)<0.1, `${t0.f.toFixed(0)} vs ${th32(0).toFixed(0)} Hz; ${t1.f.toFixed(0)} vs ${th32(1).toFixed(0)} Hz`);
 ok('#32 the speaker carries the oscillation', t1.ok && t1.swing>30, t1.swing.toFixed(0)+' mA swing');
 g.loadProject(32); g.setBreak('rmW',S.wires.findIndex(x=>x.b==='sp:64')); g.measureTone();
 ok('cut the speaker wire: no sound', !S.tone.ok);
 const dark=tone(1,{light:0.1,pot:1}).f, bright=tone(1,{light:1,pot:1}).f;
 ok('#1 bird: more light, higher pitch (CdS sets the timing)', bright>dark*3, `${dark.toFixed(0)} → ${bright.toFixed(0)} Hz`);
 // Kirchhoff with base currents: the 10 kΩ base resistor and the base–emitter link carry the same current
 g.loadProject(24); S.ctl.s1=true; g.recompute(); const fs=g.flowSolve();
 const rb=fs.links.find(l=>l.kind==='res'&&l.p.value===10000), be=fs.links.find(l=>l.kind==='base');
 ok('base current is modelled and obeys Kirchhoff', be.I>0.0005 && Math.abs(rb.I-be.I)<1e-6, `${(rb.I*1000).toFixed(3)} mA vs ${(be.I*1000).toFixed(3)} mA`);
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},400);
