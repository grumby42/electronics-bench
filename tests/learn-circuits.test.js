const { JSDOM } = require('jsdom');
const html=require('fs').readFileSync('electronics-basics.html','utf8');
const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://b.test/',beforeParse(w){w.scrollTo=()=>{};w.__raf=[];w.requestAnimationFrame=cb=>{w.__raf.push(cb);return 1;};w.cancelAnimationFrame=()=>{};}}).window;
const res=[]; const ok=(n,c,i)=>res.push([c?'PASS':'FAIL',n,i||'']);
setTimeout(()=>{ try{
 const L=w.__learn, D=w.document; L.goNav('Series & parallel'); let m=D.getElementById('main'); const t=id=>m.querySelector('#'+id).textContent;
 ok('series 300 Ω + 600 Ω: 900 Ω, 10 mA, voltages 3 V + 6 V', t('spRt')==='900' && t('spIt')==='10.0' && /3\.00 V/.test(t('sp1')) && /6\.00 V/.test(t('sp2')), [t('spRt'),t('spIt'),t('sp1'),t('sp2')].join(' | '));
 m.querySelector('.seg button[data-k=p]').click();
 ok('parallel: 200 Ω, branch currents 30 + 15 = 45 mA, 9 V across each', t('spRt')==='200' && t('spIt')==='45.0' && /30\.0 mA · 9\.00 V/.test(t('sp1')) && /15\.0 mA · 9\.00 V/.test(t('sp2')), [t('spRt'),t('spIt'),t('sp1'),t('sp2')].join(' | '));
 m.querySelector('.tog').click(); ok('parallel, R2 pulled: R1 unchanged at 30 mA', /30\.0 mA/.test(t('sp1')) && t('spIt')==='30.0');
 m.querySelector('.seg button[data-k=s]').click(); ok('series, R2 pulled: everything stops', t('spIt')==='0.0' && /0\.0 mA/.test(t('sp1')) && /Christmas/.test(m.textContent));
 L.goNav('Kirchhoff’s laws'); m=D.getElementById('main');
 const rows=[...m.querySelectorAll('.ktab td.num')].map(x=>x.textContent);
 ok('junction: 22.5 in = 15.0 + 7.5 out, difference 0', rows[0]==='22.5 mA' && rows[1]==='15.0 mA' && rows[2]==='7.5 mA' && rows[3]==='0.000 mA', rows.join(' '));
 for(const k of ['a','b']){ m.querySelector(`.seg button[data-k=${k}]`).click(); const last=[...m.querySelectorAll('.ktab tr.sum td.num')].pop().textContent; ok(`loop ${k.toUpperCase()}: voltages sum to 0.00 V`, last==='0.00 V', last); }
 const rr=m.querySelectorAll('input[type=range]'); rr[0].value='730'; rr[0].dispatchEvent(new w.Event('input')); rr[2].value='170'; rr[2].dispatchEvent(new w.Event('input'));
 m.querySelector('.seg button[data-k=j]').click(); const d=m.querySelectorAll('.ktab td.num')[3].textContent;
 ok('laws still hold with odd values (730/300/170 Ω)', d==='0.000 mA' || d==='-0.000 mA', d);
 ok('Kirchhoff origin card present', /Gustav Kirchhoff/.test(m.querySelector('details.origin').textContent));
 L.goNav('Series & parallel'); const hrefs=[...D.querySelectorAll('#main .handoff a')].map(a=>a.getAttribute('href'));
 ok('two “build it for real” links: kit #8 and #9', hrefs.join()==='electronics-trainer.html#p=8&from=learn,electronics-trainer.html#p=9&from=learn', hrefs.join(' '));
}catch(e){ res.push(['FAIL','FATAL',e.stack]); }
res.forEach(r=>console.log(r[0]+'  '+r[1]+(r[2]?'  — '+r[2]:''))); console.log(res.every(r=>r[0]==='PASS')?'ALL PASS ✓':'FAILURES ✗');
},300);
