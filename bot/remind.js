/* Yetakla Telegram eslatma boti.
   GitHub Actions har 15 daqiqada ishga tushiradi:
   1) botga kelgan xabarlarni o'qiydi (/start <uid> — ulash, /stop — o'chirish);
   2) Toshkent vaqti bilan 20:00 dan keyin, kuniga bir marta, bugun dars qilmaganlarga eslatma yuboradi.
   Kerakli secret'lar: TG_TOKEN (BotFather), FIREBASE_SA (xizmat hisobi JSON). */
const admin = require("firebase-admin");
const TOKEN = process.env.TG_TOKEN, SA = process.env.FIREBASE_SA;
if (!TOKEN || !SA) { console.log("TG_TOKEN yoki FIREBASE_SA yo'q — o'tkazib yuborildi"); process.exit(0); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(SA)) });
const db = admin.firestore();
const SITE = "https://yetakla.github.io/";
const HOUR = +(process.env.REMIND_HOUR || 20);

const tg = async (method, body) => {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
};
const send = (chat, text) => tg("sendMessage", { chat_id: chat, text, disable_web_page_preview: true });
const tashkent = () => { const d = new Date(Date.now() + 5 * 3600e3); return { day: d.toISOString().slice(0, 10), hour: d.getUTCHours() }; };

async function updates(meta) {
  const res = await tg("getUpdates", { offset: (meta.offset || 0) + 1, timeout: 0, allowed_updates: ["message"] });
  if (!res.ok) { console.log("getUpdates xato", res.description); return; }
  for (const u of res.result) {
    meta.offset = Math.max(meta.offset || 0, u.update_id);
    const m = u.message; if (!m || !m.text || !m.chat) continue;
    const chat = m.chat.id, text = m.text.trim();
    const st = /^\/start(?:\s+([A-Za-z0-9]{10,40}))?$/.exec(text);
    if (st && st[1]) {
      const uid = st[1], user = await db.doc(`users/${uid}`).get();
      if (!user.exists) { await send(chat, "Hisob topilmadi. Yetakla saytida Google bilan kirib, Profil → Telegram eslatmasi → Ulash tugmasini bosing."); continue; }
      await db.doc(`tg/${uid}`).set({ chat, on: true, at: admin.firestore.FieldValue.serverTimestamp() });
      await db.doc(`users/${uid}`).set({ tg: true }, { merge: true });
      await send(chat, `✅ Ulandi! Dars qilmagan kuningiz soat ${HOUR}:00 atrofida eslataman.\nTo'xtatish: /stop`);
    } else if (st) {
      await send(chat, `Salom! Men Yetakla eslatma botiman 🐦\nUlash uchun saytda Profil → Telegram eslatmasi → Ulash tugmasini bosing: ${SITE}`);
    } else if (/^\/stop$/.test(text)) {
      const q = await db.collection("tg").where("chat", "==", chat).get();
      for (const d of q.docs) { await d.ref.set({ on: false }, { merge: true }); await db.doc(`users/${d.id}`).set({ tg: false }, { merge: true }); }
      await send(chat, "Eslatmalar o'chirildi. Qayta yoqish uchun saytda yana Ulash tugmasini bosing.");
    }
  }
}

async function remind(meta) {
  const { day, hour } = tashkent();
  if (hour < HOUR || meta.sentDay === day) return;
  meta.sentDay = day;
  const links = await db.collection("tg").where("on", "==", true).get();
  let n = 0;
  for (const d of links.docs) {
    try {
      const u = await db.doc(`users/${d.id}`).get(); if (!u.exists) continue;
      const data = u.data(), days = data.days || [];
      if (days.includes(day)) continue;
      let streak = 0; try { streak = JSON.parse(data.s || "{}").streak || 0; } catch (e) { /* */ }
      const name = String(data.name || "").split(/\s+/)[0];
      const text = streak > 0
        ? `🔥 ${name ? name + ", o" : "O"}lovingiz ${streak} kun! Uni o'chirmang — bugun 5 daqiqalik bitta dars yetarli.\n${SITE}`
        : `🐦 ${name ? name + ", b" : "B"}ugun hali dars qilmadingiz. 5 daqiqa ajrating — Bilag'on kutyapti!\n${SITE}`;
      const r = await send(d.data().chat, text); if (r.ok) n++;
      else if (r.error_code === 403) await d.ref.set({ on: false }, { merge: true }); // foydalanuvchi botni bloklagan
    } catch (e) { console.log("xato", d.id, e.message); }
  }
  console.log("eslatma yuborildi:", n);
}

(async () => {
  const ref = db.doc("meta/tgbot"), snap = await ref.get(), meta = snap.exists ? snap.data() : {};
  await updates(meta);
  await remind(meta);
  await ref.set(meta);
})().catch(e => { console.error(e); process.exit(1); });
