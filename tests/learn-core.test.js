const { JSDOM } = require('jsdom');
const html = require('fs').readFileSync('electronics-basics.html','utf8');
function boot(store){
  const dom = new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://bench.test/',
    beforeParse(w){ w.scrollTo=()=>{}; let raf=[]; w.__raf=raf; w.requestAnimationFrame=cb=>{raf.push(cb);return raf.length;}; w.cancelAnimationFrame=()=>{};
      if(store) for(const k in store) w.localStorage.setItem(k,store[k]); }});
  return dom.window;
}
const pump=(w,n)=>{ for(let f=0;f<n;f++){ const b=w.__raf.splice(0); b.forEach(cb=>cb(16*(f+1))); } };
const click=(w,e)=>e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const res=[]; const ok=(name,cond,info)=>res.push([cond?'PASS':'FAIL',name,info||'']);
setTimeout(()=>{ try{
  // ---- full smoke across every step
  let w=boot(); const L=w.__learn, N=L.STEPS.length; const errs=[];
  for(let i=0;i<N;i++){ try{ L.go(i); pump(w,3); const m=w.document.getElementById('main');
      m.querySelectorAll('input[type=range]').forEach(r=>{[r.min,r.max,(+r.min+ +r.max)/2].forEach(v=>{r.value=v; r.dispatchEvent(new w.Event('input',{bubbles:true}));});});
      m.querySelectorAll('.tog,.seg button').forEach(b=>click(w,b));
      m.querySelectorAll('circle[data-node]').forEach((c,k)=>{ if(k%7===0) click(w,c); }); pump(w,2);
      if(m.querySelector('.warnbox') && m.querySelector('.warnbox').textContent.includes('snag')) errs.push(L.STEPS[i].nav);
    }catch(e){ errs.push(L.STEPS[i].nav+': '+e.message); } }
  ok('all steps render & controls run', errs.length===0, N+' steps'+(errs.length?' | '+errs.join('; '):''));
  ok('restored -7 quantity-vs-unit section', (L.go(0), w.document.getElementById('main').textContent.includes('Quantity vs. unit')));
  ok('4 recall checks present', L.STEPS.filter(s=>s.quiz).length===4, L.STEPS.filter(s=>s.quiz).map(s=>s.nav).join(', '));
  // ---- every "see" link points to a real lesson
  const navs=new Set(L.STEPS.map(s=>s.nav)); const src=require('fs').readFileSync('electronics-basics.html','utf8');
  const sees=[...src.matchAll(/see:"([^"]+)"/g)].map(m=>m[1]); const badSee=sees.filter(s=>!navs.has(s));
  ok('every recall “Revisit” link resolves', badSee.length===0, sees.length+' links'+(badSee.length?' | broken: '+badSee.join(', '):''));
  const badG=L.GLOSS.filter(g=>!navs.has(g[2])).map(g=>g[0]);
  ok('every glossary term links to a real lesson', badG.length===0, L.GLOSS.length+' terms'+(badG.length?' | broken: '+badG.join(', '):''));
  // ---- quiz behaviour: answer Foundations all correctly by reading the green answer after a wrong click on Q1
  L.goNav('Check: Foundations'); let m=w.document.getElementById('main');
  const cards=[...m.querySelectorAll('.qcard')];
  click(w,cards[0].querySelectorAll('.qopt')[0]); // wrong
  const q1wrong=cards[0].querySelector('.qopt.wrong'), q1right=cards[0].querySelector('.qopt.right');
  ok('wrong answer marks wrong + reveals right + explains', !!q1wrong && !!q1right && cards[0].querySelector('.qwhy').textContent.includes('40 mA'));
  click(w,cards[0].querySelectorAll('.qopt')[1]); // second click must be ignored
  ok('answer locks after first try', cards[0].querySelectorAll('.qopt.right').length===1 && cards[0].querySelectorAll('.qopt.wrong').length===1);
  const answers=[null,1,3,1,2,1,1,1,1]; for(let k=1;k<cards.length;k++) click(w,cards[k].querySelectorAll('.qopt')[answers[k]]);
  const sc=m.querySelector('.qscore').textContent;
  ok('score totals correctly (8/9)', sc.includes('8 / 9'), sc.trim());
  ok('best score saved', w.__learn.PROG.quiz.found===8);
  const badge=[...w.document.querySelectorAll('#toc button')].find(b=>b.textContent.includes('Check: Foundations')).querySelector('.qbadge').textContent;
  ok('contents list shows the score', badge==='8/9', badge);
  // revisit link navigates
  click(w,cards[0].querySelector('.qsee'));
  ok('“Revisit” jumps to the lesson', L.STEPS[L.cur].nav==='What electricity is', L.STEPS[L.cur].nav);
  // ---- persistence: go to a lesson, reboot with the same storage, expect resume there
  L.goNav('Transistor'); const saved=w.localStorage.getItem('el500-learn-v1');
  const w2=boot({'el500-learn-v1':saved});
  ok('reopens on the last lesson', w2.__learn.STEPS[w2.__learn.cur].nav==='Transistor', w2.__learn.STEPS[w2.__learn.cur].nav);
  const doneCount=w2.document.querySelectorAll('#toc button.done').length;
  ok('visited lessons stay marked', doneCount>=20, doneCount+' marked done');
  ok('saved quiz score survives reload', w2.__learn.PROG.quiz.found===8);
  // ---- corrupt storage must not break the app
  const w3=boot({'el500-learn-v1':'{not json'});
  ok('bad saved data is ignored safely', w3.__learn.cur===0 && w3.document.querySelector('h1.title').textContent.length>0);
  // ---- reset (two taps)
  const rb=w2.document.querySelector('.resetp'); click(w2,rb); const armed=rb.textContent; click(w2,rb);
  ok('reset needs a second tap, then clears', armed.includes('again') && Object.keys(w2.__learn.PROG.quiz).length===0 && w2.__learn.cur===0, armed);
  // ---- glossary
  const g=w.document.getElementById('gloss'); click(w,w.document.getElementById('glossBtn'));
  ok('glossary opens with all terms', !g.hidden && w.document.querySelectorAll('.gterm').length===L.GLOSS.length, w.document.querySelectorAll('.gterm').length+' shown');
  const q=w.document.getElementById('glossQ'); q.value='node'; q.dispatchEvent(new w.Event('input',{bubbles:true}));
  ok('search filters', w.document.querySelectorAll('.gterm').length>=1 && w.document.querySelectorAll('.gterm').length<5, w.document.querySelectorAll('.gterm').length+' match “node”');
  q.value='zzzz'; q.dispatchEvent(new w.Event('input',{bubbles:true}));
  ok('no-match message shows', w.document.getElementById('glossList').textContent.includes('No term matches'));
  q.value='gain'; q.dispatchEvent(new w.Event('input',{bubbles:true}));
  click(w,w.document.querySelector('.gterm .qsee'));
  ok('term link closes glossary and jumps', g.hidden && L.STEPS[L.cur].nav==='Transistor', L.STEPS[L.cur].nav);
  click(w,w.document.getElementById('glossBtn')); w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));
  ok('Escape closes glossary', g.hidden);
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:'')));
console.log(res.every(r=>r[0]==='PASS')?'\nALL PASS ✓':'\nFAILURES ✗');
},300);
