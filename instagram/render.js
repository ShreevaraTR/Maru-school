// Renders every .slide in slides.html to export/<id>.png at 1080x1350.
// Usage: npx playwright@1 (or a global playwright) -> node render.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const out = path.join(__dirname, 'export'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1 });
  if (process.env.ROUTE_VIA_NODE) { // sandbox helper: fetch external assets through Node
    await p.route(u => !u.href.startsWith('file:'), async route => {
      try { const r = await fetch(route.request().url(), { headers: { 'user-agent': route.request().headers()['user-agent'] } });
        const h = {}; r.headers.forEach((v, k) => { if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(k)) h[k] = v; });
        await route.fulfill({ status: r.status, headers: h, body: Buffer.from(await r.arrayBuffer()) });
      } catch { await route.abort(); } });
  }
  await p.goto('file://' + path.join(__dirname, 'slides.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const ids = await p.$$eval('.slide', s => s.map(x => x.id));
  for (const id of ids) await (await p.$('#' + id)).screenshot({ path: path.join(out, id + '.png') });
  console.log('Rendered', ids.length, 'slides to', out);
  await b.close();
})();
