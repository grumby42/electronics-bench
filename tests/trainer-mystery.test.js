const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-trainer.html','utf8').replace(/<\/script>(?![\s\S]*<\/script>)/,'\nwindow.__dbg={get state(){return state;},loadProject,recompute,ledmA,ledList,startMystery,accuse,PROJECTS};\n</script>');
const param=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://t.test/',beforeParse(w){w.AudioContext=class{constructor(){this.destination={};this.currentTime=0;}createOscillator(){return{frequency:param(),connect(){return this;},start(){},stop(){},disconnect(){}};}createGain(){return{gain:param(),connect(){return this;},disconnect(){}};}resume(){return Promise.resolve();}};w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};}}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
 const g=w.__dbg, S=g.state, D=w.document, mA=(i=0)=>g.ledmA(g.ledList()[i],S.lastSol);
 D.getElementById('powerBtn').click();
 // kit #9 now really parallel
 g.loadProject(9); S.ctl.sw='up'; g.recompute(); const one=mA(); S.ctl.sw='down'; g.recompute(); const two=mA();
 ok('kit #9: adding the parallel resistor brightens the LED (10.2 → 19.6 mA)', Math.abs(one-10.17)<0.1 && Math.abs(two-19.57)<0.1, one.toFixed(2)+' → '+two.toFixed(2)+' mA');
 g.loadProject(8); S.ctl.sw='up'; g.recompute(); const s1=mA(); S.ctl.sw='down'; g.recompute(); const s2=mA();
 ok('kit #8: adding the series resistor dims the LED', s2<s1, s1.toFixed(1)+' → '+s2.toFixed(1)+' mA');
 // mystery: forced open resistor on L1
 g.loadProject('L1'); S.ctl.tap='V6'; S.wires=[];S.parts=[];g.PROJECTS.L1.build(); g.recompute();
 const r=S.parts.find(p=>p.type==='res'); g.startMystery(['rmP',r.id]);
 ok('fault is hidden on the board (no ✕ or SHORT marks)', !/✕|SHORT/.test(D.getElementById('kit').textContent) && mA()<0.1);
 const tap=id=>D.querySelector(`.hole[data-id="${id}"]`).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 const wires0=S.wires.length; tap('bb:B6'); tap('bb:D6');
 const pr=S.mystery.probes.map(p=>p.v==null?'—':p.v.toFixed(2));
 ok('probe reads the supply before the open part and 0 V after it', pr[0]==='9.00' && pr[1]==='0.00', pr.join(' / '));
 ok('probing doesn’t draw wires', S.wires.length===wires0);
 ok('probe readings appear on the board', /9\.0V/.test(D.getElementById('kit').textContent));
 g.accuse('shP',r.id); ok('wrong accusation explained, not revealed', !S.mystery.revealed && S.mystery.wrong===1 && /isn’t shorted/.test(D.querySelector('#projCtl .mres').textContent));
 g.accuse('rmP',r.id); ok('right accusation reveals diagnosis and probe count', S.mystery.revealed && /2 probe readings and 1 wrong guess/.test(D.querySelector('#projCtl .mres').textContent) && /Open circuit/.test(D.querySelector('#projCtl .diag').textContent));
 ok('after solving, the fault is marked on the board', /✕/.test(D.getElementById('kit').textContent));
 [...D.querySelectorAll('#projCtl button')].find(b=>b.textContent==='Repair and stop').click();
 ok('repair ends the mystery and restores the LED', !S.mystery && mA()>15);
 // random picks only faults with a visible symptom
 let symptomatic=0; for(let i=0;i<12;i++){ g.startMystery(); const before=mA(); symptomatic+= S.mystery && Math.abs(before-20.11)>1 ? 1:0; [...D.querySelectorAll('#projCtl button')].find(b=>b.textContent==='Repair and stop').click(); }
 ok('random faults always cause a visible symptom', symptomatic===12, symptomatic+'/12');
 g.loadProject('L5'); g.recompute(); g.startMystery();
 ok('nothing switched on → refuses and explains', !S.mystery && /Nothing is switched on/.test(D.querySelector('#projCtl').textContent));
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},400);
