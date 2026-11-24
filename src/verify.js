require('./data.js'); for (const f of require('fs').readdirSync('./sections')) require('./sections/'+f); require('./content.js'); require('./formula.js');
const initSqlJs = require('../sqljs/node_modules/sql.js/dist/sql-asm.js');
(async()=>{
 const SQL = await initSqlJs(); const db = new SQL.Database();
 const D = globalThis.DY_DATA;
 for (const [t,{cols,rows}] of Object.entries(D)) {
   const types = cols.map((c,i)=> typeof rows[0][i]==='number'?'INTEGER':'TEXT');
   db.run(`CREATE TABLE ${t} (${cols.map((c,i)=>c+' '+types[i]).join(', ')})`);
   const st = db.prepare(`INSERT INTO ${t} VALUES (${cols.map(()=>'?').join(',')})`); rows.forEach(r=>st.run(r)); st.free();
 }
 let bad=0, nsql=0, nf=0;
 for (const s of globalThis.DY_COURSE) for (const l of s.lessons) l.steps.forEach((st,i)=>{
   const codes=[];
   if (st.t==='sql') codes.push(st.solution);
   if (st.visual && st.visual.code && /SELECT/i.test(st.visual.code)) codes.push(st.visual.code);
   for (const c of codes){ nsql++; try{ const r=db.exec(c); console.log('SQL OK', l.id, i, c, '→', r[0]?r[0].values.length+' rows':'0 rows', r[0]?JSON.stringify(r[0].values.slice(0,3)):''); }catch(e){bad++;console.log('SQL FAIL',l.id,i,c,e.message);} }
   if (st.t==='formula'){ nf++; const r=DY_FORMULA.evaluate(st.solution, st.sheet); if(!r.ok){bad++;console.log('F FAIL',l.id,i,st.solution,r.error);} else { const miss=(st.must||[]).filter(m=>!r.used.includes(m)); console.log('F OK', l.id, i, st.target, st.solution,'=',r.value, miss.length?'MISSING '+miss:''); if(miss.length)bad++; } }
 });
 // sanity on mc answers
 for (const s of globalThis.DY_COURSE) for (const l of s.lessons) l.steps.forEach((st,i)=>{
   if(['mc','predict','chart'].includes(st.t) && (st.a<0||st.a>=st.o.length)){bad++;console.log('A RANGE',l.id,i)}
   if(st.t==='fill'){const n=st.tpl.split('___').length-1; if(n!==st.a.length||st.a.some(x=>!st.o.includes(x))){bad++;console.log('FILL BAD',l.id,i)}}
   if(st.t==='bug'&&(st.a>=st.tokens.length)){bad++;console.log('BUG BAD',l.id,i)}
   if(st.t==='case') st.steps.forEach(c=>{if(c.a>=c.o.length){bad++;console.log('CASE BAD',l.id,i)}});
 });
 // Extra checks of predict facts
 const f=(x,sh)=>DY_FORMULA.evaluate(x,sh).value;
 const sh={header:['A'],rows:[[10],[20],[30],["yo'q"],[40]]}; console.log('COUNT test', f('=COUNT(A2:A6)',sh), f('=COUNTA(A2:A6)',sh));
 const sh2={header:['C'],rows:[[72],[55],[60],[90],[48]]}; console.log('COUNTIF >=60', f('=COUNTIF(A2:A6,">=60")',sh2));
 console.log('A2+A3*2', f('=A2+A3*2',{header:['A'],rows:[[10],[5]]}));
 const L=globalThis.DY_COURSE[1].lessons[3].steps.find(s=>s.t==='predict'); console.log('VLOOKUP 5', f('=VLOOKUP(5,A2:D6,2,FALSE)',{header:L.table.cols,rows:L.table.rows}));
 console.log('bug ref', DY_FORMULA.evaluate('=VLOOKUP(F2,A2:D6,5,FALSE)', globalThis.DY_COURSE[1].lessons[3].steps[3].sheet).error);
 console.log('semicolon', f('=SUM(D2:D7;0)', globalThis.DY_COURSE[1].lessons[1].steps[3].sheet));
 console.log('err cases', DY_FORMULA.evaluate('B2*C2',{header:['a'],rows:[]}).error, DY_FORMULA.evaluate('=B2×C2',{header:['a'],rows:[]}).error, DY_FORMULA.evaluate('=IF(C2>=60,O\'tdi,"Qoldi")',{header:['a','b','c'],rows:[[1,1,70]]}).error);
 let n=0; for (const s of globalThis.DY_COURSE) for (const l of s.lessons) n+=l.steps.length; console.log('total steps',n,'sql',nsql,'formulas',nf,'BAD',bad);
})();
