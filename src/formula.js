/* DataYo'l — kichik Excel formula dvigateli.
   Qo'llab-quvvatlanadi: + - * / ^ &, taqqoslash (= <> < > <= >=), katak (B2), diapazon (B2:D6),
   SUM AVERAGE COUNT COUNTA MIN MAX IF ROUND COUNTIF SUMIF AVERAGEIF VLOOKUP XLOOKUP AND OR LEN UPPER LOWER TRIM IFERROR.
   Argument ajratgich: vergul yoki nuqtali vergul. */
(function (g) {
  function FErr(code, msg) { this.code = code; this.msg = msg; }
  const colIdx = s => { let n = 0; for (const ch of s) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
  const colName = i => { let s = ""; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };

  function tokenize(src) {
    const t = []; let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"' || c === '“' || c === '”') {
        let j = i + 1, s = "";
        while (j < src.length && !['"', '“', '”'].includes(src[j])) s += src[j++];
        if (j >= src.length) throw new FErr("#XATO", "Qo'shtirnoq yopilmagan");
        t.push({ k: "str", v: s }); i = j + 1; continue;
      }
      const num = /^\d+(\.\d+)?/.exec(src.slice(i));
      if (num) { t.push({ k: "num", v: parseFloat(num[0]) }); i += num[0].length; continue; }
      const id = /^\$?[A-Za-z]+\$?\d*/.exec(src.slice(i));
      if (id) {
        const raw = id[0].replace(/\$/g, "").toUpperCase();
        if (/^[A-Z]{1,3}\d+$/.test(raw)) t.push({ k: "ref", v: raw });
        else t.push({ k: "id", v: raw });
        i += id[0].length; continue;
      }
      const two = src.slice(i, i + 2);
      if (["<>", "<=", ">="].includes(two)) { t.push({ k: "op", v: two }); i += 2; continue; }
      if ("+-*/^&=<>(),;:%".includes(c)) { t.push({ k: c === "," || c === ";" ? "sep" : "op", v: c === ";" ? "," : c }); i++; continue; }
      if (c === "×" || c === "÷" || c === "x") throw new FErr("#XATO", "Ko'paytirish uchun * , bo'lish uchun / belgisini ishlating");
      throw new FErr("#XATO", "Tushunarsiz belgi: " + c);
    }
    return t;
  }

  function Parser(tokens, sheet) { this.t = tokens; this.p = 0; this.s = sheet; }
  Parser.prototype.peek = function () { return this.t[this.p]; };
  Parser.prototype.next = function () { return this.t[this.p++]; };
  Parser.prototype.isOp = function (...ops) { const k = this.peek(); return k && k.k === "op" && ops.includes(k.v); };
  Parser.prototype.expect = function (v) { const k = this.next(); if (!k || k.v !== v) throw new FErr("#XATO", `"${v}" kutilgan edi`); };
  Parser.prototype.cmp = function () {
    let a = this.cat();
    while (this.isOp("=", "<>", "<", ">", "<=", ">=")) { const op = this.next().v; const b = this.cat(); a = compare(op, scalar(a), scalar(b)); }
    return a;
  };
  Parser.prototype.cat = function () {
    let a = this.add();
    while (this.isOp("&")) { this.next(); const b = this.add(); a = String(show(scalar(a))) + String(show(scalar(b))); }
    return a;
  };
  Parser.prototype.add = function () {
    let a = this.mul();
    while (this.isOp("+", "-")) { const op = this.next().v; const b = this.mul(); a = op === "+" ? num(a) + num(b) : num(a) - num(b); }
    return a;
  };
  Parser.prototype.mul = function () {
    let a = this.pow();
    while (this.isOp("*", "/")) {
      const op = this.next().v; const b = this.pow();
      if (op === "/" && num(b) === 0) throw new FErr("#DIV/0!", "Nolga bo'lib bo'lmaydi");
      a = op === "*" ? num(a) * num(b) : num(a) / num(b);
    }
    return a;
  };
  Parser.prototype.pow = function () {
    let a = this.unary();
    while (this.isOp("^")) { this.next(); a = Math.pow(num(a), num(this.unary())); }
    return a;
  };
  Parser.prototype.unary = function () {
    if (this.isOp("-")) { this.next(); return -num(this.unary()); }
    if (this.isOp("+")) { this.next(); return num(this.unary()); }
    let v = this.prim();
    if (this.isOp("%")) { this.next(); v = num(v) / 100; }
    return v;
  };
  Parser.prototype.prim = function () {
    const k = this.next();
    if (!k) throw new FErr("#XATO", "Formula to'liq emas");
    if (k.k === "num") return k.v;
    if (k.k === "str") return k.v;
    if (k.k === "op" && k.v === "(") { const v = this.cmp(); this.expect(")"); return v; }
    if (k.k === "ref") {
      if (this.isOp(":")) { this.next(); const e = this.next(); if (!e || e.k !== "ref") throw new FErr("#XATO", "Diapazon noto'g'ri: masalan B2:B6"); return this.s.range(k.v, e.v); }
      return this.s.get(k.v);
    }
    if (k.k === "id") {
      if (k.v === "TRUE") return true;
      if (k.v === "FALSE") return false;
      if (this.isOp("(")) {
        this.next(); const args = [];
        if (!this.isOp(")")) { for (;;) { args.push(this.cmp()); if (this.peek() && this.peek().k === "sep") { this.next(); continue; } break; } }
        this.expect(")");
        return callFn(k.v, args);
      }
      throw new FErr("#NAME?", `"${k.v}" — noma'lum nom`);
    }
    throw new FErr("#XATO", "Kutilmagan belgi: " + k.v);
  };

  function isRange(v) { return v && v.__range; }
  function flat(args) { const out = []; for (const a of args) { if (isRange(a)) a.rows.forEach(r => r.forEach(x => out.push(x))); else out.push(a); } return out; }
  function scalar(v) { if (isRange(v)) { if (v.rows.length === 1 && v.rows[0].length === 1) return v.rows[0][0]; throw new FErr("#VALUE!", "Bu yerda bitta katak kerak, diapazon emas"); } return v; }
  function num(v) {
    v = scalar(v);
    if (typeof v === "number") return v; if (typeof v === "boolean") return v ? 1 : 0;
    if (v === "" || v == null) return 0;
    const n = Number(String(v).replace(/\s/g, "")); if (!isNaN(n)) return n;
    throw new FErr("#VALUE!", `"${v}" — matn, uni son sifatida hisoblab bo'lmaydi`);
  }
  function show(v) { return typeof v === "boolean" ? (v ? "TRUE" : "FALSE") : v; }
  function eq(a, b) { if (typeof a === "string" && typeof b === "string") return a.trim().toLowerCase() === b.trim().toLowerCase(); return a === b; }
  function compare(op, a, b) {
    let x = a, y = b;
    if (typeof x === "string" && typeof y === "string") { x = x.toLowerCase(); y = y.toLowerCase(); }
    else if (typeof x !== typeof y) { if (op === "=") return false; if (op === "<>") return true; }
    switch (op) { case "=": return x === y; case "<>": return x !== y; case "<": return x < y; case ">": return x > y; case "<=": return x <= y; case ">=": return x >= y; }
  }
  function crit(c) {
    if (typeof c === "number") return v => v === c;
    const m = /^(<>|>=|<=|=|>|<)?(.*)$/.exec(String(c)); const op = m[1] || "="; const rhs = m[2];
    const n = rhs !== "" && !isNaN(Number(rhs)) ? Number(rhs) : null;
    return v => {
      if (n !== null && typeof v === "number") return compare(op, v, n);
      if (n !== null) return op === "<>";
      return compare(op, String(v ?? ""), rhs);
    };
  }
  function need(name, args, min, max) { if (args.length < min || args.length > max) throw new FErr("#XATO", `${name} uchun argumentlar soni noto'g'ri`); }
  function callFn(name, args) {
    const nums = () => flat(args).filter(x => typeof x === "number");
    switch (name) {
      case "SUM": return nums().reduce((a, b) => a + b, 0);
      case "AVERAGE": { const n = nums(); if (!n.length) throw new FErr("#DIV/0!", "O'rtacha uchun son yo'q"); return n.reduce((a, b) => a + b, 0) / n.length; }
      case "COUNT": return nums().length;
      case "COUNTA": return flat(args).filter(x => x !== "" && x != null).length;
      case "MIN": { const n = nums(); return n.length ? Math.min(...n) : 0; }
      case "MAX": { const n = nums(); return n.length ? Math.max(...n) : 0; }
      case "IF": { need(name, args, 2, 3); const c = scalar(args[0]); const t = typeof c === "boolean" ? c : num(c) !== 0; return t ? scalar(args[1]) : (args.length > 2 ? scalar(args[2]) : false); }
      case "AND": return flat(args).every(x => !!x);
      case "OR": return flat(args).some(x => !!x);
      case "ROUND": { need(name, args, 1, 2); const d = args.length > 1 ? num(args[1]) : 0; const f = Math.pow(10, d); return Math.round(num(args[0]) * f) / f; }
      case "LEN": return String(scalar(args[0]) ?? "").length;
      case "UPPER": return String(scalar(args[0]) ?? "").toUpperCase();
      case "LOWER": return String(scalar(args[0]) ?? "").toLowerCase();
      case "TRIM": return String(scalar(args[0]) ?? "").trim().replace(/\s+/g, " ");
      case "COUNTIF": { need(name, args, 2, 2); if (!isRange(args[0])) throw new FErr("#VALUE!", "COUNTIF birinchi argumenti diapazon bo'lsin"); const f = crit(scalar(args[1])); return flat([args[0]]).filter(f).length; }
      case "SUMIF": case "AVERAGEIF": {
        need(name, args, 2, 3); if (!isRange(args[0])) throw new FErr("#VALUE!", name + " birinchi argumenti diapazon bo'lsin");
        const f = crit(scalar(args[1])); const r = flat([args[0]]); const s = args[2] ? flat([args[2]]) : r;
        if (s.length !== r.length) throw new FErr("#VALUE!", "Diapazonlar o'lchami bir xil bo'lsin");
        const picked = r.map((v, i) => f(v) ? s[i] : null).filter(v => typeof v === "number");
        if (name === "SUMIF") return picked.reduce((a, b) => a + b, 0);
        if (!picked.length) throw new FErr("#DIV/0!", "Shartga mos son yo'q"); return picked.reduce((a, b) => a + b, 0) / picked.length;
      }
      case "VLOOKUP": {
        need(name, args, 3, 4); const key = scalar(args[0]); const tb = args[1]; if (!isRange(tb)) throw new FErr("#VALUE!", "Ikkinchi argument — jadval diapazoni");
        const ci = num(args[2]); if (ci < 1 || ci > tb.rows[0].length) throw new FErr("#REF!", `Diapazonda ${tb.rows[0].length} ta ustun bor, ${ci}-ustun yo'q`);
        const exactMatch = args.length > 3 && !scalar(args[3]);
        if (exactMatch) { const row = tb.rows.find(r => eq(r[0], key)); if (!row) throw new FErr("#N/A", "Qidirilgan qiymat topilmadi"); return row[ci - 1]; }
        let best = null; for (const r of tb.rows) { if (typeof r[0] === typeof key && r[0] <= key) best = r; }
        if (!best) throw new FErr("#N/A", "Qidirilgan qiymat topilmadi"); return best[ci - 1];
      }
      case "XLOOKUP": {
        need(name, args, 3, 4); const key = scalar(args[0]); const a = flat([args[1]]), b = flat([args[2]]);
        if (a.length !== b.length) throw new FErr("#VALUE!", "Qidirish va natija ustunlari bir xil uzunlikda bo'lsin");
        const i = a.findIndex(v => eq(v, key)); if (i < 0) { if (args.length > 3) return scalar(args[3]); throw new FErr("#N/A", "Qidirilgan qiymat topilmadi"); }
        return b[i];
      }
      case "MEDIAN": { const n = nums().sort((a, b) => a - b); if (!n.length) throw new FErr("#NUM!", "Son yo'q"); const m = Math.floor(n.length / 2); return n.length % 2 ? n[m] : (n[m - 1] + n[m]) / 2; }
      case "MODE": { const n = nums(); const cnt = new Map(); n.forEach(x => cnt.set(x, (cnt.get(x) || 0) + 1)); let best = null, bc = 1; for (const x of n) { if (cnt.get(x) > bc) { bc = cnt.get(x); best = x; } } if (best === null) throw new FErr("#N/A", "Takrorlanadigan qiymat yo'q"); return best; }
      case "STDEV": { const n = nums(); if (n.length < 2) throw new FErr("#DIV/0!", "Kamida 2 ta son kerak"); const mu = n.reduce((a, b) => a + b, 0) / n.length; return Math.sqrt(n.reduce((a, b) => a + (b - mu) * (b - mu), 0) / (n.length - 1)); }
      case "CORREL": {
        need(name, args, 2, 2); const a = flat([args[0]]), b = flat([args[1]]); if (a.length !== b.length) throw new FErr("#N/A", "Ikki diapazon bir xil uzunlikda bo'lsin");
        const pr = a.map((x, i) => [x, b[i]]).filter(p => typeof p[0] === "number" && typeof p[1] === "number"); const k = pr.length; if (k < 2) throw new FErr("#DIV/0!", "Juftlar yetarli emas");
        const ma = pr.reduce((s, p) => s + p[0], 0) / k, mb = pr.reduce((s, p) => s + p[1], 0) / k;
        let sab = 0, saa = 0, sbb = 0; pr.forEach(p => { sab += (p[0] - ma) * (p[1] - mb); saa += (p[0] - ma) ** 2; sbb += (p[1] - mb) ** 2; });
        return sab / Math.sqrt(saa * sbb);
      }
      case "ABS": return Math.abs(num(args[0]));
      case "PROPER": return String(scalar(args[0]) ?? "").toLowerCase().replace(/(^|[^a-z'ʻ])([a-z])/g, (m, a, b) => a + b.toUpperCase());
      case "SUBSTITUTE": { need(name, args, 3, 3); return String(scalar(args[0]) ?? "").split(String(scalar(args[1]))).join(String(scalar(args[2]))); }
      case "ISBLANK": return scalar(args[0]) === "" || scalar(args[0]) == null;
      case "COUNTBLANK": return flat(args).filter(x => x === "" || x == null).length;
      case "LEFT": return String(scalar(args[0]) ?? "").slice(0, args.length > 1 ? num(args[1]) : 1);
      case "RIGHT": { const s = String(scalar(args[0]) ?? ""); const n = args.length > 1 ? num(args[1]) : 1; return s.slice(Math.max(0, s.length - n)); }
      case "MID": return String(scalar(args[0]) ?? "").substr(num(args[1]) - 1, num(args[2]));
      case "IFERROR": { need(name, args, 2, 2); return scalar(args[0]); }
      default: throw new FErr("#NAME?", `${name} — bunday funksiya yo'q (yoki bu darsda ishlatilmaydi)`);
    }
  }

  // sheet: { header: [...], rows: [[...]] } — 1-qator sarlavha, ma'lumot 2-qatordan.
  function makeSheet(def) {
    const grid = [def.header].concat(def.rows);
    const get = ref => { const m = /^([A-Z]+)(\d+)$/.exec(ref); const c = colIdx(m[1]), r = +m[2] - 1; const v = grid[r] ? grid[r][c] : undefined; return v === undefined || v === null ? "" : v; };
    const range = (a, b) => {
      const ma = /^([A-Z]+)(\d+)$/.exec(a), mb = /^([A-Z]+)(\d+)$/.exec(b);
      const c1 = Math.min(colIdx(ma[1]), colIdx(mb[1])), c2 = Math.max(colIdx(ma[1]), colIdx(mb[1]));
      const r1 = Math.min(+ma[2], +mb[2]), r2 = Math.max(+ma[2], +mb[2]); const rows = [];
      for (let r = r1; r <= r2; r++) { const row = []; for (let c = c1; c <= c2; c++) row.push(get(colName(c) + r)); rows.push(row); }
      return { __range: true, rows };
    };
    return { get, range, grid };
  }

  function evaluate(src, sheetDef, fns) {
    try {
      let s = String(src || "").trim();
      if (!s) return { ok: false, error: "Formula bo'sh" };
      if (s[0] !== "=") return { ok: false, error: "Formula = belgisi bilan boshlanadi", noEq: true };
      s = s.slice(1);
      const toks = tokenize(s);
      const used = toks.filter((t, i) => t.k === "id" && toks[i + 1] && toks[i + 1].v === "(").map(t => t.v);
      const p = new Parser(toks, makeSheet(sheetDef)); const v = scalar(p.cmp());
      if (p.p < toks.length) throw new FErr("#XATO", "Formulada ortiqcha belgi bor: " + toks[p.p].v);
      return { ok: true, value: v, used };
    } catch (e) {
      if (e instanceof FErr) return { ok: false, error: e.code + " — " + e.msg };
      return { ok: false, error: "Formula tushunarsiz" };
    }
  }
  function same(a, b) {
    if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b));
    return eq(String(a), String(b));
  }
  g.DY_FORMULA = { evaluate, same, colName };
})(typeof window !== "undefined" ? window : globalThis);
