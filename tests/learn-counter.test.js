// Counters & registers lesson: binary counting, divide-by-two, faults read from missing numbers, register load/shift.
const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-basics.html','utf8');
const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://b.test/',beforeParse(w){w.scrollTo=()=>{};w.matchMedia=()=>({matches:true,addEventListener(){},addListener(){}});w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};}}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
 const L=w.__learn, D=w.document; L.goNav('Counters & registers'); const m=D.getElementById('main'); const C=m.querySelector('.bench').parentNode.__counter||m.__counter;
 ok('lesson renders with its origin story (Wynn-Williams)', !!C && /Wynn-Williams/.test(m.querySelector('details.origin').textContent));
 const seq=[]; for(let i=0;i<17;i++){ C.pulse(); seq.push(C.val); }
 ok('counts 1, 2, 3 … 15 then rolls over to 0, 1', seq.join(',')==='1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0,1', seq.join(','));
 C.reset(); const flips=[0,0,0,0]; let prev=[0,0,0,0]; for(let i=0;i<16;i++){ C.pulse(); C.q.forEach((b,j)=>{ if(b!==prev[j]) flips[j]++; }); prev=C.q.slice(); }
 ok('each stage flips half as often as the one before (16, 8, 4, 2)', flips.join()==='16,8,4,2', flips.join());
 const missing=()=>[...Array(16).keys()].filter(n=>!C.seen.has(n));
 C.setFault('cut'); for(let i=0;i<20;i++) C.pulse(); ok('cut after the 2s stage: only 0–3 appear', missing().join()==='4,5,6,7,8,9,10,11,12,13,14,15');
 C.setFault('s0'); for(let i=0;i<20;i++) C.pulse(); ok('2s stuck at 0: only 0 and 1 appear', C.seen.size===2 && C.seen.has(0) && C.seen.has(1));
 C.setFault('s1'); for(let i=0;i<20;i++) C.pulse(); ok('8s stuck at 1: only 8–15 appear', missing().join()==='0,1,2,3,4,5,6,7');
 C.setMystery('s0'); for(let i=0;i<20;i++) C.pulse(); let g=C.guessBtns(); g.find(b=>/stuck at 1/.test(b.textContent)).click();
 ok('mystery: a wrong accusation is explained', /Not that one/.test(m.querySelector('.kwork').textContent));
 C.guessBtns().find(b=>/2s stage stuck at 0/.test(b.textContent)).click(); ok('mystery: the right one is confirmed', /Right\./.test(m.querySelector('.kwork').textContent));
 C.setFault('none'); C.setMode('r'); ok('register mode: four inputs shown', m.querySelectorAll('.bench svg g[style*="cursor"]').length===4);
 [...m.querySelectorAll('.ctrlrow button')].find(b=>b.textContent==='Load').click(); const loaded=C.val; C.d[0]=0; C.d[1]=0;
 ok('Load stores the inputs (1101 = 13), and changing inputs afterwards leaves it alone', loaded===13 && C.val===13, loaded+' then '+C.val);
 [...m.querySelectorAll('.ctrlrow button')].find(b=>b.textContent==='Clear').click(); C.d.splice(0,4,1,1,0,0); [...m.querySelectorAll('.ctrlrow button')].find(b=>b.textContent==='Load').click();
 C.d[0]=0; const sh=[C.val]; for(let i=0;i<2;i++){ [...m.querySelectorAll('.ctrlrow button')].find(b=>b.textContent==='Shift').click(); sh.push(C.val); }
 ok('Shift left doubles: 3 → 6 → 12', sh.join()==='3,6,12', sh.join());
 ok('timing diagram drawn', m.querySelectorAll('.tdia polyline').length>=5);
 L.goNav('Check: Components'); const nq=+(D.querySelector('#main .qscore').textContent.match(/of (\d+)/)||[])[1]; const sub=D.body.textContent;
 ok('Components check intro states the real question count', nq>0 && new RegExp({10:'Ten',11:'Eleven',12:'Twelve',13:'Thirteen',14:'Fourteen',15:'Fifteen'}[nq]+' questions').test(sub), nq+' questions');
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},300);
