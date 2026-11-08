const { JSDOM } = require('jsdom'); const fs=require('fs');
const learn=fs.readFileSync('electronics-basics.html','utf8');
const trainer=fs.readFileSync('electronics-trainer.html','utf8').replace(/<\/script>(?![\s\S]*<\/script>)/,'\nwindow.__dbg={get state(){return state;},LIVE,PROJECTS};\n</script>');
const param=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
const bootT=hash=>new JSDOM(trainer,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://site.test/electronics-trainer.html'+hash,beforeParse(w){
  w.AudioContext=w.webkitAudioContext=class{constructor(){this.destination={};this.currentTime=0;}createOscillator(){return{frequency:param(),connect(){return this;},start(){},stop(){},disconnect(){}};}createGain(){return{gain:param(),connect(){return this;},disconnect(){}};}resume(){return Promise.resolve();}};
  w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};}}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
  const L=new JSDOM(learn,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://site.test/electronics-basics.html',beforeParse(w){w.scrollTo=()=>{};w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};}}).window;
  const links=[]; L.__learn.STEPS.forEach((s,i)=>{ L.__learn.go(i); const a=L.document.querySelector('#main .handoff a'); if(a) links.push([s.nav,a.getAttribute('href')]); });
  ok('the five lessons with a bench build (only) have a handoff button', links.length===5, links.map(l=>l[1]).join(' '));
  for(const [nav,href] of links){
    const hash=href.slice(href.indexOf('#')); const n=+/p=(\d+)/.exec(hash)[1];
    const T=bootT(hash); const st=T.__dbg.state;
    const back=T.document.querySelectorAll('#projCtl .backlearn');
    ok(`${nav} → trainer #${n} opens wired, with one back link`, st.project===n && T.__dbg.LIVE.has(n) && back.length===1 && back[0].getAttribute('href')==='electronics-basics.html' && (T.__dbg.PROJECTS[n].kind!=='analog' || st.wires.length+st.parts.length>0), `${st.wires.length} wires, ${st.parts.length} parts, kind ${T.__dbg.PROJECTS[n].kind}`);
  }
  const T2=bootT('#p=3'); ok('a non-playable project number shows a clear message', T2.__dbg.state.project==null && /not playable yet/.test(T2.document.body.textContent));
  const T3=bootT(''); ok('no link = normal start, no back link', T3.__dbg.state.project==null && !T3.document.querySelector('.backlearn'));
  // re-render keeps exactly one back link (e.g. after a control click)
  const T4=bootT('#p=19&from=learn'); T4.document.querySelectorAll('#projCtl input[type=range]').forEach(r=>{ r.value='0.2'; r.dispatchEvent(new T4.Event('input')); });
  const segb=T4.document.querySelector('#projCtl .seg button'); if(segb) segb.click();
  ok('back link survives panel redraws without duplicating', T4.document.querySelectorAll('.backlearn').length===1, T4.document.querySelectorAll('.backlearn').length+' link(s)');
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},400);
