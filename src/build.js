const fs=require('fs');
const css=fs.readFileSync('style.css','utf8');
const secs=fs.readdirSync('sections').filter(f=>f.endsWith('.js')).sort((a,b)=>parseInt(a.slice(1))-parseInt(b.slice(1))).map(f=>'sections/'+f);
const js=['data.js','formula.js',...secs,'content.js','app.js'].map(f=>`<script>\n${fs.readFileSync(f,'utf8')}\n</script>`).join('\n');
const head=`<title>Yetakla — data analitika</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Data analitikani o'zbek tilida, o'yin shaklida o'rganish">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=JetBrains+Mono:wght@400;700&family=Nunito:wght@400;600;700;800;900&display=swap">
<style>
${css}
</style>`;
const body=`<div id="app"></div>\n${js}`;
// Sayt versiyasi: Firebase konfiguratsiyasi va bulut moduli app.js dan oldin
const cfg=fs.existsSync('firebase-config.js')?fs.readFileSync('firebase-config.js','utf8'):'';
const appTag='<script>\n'+fs.readFileSync('app.js','utf8');
const siteJs=cfg?js.replace(appTag,()=>`<script>\n${cfg}\n</script>\n<script>\n${fs.readFileSync('cloud.js','utf8')}\n</script>\n`+appTag):js;
const siteBody=`<div id="app"></div>\n${siteJs}`;
fs.writeFileSync('datayol.html', head+'\n'+body+'\n');
fs.writeFileSync('datayol-standalone.html', `<!doctype html>\n<html lang="uz">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${siteBody}\n</body>\n</html>\n`);
console.log(fs.statSync('datayol.html').size);
// Admin panel (faqat sayt uchun): kurs tuzilishi va Firebase konfiguratsiyasi bilan
if(cfg&&fs.existsSync('admin.tpl.html')){
  const vm=require('vm');const ctx={};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
  for(const f of ['data.js','formula.js',...secs,'content.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
  const outline=JSON.stringify(ctx.DY_COURSE.filter(s=>s.lessons.length&&!s.soon).map(s=>({id:s.id,t:s.title,l:s.lessons.map(l=>[l.id,l.title])})));
  fs.writeFileSync('admin.html',fs.readFileSync('admin.tpl.html','utf8').replace('/*CFG*/',()=>cfg).replace('/*OUTLINE*/',()=>outline));
}
