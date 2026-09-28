// Automated UX audit for the Samla web prototype.
// Checks map to the ui-ux-pro-max skill's Pre-Delivery Checklist
// (.claude/skills/ui-ux-pro-max/SKILL.md). Anything that needs human judgement
// (brand fit, copy tone, flow logic) is left for the manual pass.
//
// Usage:
//   node audit/ux-audit.mjs [url] [outDir]   (needs playwright locally or globally)
//   defaults: https://samla-app.vercel.app/  audit/out

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

// Prefer a local playwright install, fall back to the global one.
let chromium;
try { ({ chromium } = await import('playwright')); } catch {
  const globalRoot = execSync('npm root -g').toString().trim();
  ({ chromium } = createRequire(path.join(globalRoot, 'noop.js'))('playwright'));
}

const START = process.argv[2] || 'https://samla-app.vercel.app/';
const OUT = process.argv[3] || 'audit/out';
const MAX_PAGES = 40;

const VIEWPORTS = [
  { name: 'small-375', width: 375, height: 667 },
  { name: 'large-430', width: 430, height: 932 },
];
const THEMES = ['light', 'dark'];

fs.mkdirSync(path.join(OUT, 'screens'), { recursive: true });

const browser = await chromium.launch();

// ---------- in-page checks ----------
function pageChecks(vw) {
  const out = [];
  const add = (rule, severity, el, detail) => {
    const r = el?.getBoundingClientRect?.();
    out.push({
      rule, severity, detail,
      el: el ? describe(el) : null,
      box: r ? { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) } : null,
    });
  };
  function describe(el) {
    const t = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const cls = typeof el.className === 'string' ? el.className.split(/\s+/).slice(0, 2).join('.') : '';
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls : ''}${t ? ` "${t}"` : ''}`;
  }
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // colour helpers
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const blend = (top, bot) => ({
    r: top.r * top.a + bot.r * (1 - top.a),
    g: top.g * top.a + bot.g * (1 - top.a),
    b: top.b * top.a + bot.b * (1 - top.a), a: 1,
  });
  // Effective background; returns null if an image/gradient is involved (can't compute).
  const bgOf = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== 'none') return null;
      const c = parse(s.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let acc = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) acc = blend(layers[i], acc);
    return acc;
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  // 1. Horizontal overflow at this width
  // (compare to the device width: mobile emulation widens the layout viewport to fit content)
  const pw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  if (pw > vw + 1) add('horizontal-scroll', 'high', null, `page is ${pw}px wide on a ${vw}px screen`);

  const interactive = [...document.querySelectorAll('a[href], button, input, select, textarea, [role=button], [role=tab], [role=switch], [role=checkbox], [onclick], [tabindex]:not([tabindex="-1"])')].filter(visible);

  for (const el of interactive) {
    const r = el.getBoundingClientRect();
    // 2. Touch targets >= 44x44
    if ((r.width < 44 || r.height < 44) && !(el.tagName === 'A' && getComputedStyle(el).display === 'inline'))
      add('touch-target', r.width < 32 || r.height < 32 ? 'high' : 'medium', el, `${Math.round(r.width)}×${Math.round(r.height)}px (min 44×44)`);
    // 3. Accessible name on controls
    const name = (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || el.innerText || el.value || el.getAttribute('placeholder') || '').trim()
      || [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join('').trim()
      || (el.id && document.querySelector(`label[for="${el.id}"]`)?.innerText?.trim()) || '';
    if (!name) add('no-accessible-name', 'high', el, 'control has no text, aria-label or label');
    // 4. Emoji as structural icon
    const txt = (el.innerText || '').trim();
    if (txt && /^\p{Extended_Pictographic}[️‍\p{Extended_Pictographic}]*$/u.test(txt))
      add('emoji-icon', 'medium', el, `control is only an emoji "${txt}" — use an SVG icon + label`);
    // 5. cursor-pointer
    if (getComputedStyle(el).cursor !== 'pointer' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
      add('cursor-pointer', 'low', el, 'clickable element without cursor:pointer');
  }

  // 6. Text contrast + tiny text + clipping
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!el || seen.has(el) || !walker.currentNode.textContent.trim() || !visible(el)) continue;
    seen.add(el);
    const s = getComputedStyle(el);
    const size = parseFloat(s.fontSize), weight = +s.fontWeight || 400;
    const fg = parse(s.color), bg = bgOf(el);
    if (fg && bg) {
      const eff = fg.a < 1 ? blend(fg, bg) : fg;
      const cr = ratio(eff, bg);
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;
      if (cr < need) add('contrast', cr < 3 ? 'high' : 'medium', el, `${cr.toFixed(2)}:1 (needs ${need}:1) — ${s.color} on rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)}), ${size}px`);
    }
    if (size < 12) add('tiny-text', 'medium', el, `${size}px text (min ~12px, body 16px)`);
    if ((el.scrollWidth > el.clientWidth + 1 && ['hidden', 'clip'].includes(s.overflowX)) || (el.scrollHeight > el.clientHeight + 1 && ['hidden', 'clip'].includes(s.overflowY) && el.clientHeight > 0))
      add('clipped-text', 'high', el, s.textOverflow === 'ellipsis' ? 'text truncated with ellipsis — is the full value reachable?' : 'text overflows a clipping box');
  }

  // 7. Images
  for (const img of document.querySelectorAll('img')) {
    if (!visible(img)) continue;
    if (!img.hasAttribute('alt')) add('img-alt', 'medium', img, 'img without alt attribute');
  }

  // 8. Still-running animations (this pass is run with reduced-motion on)
  const anims = document.getAnimations?.().filter((a) => a.playState === 'running' && (a.effect?.getComputedTiming?.().duration || 0) > 0) || [];
  if (anims.length && matchMedia('(prefers-reduced-motion: reduce)').matches)
    add('reduced-motion', 'medium', null, `${anims.length} animation(s) still running with prefers-reduced-motion: reduce`);

  // 9. Viewport zoom blocked
  const vp = document.querySelector('meta[name=viewport]')?.content || '';
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(vp)) add('zoom-disabled', 'high', null, `viewport meta blocks zoom: "${vp}"`);

  return out;
}

// Keyboard focus visibility: tab through the page, compare styles before/after focus.
async function focusCheck(page) {
  return page.evaluate(async () => {
    const res = [];
    const els = [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')].slice(0, 40);
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const before = getComputedStyle(el);
      const snap = (s) => [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.backgroundColor, s.borderColor].join('|');
      const b = snap(before);
      el.focus({ focusVisible: true });
      const a = snap(getComputedStyle(el));
      el.blur();
      const s = getComputedStyle(el);
      if (b === a || (s.outlineStyle === 'none' && a === b)) {
        const t = (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40);
        res.push({ rule: 'focus-visible', severity: 'high', el: `${el.tagName.toLowerCase()} "${t}"`, detail: 'no visible change on keyboard focus' });
      }
    }
    return res;
  });
}

// ---------- crawl ----------
const origin = new URL(START).origin;
const queue = [START];
const visited = new Set();
const results = [];

const ctxFor = (vp, theme) => browser.newContext({
  viewport: { width: vp.width, height: vp.height },
  deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  colorScheme: theme, reducedMotion: 'reduce',
});

// Discover pages with the base context.
{
  const ctx = await ctxFor(VIEWPORTS[0], 'light');
  const page = await ctx.newPage();
  while (queue.length && visited.size < MAX_PAGES) {
    const url = queue.shift().split('#')[0];
    if (visited.has(url)) continue;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) { console.error('skip', url, e.message); visited.add(url); continue; }
    visited.add(url);
    const links = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
    for (const l of links) if (l.startsWith(origin) && !visited.has(l.split('#')[0])) queue.push(l);
  }
  await ctx.close();
}

let n = 0;
for (const url of visited) {
  n++;
  const slug = String(n).padStart(2, '0') + '-' + (new URL(url).pathname.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home');
  for (const vp of VIEWPORTS) for (const theme of THEMES) {
    const ctx = await ctxFor(vp, theme);
    const page = await ctx.newPage();
    try { await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); } catch { await ctx.close(); continue; }
    await page.waitForTimeout(400);
    const shot = `screens/${slug}__${vp.name}__${theme}.png`;
    await page.screenshot({ path: path.join(OUT, shot), fullPage: true });
    const issues = await page.evaluate(pageChecks, vp.width);
    if (theme === 'light' && vp === VIEWPORTS[0]) issues.push(...await focusCheck(page));
    const title = await page.title();
    results.push({ url, slug, title, viewport: vp.name, theme, shot, issues });
    await ctx.close();
  }
}
await browser.close();

fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));

// ---------- markdown summary ----------
const sevRank = { high: 0, medium: 1, low: 2 };
const lines = [`# Samla UX audit — automated pass`, ``, `Source: ${START}  `, `Run: ${new Date().toISOString()}  `, `Pages: ${visited.size} · viewports: ${VIEWPORTS.map((v) => v.name).join(', ')} · themes: ${THEMES.join(', ')} · reduced-motion on`, ``];
const totals = {};
for (const r of results) for (const i of r.issues) totals[i.rule] = (totals[i.rule] || 0) + 1;
lines.push('## Totals by rule', '', '| Rule | Count |', '|---|---:|', ...Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`), '');
for (const slug of [...new Set(results.map((r) => r.slug))]) {
  const rs = results.filter((r) => r.slug === slug);
  lines.push(`## ${slug} — ${rs[0].title || ''}`, `${rs[0].url}`, '');
  const uniq = new Map();
  for (const r of rs) for (const i of r.issues) {
    const k = `${i.rule}|${i.el}|${i.detail}`;
    if (!uniq.has(k)) uniq.set(k, { ...i, where: [] });
    uniq.get(k).where.push(`${r.viewport}/${r.theme}`);
  }
  const list = [...uniq.values()].sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
  if (!list.length) lines.push('_No automated findings._', '');
  else lines.push('| Sev | Rule | Element | Detail | Where |', '|---|---|---|---|---|', ...list.map((i) => `| ${i.severity} | ${i.rule} | ${(i.el || '—').replace(/\|/g, '\\|')} | ${i.detail.replace(/\|/g, '\\|')} | ${i.where.join(', ')} |`), '');
}
fs.writeFileSync(path.join(OUT, 'report.md'), lines.join('\n'));
console.log(`Audited ${visited.size} page(s); ${results.reduce((s, r) => s + r.issues.length, 0)} raw findings → ${OUT}/report.md`);
