const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-basics.html','utf8');
const boot=store=>new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://bench.test/',beforeParse(w){w.scrollTo=()=>{};w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{}; if(store) for(const k in store) w.localStorage.setItem(k,store[k]);}}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
  let w=boot(), L=w.__learn, D=w.document;
  const src=html; const keys=[...src.matchAll(/^ "([^"]+)":\{thing:/gm)].map(m=>m[1]);
  const navs=new Set(L.STEPS.map(s=>s.nav)); const orphan=keys.filter(k=>!navs.has(k));
  ok('every origin story attaches to a real lesson', keys.length===18 && !orphan.length, keys.length+' stories'+(orphan.length?' | orphans: '+orphan:''));
  let bad=[]; L.STEPS.forEach((s,i)=>{ L.go(i); const c=D.querySelector('#main details.origin');
    if(keys.includes(s.nav)){ const hs=[...c.querySelectorAll('h4')].map(h=>h.textContent);
      const good=c && hs.join('|')==='The problem it solved|Found or designed?|Why it’s shaped this way|Then vs. now' && c.querySelectorAll('.evseg.cur').length===1 && c.querySelectorAll('.otl li').length>=3 && c.querySelector('.verdict');
      if(!good) bad.push(s.nav);
      if(D.querySelector('#main').children[3]!==c) bad.push(s.nav+' (not before lesson)'); }
    else if(c) bad.push(s.nav+' (unexpected card)'); });
  ok('each card: 4 sections in order, verdict, change meter, timeline, placed before the lesson', !bad.length, bad.join('; '));
  L.goNav('Transistor'); const c=D.querySelector('#main details.origin');
  ok('cards open by default', c.open);
  c.open=false; c.dispatchEvent(new w.Event('toggle'));
  const w2=boot({'el500-learn-v1':w.localStorage.getItem('el500-learn-v1')}); w2.__learn.goNav('Capacitor');
  ok('collapsing is remembered after reload', !w2.document.querySelector('#main details.origin').open);
  const verdicts={}; keys.forEach(k=>{ const m=src.match(new RegExp('"'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'":\\{thing:"[^"]+",verdict:\'(\\w+)\',change:(\\d)')); verdicts[k]=m[1]+'/'+m[2]; });
  console.log('verdict/change:', JSON.stringify(verdicts));
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},300);
