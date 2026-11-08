const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-basics.html','utf8');
const boot=hash=>new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://b.test/'+(hash||''),beforeParse(w){w.scrollTo=()=>{};w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};w.matchMedia=()=>({matches:true,addListener(){},removeListener(){}});}}).window; // reduced motion → final poses drawn
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
 let w=boot(), L=w.__learn, D=w.document;
 const cmp=L.STEPS.filter(s=>s.part==='Computing').map(s=>s.nav);
 ok('Computing part: 4 lessons + recall check', cmp.length===5, cmp.join(' · '));
 let snag=[]; cmp.forEach(n=>{ L.goNav(n); if(/snag/.test(D.getElementById('main').textContent)) snag.push(n); }); ok('all render without errors', !snag.length, snag.join(','));
 L.goNav('Heron’s programmable cart'); const m=D.getElementById('main');
 const at=()=>{ const t=m.querySelector('svg g g[transform]')||[...m.querySelectorAll('svg g')].find(g=>/translate/.test(g.getAttribute('transform')||'')); const r=/translate\(([-\d.]+) ([-\d.]+)\)/.exec(t.getAttribute('transform')); return [+r[1],+r[2]]; };
 for(const name of ['Square','Out and back']){ [...m.querySelectorAll('.seg button')].find(b=>b.textContent===name).click(); const [x,y]=at();
   ok(`Heron: “${name}” returns the cart to its start`, Math.hypot(x-110,y-120)<3, `ends ${Math.hypot(x-110,y-120).toFixed(2)} px from start`); }
 [...m.querySelectorAll('.seg button')].find(b=>b.textContent==='Rewind all').click(); [...m.querySelectorAll('.seg button')].find(b=>b.textContent==='+ Forward').click();
 m.querySelectorAll('.seg button').forEach(b=>{ if(b.textContent==='▶ Drop the weight') b.click(); }); const [fx,fy]=at();
 ok('Heron: one forward step moves straight ahead, no turn', Math.abs(fy-120)<0.5 && fx>160, `x ${fx.toFixed(1)}, y ${fy.toFixed(1)}`);
 ok('Heron: rope drums show one stretch per step on each wheel', m.querySelectorAll('svg rect[fill="#e0922f"]').length>=2);
 L.goNav('Punched cards'); const m2=D.getElementById('main'); const h0=+m2.querySelector('#jqH').textContent;
 m2.querySelectorAll('svg circle')[0].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 ok('Jacquard: punching a hole changes the count and the cloth', +m2.querySelector('#jqH').textContent===h0+1 || +m2.querySelector('#jqH').textContent===h0-1);
 const blue=m2.querySelectorAll('svg rect[fill="#3a5f8f"]').length; ok('Jacquard: every hole weaves one blue square', blue===+m2.querySelector('#jqH').textContent, blue+' blue squares for '+m2.querySelector('#jqH').textContent+' holes');
 L.goNav('Bootstrapping'); const m3=D.getElementById('main'); const rungs=m3.querySelectorAll('.rung'); rungs[0].click();
 rungs[2].click(); ok('Bootstrap ladder: the tapped rung is the one described', m3.querySelector('.rung.on')===rungs[2] && m3.querySelector('.rd-h').textContent.includes(rungs[2].textContent.split(/\d{4}s?(?:–\d{2})?\s*→?\s*/).pop().trim()), m3.querySelector('.rung.on').textContent+' ↔ '+m3.querySelector('.rd-h').textContent);
 ok('Bootstrap ladder: 7 rungs, each shows A + B → C', rungs.length===7 && /C = A \+ B|PRINT C|LOAD/.test(m3.querySelector('.rungdet').textContent), m3.querySelector('.rd-h').textContent);
 const w2=boot('#l='+encodeURIComponent('Punched cards')); ok('deep link #l=… opens that lesson', w2.__learn.STEPS[w2.__learn.cur].nav==='Punched cards');
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},300);
