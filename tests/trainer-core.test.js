const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-trainer.html','utf8').replace('</script>','\nwindow.__dbg={get state(){return state;},loadProject,PROJECTS,LIVE,recompute};\n</script>');
const param=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
const boot=store=>new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://trainer.test/',beforeParse(w){
  w.AudioContext=w.webkitAudioContext=class{constructor(){this.destination={};this.currentTime=0;this.state='running';}createOscillator(){return{type:'',frequency:param(),connect(){return this;},start(){},stop(){},disconnect(){}};}createGain(){return{gain:param(),connect(){return this;},disconnect(){}};}resume(){return Promise.resolve();}};
  w.requestAnimationFrame=()=>0; w.cancelAnimationFrame=()=>{}; if(store) for(const k in store) w.localStorage.setItem(k,store[k]); }}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
  let w=boot(), D=w.document, g=w.__dbg; D.getElementById('powerBtn').click();
  const live=[...g.LIVE]; let errs=[], noOrigin=[];
  live.forEach(n=>{ try{ g.loadProject(n); g.recompute(); const o=D.querySelector('#projCtl details.tr-origin'); if(!o||o.querySelectorAll('p').length<3) noOrigin.push(n); }catch(e){ errs.push(n+':'+e.message); } });
  ok('all live projects load without errors', !errs.length, live.length+' projects '+errs.join(' '));
  ok('every live project shows an origin note (3 parts)', !noOrigin.length, noOrigin.join(','));
  g.loadProject(27); ok('NOR project shows the logic-gate origin', D.querySelector('#projCtl .tr-origin summary').textContent.includes('logic gate'));
  const o=D.querySelector('#projCtl details.tr-origin'); o.open=false; o.dispatchEvent(new w.Event('toggle'));
  const w2=boot({'el500-trainer-oc':w.localStorage.getItem('el500-trainer-oc')}); w2.__dbg.loadProject(8);
  ok('collapsed note stays collapsed after reload', !w2.document.querySelector('#projCtl details.tr-origin').open);
  // regression from June: place R + LED by tapping, check auto-disarm and LED lights
  w=boot(); D=w.document; D.getElementById('powerBtn').click(); const holes={}; D.querySelectorAll('.hole').forEach(h=>holes[h.getAttribute('data-id')]=h);
  const click=e=>e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  D.getElementById('resVal').value='470'; click(D.querySelector('[data-part="res"]')); click(holes['pw:V6:0']); click(holes['bb:F11']);
  click(D.querySelector('[data-part="led"]')); click(holes['bb:F11']); click(holes['bb:F16']); click(holes['bb:F16']); click(holes['pw:N:1']);
  ok('June regression: parts auto-disarm and the LED lights', !D.querySelector('[data-part].armed') && D.querySelectorAll('[data-bright]').length===1);
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},300);
