/* Yetakla — akkaunt va progress sinxronlash (Firebase Auth + Firestore).
   Faqat sayt versiyasida ishlaydi. FIREBASE_CONFIG bo'sh bo'lsa, bu modul o'chiq turadi. */
(function (g) {
  const FIREBASE_CONFIG = g.YETAKLA_FIREBASE || null;
  if (!FIREBASE_CONFIG) return;
  const V = "10.12.2", CDN = "https://www.gstatic.com/firebasejs/" + V + "/";
  let fb = null, auth = null, db = null, user = null, tgOn = false, fcache = null, refIds = [], status = "idle", timer = null, ready = false, pending = null, isNew = false, bTimer = null, bLast = 0, bSent = "", bcache = null;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const refresh = () => { if (g.DY_APP && g.DY_APP.refresh) g.DY_APP.refresh(); };
  const setStatus = s => { status = s; const el = document.getElementById("cloudst"); if (el) el.textContent = label(); };
  const label = () => ({ idle: "", loading: "Ulanmoqda…", syncing: "Saqlanmoqda…", ok: "Sinxronlangan ✓", error: "Internet yo'q — keyinroq saqlanadi", login: "Kirilmoqda…" }[status] || "");

  // Ikki qurilmadagi progressni birlashtirish: hech narsa yo'qolmasin
  function merge(a, b) {
    const r = Object.assign({}, a);
    r.done = Object.assign({}, b.done || {}, a.done || {});
    r.badges = Object.assign({}, a.badges || {});
    for (const k in (b.badges || {})) r.badges[k] = r.badges[k] ? Math.min(r.badges[k], b.badges[k]) : b.badges[k];
    r.pool = Object.assign({}, b.pool || {}, a.pool || {});
    for (const k of ["xp", "bestStreak", "lessonsDone", "formulasOk", "reviewsOk"]) r[k] = Math.max(a[k] || 0, b[k] || 0);
    const la = a.lastDay || "", lb = b.lastDay || "";
    if (lb > la || (lb === la && (b.streak || 0) > (a.streak || 0))) { r.lastDay = b.lastDay; r.streak = b.streak; }
    if (a.today === b.today) r.todayXp = Math.max(a.todayXp || 0, b.todayXp || 0);
    if (!a.goal && b.goal) r.goal = b.goal;
    r.onboarded = !!(a.onboarded || b.onboarded);
    const wa = a.week || "", wb = b.week || "";
    if (wb > wa) { r.week = wb; r.weekXp = b.weekXp || 0; } else if (wa === wb) r.weekXp = Math.max(a.weekXp || 0, b.weekXp || 0);
    for (const k of ["coins", "freezes"]) r[k] = Math.max(a[k] || 0, b[k] || 0);
    const qa = a.quests, qb = b.quests;
    if (qb && (!qa || qb.day > qa.day)) r.quests = qb;
    else if (qa && qb && qa.day === qb.day) { r.quests = Object.assign({}, qa, { p: Object.assign({}, qb.p, qa.p), got: Object.assign({}, qb.got, qa.got) }); for (const k in qb.p || {}) r.quests.p[k] = Math.max(qa.p[k] || 0, qb.p[k]); }
    r.port = Object.assign({}, b.port || {}, a.port || {});
    r.name = a.name || b.name || "";
    if ((b.photoAt || 0) > (a.photoAt || 0)) { r.photo = b.photo || ""; r.photoAt = b.photoAt; }
    r.refBy = a.refBy || b.refBy || ""; r.refFrom = a.refFrom || b.refFrom || "";
    r.refClaimed = Array.from(new Set([].concat(a.refClaimed || [], b.refClaimed || [])));
    return r;
  }

  async function load() {
    if (fb) return fb;
    const [app, au, fs] = await Promise.all([import(CDN + "firebase-app.js"), import(CDN + "firebase-auth.js"), import(CDN + "firebase-firestore.js")]);
    const inst = app.initializeApp(FIREBASE_CONFIG);
    auth = au.getAuth(inst); db = fs.getFirestore(inst);
    fb = { au, fs };
    return fb;
  }

  const nameOf = () => { const st = g.DY_APP && g.DY_APP.state(); return String((st && st.name) || (user && user.displayName) || "").trim(); };
  // Reyting uchun qisqa ism: "Doniyorjon Kuchkarov" -> "Doniyorjon K."
  const shortName = n => { const p = String(n || "").trim().split(/\s+/).filter(Boolean); return !p.length ? "Nomsiz" : (p[0].slice(0, 24) + (p[1] ? " " + p[1][0].toUpperCase() + "." : "")); };
  // Haftalik reyting yozuvi: XP o'zgarganda, ko'pi bilan daqiqada bir marta
  async function pushBoard(force) {
    clearTimeout(bTimer); bTimer = null;
    const st = g.DY_APP && g.DY_APP.state(); if (!user || !fb || !st || !st.week || !(st.weekXp > 0)) return;
    const key = st.week + ":" + st.weekXp + ":" + nameOf(); if (key === bSent) return;
    const wait = 60000 - (Date.now() - bLast);
    if (!force && wait > 0) { bTimer = setTimeout(() => pushBoard(true), wait); return; }
    bLast = Date.now();
    try {
      await fb.fs.setDoc(fb.fs.doc(db, "boards", st.week, "users", user.uid), { name: shortName(nameOf()), wxp: Math.round(st.weekXp), at: fb.fs.serverTimestamp() });
      bSent = key; bcache = null;
    } catch (e) { bTimer = setTimeout(() => pushBoard(true), 30000); }
  }

  async function push() {
    if (!user || !fb) return;
    const st = pending || (g.DY_APP && g.DY_APP.state()); pending = null; if (!st) return;
    setStatus("syncing");
    try {
      const data = { s: JSON.stringify(st), xp: st.xp || 0, lessons: st.lessonsDone || 0, name: nameOf().slice(0, 60), days: fb.fs.arrayUnion(st.today || ""), at: fb.fs.serverTimestamp() };
      if (isNew) data.created = fb.fs.serverTimestamp();
      await fb.fs.setDoc(fb.fs.doc(db, "users", user.uid), data, { merge: true });
      isNew = false; setStatus("ok"); pushBoard();
    } catch (e) { setStatus("error"); timer = setTimeout(push, 15000); }
  }

  async function pull() {
    setStatus("syncing");
    try {
      const snap = await fb.fs.getDoc(fb.fs.doc(db, "users", user.uid));
      const local = g.DY_APP.state();
      isNew = !snap.exists();
      tgOn = !isNew && !!snap.data().tg;
      if (!isNew) {
        const remote = JSON.parse(snap.data().s || "{}");
        g.DY_APP.replaceState(merge(local, remote));
      }
      ready = true;
      await push();
      refs();
    } catch (e) { setStatus("error"); }
  }

  // Do'st taklifi: yangi foydalanuvchi refs/{uid} = {by} yozadi; taklif qilgan o'z bonuslarini o'qib oladi
  async function refs() {
    const st = g.DY_APP.state();
    try {
      if (st.refFrom && !st.refBy && st.refFrom !== user.uid) {
        const by = st.refFrom;
        try { await fb.fs.setDoc(fb.fs.doc(db, "refs", user.uid), { by, at: fb.fs.serverTimestamp() }); st.refBy = by; st.refFrom = ""; g.DY_APP.gift(50, "Do'stingiz taklifi uchun +50 🪙"); }
        catch (e) { st.refFrom = ""; }
      }
      const snap = await fb.fs.getDocs(fb.fs.query(fb.fs.collection(db, "refs"), fb.fs.where("by", "==", user.uid), fb.fs.limit(100)));
      refIds = []; snap.forEach(d => refIds.push(d.id));
      const cl = st.refClaimed || (st.refClaimed = []), fresh = refIds.filter(id => !cl.includes(id));
      if (fresh.length) { fresh.forEach(id => cl.push(id)); g.DY_APP.gift(50 * fresh.length, `${fresh.length} ta do'stingiz qo'shildi: +${50 * fresh.length} 🪙`); }
    } catch (e) { /* qoidalar hali yo'q yoki internet yo'q */ }
  }

  g.DY_CLOUD = {
    user: () => user,
    boardCache: () => bcache && user && bcache.uid === user.uid && Date.now() - bcache.t < 60000 ? bcache : null,
    async board() {
      if (!user || !fb) return null;
      const st = g.DY_APP.state(), wk = st.week;
      const c = this.boardCache(); if (c && c.week === wk) return c;
      try {
        if (bTimer || (st.weekXp > 0 && bSent !== wk + ":" + st.weekXp + ":" + nameOf())) await pushBoard(true);
        const col = fb.fs.collection(db, "boards", wk, "users");
        const snap = await fb.fs.getDocs(fb.fs.query(col, fb.fs.orderBy("wxp", "desc"), fb.fs.limit(50)));
        const rows = []; snap.forEach(d => rows.push(Object.assign({ id: d.id }, d.data())));
        let me = null;
        if (!rows.some(r => r.id === user.uid) && st.weekXp > 0) {
          const cnt = await fb.fs.getCountFromServer(fb.fs.query(col, fb.fs.where("wxp", ">", Math.round(st.weekXp))));
          me = { rank: cnt.data().count + 1, wxp: st.weekXp };
        }
        bcache = { t: Date.now(), week: wk, rows, me, uid: user.uid };
        return bcache;
      } catch (e) { return { error: true }; }
    },
    tg: () => tgOn,
    nameChanged() { fcache = null; bcache = null; if (user && ready) { pending = g.DY_APP.state(); clearTimeout(timer); push(); pushBoard(true); } },
    friendsCache: () => fcache && user && fcache.uid === user.uid && Date.now() - fcache.t < 60000 ? fcache : null,
    async friends() {
      if (!user || !fb) return null;
      const c = this.friendsCache(); if (c) return c;
      try {
        const st = g.DY_APP.state(), wk = st.week;
        if (bTimer || (st.weekXp > 0 && bSent !== wk + ":" + st.weekXp + ":" + nameOf())) await pushBoard(true);
        if (!refIds.length) await refs();
        const ids = Array.from(new Set([].concat(refIds, st.refBy ? [st.refBy] : []))).filter(x => x !== user.uid).slice(0, 40);
        const docs = await Promise.all([user.uid].concat(ids).map(id => fb.fs.getDoc(fb.fs.doc(db, "boards", wk, "users", id)).then(d => d.exists() ? Object.assign({ id }, d.data()) : null).catch(() => null)));
        const rows = docs.filter(Boolean);
        if (!rows.some(r => r.id === user.uid)) rows.push({ id: user.uid, name: shortName(nameOf()), wxp: Math.round(st.weekXp || 0) });
        fcache = { t: Date.now(), uid: user.uid, rows, count: ids.length, idle: ids.length - rows.filter(r => r.id !== user.uid).length };
        return fcache;
      } catch (e) { return { error: true }; }
    },
    onSave(st) {
      if (!user || !ready) return;
      pending = st; clearTimeout(timer); timer = setTimeout(push, 2500);
    },
    card() {
      if (user) {
        return `<div class="card cloud acct"><div class="cl-row"><span class="g-ic"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2.1v2.8C3.9 20.6 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.1 4.9l3.7-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.4 2.1 7.1l3.7 2.8c.9-2.6 3.3-4.5 6.2-4.5z"/></svg></span><div class="cl-info"><b>Google hisobi</b><small id="cloudst">${label() || "Progress saqlanmoqda"}</small></div><button class="btn ghost sm" data-act="cloud-logout">Chiqish</button></div></div>`;
      }
      return `<div class="card cloud"><h3>Progressni saqlang</h3><p class="muted" style="margin:6px 0 12px">Hisobga kirsangiz, progressingiz telefon va kompyuterda bir xil bo'ladi va hech qachon yo'qolmaydi.</p><button class="btn gbtn" data-act="cloud-login"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.6H2.1v2.8C3.9 20.6 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.1 4.9l3.7-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.4 2.1 7.1l3.7 2.8c.9-2.6 3.3-4.5 6.2-4.5z"/></svg><span>Google bilan kirish</span></button><small id="cloudst" class="muted" style="display:block;margin-top:8px">${label()}</small></div>`;
    },
    async start() {
      try {
        await load();
        fb.au.onAuthStateChanged(auth, async u => {
          user = u; ready = false;
          if (u) { refresh(); await pull(); refresh(); } else { setStatus("idle"); refresh(); }
        });
      } catch (e) { /* internet yo'q — mahalliy rejim */ }
    }
  };

  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-act^='cloud-']"); if (!b) return;
    if (b.dataset.act === "cloud-login") {
      setStatus("login");
      try {
        await load();
        const p = new fb.au.GoogleAuthProvider();
        try { await fb.au.signInWithPopup(auth, p); }
        catch (err) {
          if (err && /popup-blocked|operation-not-supported/.test(err.code || "")) await fb.au.signInWithRedirect(auth, p);
          else if (err && /popup-closed|cancelled-popup/.test(err.code || "")) setStatus("idle");
          else throw err;
        }
      } catch (err) { setStatus("idle"); const el = document.getElementById("cloudst"); if (el) el.textContent = "Kirib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring."; }
    }
    if (b.dataset.act === "cloud-logout") { clearTimeout(timer); if (pending) await push(); if (bTimer) await pushBoard(true); bcache = null; fcache = null; refIds = []; tgOn = false; bSent = ""; try { await fb.au.signOut(auth); } catch (err) { /* */ } }
  });
})(typeof window !== "undefined" ? window : globalThis);
