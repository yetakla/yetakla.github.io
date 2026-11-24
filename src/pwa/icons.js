const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + process.cwd() + '/datayol.html'); await p.waitForTimeout(300);
  const svg = await p.evaluate(() => { const s = document.querySelector('svg.mascot').cloneNode(true); s.removeAttribute('class'); s.querySelectorAll('[class]').forEach(e => e.removeAttribute('class')); return s.outerHTML; });
  const mk = async (size, out, pad, round) => {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<html><body style="margin:0"><div style="width:${size}px;height:${size}px;border-radius:${round ? size * 0.22 : 0}px;background:linear-gradient(160deg,#2bbd6c,#157a40);display:grid;place-items:center"><div style="width:${size * (1 - pad * 2)}px;height:${size * (1 - pad * 2)}px;display:grid;place-items:center">${svg.replace('<svg', '<svg style="height:100%;width:auto"')}</div></div></body></html>`);
    await p.screenshot({ path: out, omitBackground: true });
  };
  await mk(192, 'pwa/icon-192.png', 0.12, false);
  await mk(512, 'pwa/icon-512.png', 0.12, false);
  await mk(512, 'pwa/icon-maskable-512.png', 0.22, false);
  await mk(180, 'pwa/apple-touch-icon.png', 0.12, false);
  await b.close();
})();
