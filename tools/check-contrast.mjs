/**
 * Colour-contrast gate.
 *
 * Two independent checks, because each catches what the other cannot:
 *
 * 1. **Static** — greps the stylesheets for the raw `--p-surface-N` scale used
 *    as a `color:` or `background:`. That scale runs light→dark in *both*
 *    colour schemes (PrimeNG Aura does not invert it), so anything styled with
 *    it keeps its light-mode appearance when the theme flips. This is what put
 *    dark-navy KPI numbers on dark-navy cards at a 1.00:1 ratio.
 *
 * 2. **Rendered** — drives a real browser over a representative set of routes
 *    in both themes, walks every text node, resolves its computed colour
 *    against its effective background, and fails anything under the WCAG AA
 *    threshold. This catches contrast that no grep can see: inherited colours,
 *    PrimeNG's own component tokens, and `color-mix()` results.
 *
 * The static check runs anywhere. The rendered check needs a dev server and is
 * skipped (not failed) when one is not reachable, so `npm run test:contrast`
 * is still useful without a browser.
 *
 * Usage:  node tools/check-contrast.mjs [--url http://127.0.0.1:4200]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');
const URL_ARG = process.argv.indexOf('--url');
const APP_URL = URL_ARG > -1 ? process.argv[URL_ARG + 1] : 'http://127.0.0.1:4200';

/** WCAG 2.1 AA: 4.5:1 for normal text, 3:1 for large (>=24px, or >=18.66px bold). */
const AA_NORMAL = 4.5;
const AA_LARGE = 3;

const routes = [
  { path: '/dashboard', ready: '.stat-card__value' },
  { path: '/aircraft-maintenance/mro-dashboard', ready: '.stat-card__value' },
  { path: '/flight-operations/flight-scheduling', ready: 'table' },
  { path: '/flight-operations/route-planning', ready: 'table' }
];

let failures = 0;

// ---------------------------------------------------------------- static pass

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function staticCheck() {
  console.log('== Static: raw --p-surface-N used as a colour ==');
  const files = walk(SRC).filter((f) => /\.(scss|css|ts|html)$/.test(f));
  const offenders = [];

  for (const file of files) {
    // Strip comments before matching, so prose that *names* the anti-pattern
    // (the colour rule in styles.scss does, deliberately) is not reported as
    // an occurrence of it.
    const text = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
      .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
      .replace(/^\s*\/\/.*$/gm, '');

    text.split('\n').forEach((line, i) => {
      if (/(color|background|background-color)\s*:\s*var\(--p-surface-\d+\)/.test(line)) {
        offenders.push(`${relative(ROOT, file)}:${i + 1}  ${line.trim()}`);
      }
    });
  }

  if (offenders.length) {
    console.log(`  ${offenders.length} offending declaration(s):`);
    offenders.forEach((o) => console.log(`    ${o}`));
    console.log('  Use the semantic tokens instead — see the colour rule in src/styles.scss.');
    failures += offenders.length;
  } else {
    console.log('  none\n');
  }
}

// -------------------------------------------------------------- rendered pass

/** Injected into the page; must be self-contained. */
function auditPage(thresholds) {
  const lum = (s) => {
    const m = s.match(/\d+(\.\d+)?/g);
    if (!m) return null;
    const [R, G, B] = m.slice(0, 3).map(Number).map((c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  const ratio = (a, b) => {
    const [la, lb] = [lum(a), lum(b)];
    if (la === null || lb === null) return null;
    const [hi, lo] = [la, lb].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const parse = (s) => {
    const m = s.match(/[\d.]+/g);
    if (!m) return null;
    const [r, g, b] = m.slice(0, 3).map(Number);
    const a = m.length > 3 ? Number(m[3]) : 1;
    return { r, g, b, a };
  };
  /** Source-over composite, so a translucent tint is measured over what is behind it. */
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1
  });
  const toCss = (c) => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

  /**
   * The colour actually behind `el` after compositing every translucent
   * ancestor layer. Taking the first non-transparent background at face value
   * scores a 12%-opacity brand tint as if it were solid brand colour, which
   * reports active nav links as unreadable when they are not.
   */
  const effectiveBg = (el) => {
    const layers = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a === 1) break;
      }
      n = n.parentElement;
    }
    let base = parse(getComputedStyle(document.documentElement).backgroundColor);
    if (!base || base.a === 0) base = { r: 255, g: 255, b: 255, a: 1 };
    // Composite back-to-front.
    return toCss(layers.reduceRight((acc, layer) => over(layer, acc), base));
  };

  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const own = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join('')
      .trim();
    if (!own) continue;

    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
    if (!el.getClientRects().length) continue;

    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const limit = size >= 24 || (bold && size >= 18.66) ? thresholds.large : thresholds.normal;

    const r = ratio(cs.color, effectiveBg(el));
    if (r !== null && r < limit) {
      const cls = typeof el.className === 'string' && el.className.trim()
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
      out.push({
        selector: el.tagName.toLowerCase() + cls,
        text: own.slice(0, 30),
        color: cs.color,
        bg: effectiveBg(el),
        ratio: Number(r.toFixed(2)),
        limit
      });
    }
  }
  return out;
}

async function renderedCheck() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.log('== Rendered: skipped (playwright not installed) ==\n');
    return;
  }

  try {
    const res = await fetch(APP_URL, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    console.log(`== Rendered: skipped (no dev server at ${APP_URL}) ==`);
    console.log('   Start one with `npm start` to run the rendered pass.\n');
    return;
  }

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN || undefined,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await page.fill('#username', 'superadmin');
  await page.fill('input[type="password"]', 'super123');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.stat-card__value', { timeout: 30000 });

  for (const theme of ['light', 'dark']) {
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('app-dark'));
    if ((theme === 'dark') !== isDark) {
      await page.click('button[aria-label*="theme"]');
      await page.waitForTimeout(500);
    }

    console.log(`== Rendered: ${theme} mode ==`);
    for (const route of routes) {
      await page.goto(APP_URL + route.path, { waitUntil: 'networkidle' });
      await page.waitForSelector(route.ready, { timeout: 20000 }).catch(() => undefined);
      await page.waitForTimeout(900);

      const issues = await page.evaluate(auditPage, { normal: AA_NORMAL, large: AA_LARGE });
      if (!issues.length) {
        console.log(`  ok    ${route.path}`);
        continue;
      }
      console.log(`  FAIL  ${route.path} — ${issues.length} node(s) below AA:`);
      const seen = new Set();
      for (const i of issues) {
        const key = i.selector + i.ratio;
        if (seen.has(key)) continue;
        seen.add(key);
        console.log(`          ${String(i.ratio).padStart(6)}:1 (needs ${i.limit})  ${i.selector.padEnd(34)} "${i.text}"`);
      }
      failures += issues.length;
    }
    console.log('');
  }

  await browser.close();
}

staticCheck();
await renderedCheck();

if (failures) {
  console.error(`Contrast check failed: ${failures} issue(s).`);
  process.exit(1);
}
console.log('Contrast check passed.');
