/* Yetakla — ilova mantig'i. Kontent: DY_COURSE (content.js), ma'lumot: DY_DATA (data.js), formula: DY_FORMULA (formula.js). */
(function () {
  "use strict";
  const COURSE = window.DY_COURSE, DATA = window.DY_DATA, F = window.DY_FORMULA;
  const $app = document.getElementById("app");
  const KEY = "datayol_v1";
  const MASCOT = "Bilag'on"; // maskot ismi — bitta joyda

  /* ---------- helpers ---------- */
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = v => typeof v === "number" ? (Number.isInteger(v) ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : (Math.round(v * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")) : esc(v);
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const dayStr = d => { const x = d || new Date(); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };
  const weekKey = () => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dayStr(d); };
  const hlCode = (code) => String(code).split("\n").map(line => {
    const m = line.match(/^(.*?)((?:^|\s)(?:#|--|\/\/) .*)$/);
    return m ? hlLine(m[1]) + '<span class="cm">' + esc(m[2]) + "</span>" : hlLine(line);
  }).join("\n");
  const hlLine = (code) => {
    let s = esc(code);
    s = s.replace(/('[^']*')/g, '<span class="str">$1</span>').replace(/(&quot;[^&]*?&quot;)/g, '<span class="str">$1</span>');
    s = s.replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|PARTITION BY|LIMIT|AND|OR|NOT|AS|DESC|ASC|DISTINCT|HAVING|BETWEEN|LIKE|IN|IS|NULL|JOIN|LEFT|RIGHT|INNER|FULL|ON|WITH|CASE|WHEN|THEN|ELSE|END|OVER|UNION|SUM|AVG|AVERAGE|COUNTIF|SUMIF|COUNT|MIN|MAX|ROUND|IF|VLOOKUP|XLOOKUP|FALSE|TRUE|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|COALESCE|TRIM|UPPER|LOWER|REPLACE|SUBSTR|STRFTIME|DATE|CAST|CALCULATE|FILTER|DIVIDE|SUMX|RELATED|COUNTROWS|DISTINCTCOUNT|ALL|VAR|RETURN|import|from|as|def|return|for|in|if|else|elif|print|True|False|None|and|or|not|len|range)\b/g, '<span class="kw">$1</span>');
    s = s.replace(/(^|[^A-Za-z\d_])(\d+)(?![\d:]*[A-Za-z])/g, '$1<span class="nm">$2</span>');
    return s;
  };

  /* ---------- icons ---------- */
  const I = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="17.5" cy="16" r="2.5" fill="currentColor"/><path class="x" d="M3 3l18 18"/></svg>',
    google: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2.1v2.8C3.9 20.6 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.1 4.9l3.7-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.4 2.1 7.1l3.7 2.8c.9-2.6 3.3-4.5 6.2-4.5z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.2 12 3.8l9 7.4"/><path d="M5.5 9.6V20h13V9.6"/><path d="M10 20v-5.4h4V20"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z"/></svg>',
    crown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 7.5 7.5 11 12 4l4.5 7L21 7.5 19 18H5L3 7.5ZM5 20h14v2H5z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s5 4.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5S9 11 10.5 11C10.5 7 12 2 12 2Zm0 20a7 7 0 0 0 7-7c0-1.7-.5-3.3-1.3-4.6.1 4-2.2 6.6-5.7 6.6-2.3 0-4-1.4-4.6-3.4A7 7 0 0 0 12 22Z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.2-8-11.2A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8 3.2C20 15.8 12 21 12 21Z"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/></svg>',
    db: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="6" width="4" height="15" rx="1"/><rect x="17" y="9" width="4" height="12" rx="1"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5a2.5 2.5 0 0 0 0 5H20v-2H6.5a.5.5 0 0 1 0-1H20V2"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
    join: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/></svg>'
  };

  /* ---------- Maskot (MASCOT): hudhud qushi — yo'lni yetaklovchi dono qush ---------- */
  function mascot(mood = "ok", cls = "") {
    const BODY = "#E8893C", BODY_D = "#C96A22", BELLY = "#FBD3A2", INK = "#2A211C", TIP = "#1F1A17";
    // toj patlari: har bir kayfiyatda boshqacha yoyiladi
    const angles = { ok: [-42, -21, 0, 21, 42], happy: [-60, -30, 0, 30, 60], sad: [22, 38, 54, 70, 86], think: [-30, -12, 6, 24, 42] }[mood] || [-42, -21, 0, 21, 42];
    const len = mood === "sad" ? 0.82 : mood === "happy" ? 1.08 : 1;
    const feather = a => `<g transform="translate(50 52) rotate(${a}) scale(${len})"><path d="M0 0C-5.6-12-5.6-30 0-42C5.6-30 5.6-12 0 0Z" fill="${BODY}"/><g transform="translate(0 -8)"><path d="M-4.2-22C-3.5-27-2-31 0-34C2-31 3.5-27 4.2-22C1.4-23.5-1.4-23.5-4.2-22Z" fill="${TIP}"/><path d="M-4.8-18.5C-1.6-20-1.6-20 0-20.2C1.6-20 1.6-20 4.8-18.5L4.2-22C1.4-23.5-1.4-23.5-4.2-22Z" fill="#fff"/></g></g>`;
    const crest = angles.map(feather).join("");
    // qanot: qora-oq chiziqli (popishakning belgisi)
    const wing = (side, rot) => {
      const s = side === "l" ? 1 : -1, cx = side === "l" ? 26 : 74;
      return `<g transform="translate(${cx} 70) rotate(${rot * s}) scale(${s} 1)"><path d="M2-6C-12 2-15 18-8 30C0 26 6 12 6-2Z" fill="${TIP}"/><path d="M-4.4 3.5 4.7 1.2M-7.6 10.5 3.8 7.3M-9.2 17.6 1.8 13.8M-8.8 24.2-1.4 20.6" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></g>`;
    };
    const wr = { ok: [6, 6], happy: [62, 62], sad: [-8, -8], think: [6, 48] }[mood] || [8, 8];
    const eye = (x, y) => `<circle cx="${x}" cy="${y}" r="7.4" fill="#fff"/>`;
    const eyes = {
      ok: eye(40, 58) + eye(60, 58) + `<circle cx="41" cy="59" r="3.9" fill="${INK}"/><circle cx="59" cy="59" r="3.9" fill="${INK}"/><circle cx="42.4" cy="57.4" r="1.3" fill="#fff"/><circle cx="60.4" cy="57.4" r="1.3" fill="#fff"/>`,
      happy: `<path d="M34 60q6-8 12 0M54 60q6-8 12 0" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cx="31" cy="69" rx="5" ry="3" fill="#F26A7A" opacity=".55"/><ellipse cx="69" cy="69" rx="5" ry="3" fill="#F26A7A" opacity=".55"/>`,
      sad: eye(40, 59) + eye(60, 59) + `<circle cx="40" cy="61.5" r="3.6" fill="${INK}"/><circle cx="60" cy="61.5" r="3.6" fill="${INK}"/><path d="M33 51.5l10 3M67 51.5l-10 3" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`,
      think: eye(40, 58) + eye(60, 58) + `<circle cx="42.5" cy="55.6" r="3.7" fill="${INK}"/><circle cx="62.5" cy="55.6" r="3.7" fill="${INK}"/><path d="M53.5 49.5q6.5-3.5 13 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    }[mood];
    // uzun, biroz egilgan tumshuq
    const beak = mood === "happy"
      ? `<path d="M45.5 65.5Q50 63 54.5 65.5Q53.5 76 49 84Q48.5 74 45.5 65.5Z" fill="${INK}"/><path d="M47 68Q50 71 53 68" stroke="${BELLY}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
      : `<path d="M45.5 65.5Q50 63 54.5 65.5Q53.5 76 48.5 85Q48 74 45.5 65.5Z" fill="${INK}"/>`;
    return `<svg class="mascot ${cls}" viewBox="0 0 100 112" role="img" aria-label="${MASCOT}">
      <g class="m-crest">${crest}</g>
      <g class="m-wing l">${wing("l", wr[0])}</g><g class="m-wing r">${wing("r", wr[1])}</g>
      <ellipse cx="50" cy="72" rx="27" ry="30" fill="${BODY}"/>
      <path d="M26 78Q28 99 50 102Q72 99 74 78Q70 88 50 90Q30 88 26 78Z" fill="${BODY_D}" opacity=".35"/>
      <ellipse cx="50" cy="83" rx="15.5" ry="15" fill="${BELLY}"/>
      <path d="M43 84q7 3 14 0M44.5 90q5.5 2.4 11 0" stroke="${BODY}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>
      ${eyes}${beak}
      <path d="M42 101v6M38.5 107h7M58 101v6M54.5 107h7" stroke="${BODY_D}" stroke-width="2.8" stroke-linecap="round"/>
      ${mood === "think" ? '<text x="82" y="26" font-family="Baloo 2, sans-serif" font-weight="800" font-size="20" fill="var(--sun)">?</text>' : ""}
    </svg>`;
  }

  /* ---------- mini charts ---------- */
  const CHART_LABEL = { bar: "Ustunli", line: "Chiziqli", pie: "Doiraviy", scatter: "Nuqtali", kpi: "KPI karta" };
  function miniChart(k) {
    const ax = '<path d="M10 70h100M10 70V8" stroke="var(--line)" stroke-width="2"/>';
    if (k === "bar") return `<svg viewBox="0 0 120 80">${ax}<rect x="20" y="40" width="16" height="30" rx="2" fill="var(--green)"/><rect x="42" y="20" width="16" height="50" rx="2" fill="var(--green)"/><rect x="64" y="48" width="16" height="22" rx="2" fill="var(--green)"/><rect x="86" y="30" width="16" height="40" rx="2" fill="var(--green)"/></svg>`;
    if (k === "line") return `<svg viewBox="0 0 120 80">${ax}<polyline points="14,58 30,50 46,54 62,36 78,40 94,22 108,16" fill="none" stroke="var(--sky)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="108" cy="16" r="4" fill="var(--sky)"/></svg>`;
    if (k === "pie") return `<svg viewBox="0 0 120 80"><circle cx="60" cy="40" r="14" fill="none" stroke="var(--sun)" stroke-width="28" stroke-dasharray="57.2 88" transform="rotate(-90 60 40)"/><circle cx="60" cy="40" r="14" fill="none" stroke="var(--heart)" stroke-width="28" stroke-dasharray="0 57.2 30.8 88" transform="rotate(-90 60 40)"/></svg>`;
    if (k === "scatter") { const pts = [[18, 62], [26, 58], [34, 52], [44, 50], [52, 42], [60, 44], [70, 34], [80, 30], [90, 24], [100, 18], [40, 58], [76, 38]]; return `<svg viewBox="0 0 120 80">${ax}${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.6" fill="var(--flame)"/>`).join("")}</svg>`; }
    return `<svg viewBox="0 0 120 80"><rect x="14" y="14" width="92" height="52" rx="10" fill="var(--surface-2)" stroke="var(--line)" stroke-width="2"/><text x="26" y="34" font-size="10" font-weight="800" fill="var(--muted)" font-family="Nunito, sans-serif">TUSHUM</text><text x="26" y="56" font-size="18" font-weight="800" fill="var(--ink)" font-family="Baloo 2, sans-serif">16,2 mln</text></svg>`;
  }

  /* ---------- state ---------- */
  const fresh = () => ({ v: 1, xp: 0, todayXp: 0, today: dayStr(), goal: null, streak: 0, bestStreak: 0, lastDay: null, hearts: 5, done: {}, lessonsDone: 0, pool: {}, badges: {}, sound: true, formulasOk: 0, reviewsOk: 0, onboarded: false, week: "", weekXp: 0, music: true, coins: 0, freezes: 0, quests: null, port: {}, refFrom: "", refBy: "", refClaimed: [], frozeNote: 0, days: {} });
  let S;
  function load() {
    try { const raw = localStorage.getItem(KEY); S = raw ? Object.assign(fresh(), JSON.parse(raw)) : fresh(); } catch (e) { S = fresh(); }
    // Eski manzildan (doniyorjon-k.github.io/yetakla) ko'chib kelgan progress: #import=...
    const m = /[#&]import=([^&]+)/.exec(location.hash || "");
    if (m) {
      try {
        const imp = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(m[1])))));
        if (imp && typeof imp === "object" && (imp.xp || 0) > (S.xp || 0)) { S = Object.assign(fresh(), imp); localStorage.setItem(KEY, JSON.stringify(S)); }
      } catch (e) { /* buzilgan havola — e'tiborsiz */ }
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* */ }
    }
    // Do'st taklifi: ?ref=<uid>
    const rf = /[?&]ref=([A-Za-z0-9]{10,40})/.exec(location.search || "");
    if (rf) { if (!S.refBy && !S.refFrom) { S.refFrom = rf[1]; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* */ } } try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) { /* */ } }
    backfillDays();
    rollDay();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* xotira yo'q — sessiyada saqlanadi */ } if (window.DY_CLOUD) try { window.DY_CLOUD.onSave(S); } catch (e) { /* bulut ixtiyoriy */ } }
  function shiftDay(str, n) { const [y, m, d] = str.split("-").map(Number); return dayStr(new Date(y, m - 1, d + n)); }
  function backfillDays() {
    if (S.days && typeof S.days === "object" && Object.keys(S.days).length) return;
    S.days = {};
    if (S.lastDay) for (let i = 0; i < Math.max(1, Math.min(S.streak || 0, 400)); i++) S.days[shiftDay(S.lastDay, -i)] = 1;
  }
  function markDay(t, v) {
    if (!S.days || typeof S.days !== "object") S.days = {};
    if (S.days[t] === 1) return; S.days[t] = v;
    const ks = Object.keys(S.days); if (ks.length > 420) ks.sort().slice(0, ks.length - 400).forEach(k => delete S.days[k]);
  }
  function rollDay() {
    const t = dayStr();
    if (S.today !== t) { S.today = t; S.todayXp = 0; S.hearts = 5; }
    if (S.week !== weekKey()) { S.week = weekKey(); S.weekXp = 0; }
    if (S.lastDay && S.lastDay !== t && S.lastDay !== yesterday()) {
      // Olov himoyasi: o'tkazib yuborilgan har kun uchun bittadan sarflanadi
      const gap = daysBetween(S.lastDay, t) - 1;
      if (S.streak > 0 && gap > 0 && gap <= (S.freezes || 0)) { S.freezes -= gap; for (let i = 1; i <= gap; i++) markDay(shiftDay(S.lastDay, i), 2); S.lastDay = yesterday(); S.frozeNote = gap; }
      else S.streak = 0;
    }
  }
  function daysBetween(a, b) { const p = x => { const [y, m, d] = x.split("-").map(Number); return new Date(y, m - 1, d); }; return Math.round((p(b) - p(a)) / 864e5); }
  function addXp(n, noQuest) {
    if (n <= 0) return;
    const t = dayStr();
    if (S.lastDay !== t) { S.streak = S.lastDay === yesterday() ? S.streak + 1 : 1; S.lastDay = t; S.bestStreak = Math.max(S.bestStreak, S.streak); }
    markDay(t, 1);
    if (S.week !== weekKey()) { S.week = weekKey(); S.weekXp = 0; }
    const before = S.todayXp; S.xp += n; S.todayXp += n; S.weekXp = (S.weekXp || 0) + n;
    if (S.goal && before < S.goal && S.todayXp >= S.goal) award("goal");
    if (!noQuest) questEv("xp", n);
  }

  /* ---------- course index ---------- */
  const LESSONS = []; const EX = {};
  COURSE.forEach((sec, si) => sec.lessons.forEach((l, li) => {
    LESSONS.push({ sec, si, l, li });
    l.steps.forEach((st, i) => {
      if (st.t === "case") st.steps.forEach((c, k) => { EX[`${l.id}_${i}_${k}`] = { st: caseStep(st, c, k), l }; });
      else if (st.t !== "theory") EX[`${l.id}_${i}`] = { st, l };
    });
  }));
  function caseStep(st, c, k) { return Object.assign({ t: "mc", context: { title: st.title, story: st.story, step: `${k + 1}/${st.steps.length}-qadam` }, use: st.use }, c); }
  function expand(l) {
    const q = [];
    l.steps.forEach((st, i) => {
      if (st.t === "case") st.steps.forEach((c, k) => q.push(Object.assign({ id: `${l.id}_${i}_${k}`, caseKind: true }, caseStep(st, c, k))));
      else q.push(Object.assign({ id: `${l.id}_${i}` }, st));
    });
    return q;
  }
  const isDone = id => !!S.done[id];
  // Xato savol takrorlashga "vaqti kelgan"mi: yangi xato — darhol, to'g'ri yechilgani — 1 / 3 kundan keyin
  const dueIds = () => Object.keys(S.pool).filter(k => EX[k] && (!S.pool[k].day || S.pool[k].day <= dayStr()));
  function lessonState(idx) {
    const { l } = LESSONS[idx];
    if (isDone(l.id)) return "done";
    if (!l.steps.length) return "soon";
    if (idx === 0 || isDone(LESSONS[idx - 1].l.id)) return "current";
    return "locked";
  }
  const secDone = sid => COURSE.find(s => s.id === sid).lessons.every(l => isDone(l.id));

  /* ---------- badges ---------- */
  const BADGES = [
    { id: "first_lesson", name: "Birinchi qadam", desc: "Birinchi darsni tugating", ic: "star", c: "#1f9d55" },
    { id: "first_sql", name: "Birinchi SQL so'rov", desc: "Jonli SQL'ni to'g'ri yozing", ic: "db", c: "#2f6fdb" },
    { id: "perfect", name: "Xatosiz dars", desc: "Darsni birorta xatosiz tugating", ic: "target", c: "#f5a400" },
    { id: "goal", name: "Kunlik maqsad", desc: "Kunlik XP maqsadiga yeting", ic: "bolt", c: "#f26a1b" },
    { id: "streak3", name: "3 kunlik olov", desc: "3 kun ketma-ket o'qing", ic: "flame", c: "#f26a1b" },
    { id: "streak7", name: "7 kunlik olov", desc: "7 kun ketma-ket o'qing", ic: "flame", c: "#e5484d" },
    { id: "xp100", name: "100 XP", desc: "Jami 100 XP to'plang", ic: "bolt", c: "#f5a400" },
    { id: "xp500", name: "500 XP", desc: "Jami 500 XP to'plang", ic: "bolt", c: "#d97706" },
    { id: "formula10", name: "Formula ustasi", desc: "10 ta jonli formulani to'g'ri yozing", ic: "grid", c: "#0e9384" },
    { id: "review10", name: "Takrorlash qahramoni", desc: "10 ta takrorlash savoliga to'g'ri javob", ic: "repeat", c: "#7c5cff" },
    { id: "boss", name: "Boss yengildi", desc: "Birinchi boss darsini tugating", ic: "crown", c: "#e5484d" },
    { id: "s0", name: "Analitik fikrlovchi", desc: "0-bo'limni tugating", ic: "chart", c: "#1f9d55" },
    { id: "s1", name: "Excel ustasi", desc: "1-bo'limni tugating", ic: "grid", c: "#0e9384" },
    { id: "s2", name: "Statistik ko'z", desc: "Statistika bo'limini tugating", ic: "target", c: "#7c5cff" },
    { id: "join", name: "JOIN ustasi", desc: "SQL o'rta va ilg'or bo'limini tugating", ic: "join", c: "#d9488f" },
    { id: "s3", name: "SQL boshlovchi", desc: "SQL asoslari bo'limini tugating", ic: "db", c: "#2f6fdb" },
    { id: "dash", name: "Birinchi dashboard", desc: "Dashboard uchun kategoriya hisobotini yozing", ic: "chart", c: "#c9a400" },
    { id: "superset", name: "SQL Lab ustasi", desc: "Superset uchun ikki o'lchovli dataset yozing", ic: "db", c: "#3b5bdb" },
    { id: "python", name: "Ikki tilda tekshiruv", desc: "Pandas natijasini SQL bilan tasdiqlang", ic: "book", c: "#0b8f6a" },
    { id: "aifix", name: "AI nazoratchisi", desc: "AI so'rovidagi JOIN xatosini tuzating", ic: "target", c: "#8f5cd6" },
    { id: "final", name: "Yakuniy loyiha", desc: "Yakuniy loyiha tahlilini yakunlang", ic: "crown", c: "#c2410c" },
    { id: "s5", name: "Toza ma'lumot", desc: "Ma'lumotlarni tozalash bo'limini tugating", ic: "check", c: "#0e9384" },
    { id: "s6", name: "Dashboard quruvchi", desc: "Vizualizatsiya va Power BI bo'limini tugating", ic: "chart", c: "#f5a400" },
    { id: "s7", name: "BI sayyohi", desc: "Tableau va Superset bo'limini tugating", ic: "map", c: "#2f6fdb" },
    { id: "s8", name: "Pythonchi", desc: "Python bilan tahlil bo'limini tugating", ic: "book", c: "#7c5cff" },
    { id: "s9", name: "AI hamkori", desc: "AI bilan ishlash bo'limini tugating", ic: "bolt", c: "#d9488f" },
    { id: "s10", name: "Ishga tayyor", desc: "Karyera bo'limini tugating", ic: "trophy", c: "#1f9d55" }
  ];
  const SEC_BADGE = { s0: "s0", s1: "s1", s2: "s2", s3: "s3", s4: "join", s5: "s5", s6: "s6", s7: "s7", s8: "s8", s9: "s9", s10: "s10" };
  let toastQ = [];
  function award(id) { if (S.badges[id]) return; S.badges[id] = Date.now(); toastQ.push(id); }
  function checkBadges() {
    if (S.lessonsDone >= 1) award("first_lesson");
    if (S.streak >= 3) award("streak3"); if (S.streak >= 7) award("streak7");
    if (S.xp >= 100) award("xp100"); if (S.xp >= 500) award("xp500");
    if (S.formulasOk >= 10) award("formula10"); if (S.reviewsOk >= 10) award("review10");
    COURSE.forEach(sec => { const b = SEC_BADGE[sec.id]; if (b && sec.lessons.length && !sec.soon && secDone(sec.id) && !sec.lessons.some(l => S.done[l.id] && S.done[l.id].skip)) award(b); });
  }
  let toastOn = false;
  function flushToasts() {
    if (toastOn || !toastQ.length) return;
    const id = toastQ.shift(); const b = typeof id === "object" ? id : BADGES.find(x => x.id === id); if (!b) return flushToasts();
    const t = document.createElement("div"); t.className = "toast"; t.style.setProperty("--c", b.c);
    t.innerHTML = `<span class="ic">${b.emo ? `<span style="font-size:20px">${b.emo}</span>` : I[b.ic]}</span><span>${b.pre === undefined ? "Yangi yutuq: " : b.pre}${esc(b.name)}</span>`;
    document.body.appendChild(t); sfx("badge");
    toastOn = true; setTimeout(() => { t.remove(); toastOn = false; flushToasts(); }, 2600);
  }
  const TIERS = [["Bronza", 0, "#b8743a"], ["Kumush", 150, "#8a9aa6"], ["Oltin", 400, "#f5a400"], ["Yoqut", 800, "#e5484d"], ["Olmos", 1500, "#2f6fdb"]];

  /* ---------- sound (Web Audio, fayllarsiz sintez) ---------- */
  let ac, master, wet, lastKey = 0;
  function audio() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.connect(ac.destination);
      master = ac.createGain(); master.gain.value = 0.9; master.connect(comp);
      // yumshoq "xona" effekti: qisqa takrorlanuvchi kechikish
      const d = ac.createDelay(); d.delayTime.value = 0.11; const fb = ac.createGain(); fb.gain.value = 0.28;
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600;
      wet = ac.createGain(); wet.gain.value = 0.22;
      wet.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(master);
    }
    if (ac.state === "suspended") ac.resume();
    return ac;
  }
  function tone(f, at, dur, o) {
    o = o || {};
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || "sine"; osc.frequency.setValueAtTime(f, at);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, at + dur * 0.9);
    const v = o.vol || 0.15, a = o.att || 0.006;
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(v, at + a); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(g); g.connect(master); if (o.rev) g.connect(wet);
    osc.start(at); osc.stop(at + dur + 0.02);
  }
  function bell(f, at, dur, vol) { // qo'ng'iroqsimon: asosiy ton + yuqori garmonikalar
    tone(f, at, dur, { type: "sine", vol: vol, rev: true });
    tone(f * 2.01, at, dur * 0.6, { type: "sine", vol: vol * 0.35, rev: true });
    tone(f * 3.98, at, dur * 0.3, { type: "sine", vol: vol * 0.12 });
  }
  function noise(at, dur, o) {
    o = o || {};
    const n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = buf;
    const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = o.q || 1.2;
    bp.frequency.setValueAtTime(o.from || 2000, at); if (o.to) bp.frequency.exponentialRampToValueAtTime(o.to, at + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(o.vol || 0.08, at + (o.att || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(at); src.stop(at + dur + 0.02);
  }
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5]; // C-major pentatonika
  function sfx(kind, n) {
    if (!S.sound) return;
    try {
      audio(); const t = ac.currentTime + 0.005; n = n || 0;
      switch (kind) {
        case "tap": tone(1250, t, 0.045, { vol: 0.07, to: 950 }); noise(t, 0.02, { from: 4000, vol: 0.025 }); break;
        case "select": tone(620, t, 0.08, { type: "triangle", vol: 0.11, to: 880 }); break;
        case "pop": tone(420 + Math.random() * 60, t, 0.07, { type: "sine", vol: 0.13, to: 760 }); noise(t, 0.015, { from: 3000, vol: 0.03 }); break;
        case "unpop": tone(700, t, 0.07, { type: "sine", vol: 0.1, to: 380 }); break;
        case "key": noise(t, 0.022, { from: 2600 + Math.random() * 1400, q: 3, vol: 0.05 }); tone(1800 + Math.random() * 400, t, 0.015, { vol: 0.012 }); break;
        case "keydel": noise(t, 0.03, { from: 1200, q: 3, vol: 0.05 }); break;
        case "swoosh": noise(t, 0.22, { from: 500, to: 3200, q: 0.8, vol: 0.045, att: 0.08 }); break;
        case "start": noise(t, 0.3, { from: 400, to: 2800, q: 0.7, vol: 0.04, att: 0.1 }); [0, 2, 4].forEach((k, i) => bell(PENTA[k], t + 0.12 + i * 0.07, 0.35, 0.07)); break;
        case "ok": { // ketma-ket to'g'ri javobda ohang balandlashadi
          const b = Math.min(n, 4);
          bell(PENTA[b], t, 0.5, 0.13); bell(PENTA[b + 2], t + 0.085, 0.55, 0.13); bell(PENTA[b + 4] || 1568, t + 0.17, 0.7, 0.1);
          noise(t + 0.17, 0.25, { from: 6000, to: 9000, q: 2, vol: 0.02 }); break; }
        case "pair": bell(PENTA[Math.min(n, 7)], t, 0.35, 0.12); break;
        case "bad": tone(311, t, 0.16, { type: "triangle", vol: 0.16, to: 233 }); tone(233, t + 0.13, 0.28, { type: "triangle", vol: 0.14, to: 185 }); break;
        case "heart": tone(880, t + 0.32, 0.25, { vol: 0.05, to: 440, rev: true }); break;
        case "soft": tone(440, t, 0.12, { type: "triangle", vol: 0.1 }); tone(392, t + 0.1, 0.18, { type: "triangle", vol: 0.09 }); break;
        case "done": {
          [0, 2, 4, 5].forEach((k, i) => bell(PENTA[k], t + i * 0.11, 0.5, 0.12));
          [523.25, 659.25, 783.99, 1046.5].forEach(f => tone(f, t + 0.5, 1.3, { type: "triangle", vol: 0.045, att: 0.05, rev: true }));
          for (let i = 0; i < 6; i++) bell(PENTA[3 + (i % 5)] * 2, t + 0.55 + i * 0.06, 0.25, 0.03);
          break; }
        case "badge": [4, 5, 6, 7].forEach((k, i) => bell(PENTA[k], t + i * 0.07, 0.6, 0.08)); noise(t, 0.5, { from: 7000, to: 11000, q: 3, vol: 0.02, att: 0.1 }); break;
        case "toggle": bell(PENTA[2], t, 0.25, 0.1); bell(PENTA[4], t + 0.07, 0.3, 0.1); break;
        case "hello": { // Bilag'on qo'nganda: ikki chug'urlash + quvnoq kuy
          [0, 0.13].forEach(d => { tone(2300, t + d, 0.07, { vol: 0.05, to: 3300 }); tone(3100, t + d + 0.05, 0.06, { vol: 0.035, to: 2500 }); });
          [[0, 0.32], [2, 0.42], [4, 0.52], [3, 0.62], [5, 0.74]].forEach(([k, d]) => bell(PENTA[k], t + d, 0.45, 0.085));
          [261.63, 329.63, 392].forEach(f => tone(f, t + 0.74, 1.1, { type: "triangle", vol: 0.03, att: 0.04, rev: true }));
          break; }
        case "fanfare": { // bo'lim tugadi yoki yangi liga
          [[0, 0], [2, 0.12], [4, 0.24], [5, 0.36]].forEach(([k, d]) => { bell(PENTA[k], t + d, 0.4, 0.11); tone(PENTA[k] / 2, t + d, 0.3, { type: "triangle", vol: 0.04 }); });
          [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, t + 0.52 + i * 0.015, 1.8, { type: "triangle", vol: 0.04, att: 0.03, rev: true }));
          [130.81, 196].forEach(f => tone(f, t + 0.52, 1.6, { type: "sine", vol: 0.07, att: 0.02 }));
          for (let i = 0; i < 10; i++) bell(PENTA[2 + (i % 6)] * 2, t + 0.6 + i * 0.055, 0.25, 0.025);
          noise(t + 0.5, 0.9, { from: 6000, to: 11000, q: 2, vol: 0.025, att: 0.15 });
          break; }
        default: tone(660, t, 0.08, { vol: 0.08 });
      }
    } catch (e) { /* ovoz yo'q */ }
  }
  /* ---------- fon musiqasi: tinch, generativ (C-dur pentatonika) ---------- */
  let mGain = null, mWet = null, mTimer = null, mNext = 0, mStep = 0, mIdx = 3, mOff = null, mOsc = [];
  const CHORDS = [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]]; // C Am F G
  const HALF = 60 / 70 / 2;
  function mtone(f, at, dur, type, vol, att, rev) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, at);
    g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(vol, at + att); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(mGain); if (rev) g.connect(mWet); // aks-sado ham mGain orqali: o'chirganda darhol jim bo'ladi
    o.start(at); o.stop(at + dur + 0.05);
    mOsc.push(o); o.onended = () => { const k = mOsc.indexOf(o); if (k >= 0) mOsc.splice(k, 1); };
  }
  function musicTick() {
    while (mNext < ac.currentTime + 0.7) {
      const t = mNext, s = mStep % 8, ch = CHORDS[Math.floor(mStep / 8) % 4];
      if (s === 0) { ch.forEach(f => mtone(f, t, HALF * 9, "triangle", 0.022, 0.9, true)); mtone(ch[0] / 2, t, HALF * 7, "sine", 0.05, 0.08); }
      if (s === 4) mtone(ch[2] / 2, t, HALF * 3.5, "sine", 0.03, 0.08);
      if (s % 2 === 0 ? Math.random() < 0.6 : Math.random() < 0.18) {
        mIdx = Math.max(0, Math.min(7, mIdx + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
        const f = PENTA[mIdx]; mtone(f, t, 0.9, "sine", 0.03, 0.01, true); mtone(f * 2.01, t, 0.4, "sine", 0.008, 0.01);
      }
      mNext += HALF; mStep++;
    }
  }
  function musicStopNow() { // foydalanuvchi o'chirdi: shu zahoti jimlik
    try {
      clearInterval(mTimer); mTimer = null; clearTimeout(mOff); mOff = null;
      if (!mGain) return; const now = ac.currentTime;
      mGain.gain.cancelScheduledValues(now); mGain.gain.setValueAtTime(mGain.gain.value, now); mGain.gain.linearRampToValueAtTime(0.0001, now + 0.04);
      mOsc.splice(0).forEach(o => { try { o.stop(now + 0.05); } catch (e) { /* */ } });
    } catch (e) { /* */ }
  }
  function musicSync() {
    const want = !!S.music && !session && !document.hidden && !!S.onboarded;
    try {
      if (want) {
        audio(); if (ac.state !== "running") return; // brauzer ruxsat bermadi: birinchi bosishda qayta uriniladi
        if (!mGain) {
          mGain = ac.createGain(); mGain.gain.value = 0.0001; mGain.connect(master);
          const d = ac.createDelay(); d.delayTime.value = 0.23; const fb = ac.createGain(); fb.gain.value = 0.3;
          const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2200;
          mWet = ac.createGain(); mWet.gain.value = 0.3; mWet.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(mGain);
        }
        clearTimeout(mOff); mOff = null;
        if (!mTimer) { mNext = ac.currentTime + 0.1; mTimer = setInterval(musicTick, 150); musicTick(); }
        mGain.gain.cancelScheduledValues(ac.currentTime); mGain.gain.setTargetAtTime(0.6, ac.currentTime, 0.8);
      } else if (mTimer && mGain) {
        mGain.gain.cancelScheduledValues(ac.currentTime); mGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.35);
        clearTimeout(mOff); mOff = setTimeout(() => { clearInterval(mTimer); mTimer = null; }, 1800);
      }
    } catch (e) { /* ovoz yo'q */ }
  }
  document.addEventListener("visibilitychange", () => musicSync());
  document.addEventListener("pointerdown", () => { if (S && S.music && !mTimer) setTimeout(musicSync, 0); }, true);

  // har bir tugma bosilishiga mos ovoz (capture: element hali DOM'da)
  document.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    const a = b.dataset.act;
    if (a === "check" || a === "sound") return; // ular o'z ovozini chiqaradi
    if (a === "next") return sfx("swoosh");
    if (b.dataset.start) return sfx("start");
    if (b.matches(".opt")) return sfx("select");
    if (b.dataset.pos !== undefined) return sfx("unpop");
    if (b.matches(".blk, [data-ins], [data-l], [data-r]")) return sfx("pop");
    sfx("tap");
  }, true);
  document.addEventListener("keydown", e => {
    const tg = e.target; if (!tg || !/^(TEXTAREA|INPUT)$/.test(tg.tagName)) return;
    const now = performance.now(); if (now - lastKey < 28) return; lastKey = now;
    if (e.key === "Backspace" || e.key === "Delete") sfx("keydel"); else if (e.key.length === 1 || e.key === "Enter" || e.key === "Tab") sfx("key");
  }, true);

  /* ---------- SQL engine ---------- */
  let sqlP = null;
  function loadSQL() {
    if (sqlP) return sqlP;
    const urls = ["https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-asm.js", "https://unpkg.com/sql.js@1.10.3/dist/sql-asm.js"];
    sqlP = new Promise((res, rej) => {
      const tryAt = i => {
        if (i >= urls.length) { sqlP = null; return rej(new Error("SQL dvigatelini yuklab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.")); }
        const s = document.createElement("script"); s.src = urls[i]; s.async = true;
        s.onload = () => window.initSqlJs().then(res, () => tryAt(i + 1));
        s.onerror = () => { s.remove(); tryAt(i + 1); };
        document.head.appendChild(s);
      };
      if (window.initSqlJs) window.initSqlJs().then(res, rej); else tryAt(0);
    });
    return sqlP;
  }
  function newDb(SQL) {
    const db = new SQL.Database();
    for (const [t, { cols, rows }] of Object.entries(DATA)) {
      const types = cols.map((c, i) => typeof rows[0][i] === "number" ? "INTEGER" : "TEXT");
      db.run(`CREATE TABLE ${t} (${cols.map((c, i) => c + " " + types[i]).join(", ")})`);
      const st = db.prepare(`INSERT INTO ${t} VALUES (${cols.map(() => "?").join(",")})`); rows.forEach(r => st.run(r)); st.free();
    }
    return db;
  }
  async function runSQL(sql) {
    const SQL = await loadSQL(); const db = newDb(SQL);
    try { const r = db.exec(sql); const last = r[r.length - 1]; return last ? { cols: last.columns, rows: last.values } : { cols: [], rows: [] }; }
    finally { db.close(); }
  }
  const sqlErr = m => {
    m = String(m || "");
    let hint = "";
    if (/no such table/i.test(m)) hint = "Bunday jadval yo'q. Jadval nomini tekshiring.";
    else if (/no such column/i.test(m)) hint = "Bunday ustun yo'q. Ustun nomini tekshiring.";
    else if (/syntax error/i.test(m)) hint = "Sintaksis xatosi: kalit so'zlar, vergul va tartibni tekshiring.";
    else if (/incomplete input/i.test(m)) hint = "So'rov to'liq emas.";
    return (hint ? hint + "\n" : "") + "SQLite: " + m;
  };
  const norm = rows => rows.map(r => r.map(v => typeof v === "number" ? Math.round(v * 1e6) / 1e6 : typeof v === "string" ? v.trim() : v));
  function sameResult(a, b, ordered) {
    if (a.cols.length !== b.cols.length || a.rows.length !== b.rows.length) return false;
    let x = norm(a.rows).map(r => JSON.stringify(r)), y = norm(b.rows).map(r => JSON.stringify(r));
    if (!ordered) { x.sort(); y.sort(); }
    return x.every((v, i) => v === y[i]);
  }

  /* ---------- Python engine (Pyodide, Web Worker ichida) ---------- */
  const PYO = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  const PY_HELPER = String.raw`
import ast, io, sys, json, math, contextlib

def _yt_run(src, out):
    g = {"__name__": "__main__"}
    tree = ast.parse(src, "<kod>")
    last = None
    if tree.body and isinstance(tree.body[-1], ast.Expr):
        last = ast.Expression(tree.body.pop().value)
    val = None
    with contextlib.redirect_stdout(out):
        exec(compile(tree, "<kod>", "exec"), g)
        if last is not None:
            val = eval(compile(last, "<kod>", "eval"), g)
    return g, val

def _yt_cell(v):
    np = sys.modules.get("numpy")
    if np is not None and isinstance(v, np.generic):
        v = v.item()
    if isinstance(v, float):
        if math.isnan(v):
            return None
        return round(v, 6)
    if v is None or isinstance(v, (bool, int, str)):
        return v
    return str(v)

def _yt_frame(v):
    pd = sys.modules.get("pandas")
    if pd is None:
        return None
    if isinstance(v, pd.Series):
        v = v.to_frame(name=v.name if v.name is not None else "qiymat")
    if isinstance(v, pd.DataFrame):
        if isinstance(v.index, pd.MultiIndex) or v.index.name is not None:
            v = v.reset_index()
        cols = [str(c) for c in v.columns]
        rows = [[_yt_cell(x) for x in r] for r in v.itertuples(index=False, name=None)]
        return cols, rows
    return None

def _yt_norm(x):
    f = _yt_frame(x)
    if f is not None:
        return ("t", f)
    if isinstance(x, (list, tuple)):
        return ("l", [_yt_cell(i) for i in x])
    return ("v", _yt_cell(x))

def _yt_eq(a, b):
    num = lambda z: isinstance(z, (int, float)) and not isinstance(z, bool)
    if num(a) and num(b):
        return abs(a - b) <= 1e-6 * max(1, abs(b))
    if isinstance(a, str) and isinstance(b, str):
        return a.strip() == b.strip()
    return a == b

def _yt_rows_eq(ra, rb):
    return all(len(x) == len(y) and all(_yt_eq(p, q) for p, q in zip(x, y)) for x, y in zip(ra, rb))

def _yt_same(a, b, ordered):
    if a[0] != b[0]:
        return False
    if a[0] == "t":
        (ca, ra), (cb, rb) = a[1], b[1]
        if len(ca) != len(cb) or len(ra) != len(rb):
            return False
        if not ordered:
            k = lambda r: json.dumps(r, default=str)
            ra, rb = sorted(ra, key=k), sorted(rb, key=k)
        return _yt_rows_eq(ra, rb)
    if a[0] == "l":
        return len(a[1]) == len(b[1]) and _yt_rows_eq([a[1]], [b[1]])
    return _yt_eq(a[1], b[1])

def _yt_short(n):
    if n[0] == "t":
        return "%d qator (%s)" % (len(n[1][1]), ", ".join(n[1][0]))
    return str(n[1])

def _yt_show(x):
    f = _yt_frame(x)
    if f is not None:
        return {"table": {"cols": f[0], "rows": f[1][:50], "n": len(f[1])}}
    if isinstance(x, (list, tuple, dict, set)):
        return {"val": repr(x)[:2000]}
    c = _yt_cell(x)
    return {"val": repr(c) if isinstance(c, str) else str(c)}

def yt_exec(src, sol, var, ordered):
    res = {"out": "", "ok": False}
    out = io.StringIO()
    try:
        g, val = _yt_run(src, out)
    except SyntaxError as e:
        res["out"] = out.getvalue()[:4000]
        res["error"] = {"type": type(e).__name__, "msg": str(e.msg), "line": e.lineno}
        return json.dumps(res, default=str)
    except BaseException as e:
        line, tb = None, e.__traceback__
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == "<kod>":
                line = tb.tb_lineno
            tb = tb.tb_next
        res["out"] = out.getvalue()[:4000]
        res["error"] = {"type": type(e).__name__, "msg": str(e), "line": line}
        return json.dumps(res, default=str)
    res["out"] = out.getvalue()[:4000]
    shown = g[var] if var and var in g else val
    if shown is not None:
        res.update(_yt_show(shown))
        if var and var in g:
            res["name"] = var
    if sol:
        o2 = io.StringIO()
        gs, vs = _yt_run(sol, o2)
        if var:
            if var not in g:
                res["missing"] = var
            else:
                a, b = _yt_norm(g[var]), _yt_norm(gs[var])
                res["ok"] = _yt_same(a, b, ordered)
                res["got"], res["exp"] = _yt_short(a), _yt_short(b)
        else:
            res["ok"] = out.getvalue().strip() == o2.getvalue().strip()
            res["got"], res["exp"] = out.getvalue().strip()[:200], o2.getvalue().strip()[:200]
    return json.dumps(res, default=str)
`;
  const PY_WORKER = `let py=null;
self.onmessage=async e=>{const m=e.data;try{
if(m.op==="init"){importScripts(m.base+"pyodide.js");py=await loadPyodide({indexURL:m.base});for(const n in m.files)py.FS.writeFile(n,m.files[n]);py.runPython(m.helper);postMessage({id:m.id,ok:true});}
else if(m.op==="pkgs"){await py.loadPackage(m.pkgs);postMessage({id:m.id,ok:true});}
else if(m.op==="run"){await py.loadPackagesFromImports(m.src);const f=py.globals.get("yt_exec");const r=f(m.src,m.sol||"",m.v||"",!!m.ord);f.destroy();postMessage({id:m.id,ok:true,res:r});}
}catch(err){postMessage({id:m.id,ok:false,err:String(err&&err.message||err)});}};`;
  let pyW = null, pyP = null, pdP = null, pyReady = false, pySeq = 0; const pyCb = {};
  function pyKill() {
    if (pyW) pyW.terminate(); pyW = null; pyP = null; pdP = null; pyReady = false;
    for (const k in pyCb) { pyCb[k].rej(new Error("to'xtatildi")); delete pyCb[k]; }
  }
  function pyCall(msg, ms) {
    return new Promise((res, rej) => {
      if (!pyW) return rej(new Error("Python ishga tushmagan"));
      const id = ++pySeq;
      const t = setTimeout(() => { delete pyCb[id]; pyKill(); rej(Object.assign(new Error("timeout"), { timeout: true })); }, ms);
      pyCb[id] = { res: v => { clearTimeout(t); res(v); }, rej: e => { clearTimeout(t); rej(e); } };
      pyW.postMessage(Object.assign({ id }, msg));
    });
  }
  const csvOf = t => { const q = v => v === null ? "" : typeof v === "string" && /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : String(v); return [t.cols.join(",")].concat(t.rows.map(r => r.map(q).join(","))).join("\n") + "\n"; };
  function loadPy() {
    if (pyP) return pyP;
    const p = pyP = (async () => {
      pyW = new Worker(URL.createObjectURL(new Blob([PY_WORKER], { type: "text/javascript" })));
      pyW.onmessage = e => { const m = e.data, cb = pyCb[m.id]; if (!cb) return; delete pyCb[m.id]; m.ok ? cb.res(m.res) : cb.rej(new Error(m.err)); };
      pyW.onerror = e => { if (e.preventDefault) e.preventDefault(); const err = new Error(e.message || "Python xatosi"); for (const k in pyCb) { pyCb[k].rej(err); delete pyCb[k]; } };
      const files = {}; for (const [t, d] of Object.entries(DATA)) files[t + ".csv"] = csvOf(d);
      await pyCall({ op: "init", base: PYO, files, helper: PY_HELPER }, 180000);
      pyReady = true;
    })();
    p.catch(() => { if (pyP === p) pyKill(); });
    return p;
  }
  const needsPd = s => /\b(import\s+pandas|from\s+pandas)\b/.test(s || "");
  function loadPd() {
    if (pdP) return pdP;
    const p = pdP = loadPy().then(() => pyCall({ op: "pkgs", pkgs: ["pandas"] }, 180000));
    p.catch(() => { if (pdP === p) pdP = null; });
    return p;
  }
  function pyWarm(steps) {
    const ps = steps.filter(s => s.t === "py"); if (!ps.length) return;
    (ps.some(s => needsPd(s.solution)) ? loadPd() : loadPy()).catch(() => { });
  }
  async function runPy(src, sol, v, ord) {
    try { await (needsPd(src) || needsPd(sol) ? loadPd() : loadPy()); }
    catch (e) { throw Object.assign(new Error("Python yuklanmadi. Internetni tekshirib, qayta urinib ko'ring."), { load: true }); }
    try { return JSON.parse(await pyCall({ op: "run", src, sol, v, ord }, 20000)); }
    catch (e) { if (e.timeout) return { out: "", error: { type: "Timeout", msg: "Kod juda uzoq ishladi, cheksiz sikl bo'lishi mumkin. Python qayta ishga tushiriladi." } }; throw e; }
  }
  const pyErr = e => {
    const m = String(e.msg || ""); let h = "";
    const nm = (/'([^']+)'/.exec(m) || [])[1];
    if (e.type === "Timeout") return m;
    if (nm && /^_+$/.test(nm)) return "___ o'rniga kod yozing.";
    if (e.type === "NameError") h = `Bunday nom topilmadi${nm ? `: ${nm}` : ""}. O'zgaruvchi yoki funksiya nomini tekshiring (katta-kichik harf ham muhim).`;
    else if (e.type === "KeyError") h = `Bunday ustun yoki kalit yo'q${nm ? `: ${nm}` : ""}. Ustun nomini qo'shtirnoq ichida aniq yozing.`;
    else if (e.type === "IndentationError" || e.type === "TabError") h = "Chekinish xatosi: blok ichidagi qatorlar bir xil (4 ta bo'sh joy) surilgan bo'lsin.";
    else if (e.type === "SyntaxError") h = "Sintaksis xatosi: qavslar, qo'shtirnoq, ikki nuqta (:) va = belgisini tekshiring.";
    else if (e.type === "AttributeError") h = "Bunday metod yoki xususiyat yo'q. Nomini tekshiring (masalan, .mean(), .sum()).";
    else if (e.type === "TypeError") h = "Turlar mos emas: masalan, matn bilan sonni qo'shib bo'lmaydi yoki funksiyaga noto'g'ri argument berildi.";
    else if (e.type === "ZeroDivisionError") h = "Nolga bo'lib bo'lmaydi.";
    else if (e.type === "FileNotFoundError") h = "Fayl topilmadi. Fayl nomini tekshiring, masalan \"safarlar.csv\".";
    else if (e.type === "ModuleNotFoundError") h = "Bunday kutubxona topilmadi. Bu yerda pandas va numpy mavjud.";
    return (h ? h + "\n" : "") + `${e.type}${e.line ? ` (${e.line}-qator)` : ""}: ${m}`;
  };

  /* ---------- visuals ---------- */
  function tableHTML(t, extraCls = "") {
    return `<div class="tblwrap ${extraCls}"><table class="t"><thead><tr>${t.cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${t.rows.map((r, i) => `<tr class="${t.hlRow === i ? "hl" : ""}">${r.map(v => `<td>${v === null ? '<i style="color:var(--muted)">NULL</i>' : fmt(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function inRange(ref, hl) {
    if (!hl) return false; const parse = r => { const m = /^([A-Z]+)(\d+)$/.exec(r); return [m[1].charCodeAt(0) - 65, +m[2]]; };
    if (!hl.includes(":")) return ref === hl;
    const [a, b] = hl.split(":").map(parse), [c, r] = parse(ref);
    return c >= Math.min(a[0], b[0]) && c <= Math.max(a[0], b[0]) && r >= Math.min(a[1], b[1]) && r <= Math.max(a[1], b[1]);
  }
  function sheetHTML(sh, opt = {}) {
    const grid = [sh.header].concat(sh.rows); const ncol = sh.header.length;
    let h = `<div class="sheetwrap"><table class="sheet"><thead><tr><th></th>${Array.from({ length: ncol }, (_, c) => `<th>${F.colName(c)}</th>`).join("")}</tr></thead><tbody>`;
    grid.forEach((row, ri) => {
      h += `<tr class="${ri === 0 ? "h" : ""}"><th>${ri + 1}</th>`;
      for (let c = 0; c < ncol; c++) {
        const ref = F.colName(c) + (ri + 1); let v = row[c]; let cls = typeof v === "number" ? "n" : "";
        if (inRange(ref, opt.hl)) cls += " hl";
        if (opt.formula && opt.formula[0] === ref) { const r = F.evaluate(opt.formula[1], sh); v = r.ok ? r.value : "#?"; cls += " tg"; cls += typeof v === "number" ? " n" : ""; }
        if (opt.target === ref) { cls += " tg" + (opt.err ? " err" : ""); v = opt.preview !== undefined ? opt.preview : "?"; if (typeof v === "number") cls += " n"; }
        h += `<td class="${cls}" ${opt.target === ref ? 'id="tgcell"' : ""}>${v === "" || v == null ? "" : fmt(v)}</td>`;
      }
      h += "</tr>";
    });
    return h + "</tbody></table></div>";
  }
  function visualHTML(v) {
    if (!v) return "";
    if (v.table) return tableHTML(v.table);
    if (v.sheet) return (v.formula ? `<div class="fx"><span class="cell">${v.formula[0]}</span><em>fx</em><span>${hlCode(v.formula[1])}</span></div>` : "") + sheetHTML(v.sheet, { hl: v.hl, formula: v.formula });
    if (v.code) return `<pre class="code">${hlCode(v.code)}</pre>` + (v.result ? `<div class="out"><span class="meta">Natija:</span>${tableHTML(v.result)}</div>` : "");
    if (v.chips) return `<div class="chips">${v.chips.map(c => `<span class="chip">${esc(c)}</span>`).join("")}</div>`;
    if (v.cycle) return `<div class="cycle">${v.cycle.map((c, i) => `<span class="chip">${esc(c)}</span>${i < v.cycle.length - 1 ? '<span class="arr">→</span>' : ""}`).join("")}</div>`;
    if (v.bars) { const mx = Math.max(...v.bars.map(b => b[1])); return `<div class="bars">${v.bars.map(b => `<div class="b"><small>${fmt(b[1])}</small><i style="height:${Math.max(4, b[1] / mx * 100) * 0.72}%"></i><span>${esc(b[0])}</span></div>`).join("")}</div>${v.unit ? `<div class="bars-unit">Birlik: ${esc(v.unit)}</div>` : ""}`; }
    if (v.kpis) return `<div class="kpis">${v.kpis.map(k => `<div class="kpi"><span>${esc(k[0])}</span><b>${esc(k[1])}</b><small>${esc(k[2])}</small></div>`).join("")}</div>`;
    if (v.pivot) return `<div class="pivot${v.pivot.raw.cols.length + v.pivot.out.cols.length > 4 ? " wide" : ""}">${tableHTML(v.pivot.raw)}<span class="arrow">→</span>${tableHTML(v.pivot.out)}</div>`;
    if (v.charts) return `<div class="charts">${v.charts.map(k => `<div class="chartcard">${miniChart(k)}<span>${CHART_LABEL[k]}</span></div>`).join("")}</div>`;
    return "";
  }

  /* ---------- UI shell ---------- */
  let tab = "home", openLesson = null, session = null, modal = null;
  function ring() {
    const g = S.goal || 20, p = Math.min(1, S.todayXp / g), C = 2 * Math.PI * 14;
    return `<div class="ring" title="Kunlik maqsad: ${S.todayXp}/${g} XP"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" fill="none" stroke="var(--surface-2)" stroke-width="5"/><circle cx="17" cy="17" r="14" fill="none" stroke="var(--sun)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(p * C).toFixed(1)} ${C.toFixed(1)}"/></svg><b>${p >= 1 ? "✓" : Math.round(p * 100) + "%"}</b></div>`;
  }
  const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === "dark" : !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); };
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("yt_theme", t); } catch (e) { }
  }
  function topbar() {
    return `<header class="topbar"><div class="wrap">
      <div class="brand">Yetakla</div>
      <div class="tgrp stats3">
      <button class="stat fire ${S.streak ? "" : "off"}" data-act="streak" title="Ketma-ket kunlar" aria-label="Ketma-ket kunlar: ${S.streak}. Kalendarni ochish">🔥 ${S.streak}</button>
      <span class="stat xp" title="Jami XP: ${S.xp}">⚡ ${S.xp >= 10000 ? (Math.floor(S.xp / 100) / 10).toString().replace(".", ",") + "K" : S.xp}</span>
      <span class="stat hp" title="Jonlar">❤️ ${S.hearts}</span>
      </div>
      <div class="tgrp ctl">
      <button class="mus thm" data-act="theme" aria-label="${isDark() ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}" title="${isDark() ? "Yorug' rejim" : "Qorong'i rejim"}">${isDark() ? I.sun : I.moon}</button>
      <button class="mus ${S.music ? "on" : ""}" data-act="music" aria-label="Fon musiqasi: ${S.music ? "yoqiq" : "o'chiq"}" title="Fon musiqasi">${I.music}</button>
      </div>
      ${ring()}
    </div></header>`;
  }
  function tabbar() {
    const t = (id, ic, label) => `<button class="tab ${tab === id ? "on" : ""}" data-tab="${id}">${I[ic]}<span>${label}</span></button>`;
    return `<nav class="tabbar"><div class="in">${t("home", "home", "Asosiy")}${t("map", "map", "Xarita")}${t("rank", "trophy", "Reyting")}${t("profile", "user", "Profil")}</div></nav>`;
  }
  const OFFS = [0, 52, 84, 52, 0, -52, -84, -52];
  function mapHTML() {
    const poolN = dueIds().length;
    let h = `<div class="map wrap"><div class="maphead"><button class="back" data-tab="home" aria-label="Asosiyga qaytish">${I.back}<span>Asosiy</span></button><b>Data analitika</b></div>`;
    h += `<div class="practice-cta">${I.repeat.replace("<svg", '<svg style="width:30px;height:30px;color:var(--sky);flex:none"')}<p><b>Takrorlash mashqi</b>${poolN ? `${poolN} ta xato savol sizni kutyapti. Har to'g'ri javob +1 ❤️` : "O'tilgan darslardan savollar. Har to'g'ri javob +1 ❤️"}</p><button class="btn sky sm" data-act="practice">Boshlash</button></div>`;
    COURSE.forEach((sec, si) => {
      const locked = sec.soon; const nDone = sec.lessons.filter(l => isDone(l.id)).length;
      h += `<section><div class="banner ${locked ? "locked" : ""}" style="background:${sec.color}"><div class="t"><div class="eyebrow">${si}-bo'lim</div><h2>${esc(sec.title)}</h2><p>${esc(sec.desc)}</p></div>${!locked && si > 0 && sec.lessons.length && lessonState(LESSONS.findIndex(x => x.l.id === sec.lessons[0].id)) === "locked" ? `<button class="pill jump" data-skip="${sec.id}" aria-label="Sinov bilan ${si}-bo'limga sakrash">⏩ Sakrash</button>` : `<span class="pill">${locked ? "🔒 Tez kunda" : `${nDone}/${sec.lessons.length}`}</span>`}</div><div class="path">`;
      if (si < 2) h += `<div class="side-mascot ${si ? "r" : "l"}" style="top:${si ? 70 : 24}%">${mascot(si ? "think" : "happy", "float")}</div>`;
      sec.lessons.forEach((l, li) => {
        const idx = LESSONS.findIndex(x => x.l.id === l.id); const st = lessonState(idx);
        const icon = st === "done" ? I.check : (st === "locked" || st === "soon") ? I.lock : l.boss ? I.crown : I.star;
        const cls = ["node", l.boss ? "boss" : "", st === "current" ? "current" : "", st === "locked" || st === "soon" ? "locked" : ""].join(" ");
        h += `<div class="node-row"><div class="nw" style="transform:translateX(${OFFS[li % 8]}px);--c:${sec.color}">${st === "current" ? '<span class="bubble">BOSHLASH</span>' : ""}<button class="${cls}" style="${st === "locked" || st === "soon" ? "" : "--c:" + sec.color}" data-lesson="${l.id}" aria-label="${esc(l.title)}">${icon}</button><div class="node-label ${st === "current" ? "on" : ""}">${esc(l.title)}</div></div>`;
        if (openLesson === l.id) {
          if (st === "done" || st === "current") {
            const d = S.done[l.id]; const n = l.steps.filter(s => s.t !== "theory").length;
            h += `<div class="pop" style="--c:${sec.color}"><h3>${esc(l.title)}</h3><p>${esc(l.goal || "")}${d ? ` · eng yaxshi aniqlik: ${d.acc}%` : ` · ${n} ta mashq`}</p><button class="btn white" style="--c:${sec.color}" data-start="${l.id}">${st === "done" ? "Qaytadan o'tish +5 XP" : l.boss ? "Bossni boshlash" : "Boshlash +10 XP"}</button></div>`;
          } else {
            h += `<div class="pop locked"><h3>${esc(l.title)}</h3><p>${st === "soon" ? "Bu dars tez orada qo'shiladi." : "Avvalgi darslarni tugatib, bu darsni oching."}</p></div>`;
          }
        }
        h += `</div>`;
      });
      h += `</div></section>`;
    });
    return h + `</div>`;
  }
  function badgesHTML() {
    const ti = TIERS.reduce((a, t, i) => S.xp >= t[1] ? i : a, 0); const cur = TIERS[ti], nxt = TIERS[ti + 1];
    const pct = nxt ? Math.round((S.xp - cur[1]) / (nxt[1] - cur[1]) * 100) : 100;
    return `<h3 class="ph">Yutuqlar</h3>
      <div class="card league"><svg class="medal" viewBox="0 0 58 58"><path d="M17 2h10l4 14H21zM31 2h10l-4 14h-10z" fill="var(--sky)"/><circle cx="29" cy="36" r="19" fill="${cur[2]}"/><circle cx="29" cy="36" r="13" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>${I.star.replace('<svg viewBox="0 0 24 24"', '<svg x="19" y="26" width="20" height="20" viewBox="0 0 24 24"').replace('fill="currentColor"', 'fill="#fff"')}</svg>
        <div class="info"><b>${cur[0]} liga</b><span>${nxt ? `${nxt[0]} ligasiga ${nxt[1] - S.xp} XP qoldi` : "Eng yuqori liga!"}</span><div class="bar"><i style="width:${pct}%"></i></div><div class="tiers">${TIERS.map((t, i) => `<span class="${i === ti ? "on" : ""}">${t[0]}</span>`).join("")}</div></div></div>
      <h3>Nishonlar · ${Object.keys(S.badges).length}/${BADGES.length}</h3>
      <div class="badges">${BADGES.slice().sort((a, b) => (S.badges[b.id] ? 1 : 0) - (S.badges[a.id] ? 1 : 0)).slice(0, allBadges ? 99 : 4).map(b => `<div class="badge ${S.badges[b.id] ? "" : "off"}" style="--c:${b.c}"><span class="ic">${S.badges[b.id] ? I[b.ic] : I.lock}</span><b>${esc(b.name)}</b><small>${esc(b.desc)}</small></div>`).join("")}</div>
      <button class="btn ghost sm more" data-act="badges-all">${allBadges ? "Kamroq ko'rsatish" : `Barcha nishonlar (${BADGES.length})`}</button>`;
  }
  const myName = () => { const C = window.DY_CLOUD, u = C && C.user(); return String(S.name || (u && u.displayName) || "").trim(); };
  let allBadges = false;
  // Profil rasmi: qurilmada kichraytirilgan JPEG (data:) yoki Google rasmi (https)
  const okPhoto = p => { p = String(p || ""); return /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) || /^https:\/\/lh\d\.googleusercontent\.com\/[^"'<>\s]*$/.test(p) ? p : ""; };
  const photoSrc = () => okPhoto(S.photo);
  // Rasm o'rniga hayvon emojisi: profilda katta emoji, reyting uchun 64px rasmga chiziladi
  const ANIMALS = [["🦊", "#ffd8b8"], ["🐼", "#e3e8ec"], ["🐨", "#dfe3f0"], ["🦁", "#ffe6a8"], ["🐯", "#ffdcb0"], ["🐸", "#d3f2cf"], ["🐵", "#f1dcc8"], ["🦉", "#e8dccd"], ["🐧", "#d6e6f7"], ["🐰", "#fbe0ea"], ["🐻", "#ead7c5"], ["🐱", "#fdebc8"], ["🐶", "#f4e1cf"], ["🦄", "#efdcf7"], ["🐢", "#d7efd9"], ["🐬", "#d2ecf7"], ["🐝", "#fff0b3"], ["🐙", "#fbd9de"]];
  const emoOf = v => { const m = /^emo:(.+)$/.exec(String(v || "")); return m && ANIMALS.find(a => a[0] === m[1]) || null; };
  function editPhoto() {
    const C = window.DY_CLOUD, u = C && C.user(), g = u && u.photoURL && /^https:\/\/lh\d\.googleusercontent\.com\//.test(u.photoURL) ? u.photoURL : "";
    const m = document.createElement("div"); m.className = "sheet-modal";
    m.innerHTML = `<div class="card" role="dialog" aria-label="Profil rasmi"><h3>Profil rasmi</h3><p class="muted" style="font-size:15px">Profilingizda va reytingda ko'rinadi. Rasm kvadrat shaklda kesib, kichraytirib saqlanadi.</p>
      <label class="btn"><input type="file" id="phin" accept="image/*" hidden>Rasm tanlash</label>
      <div class="emo-head">yoki hayvon tanlang</div>
      <div class="emo-grid">${ANIMALS.map(a => `<button data-emo="${a[0]}" class="${S.photo === "emo:" + a[0] ? "on" : ""}" style="background:${a[1]}" aria-label="Hayvon belgisi">${a[0]}</button>`).join("")}</div>
      ${g ? `<button class="btn ghost" data-act="photo-google">Google rasmini qo'yish</button>` : ""}
      ${photoSrc() || emoOf(S.photo) ? `<button class="btn ghost red-t" data-act="photo-del">Rasmni olib tashlash</button>` : ""}
      <small id="pherr" class="nm-err"></small>
      <button class="btn ghost" data-act="close-simple">Bekor qilish</button></div>`;
    m.addEventListener("click", e => { if (e.target === m || e.target.closest('[data-act="close-simple"]')) m.remove(); });
    document.body.appendChild(m);
    m.querySelector("#phin").addEventListener("change", e => { const f = e.target.files && e.target.files[0]; if (f) loadPhoto(f); });
  }
  function loadPhoto(f) {
    const err = document.getElementById("pherr");
    if (!/^image\//.test(f.type)) { if (err) err.textContent = "Bu rasm fayli emas."; return; }
    if (f.size > 15e6) { if (err) err.textContent = "Rasm juda katta (15 MB dan oshmasin)."; return; }
    if (err) { err.style.color = "var(--muted)"; err.textContent = "Tayyorlanmoqda…"; }
    const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => {
      const N = 192, side = Math.min(im.naturalWidth, im.naturalHeight), cv = document.createElement("canvas"); cv.width = cv.height = N;
      const x = cv.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, N, N);
      x.drawImage(im, (im.naturalWidth - side) / 2, (im.naturalHeight - side) / 2, side, side, 0, 0, N, N);
      URL.revokeObjectURL(url);
      let q = 0.85, d = cv.toDataURL("image/jpeg", q); while (d.length > 40000 && q > 0.4) { q -= 0.15; d = cv.toDataURL("image/jpeg", q); }
      setPhoto(d);
    };
    im.onerror = () => { URL.revokeObjectURL(url); if (err) { err.style.color = ""; err.textContent = "Rasmni ochib bo'lmadi. Boshqa rasm tanlang (JPG yoki PNG)."; } };
    im.src = url;
  }
  // Reyting uchun kichik nusxa (64px), Google rasmi uchun kichik o'lcham havolasi
  function thumbOf(v) {
    return new Promise(res => {
      if (!v) return res("");
      const em = emoOf(v);
      if (em) { const cv = document.createElement("canvas"); cv.width = cv.height = 64; const x = cv.getContext("2d"); x.fillStyle = em[1]; x.fillRect(0, 0, 64, 64); x.font = '40px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(em[0], 32, 35); return res(cv.toDataURL("image/jpeg", 0.8)); }
      if (/^https:/.test(v)) return res(v.replace(/=s\d+(-c)?$/, "") + "=s96-c");
      const im = new Image(); im.onload = () => { const cv = document.createElement("canvas"); cv.width = cv.height = 64; cv.getContext("2d").drawImage(im, 0, 0, 64, 64); res(cv.toDataURL("image/jpeg", 0.72)); }; im.onerror = () => res(""); im.src = v;
    });
  }
  async function setPhoto(v) { S.photo = v; S.photoSm = await thumbOf(v); S.photoAt = Date.now(); save(); if (window.DY_CLOUD && window.DY_CLOUD.nameChanged) window.DY_CLOUD.nameChanged(); document.querySelectorAll(".sheet-modal").forEach(x => x.remove()); renderHome(); toastNow(v ? (emoOf(v) ? "Belgi saqlandi" : "Rasm saqlandi") : "Rasm olib tashlandi", emoOf(v) ? emoOf(v)[0] : "📷"); }
  function profileHTML() {
    const C = window.DY_CLOUD, u = C && C.user(), nm = myName();
    const ti = TIERS.reduce((a, t, i) => S.xp >= t[1] ? i : a, 0), cur = TIERS[ti];
    const seg = (v, n) => `<button class="${S.goal === v ? "on" : ""}" data-goal="${v}"><b>${n}</b><small>${v} XP</small></button>`;
    const row = (title, sub, ctl) => `<div class="srow"><span class="st"><b>${title}</b>${sub ? `<small>${sub}</small>` : ""}</span>${ctl}</div>`;
    const tile = (ic, v, l) => `<div class="pst"><span class="pi">${ic}</span><b>${v}</b><small>${l}</small></div>`;
    return `<div class="page wrap prof">
      <div class="phero">
        <button class="pav" data-act="photo-edit" style="--t:${cur[2]}" aria-label="Profil rasmini o'zgartirish">${photoSrc() ? `<img src="${esc(photoSrc())}" alt="" referrerpolicy="no-referrer">` : emoOf(S.photo) ? `<span class="emo" style="background:${emoOf(S.photo)[1]}">${emoOf(S.photo)[0]}</span>` : nm ? esc(nm[0].toUpperCase()) : mascot("happy")}<span class="cam">📷</span></button>
        <button class="pname" data-act="name-edit"><span class="nm ${nm ? "" : "empty"}">${nm ? esc(nm) : "Ismingizni kiriting"}</span><span class="pen">${I.pen}</span></button>
        <div class="pmeta"><span class="tier" style="--t:${cur[2]}">${cur[0]} liga</span><span class="acct ${u ? "on" : ""}">${u ? "Hisob ulangan ✓" : "Mehmon rejimi"}</span></div>
      </div>
      <div class="pstats">${tile("⚡", S.xp, "Jami XP")}${tile("🔥", S.streak, "Joriy olov")}${tile("📚", S.lessonsDone, "Darslar")}${tile("🏆", S.bestStreak, "Rekord olov")}</div>
      ${C ? C.card() : ""}
      ${friendsCard()}
      ${portfolioCard()}
      <h3 class="ph">Sozlamalar</h3>
      <div class="card setlist">
        <div class="srow col"><span class="st"><b>Kunlik maqsad</b><small>Har kuni qancha o'qiysiz?</small></span><div class="gseg">${seg(20, "Yengil")}${seg(50, "Jiddiy")}${seg(100, "Kuchli")}</div></div>
        ${row("Ovoz effektlari", "", `<button class="switch ${S.sound ? "on" : ""}" data-act="sound" aria-label="Ovoz effektlari"></button>`)}
        ${row("Fon musiqasi", "Asosiy sahifa va xaritada tinch kuy", `<button class="switch ${S.music ? "on" : ""}" data-act="music" aria-label="Fon musiqasi"></button>`)}
        ${tgRow(row)}
        ${canInstall() ? row("Telefonga o'rnatish", "Ilovadek ochiladi, internetsiz ham ishlaydi", `<button class="btn sm" data-act="install">O'rnatish</button>`) : ""}
      </div>
      ${badgesHTML()}
      <div class="card about"><b>Kurs haqida</b><p class="muted">11 bo'lim: analitik fikrlash → Excel → statistika → SQL → tozalash → Power BI → Tableau va Superset → Python → AI → karyera. Barcha misollar to'qima ma'lumotlar. ${u ? "Progress hisobingizda saqlanadi." : "Progress shu brauzerda saqlanadi."}</p>
        <div class="row">${modal === "reset" ? `<button class="btn red sm" data-act="reset-yes">Ha, hammasini o'chir</button><button class="btn ghost sm" data-act="reset-no">Bekor</button>` : `<button class="btn ghost sm" data-act="reset">Progressni tozalash</button>`}</div></div>
    </div>`;
  }
  function editName() {
    const m = document.createElement("div"); m.className = "sheet-modal";
    m.innerHTML = `<div class="card" role="dialog" aria-label="Ismni o'zgartirish"><h3>Ism va familiya</h3><p class="muted" style="font-size:15px">Profilda, reytingda va ulashilgan rasmlarda shu ism ko'rinadi. Reytingda familiyaning faqat bosh harfi chiqadi.</p>
      <input id="nmin" class="nm-in" maxlength="30" autocomplete="name" autocapitalize="words" placeholder="Masalan: Aziz Karimov" value="${esc(myName())}">
      <small id="nmerr" class="nm-err"></small>
      <button class="btn" data-act="name-save">Saqlash</button><button class="btn ghost" data-act="close-simple">Bekor qilish</button></div>`;
    m.addEventListener("click", e => { if (e.target === m || e.target.closest('[data-act="close-simple"]')) m.remove(); });
    document.body.appendChild(m);
    const inp = m.querySelector("#nmin"); inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); saveName(); } });
    setTimeout(() => { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }, 60);
  }
  function saveName() {
    const inp = document.getElementById("nmin"), err = document.getElementById("nmerr"); if (!inp) return;
    const v = inp.value.replace(/<[^>]*>/g, "").replace(/[<>"`{}\[\]\\/@#$%^*=+|~0-9_]/g, "").replace(/\s+/g, " ").trim();
    if (v.length < 2) { err.textContent = "Kamida 2 ta harf kiriting."; inp.focus(); return; }
    S.name = v.slice(0, 30); save(); document.querySelectorAll(".sheet-modal").forEach(x => x.remove());
    if (window.DY_CLOUD && window.DY_CLOUD.nameChanged) window.DY_CLOUD.nameChanged();
    renderHome(); toastNow("Ism saqlandi", "✏️");
  }
  function nextLesson() { const i = LESSONS.findIndex((x, k) => lessonState(k) === "current"); return i < 0 ? null : LESSONS[i]; }
  function homeHTML() {
    const real = LESSONS.filter(x => x.l.steps.length), total = real.length, done = real.filter(x => isDone(x.l.id)).length;
    const nx = nextLesson(), C = window.DY_CLOUD, u = C && C.user();
    const first = myName().split(/\s+/)[0] || "";
    const g = S.goal || 20, met = S.todayXp >= g, hr = new Date().getHours(), pct = total ? Math.round(100 * done / total) : 0;
    const hello = (hr < 5 ? "Xayrli tun" : hr < 11 ? "Xayrli tong" : hr < 18 ? "Xayrli kun" : "Xayrli kech") + (first ? ", " + first : "") + "!";
    const froze = S.frozeNote; if (froze) { S.frozeNote = 0; save(); }
    const poolN = dueIds().length;
    const say = froze ? `❄️ Olov himoyasi ${S.streak} kunlik olovingizni saqlab qoldi!` : met ? "Bugungi maqsad bajarildi. Barakalla!" : S.todayXp ? `Maqsadga ${g - S.todayXp} XP qoldi.` : S.streak ? "Olovni o'chirmang: bugun bitta dars yetarli." : "Bugun bitta dars bilan boshlaymiz.";
    return `<div class="page wrap home">
      <div class="hello">${mascot(met ? "happy" : "ok")}<div class="say"><b>${esc(hello)}</b><span>${say}</span></div></div>
      ${nx ? `<button class="cont" style="--c:${nx.sec.color}" data-start="${nx.l.id}"><span class="eyebrow">${nx.si}-bo'lim · ${esc(nx.sec.title)}</span><b>${esc(nx.l.title)}</b><span class="go">${done ? "Davom etish" : "Boshlash"}</span></button>`
        : `<div class="card cont-done"><b>Kurs tugatildi! 🎉</b><span class="muted">Takrorlash mashqlari bilan bilimni mustahkamlang.</span></div>`}
      ${installHTML()}
      ${poolN ? `<button class="card course mist" data-act="mistakes"><span class="ic">${I.repeat}</span><span class="txt"><b>Xatolar ustida ishlash</b><small>${poolN} ta savolni qayta mashq qiling · +1 ❤️ har to'g'ri javobga</small></span><span class="chev">›</span></button>` : ""}
      <div class="today">
        <div class="card"><b>${S.todayXp}<small>/${g}</small></b><span>Bugungi XP</span><i class="bar"><i style="width:${Math.min(100, 100 * S.todayXp / g)}%"></i></i></div>
        <div class="card"><b>${S.streak} 🔥</b><span>Olov</span></div>
        <button class="card" data-tab="rank"><b>${S.weekXp || 0}</b><span>Haftalik XP ›</span></button>
      </div>
      ${questsHTML()}
      <h3>Yo'nalishlar</h3>
      <button class="card course" data-tab="map"><span class="ic">${I.chart}</span><span class="txt"><b>Data analitika</b><small>${done}/${total} dars · ${pct}%</small><i class="bar"><i style="width:${pct}%"></i></i></span><span class="chev">›</span></button>
      <div class="card course soon"><span class="ic">${I.lock}</span><span class="txt"><b>Yangi yo'nalishlar</b><small>Tez kunda</small></span></div>
    </div>`;
  }
  const avHTML = r => { const ph = okPhoto(r.ph); return `<span class="av">${ph ? `<img src="${esc(ph)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : esc((r.name || "?").trim()[0] || "?").toUpperCase()}</span>`; };
  function rankRows(d) {
    if (!d) return `<div class="card muted">Yuklanmoqda…</div>`;
    if (d.error) return `<div class="card muted">Reytingni yuklab bo'lmadi. Internetni tekshirib, qayta oching.</div>`;
    if (!d.rows.length) return `<div class="card muted">Bu hafta hali hech kim XP yig'magan. Birinchi bo'ling!</div>`;
    let h = `<ol class="rank">${d.rows.map((r, i) => `<li class="${r.id === d.uid ? "me" : ""}"><span class="pos p${i + 1}">${i + 1}</span>${avHTML(r)}<b>${esc(r.name || "Nomsiz")}</b><span class="x">${r.wxp} XP</span></li>`).join("")}</ol>`;
    if (!d.rows.some(r => r.id === d.uid)) h += `<div class="card me-row">${d.me ? `Sizning o'rningiz: <b>${d.me.rank}</b> · ${d.me.wxp} XP` : "Bu hafta dars o'tib, reytingga kiring."}</div>`;
    return h;
  }
  function rankHTML() {
    const C = window.DY_CLOUD, left = 7 - ((new Date().getDay() + 6) % 7);
    let body;
    if (!C) body = `<div class="card muted">Reyting saytda ishlaydi. Bu yerda progress faqat shu qurilmada.</div>`;
    else if (!C.user()) body = `<div class="card rank-in">${mascot("think")}<b>Reytingga qo'shiling</b><p class="muted">Google bilan kiring: haftalik XP'ingiz boshqalar bilan solishtiriladi, progressingiz ham saqlanib qoladi.</p><button class="btn gbtn" data-act="cloud-login"><span>Google bilan kirish</span></button><small id="cloudst" class="muted"></small></div>`;
    else body = `<div class="seg" role="tablist"><button class="${rankView === "all" ? "on" : ""}" data-act="rv-all" role="tab">Hammasi</button><button class="${rankView === "fr" ? "on" : ""}" data-act="rv-fr" role="tab">Do'stlar</button></div><div id="rankbox">${rankView === "fr" ? friendRows(C.friendsCache && C.friendsCache()) : rankRows(C.boardCache())}</div>`;
    return `<div class="page wrap"><div class="rank-head"><h2>Haftalik reyting</h2><span class="muted">${left === 7 ? "Yangi hafta bugun boshlandi" : `Hafta tugashiga ${left} kun`} · Siz: ${S.weekXp || 0} XP</span></div>${body}</div>`;
  }
  let rankView = "all";
  function friendRows(d) {
    const inv = `<div class="card invite-cta">${mascot("happy")}<div><b>Do'stlaringizni chaqiring</b><p class="muted">Havolangiz orqali kirgan har bir do'st uchun ikkalangiz ham +${REF_GIFT} 🪙 olasiz.</p><button class="btn sm" data-act="invite">Taklif havolasi</button></div></div>`;
    if (!d) return `<div class="card muted">Yuklanmoqda…</div>`;
    if (d.error) return `<div class="card muted">Do'stlar ro'yxatini yuklab bo'lmadi. Internetni tekshirib, qayta oching.</div>`;
    if (!d.count) return inv;
    const rows = d.rows.slice().sort((a, b) => b.wxp - a.wxp);
    return `<ol class="rank">${rows.map((r, i) => `<li class="${r.id === d.uid ? "me" : ""}"><span class="pos p${i + 1}">${i + 1}</span>${avHTML(r)}<b>${esc(r.name || "Nomsiz")}</b><span class="x">${r.wxp} XP</span></li>`).join("")}</ol>${d.idle ? `<p class="muted" style="text-align:center">Yana ${d.idle} ta do'stingiz bu hafta hali o'qimagan.</p>` : ""}${inv}`;
  }
  function renderHome() {
    document.body.classList.remove("in-lesson");
    $app.innerHTML = `<div class="app">${topbar()}${tab === "home" ? homeHTML() : tab === "map" ? mapHTML() : tab === "rank" ? rankHTML() : profileHTML()}</div>${tabbar()}`;
    flushToasts(); musicSync();
    const C = window.DY_CLOUD;
    if (tab === "rank" && C && C.user()) {
      if (rankView === "fr" && C.friends) C.friends().then(d => { const el = document.getElementById("rankbox"); if (el && tab === "rank" && rankView === "fr" && d) el.innerHTML = friendRows(d); });
      else C.board().then(d => { const el = document.getElementById("rankbox"); if (el && tab === "rank" && rankView === "all" && d) el.innerHTML = rankRows(d); });
    }
  }
  const hpush = st => { try { history.pushState(st, ""); } catch (e) { /* iframe */ } };
  let pendingStart = null;
  function beginLesson(id) { if (S.hearts > 0) hpush({ tab, lesson: 1 }); startLesson(id); }
  const closeSheet = () => document.querySelectorAll(".sheet-modal.signup").forEach(m => m.remove());
  // Kirmagan foydalanuvchiga dars oldidan hisob taklifi (kuniga bir marta)
  function askSignup(id) {
    pendingStart = id; closeSheet();
    const m = document.createElement("div"); m.className = "sheet-modal signup";
    const perk = (b, t) => `<li>${I.check}<span><b>${b}</b> ${t}</span></li>`;
    m.innerHTML = `<div class="card" role="dialog" aria-label="Hisobga kirish taklifi"><div class="say">${mascot("happy")}<div class="sb">Darsdan oldin bir taklif: progressingizni saqlab qo'yaylik!</div></div>
      <ul class="perks">${perk("Progress yo'qolmaydi.", "Brauzer tozalansa yoki telefon almashsa ham hammasi joyida qoladi.")}${perk("Telefon va kompyuterda bir xil.", "Qayerda to'xtasangiz, boshqa qurilmada o'sha yerdan davom etasiz.")}${perk("Haftalik reytingda qatnashasiz.", "XP'ingiz boshqalar bilan solishtiriladi.")}${perk("Bepul va bir bosishda.", "Parol o'ylab topish shart emas, Google hisobingiz yetarli.")}</ul>
      <button class="btn gbtn" data-act="cloud-login">${I.google}<span>Google bilan kirish</span></button><small id="cloudst" class="muted" style="text-align:center;margin-top:-6px"></small>
      <button class="btn ghost" data-act="signup-later">Keyinroq, darsni boshlash</button></div>`;
    m.addEventListener("click", e => { if (e.target === m) { m.remove(); pendingStart = null; } });
    document.body.appendChild(m);
  }
  function leaveLesson() { session = null; if (history.state && history.state.lesson) history.back(); else renderHome(); }
  function renderOnboard(step) {
    setTimeout(() => {
      const l = document.getElementById("onb"); if (!l || !l.classList.contains("intro")) return;
      l.addEventListener("pointerdown", () => l.classList.add("skip"), { once: true });
      // qo'nish payti salom kuyi; brauzer ovozga ruxsat bermasa — birinchi bosishda
      let said = false; const hello = () => { if (said) return; said = true; sfx("hello"); };
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTimeout(() => { try { audio(); if (ac.state === "running") hello(); } catch (e) { /* */ } }, reduce ? 0 : 1380);
      l.addEventListener("pointerdown", hello, { once: true, capture: true });
    }, 0);
    const sel = S.goal;
    if (step === "dir") {
      $app.innerHTML = `<div class="layer"><div class="center">${mascot("think", "float")}
        <h1 class="g">Nimani o'rganmoqchisiz?</h1><p>Yo'nalishni tanlang. Keyinroq boshqasini ham qo'shishingiz mumkin.</p>
        <div class="dirs">
          <button class="card course" data-act="onb-dir"><span class="ic">${I.chart}</span><span class="txt"><b>Data analitika</b><small>Excel, SQL, Power BI, Python</small></span><span class="chev">›</span></button>
          <div class="card course soon"><span class="ic">${I.lock}</span><span class="txt"><b>Yangi yo'nalishlar</b><small>Tez kunda qo'shiladi</small></span></div>
        </div></div></div>`;
      return;
    }
    const intro = step === 1;
    $app.innerHTML = `<div class="layer${intro ? " intro" : ""}" id="onb"><div class="center">${intro
      ? `<div class="perch"><span class="shadow"></span><div class="flyer">${mascot("happy")}<span class="hi">Salom! 👋</span><i class="spark a">✦</i><i class="spark b">✦</i><i class="spark c">✦</i><i class="spark d">✦</i></div></div>`
      : mascot("happy", "float")}
      ${step === 2 ? `<h1 class="g">Kunlik maqsad</h1><p>Har kuni qancha o'qiysiz? Keyin Profil bo'limida o'zgartirish mumkin.</p>
        <div class="goals">${[[20, "Yengil", "≈ 10 daqiqa"], [50, "Jiddiy", "≈ 20 daqiqa"], [100, "Kuchli", "≈ 40 daqiqa"]].map(g => `<button class="opt ${sel === g[0] ? "sel" : ""}" data-ogoal="${g[0]}"><span>${g[1]}</span><small>${g[0]} XP · ${g[2]}</small></button>`).join("")}</div>`
      : `<h1 class="g rise d1">Salom! Men ${MASCOT}man.</h1><p class="rise d2">Yetakla'da yangi kasb va ko'nikmalarni o'zbek tilida, o'yin orqali o'rganasiz. Kuniga 5–10 daqiqa yetarli, yo'lni esa men ko'rsatib boraman.</p>`}
      <div class="foot-center${intro ? " rise d3" : ""}">${step === 2 ? `<button class="btn" data-act="onb-done" ${sel ? "" : "disabled"}>Boshlash</button>` : `<button class="btn" data-act="onb-next">Davom etish</button>${window.DY_CLOUD ? `<button class="btn ghost sm" data-act="cloud-login" style="margin-top:14px;text-transform:none;letter-spacing:0">Hisobim bor — Google bilan kirish</button><small id="cloudst" class="muted" style="display:block;margin-top:6px"></small>` : ""}`}</div>
    </div></div>`;
  }

  /* ---------- lesson session ---------- */
  function startLesson(id) {
    const idx = LESSONS.findIndex(x => x.l.id === id); const { l, sec } = LESSONS[idx];
    if (S.hearts <= 0) { renderNoHearts(); return; }
    const q = expand(l);
    const due = Object.entries(S.pool).filter(([k, v]) => v.due <= S.lessonsDone && EX[k] && EX[k].l.id !== l.id).slice(0, 2);
    due.forEach(([k]) => q.push(Object.assign({ id: k, review: true }, EX[k].st)));
    pyWarm(q);
    session = { kind: "lesson", l, sec, q, i: 0, total: q.filter(s => s.t !== "theory").length, firstOk: 0, wrongIds: new Set(), seen: new Set(), t0: Date.now(), xp: 0, retry: S.done[l.id] ? true : false };
    renderStep();
  }
  function startPractice(mode) {
    if (mode === "mistakes") {
      const ids = dueIds().sort((a, b) => (S.pool[a].day || "").localeCompare(S.pool[b].day || "") || S.pool[a].box - S.pool[b].box).slice(0, 8);
      if (ids.length) {
        session = { kind: "practice", l: { id: "practice", title: "Xatolar ustida ishlash", simple: "Bu yerda siz xato qilgan savollar qaytadan chiqadi. Har bir savol 3 marta to'g'ri yechilgach, ro'yxatdan chiqadi." }, sec: { color: "#2f6fdb" }, q: ids.map(k => Object.assign({ id: k, review: true }, EX[k].st, { _order: null, _draft: undefined })), i: 0, total: ids.length, firstOk: 0, wrongIds: new Set(), seen: new Set(), t0: Date.now(), xp: 0 };
        return renderStep();
      }
    }
    let ids = dueIds();
    const doneLessons = LESSONS.filter(x => isDone(x.l.id)).map(x => x.l.id);
    const extra = Object.keys(EX).filter(k => doneLessons.includes(EX[k].l.id) && !ids.includes(k));
    ids = shuffle(ids).slice(0, 6).concat(shuffle(extra)).slice(0, 6);
    if (ids.length < 3) ids = ids.concat(shuffle(Object.keys(EX).filter(k => EX[k].l.id === "s0l1" && !ids.includes(k)))).slice(0, 6);
    session = { kind: "practice", l: { id: "practice", title: "Takrorlash", simple: "Bu yerda oldingi darslardagi savollar qaytadan chiqadi. Har bir to'g'ri javob bitta jon qaytaradi." }, sec: { color: "#2f6fdb" }, q: ids.map(k => Object.assign({ id: k, review: true }, EX[k].st)), i: 0, total: ids.length, firstOk: 0, wrongIds: new Set(), seen: new Set(), t0: Date.now(), xp: 0 };
    renderStep();
  }

  const KIND = { mc: "Bitta javobni tanlang", predict: "Natijani taxmin qiling", tf: "To'g'rimi yoki noto'g'ri?", match: "Juftlarni moslang", fill: "Bo'sh joyni to'ldiring", order: "Bloklardan yig'ing", sql: "Jonli SQL", py: "Jonli Python", formula: "Jonli formula", chart: "Grafikni tanlang", bug: "Xatoni toping", theory: "Yangi mavzu" };
  let ctl = null, phase = "answer";
  function lessonShell(inner, foot) {
    const done = session.i; const pct = Math.round(done / session.q.length * 100);
    return `<div class="layer" id="layer"><div class="lbar"><button class="x" data-act="quit" aria-label="Chiqish">${I.close}</button><div class="prog"><i style="width:${pct}%"></i></div><span class="stat hp">${hpLabel()}</span></div>
      <div class="lbody" id="lbody">${inner}</div><div id="lfoot">${foot}</div></div>`;
  }
  function footAnswer() {
    const st = session.q[session.i];
    if (st.t === "theory") return `<div class="lfoot"><button class="btn ghost help" data-act="simple">Tushunmadim 🤔</button><button class="btn main" data-act="next">Davom etish</button></div>`;
    return `<div class="lfoot"><button class="btn ghost help" data-act="simple" title="Soddaroq tushuntirish">🤔</button><button class="btn main" data-act="check" id="checkbtn" ${ctl && ctl.ready() ? "" : "disabled"}>Tekshirish</button></div>`;
  }
  const hpLabel = () => session.kind === "test" ? `🛡️ ${TEST_LIVES - session.mist}` : `${session.kind === "practice" ? "🔁" : "❤️"} ${S.hearts}`;
  function refreshCheck() { const b = document.getElementById("checkbtn"); if (b) b.disabled = !(ctl && ctl.ready()); }
  function renderStep() {
    if (session && session.i === 0) musicSync();
    document.body.classList.add("in-lesson");
    if (session.i >= session.q.length) return finish();
    const st = session.q[session.i]; phase = "answer"; ctl = null;
    let head = "";
    if (st.t !== "theory") {
      head = `<div class="kind">${session.kind === "test" ? '<span class="tag">⏩ Sinov</span>' : ""}${st.review ? '<span class="tag">🔁 Takrorlash</span>' : ""}${session.l.boss ? '<span class="tag boss">Boss</span>' : ""}${st.caseKind || st.context ? "Mini-keys" : KIND[st.t]}</div>`;
    }
    const body = st.t === "theory" ? theoryHTML(st) : head + exerciseHTML(st);
    $app.innerHTML = lessonShell(body, footAnswer());
    if (st.t !== "theory") { ctl = bindExercise(st); refreshCheck(); }
    const lb = document.getElementById("lbody"); if (lb) lb.scrollTop = 0;
  }
  function theoryHTML(st) {
    return `<div class="theory"><div class="kind">${session.l.boss ? '<span class="tag boss">Boss</span>' : ""}Yangi mavzu</div><h2>${esc(st.title)}</h2>
      <div class="say">${mascot("ok")}<div class="sb">${esc(st.analogy)}</div></div>
      <p class="body">${esc(st.text)}</p>${visualHTML(st.visual)}${st.example ? `<p class="ex">${esc(st.example)}</p>` : ""}</div>`;
  }
  function ctxHTML(st) { return st.context ? `<div class="context"><span class="step">${esc(st.context.step)}</span><b>${esc(st.context.title)}</b><span>${esc(st.context.story)}</span></div>` : ""; }

  function exerciseHTML(st) {
    switch (st.t) {
      case "mc": case "predict": {
        const order = st._order || (st._order = shuffle(st.o.map((_, i) => i)));
        return `${ctxHTML(st)}<p class="q">${esc(st.q)}</p>${st.code ? `<pre class="code">${hlCode(st.code)}</pre>` : ""}${st.table ? tableHTML(st.table) : ""}<div class="opts">${order.map((oi, n) => `<button class="opt" data-o="${oi}"><span class="k">${n + 1}</span><span>${esc(st.o[oi])}</span></button>`).join("")}</div>`;
      }
      case "tf": return `<div class="statement">${esc(st.q)}</div><div class="tf"><button class="opt" data-o="1">✓ To'g'ri</button><button class="opt" data-o="0">✗ Noto'g'ri</button></div>`;
      case "match": {
        const L = shuffle(st.pairs.map((p, i) => i)), R = shuffle(st.pairs.map((p, i) => i));
        return `<p class="q">${esc(st.q)}</p><div class="match"><div class="col">${L.map(i => `<button class="opt" data-l="${i}">${esc(st.pairs[i][0])}</button>`).join("")}</div><div class="col">${R.map(i => `<button class="opt" data-r="${i}">${esc(st.pairs[i][1])}</button>`).join("")}</div></div>`;
      }
      case "fill": {
        const parts = st.tpl.split("___"); let tpl = "";
        parts.forEach((p, i) => { tpl += esc(p); if (i < parts.length - 1) tpl += `<span class="slot" data-slot="${i}"></span>`; });
        return `<p class="q">${esc(st.q)}</p><div class="slots ${st.code ? "mono" : ""}">${tpl}</div><div class="bank">${shuffle(st.o.map((o, i) => i)).map(i => `<button class="blk ${st.code ? "mono" : ""}" data-chip="${i}">${esc(st.o[i])}</button>`).join("")}</div>`;
      }
      case "order": {
        const all = st.blocks.concat(st.extra || []);
        return `<p class="q">${esc(st.q)}</p><div class="answer-line ${st.code ? "" : "lines"}" id="ansline"></div><div class="bank">${shuffle(all.map((b, i) => i)).map(i => `<button class="blk ${st.code ? "mono" : ""}" data-blk="${i}">${esc(all[i])}</button>`).join("")}</div>`;
      }
      case "bug": return `<p class="q">${esc(st.q)}</p><div class="bugline ${st.code ? "mono" : ""}">${st.tokens.map((t, i) => `<button class="blk ${st.code ? "mono" : ""}" data-tok="${i}">${esc(t)}</button>`).join("")}</div>`;
      case "chart": {
        const order = st._order || (st._order = shuffle(st.o.map((_, i) => i)));
        return `<p class="q">${esc(st.q)}</p><div class="chartopts">${order.map(oi => `<button class="opt" data-o="${oi}">${miniChart(st.o[oi])}<span>${CHART_LABEL[st.o[oi]]}</span></button>`).join("")}</div>`;
      }
      case "sql": return `<p class="q">${esc(st.task)}</p>
        <div class="schema">${st.tables.map(t => `<button data-peek="${t}">${I.db.replace("<svg", '<svg style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"')}${t}</button>`).join("")}<button data-peek="__all">barcha jadvallar</button><div class="cols" id="schemacols">${st.tables.map(t => `${t}(${DATA[t].cols.join(", ")})`).join("<br>")}</div></div>
        <textarea class="editor" id="sqled" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="SQL so'rov">${esc(st._draft ?? st.starter ?? "")}</textarea>
        <div class="row"><button class="btn sky sm" data-act="run">▶ Ishga tushirish</button><span class="loading" id="sqlstat"></span></div><div class="out" id="sqlout"></div>`;
      case "py": return `<p class="q">${esc(st.task)}</p>
        ${st.tables ? `<div class="schema">${st.tables.map(t => `<button data-peek="${t}">${I.db.replace("<svg", '<svg style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"')}${t}.csv</button>`).join("")}<div class="cols" id="schemacols">${st.tables.map(t => `${t}.csv: ${DATA[t].cols.join(", ")}`).join("<br>")}</div></div>` : ""}
        <textarea class="editor py" id="pyed" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Python kod">${esc(st._draft ?? st.starter ?? "")}</textarea>
        <div class="row"><button class="btn sky sm" data-act="pyrun">▶ Ishga tushirish</button><span class="loading" id="pystat"></span></div><div class="out" id="pyout"></div>`;
      case "formula": return `<p class="q">${esc(st.task)}</p><div id="fsheet">${sheetHTML(st.sheet, { target: st.target })}</div>
        <div class="fxinput"><span class="cell">${st.target}</span><em>fx</em><input id="fxin" value="${esc(st._draft ?? "=")}" spellcheck="false" autocapitalize="characters" autocomplete="off" aria-label="Formula"></div>
        <div class="fxhelp">${(st.keys || ["=", "SUM(", "AVERAGE(", "COUNT(", "MIN(", "MAX(", "IF(", "COUNTIF(", "SUMIF(", "VLOOKUP(", "XLOOKUP(", ":", ",", "\"", ")", "*", "/", "+", ">="]).map(k => `<button data-ins="${esc(k)}">${esc(k)}</button>`).join("")}</div>
        <div class="preview" id="fxprev">Natija shu yerda ko'rinadi.</div>`;
    }
    return "";
  }

  function bindExercise(st) {
    const body = document.getElementById("lbody");
    const c = { ready: () => false, check: () => ({ ok: false }), answer: "" };
    if (["mc", "predict", "tf", "chart"].includes(st.t)) {
      let sel = null;
      body.querySelectorAll(".opt[data-o]").forEach(b => b.onclick = () => { if (phase !== "answer") return; body.querySelectorAll(".opt[data-o]").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); sel = +b.dataset.o; refreshCheck(); });
      c.ready = () => sel !== null;
      if (st.t === "tf") { c.check = () => ({ ok: (sel === 1) === st.a }); c.answer = st.a ? "To'g'ri" : "Noto'g'ri"; }
      else { c.check = () => ({ ok: sel === st.a }); c.answer = st.t === "chart" ? CHART_LABEL[st.o[st.a]] + " grafik" : st.o[st.a]; }
      c.key = n => { const btns = body.querySelectorAll(".opt[data-o]"); if (btns[n - 1]) btns[n - 1].click(); };
    }
    if (st.t === "match") {
      let L = null, R = null, matched = 0, wrong = 0;
      const tryPair = () => {
        if (L === null || R === null) return;
        const lb = body.querySelector(`[data-l="${L}"]`), rb = body.querySelector(`[data-r="${R}"]`);
        if (L === R) { [lb, rb].forEach(b => { b.classList.remove("sel"); b.classList.add("ok"); b.disabled = true; }); matched++; sfx("pair", matched); }
        else { wrong++; [lb, rb].forEach(b => { b.classList.remove("sel"); b.classList.add("no"); setTimeout(() => b.classList.remove("no"), 400); }); sfx("bad"); }
        L = R = null;
        if (matched === st.pairs.length) setTimeout(() => submit(), 250);
      };
      body.querySelectorAll("[data-l]").forEach(b => b.onclick = () => { body.querySelectorAll("[data-l]").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); L = +b.dataset.l; tryPair(); });
      body.querySelectorAll("[data-r]").forEach(b => b.onclick = () => { body.querySelectorAll("[data-r]").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); R = +b.dataset.r; tryPair(); });
      c.ready = () => false; c.check = () => ({ ok: wrong < 2, msg: wrong >= 2 ? `${wrong} marta noto'g'ri juft tanlandi.` : "" });
      c.answer = st.pairs.map(p => p[0] + " — " + p[1]).join("; ");
    }
    if (st.t === "fill") {
      const slots = [...body.querySelectorAll("[data-slot]")]; const fill = slots.map(() => null);
      const paint = () => { slots.forEach((s, i) => { s.className = "slot" + (fill[i] !== null ? " f" : ""); s.textContent = fill[i] !== null ? st.o[fill[i]] : ""; }); body.querySelectorAll("[data-chip]").forEach(b => b.classList.toggle("used", fill.includes(+b.dataset.chip))); refreshCheck(); };
      body.querySelectorAll("[data-chip]").forEach(b => b.onclick = () => { if (phase !== "answer") return; const k = fill.indexOf(null); if (k < 0) return; fill[k] = +b.dataset.chip; paint(); });
      slots.forEach((s, i) => s.onclick = () => { if (phase !== "answer") return; fill[i] = null; paint(); });
      c.ready = () => !fill.includes(null);
      c.check = () => ({ ok: fill.every((f, i) => st.o[f] === st.a[i]) });
      c.answer = st.tpl.split("___").reduce((a, p, i) => a + p + (st.a[i] ?? ""), "");
    }
    if (st.t === "order") {
      const all = st.blocks.concat(st.extra || []); const seq = []; const line = document.getElementById("ansline");
      const paint = () => { line.innerHTML = seq.map((i, n) => `<button class="blk ${st.code ? "mono" : ""}" data-pos="${n}">${esc(all[i])}</button>`).join(""); body.querySelectorAll("[data-blk]").forEach(b => b.classList.toggle("used", seq.includes(+b.dataset.blk))); line.querySelectorAll("[data-pos]").forEach(b => b.onclick = () => { if (phase !== "answer") return; seq.splice(+b.dataset.pos, 1); paint(); }); refreshCheck(); };
      body.querySelectorAll("[data-blk]").forEach(b => b.onclick = () => { if (phase !== "answer") return; const i = +b.dataset.blk; if (!seq.includes(i)) { seq.push(i); paint(); } });
      c.ready = () => seq.length > 0;
      c.check = () => ({ ok: seq.map(i => all[i]).join("\u0001") === st.blocks.join("\u0001") });
      c.answer = st.blocks.join(" ");
    }
    if (st.t === "bug") {
      let sel = null;
      body.querySelectorAll("[data-tok]").forEach(b => b.onclick = () => { if (phase !== "answer") return; body.querySelectorAll("[data-tok]").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); sel = +b.dataset.tok; refreshCheck(); });
      c.ready = () => sel !== null; c.check = () => ({ ok: sel === st.a }); c.answer = st.tokens[st.a];
    }
    if (st.t === "sql") {
      const ed = document.getElementById("sqled"), out = document.getElementById("sqlout"), stat = document.getElementById("sqlstat");
      ed.oninput = () => { st._draft = ed.value; refreshCheck(); };
      ed.onkeydown = e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); } };
      const show = r => { out.innerHTML = `<span class="meta">Natija: ${r.rows.length} qator${r.rows.length > 50 ? " (birinchi 50 tasi)" : ""}</span>` + (r.cols.length ? tableHTML({ cols: r.cols, rows: r.rows.slice(0, 50) }) : ""); };
      const run = async (sqlText) => {
        stat.textContent = window.initSqlJs ? "" : "SQL dvigateli yuklanmoqda…";
        try { const r = await runSQL(sqlText || ed.value); stat.textContent = ""; show(r); return r; }
        catch (e) { stat.textContent = ""; out.innerHTML = `<div class="err">${esc(e && e.message && /yuklab bo'lmadi/.test(e.message) ? e.message : sqlErr(e && e.message))}</div>`; throw e; }
      };
      body.querySelector('[data-act="run"]').onclick = () => run().catch(() => { });
      body.querySelectorAll("[data-peek]").forEach(b => b.onclick = () => {
        const t = b.dataset.peek;
        if (t === "__all") { document.getElementById("schemacols").innerHTML = Object.keys(DATA).map(k => `${k}(${DATA[k].cols.join(", ")})`).join("<br>"); return; }
        run(`SELECT * FROM ${t} LIMIT 5;`).then(() => { out.querySelector(".meta").textContent = `${t} jadvalidan namuna (5 qator)`; }).catch(() => { });
      });
      loadSQL().catch(() => { });
      setTimeout(() => ed.focus({ preventScroll: true }), 50);
      c.ready = () => ed.value.trim().length > 6;
      c.check = async () => {
        let mine;
        try { mine = await run(); } catch (e) { return { ok: false, soft: true, msg: e && /yuklab bo'lmadi/.test(e.message || "") ? e.message : "So'rovda xato bor. Pastdagi qizil xabarni o'qib, tuzating." }; }
        const exp = await runSQL(st.solution);
        const ok = sameResult(mine, exp, /order\s+by/i.test(st.solution) && !st.unordered);
        if (ok && st.badge) award(st.badge);
        return { ok, msg: ok ? "" : `Sizning natijangiz: ${mine.rows.length} qator, ${mine.cols.length} ustun. Kutilgan: ${exp.rows.length} qator, ${exp.cols.length} ustun.` };
      };
      c.answer = st.solution; c.code = true;
    }
    if (st.t === "py") {
      const ed = document.getElementById("pyed"), out = document.getElementById("pyout"), stat = document.getElementById("pystat");
      ed.oninput = () => { st._draft = ed.value; refreshCheck(); };
      ed.onkeydown = e => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run().catch(() => { }); return; }
        if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); const s = ed.selectionStart, en = ed.selectionEnd; ed.value = ed.value.slice(0, s) + "    " + ed.value.slice(en); ed.setSelectionRange(s + 4, s + 4); ed.oninput(); }
      };
      const show = r => {
        let h = "";
        if (r.error) { if (r.out) h += `<span class="meta">Chop etildi (print)</span><pre class="pyprint">${esc(r.out)}</pre>`; h += `<div class="err">${esc(pyErr(r.error))}</div>`; }
        else {
          if (r.table) h += `<span class="meta">${r.name ? esc(r.name) + ": " : "Natija: "}${r.table.n} qator${r.table.n > 50 ? " (birinchi 50 tasi)" : ""}</span>` + tableHTML(r.table);
          else if (r.out) h += `<span class="meta">Chop etildi (print)</span><pre class="pyprint">${esc(r.out)}</pre>`;
          else if (r.val != null) h += `<span class="meta">${r.name ? esc(r.name) : "Qiymat"}</span><pre class="pyprint">${esc(r.val)}</pre>`;
          if (!h) h = '<span class="meta">Kod xatosiz ishladi, lekin hech narsa chiqmadi. Natijani ko\'rish uchun print(...) qo\'shing.</span>';
        }
        out.innerHTML = h;
      };
      let running = null;
      const run = (withSol) => {
        if (running) return running;
        stat.textContent = pyReady ? "Bajarilmoqda…" : "Python yuklanmoqda… (birinchi marta ~15 MB)";
        const p = running = runPy(ed.value, withSol ? st.solution : "", st.v, !!st.ord)
          .then(r => { stat.textContent = ""; show(r); return r; },
            e => { stat.textContent = ""; out.innerHTML = `<div class="err">${esc(e && e.load ? e.message : "Kodni ishga tushirib bo'lmadi: " + (e && e.message || e))}</div>`; throw e; })
          .finally(() => { if (running === p) running = null; });
        return p;
      };
      body.querySelector('[data-act="pyrun"]').onclick = () => run().catch(() => { });
      body.querySelectorAll("[data-peek]").forEach(b => b.onclick = () => {
        const t = DATA[b.dataset.peek];
        out.innerHTML = `<span class="meta">${esc(b.dataset.peek)}.csv faylidan namuna (5 qator)</span>` + tableHTML({ cols: t.cols, rows: t.rows.slice(0, 5) });
      });
      pyWarm([st]);
      c.ready = () => ed.value.trim().length > 3;
      c.check = async () => {
        if (/___/.test(ed.value)) return { ok: false, soft: true, msg: "___ o'rniga kod yozing." };
        let r;
        try { if (running) await running.catch(() => { }); r = await run(true); }
        catch (e) { if (e && e.load) return { ok: true, msg: "Python yuklanmadi, shuning uchun bu mashq tekshirilmadi. Internet yaxshilanganda qayta urinib ko'ring." }; return { ok: false, soft: true, msg: "Kodni ishga tushirib bo'lmadi. Qayta urinib ko'ring." }; }
        if (r.error) return { ok: false, soft: true, msg: "Kodda xato bor. Pastdagi qizil xabarni o'qib, tuzating." };
        if (r.missing) return { ok: false, soft: true, msg: `${r.missing} o'zgaruvchisi topilmadi. Natijani ${r.missing} = ... ko'rinishida yozing.` };
        return { ok: !!r.ok, msg: r.ok ? "" : r.got === r.exp && /qator/.test(r.got || "") ? `Natija shakli to'g'ri (${r.got}), lekin qiymatlar boshqacha. Hisoblashni tekshiring.` : `Sizning natijangiz: ${r.got}. Kutilgan: ${r.exp}.` };
      };
      c.answer = st.solution; c.code = true;
    }
    if (st.t === "formula") {
      const inp = document.getElementById("fxin"), prev = document.getElementById("fxprev"), wrap = document.getElementById("fsheet");
      const upd = () => {
        st._draft = inp.value; const v = inp.value.trim();
        if (!v || v === "=") { wrap.innerHTML = sheetHTML(st.sheet, { target: st.target }); prev.className = "preview"; prev.textContent = "Natija shu yerda ko'rinadi."; refreshCheck(); return; }
        const r = F.evaluate(v, st.sheet);
        wrap.innerHTML = sheetHTML(st.sheet, { target: st.target, preview: r.ok ? r.value : "#XATO", err: !r.ok });
        prev.className = "preview" + (r.ok ? "" : " err"); prev.textContent = r.ok ? `${st.target} = ${typeof r.value === "number" ? fmt(r.value).replace(/&nbsp;/g, " ") : r.value}` : r.error;
        refreshCheck();
      };
      inp.oninput = upd;
      body.querySelectorAll("[data-ins]").forEach(b => b.onclick = () => {
        const k = b.dataset.ins; const s = inp.selectionStart ?? inp.value.length, e = inp.selectionEnd ?? inp.value.length;
        if (k === "=" && inp.value.startsWith("=")) { inp.focus(); return; }
        inp.value = inp.value.slice(0, s) + k + inp.value.slice(e); inp.focus(); inp.setSelectionRange(s + k.length, s + k.length); upd();
      });
      upd();
      c.ready = () => inp.value.trim().length > 1;
      c.check = () => {
        const v = inp.value.trim(); const r = F.evaluate(v, st.sheet);
        if (!r.ok) return { ok: false, soft: true, msg: r.error };
        if (!/[A-Z]+\d+/i.test(v.replace(/"[^"]*"/g, ""))) return { ok: false, soft: true, msg: "Raqamni qo'lda yozmang — katak manziliga havola qiling (masalan B2). Shunda ma'lumot o'zgarsa, natija ham yangilanadi." };
        const miss = (st.must || []).filter(m => !r.used.includes(m));
        if (miss.length) return { ok: false, soft: true, msg: `Bu safar ${miss.join(", ")} funksiyasidan foydalaning.` };
        const exp = F.evaluate(st.solution, st.sheet).value;
        const near = x => typeof r.value === "number" && typeof x === "number" && (F.same(r.value, x) || (st.tol && Math.abs(r.value - x) <= st.tol));
        const ok = typeof exp === "number" ? (near(exp) || (st.pct && near(exp * 100))) : F.same(r.value, exp); if (ok) S.formulasOk++;
        return { ok, msg: ok ? "" : `Sizning natijangiz: ${typeof r.value === "number" ? fmt(r.value).replace(/&nbsp;/g, " ") : r.value}. Kutilgan: ${typeof exp === "number" ? fmt(exp).replace(/&nbsp;/g, " ") : exp}.` };
      };
      c.answer = st.solution; c.code = true;
    }
    return c;
  }

  const PRAISE = ["Zo'r! 🎉", "Barakalla!", "Ajoyib!", "To'ppa-to'g'ri!", "Qoyil! 💪", "Aynan shunday!"];
  const CHEER = ["Hechqisi yo'q, yana urinib ko'r!", "Deyarli! Keyingi safar albatta.", "Xato ham — o'rganish!"];
  let busy = false;
  async function submit() {
    if (!ctl || phase !== "answer" || busy) return;
    const st = session.q[session.i]; busy = true;
    const btn = document.getElementById("checkbtn"); if (btn) { btn.disabled = true; btn.textContent = "Tekshirilmoqda…"; }
    let r; try { r = await ctl.check(); } catch (e) { r = { ok: false, soft: true, msg: "Tekshirib bo'lmadi: " + (e && e.message || e) }; }
    busy = false;
    if (r.soft) {
      sfx("soft");
      document.getElementById("lfoot").innerHTML = `<div class="fb soft"><div class="head">${mascot("think")}<h3>Bir qarab chiqing</h3></div><div class="txt"><span>${esc(r.msg)}</span></div><button class="btn" data-act="fix">Tuzatish</button></div>`;
      phase = "soft"; return;
    }
    phase = "result";
    const first = !session.seen.has(st.id); session.seen.add(st.id);
    const wasMistake = !!S.pool[st.id]; // takrorlashda XP faqat haqiqiy xato savol uchun
    if (r.ok) {
      session.combo = (session.combo || 0) + 1; sfx("ok", session.combo - 1);
      if (first) { session.firstOk++; const gain = session.kind === "test" ? 0 : session.kind === "practice" ? (wasMistake ? 5 : 0) : session.retry ? 0 : 10; session.xp += gain; }
      if (session.kind === "practice" && S.hearts < 5) S.hearts++;
      if (st.review) { const p = S.pool[st.id]; if (p && first) { p.box++; if (p.box >= 3) delete S.pool[st.id]; else { p.due = S.lessonsDone + 2; const d = new Date(); d.setDate(d.getDate() + (p.box === 1 ? 1 : 3)); p.day = dayStr(d); } } if (wasMistake && first) { S.reviewsOk++; questEv("review"); } }
      questEv("combo", session.combo);
      if (st.t === "sql" || st.t === "formula" || st.t === "py") questEv("live");
      if (st.t === "sql" && session.kind === "lesson" && session.l.id === FINAL) { const ed = document.getElementById("sqled"); if (ed) S.port[st.id] = ed.value.slice(0, 4000); }
    } else {
      session.combo = 0; sfx("bad");
      session.wrongIds.add(st.id);
      if (session.kind === "test") session.mist++;
      else {
        if (session.kind !== "practice") { sfx("heart"); S.hearts = Math.max(0, S.hearts - 1); }
        S.pool[st.id] = { box: 0, due: S.lessonsDone + 1, day: dayStr() };
        if (session.kind !== "practice") session.q.push(Object.assign({}, st, { _order: null, _draft: undefined }));
      }
    }
    save();
    const use = st.use;
    const why = st.why ? `<span>${esc(st.why)}</span>` : "";
    const fb = r.ok
      ? `<div class="fb good"><div class="head">${mascot("happy")}<h3>${pick(PRAISE)}</h3></div><div class="txt">${why}${use ? `<span class="use"><b>Ishda:</b> ${esc(use)}</span>` : ""}</div><button class="btn" data-act="next">Davom etish</button></div>`
      : `<div class="fb bad"><div class="head">${mascot("sad")}<h3>${pick(CHEER)}</h3></div><div class="txt">${st.t === "match" ? `<span>${esc(r.msg)} Juftlar keyinroq yana chiqadi.</span>` : `<span class="ans">To'g'ri javob: ${ctl.code ? `<code${st.t === "py" ? ' class="pyans"' : ""}>${esc(ctl.answer)}</code>` : esc(ctl.answer)}</span>`}${r.msg && st.t !== "match" ? `<span>${esc(r.msg)}</span>` : ""}${why}</div><button class="btn" data-act="next">Tushundim</button></div>`;
    document.getElementById("lfoot").innerHTML = fb;
    const hp = document.querySelector(".lbar .stat.hp"); if (hp) hp.innerHTML = hpLabel();
    document.getElementById("lbody").querySelectorAll("button,textarea,input").forEach(x => { if (!x.closest(".schema")) x.disabled = true; });
  }
  function next() {
    const st = session.q[session.i];
    if (st && st.t !== "theory" && phase !== "result") return;
    if (session.kind === "test" && session.mist >= TEST_LIVES && phase === "result") { renderTestFail(); return; }
    if (session.kind === "lesson" && S.hearts <= 0 && phase === "result") { session.i++; renderNoHearts(); return; }
    session.i++; renderStep();
  }

  function finish() {
    const secs = Math.round((Date.now() - session.t0) / 1000);
    const acc = session.total ? Math.round(session.firstOk / session.total * 100) : 100;
    const perfect = session.wrongIds.size === 0;
    let bonus = 0;
    if (session.kind === "lesson") {
      if (perfect && !session.retry) bonus = 20;
      if (session.retry) session.xp = 5 + (perfect ? 5 : 0);
      const prev = S.done[session.l.id];
      if (!prev) S.lessonsDone++;
      S.done[session.l.id] = { acc: Math.max(acc, prev ? prev.acc : 0), ts: Date.now() };
      if (perfect) award("perfect");
      if (session.l.boss) award("boss");
      questEv("lesson"); if (perfect) questEv("perfect");
    }
    let opened = 0;
    if (session.kind === "test") {
      const si = COURSE.findIndex(s => s.id === session.sid);
      LESSONS.forEach(x => { if (x.si < si && x.l.steps.length && !isDone(x.l.id)) { S.done[x.l.id] = { acc: 0, ts: Date.now(), skip: 1 }; S.lessonsDone++; opened++; } });
      bonus = 30;
    }
    const tierOf = x => TIERS.reduce((a, t, i) => x >= t[1] ? i : a, 0), tier0 = tierOf(S.xp);
    const secWas = session.kind === "lesson" && session.sec ? session.sec.lessons.filter(l => l.id !== session.l.id).every(l => isDone(l.id)) && !session.retry : false;
    const total = session.xp + bonus; addXp(total); checkBadges(); save();
    sfx(secWas || tierOf(S.xp) > tier0 ? "fanfare" : "done");
    const boss = session.l.boss && session.kind === "lesson";
    const secNo = session.sec ? COURSE.indexOf(session.sec) : -1;
    lastWin = session.kind === "test" ? `Sinov bilan ${COURSE.findIndex(s => s.id === session.sid)}-bo'limga sakradim!` : secWas && secNo >= 0 ? `${secNo}-bo'lim: “${session.sec.title}” tugatildi!` : session.kind === "lesson" ? `“${session.l.title}” darsini tugatdim!` : null;
    $app.innerHTML = `<div class="layer"><div class="center">${mascot("happy", "float")}
      <h1>${session.kind === "test" ? "Sinovdan o'tdingiz! 🚀" : session.kind === "practice" ? "Takrorlash tugadi!" : boss ? "Boss yengildi! 👑" : "Dars tugadi!"}</h1>
      <p>${session.kind === "test" ? `${opened} ta dars ochildi. +30 XP bonus.` : (perfect ? "Birorta ham xato yo'q — ajoyib natija!" : session.kind === "practice" ? `Jonlar: ❤️ ${S.hearts}. Endi yangi darsga tayyorsiz.` : "Xato qilingan savollar keyingi darslarda qayta chiqadi.") + (bonus ? " Xatosiz dars uchun +20 bonus XP." : "") + (session.kind === "practice" && !total ? " Takrorlashda XP faqat ilgari xato qilingan savollar uchun beriladi." : "")}</p>
      <div class="endstats"><div class="es" style="--c:var(--sun)"><span>Jami XP</span><b>⚡ ${total}</b></div><div class="es" style="--c:var(--green)"><span>Aniqlik</span><b>${acc}%</b></div><div class="es" style="--c:var(--sky)"><span>Vaqt</span><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</b></div></div>
      <div class="foot-center"><button class="btn" data-act="home">Davom etish</button>${lastWin ? `<button class="btn ghost" data-act="share-win">Natijani ulashish</button>` : ""}</div></div></div>`;
    confetti();
    session = null;
  }
  function renderNoHearts() {
    $app.innerHTML = `<div class="layer"><div class="center">${mascot("sad")}<h1 style="color:var(--heart)">Jonlar tugadi</h1><p>Hechqisi yo'q! Takrorlash mashqida har bir to'g'ri javob bitta ❤️ qaytaradi. Ertaga jonlar o'zi 5 taga to'ladi.</p>
      <div class="foot-center"><button class="btn sky" data-act="practice">Takrorlash bilan jon tiklash</button><button class="btn ghost" data-act="home">Xaritaga qaytish</button></div></div></div>`;
    session = null;
  }
  const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  let calOff = 0;
  function calHTML() {
    const now = new Date(), base = new Date(now.getFullYear(), now.getMonth() + calOff, 1);
    const y = base.getFullYear(), mo = base.getMonth(), nd = new Date(y, mo + 1, 0).getDate(), lead = (base.getDay() + 6) % 7, today = dayStr();
    const D = S.days || {}, ds = d => dayStr(new Date(y, mo, d));
    const first = Object.keys(D).sort()[0] || today, canPrev = first.slice(0, 7) < ds(1).slice(0, 7);
    let cells = "", cnt = 0;
    for (let i = 0; i < lead; i++) cells += '<span class="cd e"></span>';
    for (let d = 1; d <= nd; d++) {
      const k = ds(d), v = D[k], col = (lead + d - 1) % 7;
      const on = v === 1 || v === 2, pv = d > 1 && col > 0 && (D[ds(d - 1)] === 1 || D[ds(d - 1)] === 2), nx = d < nd && col < 6 && (D[ds(d + 1)] === 1 || D[ds(d + 1)] === 2);
      if (v === 1) cnt++;
      cells += `<span class="cd${on ? " on" : ""}${v === 2 ? " fz" : ""}${on && pv ? " l" : ""}${on && nx ? " r" : ""}${k === today ? " td" : ""}${k > today ? " fu" : ""}"><b>${v === 2 ? "❄" : d}</b></span>`;
    }
    for (let i = lead + nd; i < 42; i++) cells += '<span class="cd e"></span>';
    return `<div class="cal-h"><button class="cal-nav" data-act="cal-prev" aria-label="Oldingi oy" ${canPrev ? "" : "disabled"}>‹</button><b>${MONTHS[mo]} ${y}</b><button class="cal-nav" data-act="cal-next" aria-label="Keyingi oy" ${calOff < 0 ? "" : "disabled"}>›</button></div>
      <div class="cal-g">${["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map(w => `<span class="wd">${w}</span>`).join("")}${cells}</div>
      <p class="cal-f">Bu oyda <b>${cnt}</b> kun dars qilindi${Object.values(D).includes(2) ? " · ❄ — olov himoyasi saqlab qolgan kun" : ""}</p>`;
  }
  function showStreak() {
    calOff = 0;
    const m = document.createElement("div"); m.className = "sheet-modal";
    const done = S.lastDay === dayStr();
    m.innerHTML = `<div class="card streakcal" role="dialog" aria-label="Olovli kunlar kalendari">
      <div class="sc-top"><span class="sc-fire ${S.streak ? "" : "off"}">🔥</span><div><b>${S.streak} kun</b><small>${S.streak ? (done ? "Bugungi olov yoqildi!" : "Bugun dars qilib, olovni davom ettiring") : "Bugun dars qilib, olovni yoqing"}</small></div></div>
      <div class="sc-stats"><span><b>${S.bestStreak || 0}</b><small>Eng uzun</small></span><span><b>${Object.values(S.days || {}).filter(v => v === 1).length}</b><small>Jami kun</small></span><span><b>❄️ ${S.freezes || 0}</b><small>Himoya</small></span></div>
      <div id="calbox">${calHTML()}</div>
      <button class="btn" data-act="close-simple">Yopish</button></div>`;
    m.addEventListener("click", e => {
      if (e.target === m || e.target.closest('[data-act="close-simple"]')) return m.remove();
      const nb = e.target.closest("[data-act=cal-prev],[data-act=cal-next]"); if (!nb || nb.disabled) return;
      calOff += nb.dataset.act === "cal-prev" ? -1 : 1; m.querySelector("#calbox").innerHTML = calHTML();
    });
    document.body.appendChild(m);
  }
  function showSimple() {
    const st = session.q[session.i];
    const txt = st.simple || (st.review && EX[st.id] ? EX[st.id].l.simple : session.l.simple);
    const m = document.createElement("div"); m.className = "sheet-modal";
    m.innerHTML = `<div class="card" role="dialog" aria-label="Soddaroq tushuntirish"><div class="say">${mascot("think")}<div class="sb">Keling, boshqacha tushuntiraman.</div></div>${st.hint ? `<p><b>Yordam:</b> <code style="font-family:var(--f-mono)">${esc(st.hint)}</code></p>` : ""}<p>${esc(txt)}</p><button class="btn" data-act="close-simple">Tushundim</button></div>`;
    m.addEventListener("click", e => { if (e.target === m || e.target.closest('[data-act="close-simple"]')) m.remove(); });
    document.body.appendChild(m);
  }

  /* ---------- confetti ---------- */
  function confetti() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = document.createElement("canvas"); cv.id = "confetti"; document.body.appendChild(cv);
    const ctx = cv.getContext("2d"); const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const cols = ["#1f9d55", "#f5a400", "#2f6fdb", "#e5484d", "#7c5cff", "#0e9384"];
    const P = Array.from({ length: 140 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 11, vy: -Math.random() * 12 - 4, s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: pick(cols) }));
    const t0 = performance.now();
    const step = t => {
      const dt = t - t0; ctx.clearRect(0, 0, innerWidth, innerHeight);
      P.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - dt / 2600); ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (dt < 2600) requestAnimationFrame(step); else cv.remove();
    };
    requestAnimationFrame(step);
  }

  /* ---------- kunlik vazifalar va tangalar ---------- */
  const QUESTS = {
    lesson1: { t: "1 ta dars tugating", n: 1, ev: "lesson" },
    lesson2: { t: "2 ta dars tugating", n: 2, ev: "lesson" },
    perfect: { t: "1 ta darsni xatosiz tugating", n: 1, ev: "perfect" },
    xp30: { t: "30 XP to'plang", n: 30, ev: "xp" },
    review: { t: "3 ta takrorlash savoliga to'g'ri javob bering", n: 3, ev: "review" },
    combo: { t: "Ketma-ket 5 ta to'g'ri javob bering", n: 5, ev: "combo", max: true },
    live: { t: "2 ta jonli SQL yoki formula yozing", n: 2, ev: "live" }
  };
  const Q_REWARD = 10, FREEZE_COST = 30, FREEZE_MAX = 2, REF_GIFT = 50;
  const SITE = "https://yetakla.github.io/";
  function quests() {
    const t = dayStr();
    if (!S.quests || S.quests.day !== t) {
      let h = 7; for (const c of t) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const rest = ["perfect", "xp30", "review", "combo"]; if (S.formulasOk > 0 || S.badges.first_sql) rest.push("live");
      const ids = [(S.goal || 20) >= 50 ? "lesson2" : "lesson1"];
      while (ids.length < 3) { ids.push(rest.splice(h % rest.length, 1)[0]); h = Math.floor(h / 5) + 11; }
      S.quests = { day: t, ids, p: {}, got: {} };
    }
    return S.quests;
  }
  function questEv(ev, n) {
    if (!S.onboarded) return;
    const q = quests(); n = n || 1;
    q.ids.forEach(id => {
      const d = QUESTS[id]; if (!d || d.ev !== ev || q.got[id]) return;
      q.p[id] = d.max ? Math.max(q.p[id] || 0, n) : (q.p[id] || 0) + n;
      if (q.p[id] >= d.n) { q.got[id] = 1; S.coins = (S.coins || 0) + Q_REWARD; addXp(Q_REWARD, true); toastQ.push({ name: d.t, pre: "Vazifa bajarildi: ", emo: "🎯", c: "#f5a400" }); }
    });
    if (!q.all && q.ids.every(id => q.got[id])) { q.all = 1; S.coins += 20; toastQ.push({ name: "+20 🪙 bonus", pre: "Barcha vazifalar bajarildi! ", emo: "🏆", c: "#1f9d55" }); }
  }
  function gift(n, name) { S.coins = (S.coins || 0) + n; toastQ.push({ name, pre: "", emo: "🎁", c: "#7c5cff" }); save(); if (!session) renderHome(); }
  function questsHTML() {
    const q = quests(), fz = S.freezes || 0, can = fz < FREEZE_MAX && (S.coins || 0) >= FREEZE_COST;
    return `<div class="card quests"><div class="qhead"><h3>Kunlik vazifalar</h3><span class="coins" title="Tangalar">🪙 ${S.coins || 0}</span></div>
      ${q.ids.map(id => { const d = QUESTS[id], v = Math.min(d.n, q.p[id] || 0), ok = !!q.got[id]; return `<div class="quest ${ok ? "ok" : ""}"><span class="qi">${ok ? I.check : I.target}</span><span class="qt"><b>${esc(d.t)}</b><i class="bar"><i style="width:${Math.round(100 * v / d.n)}%"></i></i></span><span class="qn">${ok ? `+${Q_REWARD} 🪙` : `${v}/${d.n}`}</span></div>`; }).join("")}
      <div class="freeze"><span class="fz-ic">❄️</span><span class="qt"><b>Olov himoyasi · ${fz}/${FREEZE_MAX}</b><small>Bir kun o'tkazib yuborsangiz ham olov o'chmaydi</small></span><button class="btn sky sm" data-act="buy-freeze" ${can ? "" : "disabled"}>${fz >= FREEZE_MAX ? "To'liq" : `${FREEZE_COST} 🪙`}</button></div></div>`;
  }

  /* ---------- telefonga o'rnatish (PWA) ---------- */
  let installEv = null;
  const isStandalone = () => (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEv = e; if (S && !session && S.onboarded && tab === "home") renderHome(); });
  addEventListener("appinstalled", () => { installEv = null; if (S && !session) renderHome(); });
  const canInstall = () => !isStandalone() && !!window.DY_CLOUD && (installEv || isIOS());
  function installHTML() {
    if (!canInstall() || (S.installHide && S.installHide > dayStr())) return "";
    return `<div class="card install"><span class="ic">📲</span><span class="txt"><b>Telefonga o'rnating</b><small>Bosh ekrandan bir bosishda oching, internetsiz ham ishlaydi.</small></span><button class="x" data-act="install-no" aria-label="Yopish">${I.close}</button><button class="btn sm" data-act="install">O'rnatish</button></div>`;
  }
  async function doInstall() {
    if (installEv) { installEv.prompt(); try { const r = await installEv.userChoice; if (r && r.outcome === "accepted") installEv = null; } catch (e) { /* */ } renderHome(); return; }
    const m = document.createElement("div"); m.className = "sheet-modal";
    m.innerHTML = `<div class="card" role="dialog" aria-label="O'rnatish"><div class="say">${mascot("happy")}<div class="sb">iPhone'da 3 qadam:</div></div>
      <ol class="steps"><li>Saytni <b>Safari</b>da oching.</li><li>Pastdagi <b>Ulashish</b> tugmasini bosing <span class="kbd">□↑</span></li><li><b>“Bosh ekranga qo'shish”</b> (Add to Home Screen) ni tanlang.</li></ol>
      <button class="btn" data-act="close-simple">Tushundim</button></div>`;
    m.addEventListener("click", e => { if (e.target === m || e.target.closest('[data-act="close-simple"]')) m.remove(); });
    document.body.appendChild(m);
  }

  /* ---------- sakrash sinovi (joylashtirish testi) ---------- */
  const TEST_LIVES = 3;
  function askTest(sid) {
    const si = COURSE.findIndex(s => s.id === sid), n = LESSONS.filter(x => x.si < si && x.l.steps.length && !isDone(x.l.id)).length;
    const m = document.createElement("div"); m.className = "sheet-modal";
    m.innerHTML = `<div class="card" role="dialog" aria-label="Sakrash sinovi"><div class="say">${mascot("think")}<div class="sb">Bilimingiz bormi? Isbotlang!</div></div>
      <h3>${si}-bo'limga sakrash</h3><p class="muted" style="font-size:16px">Oldingi bo'limlardan 10 ta savol. ${TEST_LIVES} marta xato qilsangiz, sinov to'xtaydi. O'tsangiz, ${n} ta dars ochiladi va +30 XP olasiz.</p>
      <button class="btn" data-act="test-go" data-sid="${sid}">Sinovni boshlash</button><button class="btn ghost" data-act="close-simple">Bekor qilish</button></div>`;
    m.addEventListener("click", e => { if (e.target === m || e.target.closest('[data-act="close-simple"],[data-act="test-go"]')) m.remove(); });
    document.body.appendChild(m);
  }
  function startTest(sid) {
    const si = COURSE.findIndex(s => s.id === sid), sec = COURSE[si];
    const prev = COURSE.slice(0, si).filter(s => !s.soon && s.lessons.some(l => l.steps.length && !isDone(l.id)));
    const per = Math.max(1, Math.ceil(10 / Math.max(1, prev.length)));
    let ids = [];
    prev.forEach(s => {
      const ks = shuffle(Object.keys(EX).filter(k => !isDone(EX[k].l.id) && s.lessons.some(l => l.id === EX[k].l.id) && EX[k].st.t !== "match"));
      const quick = ks.filter(k => !/^(sql|formula)$/.test(EX[k].st.t)), live = ks.filter(k => /^(sql|formula)$/.test(EX[k].st.t));
      const L = per >= 3 ? Math.min(1, live.length) : 0; ids = ids.concat(quick.slice(0, per - L), live.slice(0, L));
    });
    ids = ids.slice(0, 10);
    hpush({ tab, lesson: 1 });
    session = { kind: "test", sid, l: { id: "test", title: "Sakrash sinovi", simple: "Bu sinov oldingi bo'limlardan. Bilsangiz — o'tasiz, bilmasangiz — darslar sizni kutadi." }, sec: { color: sec.color }, q: ids.map(k => Object.assign({ id: k }, EX[k].st, { _order: null, _draft: undefined })), i: 0, total: ids.length, firstOk: 0, wrongIds: new Set(), seen: new Set(), t0: Date.now(), xp: 0, mist: 0 };
    renderStep();
  }
  function renderTestFail() {
    $app.innerHTML = `<div class="layer"><div class="center">${mascot("sad")}<h1>Bu safar o'xshamadi</h1><p>Hechqisi yo'q! Darslarni ketma-ket o'tib bilimni mustahkamlang. Sinovni istalgan vaqt qayta topshirish mumkin.</p>
      <div class="foot-center"><button class="btn" data-act="home">Xaritaga qaytish</button></div></div></div>`;
    session = null;
  }

  /* ---------- portfolio (yakuniy loyiha hisoboti) ---------- */
  const FINAL = "s10l5";
  function portfolioCard() {
    if (!LESSONS.some(x => x.l.id === FINAL)) return "";
    const done = isDone(FINAL);
    return `<div class="card portf"><div class="pf-row"><span class="ic">💼</span><span class="txt"><b>Portfolio loyiham</b><small>${done ? "“Mijozlar qiymati” tahlili: sizning SQL so'rovlaringiz, natijalar va xulosalar." : "Yakuniy loyihani (10-bo'lim) tugatsangiz, shu yerda tayyor portfolio hisobotingiz paydo bo'ladi."}</small></span>${done ? "" : `<span class="lockic">${I.lock}</span>`}</div>
      ${done ? `<div class="row"><button class="btn sm" data-act="port-html">Hisobot</button><button class="btn ghost sm" data-act="port-md">README.md</button></div><small id="portst" class="muted"></small>` : ""}</div>`;
  }
  async function buildPortfolio() {
    const L = LESSONS.find(x => x.l.id === FINAL).l, steps = expand(L);
    const theory = L.steps.find(s => s.t === "theory"), cas = L.steps.find(s => s.t === "case");
    const out = [];
    for (const s of steps.filter(s => s.t === "sql")) {
      let q = String(S.port[s.id] || s.solution).trim(), r;
      try { r = await runSQL(q); } catch (e) { q = s.solution; r = await runSQL(q); }
      out.push({ task: s.task, sql: q, r, use: s.use });
    }
    const finds = cas ? cas.steps.map(c => [c.q, c.o[c.a]]) : [];
    const C = window.DY_CLOUD, u = C && C.user();
    return { title: "Mijozlar qiymati tahlili", who: myName(), date: dayStr(), brief: theory ? theory.text : "", story: cas ? cas.story : "", out, finds };
  }
  function portfolioHTMLDoc(P) {
    const tbl = r => `<table><thead><tr>${r.cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${r.rows.slice(0, 20).map(row => `<tr>${row.map(v => `<td>${v === null ? "NULL" : esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    return `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(P.title)} — portfolio</title>
<style>body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;max-width:780px;margin:0 auto;padding:24px 16px 48px;color:#16301e;background:#fff;line-height:1.5}h1{font-size:28px;margin:0 0 4px}h2{font-size:20px;margin:28px 0 8px;border-bottom:2px solid #d5e2d4;padding-bottom:4px}.meta{color:#5b7062;font-size:14px}pre{background:#10261a;color:#d7f5df;padding:12px 14px;border-radius:10px;overflow-x:auto;font-size:13px;white-space:pre-wrap;word-break:break-word}table{border-collapse:collapse;font-size:14px;margin:8px 0;display:block;overflow-x:auto}th,td{border:1px solid #d5e2d4;padding:6px 10px;text-align:left;white-space:nowrap}th{background:#e8f0e7}.use{background:#fff1cc;border-radius:8px;padding:8px 12px;font-size:14px}li{margin:6px 0}.foot{margin-top:36px;color:#5b7062;font-size:13px}</style></head><body>
<h1>${esc(P.title)}</h1><div class="meta">${P.who ? esc(P.who) + " · " : ""}${P.date} · SQL (SQLite) · Yetakla yakuniy loyihasi</div>
<h2>Topshiriq</h2><p>${esc(P.brief)}</p>
${P.out.map((o, i) => `<h2>${i + 1}. ${esc(o.task)}</h2><pre>${esc(o.sql)}</pre>${tbl(o.r)}${o.use ? `<p class="use">${esc(o.use)}</p>` : ""}`).join("")}
<h2>Xulosa va tavsiyalar</h2><p>${esc(P.story)}</p><ul>${P.finds.map(f => `<li><b>${esc(f[0])}</b> ${esc(f[1])}</li>`).join("")}</ul>
<p class="foot">Ma'lumotlar to'qima (o'quv maqsadida). Tayyorlandi: Yetakla — ${SITE}</p></body></html>`;
  }
  function portfolioMD(P) {
    const tbl = r => `| ${r.cols.join(" | ")} |\n|${r.cols.map(() => "---").join("|")}|\n` + r.rows.slice(0, 20).map(row => `| ${row.map(v => v === null ? "NULL" : String(v)).join(" | ")} |`).join("\n");
    return `# ${P.title}\n\n${P.who ? P.who + " · " : ""}${P.date} · SQL (SQLite) · Yetakla yakuniy loyihasi\n\n## Topshiriq\n\n${P.brief}\n\n` +
      P.out.map((o, i) => `## ${i + 1}. ${o.task}\n\n\`\`\`sql\n${o.sql}\n\`\`\`\n\n${tbl(o.r)}\n\n${o.use ? "> " + o.use + "\n\n" : ""}`).join("") +
      `## Xulosa va tavsiyalar\n\n${P.story}\n\n${P.finds.map(f => `- **${f[0]}** ${f[1]}`).join("\n")}\n\n---\nMa'lumotlar to'qima (o'quv maqsadida). Tayyorlandi: [Yetakla](${SITE})\n`;
  }
  function download(name, data, type) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type }));
    a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  async function exportPortfolio(md) {
    const st = document.getElementById("portst"); if (st) st.textContent = "Tayyorlanmoqda…";
    try { const P = await buildPortfolio(); md ? download("README.md", portfolioMD(P), "text/markdown") : download("yetakla-portfolio.html", portfolioHTMLDoc(P), "text/html"); if (st) st.textContent = "Yuklab olindi ✓"; }
    catch (e) { if (st) st.textContent = "Tayyorlab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring."; }
  }

  /* ---------- natija kartochkasi va do'st taklifi ---------- */
  let lastWin = null;
  const inviteLink = () => { const C = window.DY_CLOUD, u = C && C.user(); return u ? SITE + "?ref=" + u.uid : SITE; };
  function wrapText(x, text, maxW) { const w = String(text).split(" "), lines = []; let cur = ""; w.forEach(s => { const t = cur ? cur + " " + s : s; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = s; } else cur = t; }); if (cur) lines.push(cur); return lines; }
  function rrect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  async function makeCard(head) {
    const cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1350; const x = cv.getContext("2d");
    try { await Promise.all(['800 80px "Baloo 2"', '800 40px "Nunito"', '700 40px "Nunito"'].map(f => document.fonts.load(f))); } catch (e) { /* */ }
    const g = x.createLinearGradient(0, 0, 1080, 1350); g.addColorStop(0, "#22b062"); g.addColorStop(1, "#13703b"); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
    x.fillStyle = "rgba(255,255,255,.07)"; for (let i = 0; i < 16; i++) for (let j = 0; j < 20; j++) { x.beginPath(); x.arc(30 + i * 70, 30 + j * 70, 4, 0, 7); x.fill(); }
    x.fillStyle = "#fff"; x.font = '800 64px "Baloo 2", sans-serif'; x.textBaseline = "middle"; x.fillText("Yetakla", 72, 104);
    rrect(x, 60, 190, 960, 930, 48); x.fillStyle = "#fff"; x.fill();
    const svg = mascot("happy").replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="448" ');
    await new Promise(res => { const im = new Image(); im.onload = () => { x.drawImage(im, 390, 260, 300, 336); res(); }; im.onerror = res; im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); });
    x.fillStyle = "#16301e"; x.textAlign = "center"; x.font = '800 68px "Baloo 2", sans-serif';
    const lines = wrapText(x, head, 860).slice(0, 3); lines.forEach((l, i) => x.fillText(l, 540, 680 + i * 80));
    const C = window.DY_CLOUD, u = C && C.user(), y0 = 680 + lines.length * 80 + 30;
    const stats = [["⚡ " + S.xp, "XP"], ["🔥 " + S.streak, "kun ketma-ket"], ["📚 " + S.lessonsDone, "dars"]];
    stats.forEach((s, i) => { const cx = 120 + i * 290; rrect(x, cx, y0, 260, 170, 30); x.fillStyle = "#e8f0e7"; x.fill(); x.fillStyle = "#16301e"; x.font = '800 56px "Baloo 2", sans-serif'; x.fillText(s[0], cx + 130, y0 + 68); x.fillStyle = "#5b7062"; x.font = '700 32px "Nunito", sans-serif'; x.fillText(s[1], cx + 130, y0 + 128); });
    if (myName()) { x.fillStyle = "#5b7062"; x.font = '700 38px "Nunito", sans-serif'; x.fillText(myName().split(/\s+/).slice(0, 2).join(" ").slice(0, 32), 540, y0 + 230); }
    x.fillStyle = "#fff"; x.font = '800 54px "Baloo 2", sans-serif'; x.fillText("yetakla.github.io", 540, 1200);
    x.font = '700 34px "Nunito", sans-serif'; x.fillStyle = "rgba(255,255,255,.88)"; x.fillText("O'zbek tilida, o'yin orqali o'rganing", 540, 1264);
    return new Promise(r => cv.toBlob(r, "image/png"));
  }
  function defaultHead() { return S.streak >= 2 ? `${S.streak} kun ketma-ket o'qiyapman!` : S.lessonsDone ? `${S.lessonsDone} ta dars tugatdim!` : "Yetakla'da o'rganishni boshladim!"; }
  async function shareResult(head, btn) {
    head = head || defaultHead(); if (btn) btn.disabled = true;
    try {
      const blob = await makeCard(head), file = new File([blob], "yetakla.png", { type: "image/png" });
      const text = head + " Men bilan birga o'rganing: " + inviteLink();
      if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
      download("yetakla-natija.png", blob); toastNow("Rasm saqlandi — Telegram yoki Instagram'ga joylang", "🖼️");
    } catch (e) { toastNow("Rasm tayyorlab bo'lmadi", "⚠️"); }
    finally { if (btn) btn.disabled = false; }
  }
  function toastNow(name, emo) { toastQ.push({ name, pre: "", emo, c: "#2f6fdb" }); flushToasts(); }
  async function shareInvite() {
    const link = inviteLink(), text = `Yetakla'da men bilan birga o'rganing! Shu havola orqali kirsangiz, ikkalamiz ham +${REF_GIFT} 🪙 olamiz:`;
    if (navigator.share) { try { await navigator.share({ title: "Yetakla", text, url: link }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(text + " " + link); toastNow("Havola nusxalandi", "🔗"); } catch (e) { toastNow(link, "🔗"); }
  }
  function friendsCard() {
    const C = window.DY_CLOUD, u = C && C.user();
    return `<div class="card friends"><h3>Do'stlar bilan</h3><p class="muted" style="margin:6px 0 12px">${u ? `Do'stingiz havolangiz orqali kirib, hisob ochsa, ikkalangiz ham +${REF_GIFT} 🪙 olasiz. Taklif qilganlaringiz: ${(S.refClaimed || []).length} ta.` : "Natijangizni ulashing. Do'st taklif qilish va bonus olish uchun hisobga kiring."}</p>
      <div class="row">${u ? `<button class="btn sm" data-act="invite">Do'stni taklif qilish</button>` : ""}<button class="btn ghost sm" data-act="share">Natijamni ulashish</button></div></div>`;
  }
  function tgRow(row) {
    const C = window.DY_CLOUD, bot = window.YETAKLA_TG_BOT; if (!C || !bot) return "";
    const u = C.user(), on = C.tg && C.tg();
    return row("Telegram eslatmasi", !u ? "Avval hisobga kiring" : on ? "Ulangan ✓ Har kuni kechqurun eslatadi" : "Dars qilmagan kuni kechqurun eslatadi", u ? `<a class="btn sky sm" href="https://t.me/${esc(bot)}?start=${esc(u.uid)}" target="_blank" rel="noopener">${on ? "Sozlash" : "Ulash"}</a>` : "");
  }


  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act],[data-tab],[data-lesson],[data-start],[data-goal],[data-ogoal],[data-skip],[data-emo]");
    if (!t) return;
    if (t.dataset.emo) { if (emoOf("emo:" + t.dataset.emo)) setPhoto("emo:" + t.dataset.emo); return; }
    if (t.dataset.skip) return askTest(t.dataset.skip);
    if (t.dataset.tab) { if (tab !== t.dataset.tab) hpush({ tab: t.dataset.tab }); tab = t.dataset.tab; openLesson = null; modal = null; renderHome(); window.scrollTo(0, 0); return; }
    if (t.dataset.lesson) { openLesson = openLesson === t.dataset.lesson ? null : t.dataset.lesson; renderHome(); return; }
    if (t.dataset.start) {
      openLesson = null; const C = window.DY_CLOUD;
      if (C && !C.user() && S.askDay !== dayStr()) { askSignup(t.dataset.start); return; }
      beginLesson(t.dataset.start); return;
    }
    if (t.dataset.goal) { S.goal = +t.dataset.goal; save(); renderHome(); return; }
    if (t.dataset.ogoal) { S.goal = +t.dataset.ogoal; renderOnboard(2); return; }
    const a = t.dataset.act;
    if (a === "onb-next") return renderOnboard("dir");
    if (a === "onb-dir") return renderOnboard(2);
    if (a === "onb-done") { S.onboarded = true; save(); return renderHome(); }
    if (a === "check") return submit();
    if (a === "next") return next();
    if (a === "fix") { phase = "answer"; document.getElementById("lfoot").innerHTML = footAnswer(); refreshCheck(); return; }
    if (a === "simple") return showSimple();
    if (a === "signup-later") { S.askDay = dayStr(); save(); const id = pendingStart; pendingStart = null; closeSheet(); if (id) beginLesson(id); return; }
    if (a === "quit") return leaveLesson();
    if (a === "home") { leaveLesson(); window.scrollTo(0, 0); return; }
    if (a === "practice" || a === "mistakes") { if (!(history.state && history.state.lesson)) hpush({ tab, lesson: 1 }); return startPractice(a); }
    if (a === "buy-freeze") { if ((S.freezes || 0) >= FREEZE_MAX || (S.coins || 0) < FREEZE_COST) return; S.coins -= FREEZE_COST; S.freezes = (S.freezes || 0) + 1; save(); renderHome(); sfx("badge"); return; }
    if (a === "install") return doInstall();
    if (a === "install-no") { const d = new Date(); d.setDate(d.getDate() + 7); S.installHide = dayStr(d); save(); renderHome(); return; }
    if (a === "test-go") return startTest(t.dataset.sid);
    if (a === "port-html") return exportPortfolio(false);
    if (a === "port-md") return exportPortfolio(true);
    if (a === "share") return shareResult(null, t);
    if (a === "share-win") return shareResult(lastWin, t);
    if (a === "invite") return shareInvite();
    if (a === "name-edit") return editName();
    if (a === "name-save") return saveName();
    if (a === "photo-edit") return editPhoto();
    if (a === "photo-del") return setPhoto("");
    if (a === "photo-google") { const u = window.DY_CLOUD && window.DY_CLOUD.user(); if (u && u.photoURL) setPhoto(u.photoURL); return; }
    if (a === "badges-all") { allBadges = !allBadges; renderHome(); return; }
    if (a === "rv-all" || a === "rv-fr") { rankView = a === "rv-fr" ? "fr" : "all"; renderHome(); return; }
    if (a === "sound") { S.sound = !S.sound; save(); renderHome(); sfx("toggle"); return; }
    if (a === "streak") { showStreak(); return; }
    if (a === "theme") { setTheme(isDark() ? "light" : "dark"); renderHome(); return; }
    if (a === "music") { S.music = !S.music; save(); audio(); if (!S.music) musicStopNow(); renderHome(); return; }
    if (a === "reset") { modal = "reset"; renderHome(); return; }
    if (a === "reset-no") { modal = null; renderHome(); return; }
    if (a === "reset-yes") { modal = null; S = fresh(); save(); tab = "home"; renderOnboard(1); return; }
  });
  document.addEventListener("keydown", e => {
    if (!session || document.querySelector(".sheet-modal")) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (e.key === "Enter" && tag !== "textarea") {
      e.preventDefault();
      if (phase === "answer") { const st = session.q[session.i]; if (st.t === "theory") next(); else if (ctl && ctl.ready()) submit(); }
      else if (phase === "result") next();
      else if (phase === "soft") document.querySelector('[data-act="fix"]').click();
    } else if (/^[1-4]$/.test(e.key) && tag !== "textarea" && tag !== "input" && phase === "answer" && ctl && ctl.key) ctl.key(+e.key);
  });

  addEventListener("popstate", e => {
    const st = e.state || {};
    if (st.lesson && !session) { history.back(); return; }
    session = null; tab = st.tab || "home"; openLesson = null; modal = null; renderHome(); window.scrollTo(0, 0);
  });
  load();
  if (S.photo && !S.photoSm) thumbOf(S.photo).then(t => { S.photoSm = t; save(); });
  try { history.replaceState({ tab: "home" }, ""); } catch (e) { /* iframe */ }
  if (!S.onboarded) renderOnboard(1); else renderHome();
  window.DY_APP = { state: () => S, startLesson, cur: () => session && session.q[session.i], version: "1.3", musicOn: () => !!mTimer && !mOff,
    gift, quests: () => quests(),
    replaceState(ns) { S = Object.assign(fresh(), ns); backfillDays(); rollDay(); save(); if (!session) renderHome(); },
    refresh() {
      if (pendingStart && window.DY_CLOUD && window.DY_CLOUD.user()) { const id = pendingStart; pendingStart = null; closeSheet(); beginLesson(id); return; }
      if (!session && S.onboarded) renderHome();
    } };
  if (window.DY_CLOUD) window.DY_CLOUD.start();
})();
