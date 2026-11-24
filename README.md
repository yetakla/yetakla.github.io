# Yetakla

Data analitikani o'zbek tilida, o'yin shaklida o'rganish uchun ilova.

**Sayt:** https://yetakla.github.io/

## Kurs

11 bo'lim, 59 dars: analitik fikrlash → Excel → statistika → SQL asoslari → SQL o'rta va ilg'or → ma'lumotlarni tozalash → Power BI → Tableau va Superset → Python → AI bilan ishlash → karyera.

- Jonli SQL mashqlari (brauzerda sql.js orqali)
- Jonli Excel formula mashqlari
- XP, olov (streak), jonlar, kunlik maqsad, nishonlar
- Xatolar keyingi darslarda takrorlanadi
- Progress foydalanuvchi brauzerida saqlanadi, server kerak emas

Barcha misollar to'qima ma'lumotlarga asoslangan.

## Tuzilishi

- `index.html` — tayyor sayt (bitta fayl)
- `src/` — manba fayllar:
  - `data.js` — namuna jadvallar
  - `formula.js` — Excel formula dvigateli
  - `content.js` va `sections/` — kurs kontenti
  - `app.js` — ilova mantig'i
  - `style.css` — dizayn

`src/` ichida `node build.js` buyrug'i `datayol-standalone.html` faylini yig'adi. Saytni yangilash uchun shu faylni `index.html` nomi bilan repository ildiziga ko'chiring.
