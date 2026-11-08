const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-basics.html','utf8').replace(/<\/script>(?![\s\S]*<\/script>)/,'\nwindow.__fg={FLOW_GATES,fgSolve,fgLampMax};\n</script>');
const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://b.test/',beforeParse(w){w.scrollTo=()=>{};w.__raf=[];w.requestAnimationFrame=cb=>{w.__raf.push(cb);return 1;};w.cancelAnimationFrame=()=>{};}}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
 const {FLOW_GATES,fgSolve,fgLampMax}=w.__fg;
 Object.entries(FLOW_GATES).forEach(([name,g])=>{ const max=fgLampMax(g); let got='',want='',minOn=1,maxOff=0;
   g.tt.forEach(r=>{ const two=r.length===3, s=fgSolve(g,{A:r[0],B:two?r[1]:0}), frac=s.lampI/max; got+=frac>0.5?1:0; want+=r[r.length-1]; if(r[r.length-1]) minOn=Math.min(minOn,frac); else maxOff=Math.max(maxOff,frac); });
   ok(`${name}: pipe physics reproduces the truth table`, got===want && minOn>0.8 && maxOff<0.2, `solved ${got} = table ${want}; weakest 1 = ${(minOn*100).toFixed(0)}%, strongest 0 = ${(maxOff*100).toFixed(0)}%`); });
 // conservation: flow in from supply = flow out to drain
 const g=FLOW_GATES.XOR, s=fgSolve(g,{A:1,B:1}); let inS=0,outG=0; g.edges.forEach((e,i)=>{ if(e[0]==='S') inS+=s.flows[i]; if(e[1]==='G') outG+=s.flows[i]; });
 ok('flow is conserved (what enters from the supply leaves at the drain)', Math.abs(inS-outG)<1e-6, inS.toFixed(4)+' in = '+outG.toFixed(4)+' out');
 // UI: lesson renders, valves toggle, media switch
 const L=w.__learn; L.goNav('See the flow: gates'); const D=w.document, m=D.getElementById('main');
 const out0=m.querySelector('#fgOut').textContent; m.querySelector('.fgvalve').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 ok('tapping a valve re-solves the gate', m.querySelector('#fgOut').textContent!==out0, out0+' → '+m.querySelector('#fgOut').textContent);
 [...m.querySelectorAll('.seg button')].find(b=>b.dataset.m==='air').click();
 ok('switching medium keeps the logic, changes the words', /fluidic/i.test(m.textContent) && /whistle/.test(m.textContent));
 m.querySelector('.fgvalve').dispatchEvent(new w.MouseEvent('click',{bubbles:true})); for(let f=0;f<3;f++){ w.__raf.splice(0).forEach(cb=>cb(16*(f+1))); }
 ok('flow streaks animate', [...m.querySelectorAll('polyline[stroke-dasharray]')].some(p=>p.getAttribute('stroke-dashoffset')));
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},300);
