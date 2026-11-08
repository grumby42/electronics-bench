const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-trainer.html','utf8').replace(/<\/script>(?![\s\S]*<\/script>)/,'\nwindow.__dbg={get state(){return state;},loadProject,recompute,flowSolve,ledmA,ledList,drawXray,PROJECTS};\n</script>');
const param=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://t.test/',beforeParse(w){w.AudioContext=class{constructor(){this.destination={};this.currentTime=0;}createOscillator(){return{frequency:param(),connect(){return this;},start(){},stop(){},disconnect(){}};}createGain(){return{gain:param(),connect(){return this;},disconnect(){}};}resume(){return Promise.resolve();}};w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};}}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
 const g=w.__dbg, S=g.state, D=w.document;
 D.getElementById('xrayBtn').click();
 ok('X-ray draws all 120 board strips + 6 tap strips + ground strip', D.querySelectorAll('.xray rect').length===127, D.querySelectorAll('.xray rect').length+' strips');
 ok('legend shown, button pressed', !D.getElementById('xrayLegend').hidden && D.getElementById('xrayBtn').getAttribute('aria-pressed')==='true');
 D.getElementById('powerBtn').click();
 const run=(id,ctl)=>{ g.loadProject(id); Object.assign(S.ctl,ctl||{}); S.wires=[];S.parts=[];g.PROJECTS[id].build(); g.recompute(); };
 run('L1',{tap:'V6'}); let fs=g.flowSolve(); const led=g.ledmA(g.ledList()[0],S.lastSol);
 const wI=fs.links.filter(l=>l.kind==='wire').map(l=>Math.abs(l.I)*1000);
 ok('single loop: every wire carries the LED’s current (Kirchhoff)', wI.every(x=>Math.abs(x-led)<0.1), 'LED '+led.toFixed(2)+' mA, wires '+wI.map(x=>x.toFixed(2)).join(', '));
 ok('streaks drawn for each current-carrying wire and part', D.querySelectorAll('.xflowg path').length===4, D.querySelectorAll('.xflowg path').length+' streaks');
 const lit=[...D.querySelectorAll('.xray rect')].filter(r=>/hsla/.test(r.getAttribute('fill'))).length;
 ok('only strips actually in the circuit are coloured', lit>=4 && lit<20, lit+' strips live');
 run('L6',{s1:true,s2:true}); fs=g.flowSolve(); const ledOr=g.ledmA(g.ledList()[0],S.lastSol);
 const keyW=fs.links.filter(l=>l.kind==='wire').filter(l=>/sp:9|sp:8/.test(S.wires[l.i].a)&&/bb:/.test(S.wires[l.i].b)).map(l=>Math.abs(l.I)*1000);
 ok('OR with both keys: the two key wires add up to the LED current (Kirchhoff)', keyW.length===2 && Math.abs(keyW[0]+keyW[1]-ledOr)<0.1, keyW.map(x=>x.toFixed(2)).join(' + ')+' = '+(keyW[0]+keyW[1]).toFixed(2)+' vs LED '+ledOr.toFixed(2));
 run('L1',{tap:'V6'}); const r=S.parts.find(p=>p.type==='res'); S.brk.rmP.add(r.id); g.recompute(); g.drawXray();
 ok('with a part removed, no current streaks anywhere in that loop', D.querySelectorAll('.xflowg path').length===0);
 D.getElementById('powerBtn').click(); g.recompute();
 ok('power off: strips stay grey, no streaks', D.querySelectorAll('.xflowg path').length===0 && ![...D.querySelectorAll('.xray rect')].some(r=>/hsla/.test(r.getAttribute('fill'))));
 D.getElementById('xrayBtn').click(); ok('X-ray off removes everything', D.querySelectorAll('.xray rect').length===0 && D.getElementById('xrayLegend').hidden);
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},400);
