// Runs every suite from the repo root and fails if any check fails.  Usage: npm test
const { execFileSync } = require('child_process'); const path=require('path'); const fs=require('fs');
const root=path.join(__dirname,'..'); let failed=0;
for(const f of fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.js')).sort()){
  let out=''; try{ out=execFileSync(process.execPath,[path.join(__dirname,f)],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(e){ out=(e.stdout||'')+(e.stderr||''); }
  const lines=out.split('\n').filter(l=>/^(PASS|FAIL)/.test(l)); const bad=lines.filter(l=>l.startsWith('FAIL'));
  failed+=bad.length||(lines.length?0:1);
  console.log(`${bad.length||!lines.length?'✗':'✓'} ${f.padEnd(26)} ${lines.length-bad.length}/${lines.length} checks`); bad.forEach(l=>console.log('    '+l));
}
console.log(failed?`\n${failed} failing check(s)`:'\nAll suites pass.'); process.exit(failed?1:0);
