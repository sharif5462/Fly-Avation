/**
 * Route smoke test.
 *
 * Visits every screen in the manifest in a real browser and asserts each one
 * actually rendered — a table header, a KPI card, or the load-error banner.
 * This catches the failure mode the unit tests cannot: a route that resolves
 * but comes up blank, an entity key with no config behind it, or a console
 * error thrown while rendering.
 *
 * Routes come from `module-manifest.ts` itself (bundled on the fly with the
 * esbuild that ships with Angular) rather than by scraping the sidebar, so the
 * list is exhaustive and does not depend on nav state.
 *
 * Needs a dev server. Usage:
 *   node tools/smoke-routes.mjs --url http://127.0.0.1:4200 [--limit 40]
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const APP_URL = arg('--url', 'http://127.0.0.1:4200');
const LIMIT = Number(arg('--limit', '0'));
const ROOT = new URL('..', import.meta.url).pathname;

try {
  const res = await fetch(APP_URL, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) throw new Error(String(res.status));
} catch {
  console.log(`Skipped: no dev server at ${APP_URL}. Start one with \`npm start\`.`);
  process.exit(0);
}

/** Bundles the manifest to CJS and evaluates it, so the route list is the real one. */
function manifestRoutes() {
  const dir = mkdtempSync(join(tmpdir(), 'smoke-'));
  try {
    const src = join(dir, 'routes.ts');
    writeFileSync(
      src,
      `import { MODULES } from '${join(ROOT, 'src/app/core/data/module-manifest')}';\n` +
        `console.log(JSON.stringify(MODULES.flatMap((m) => m.items.map((i) => '/' + m.key + '/' + i.key))));\n`
    );
    const out = join(dir, 'routes.cjs');
    execFileSync(join(ROOT, 'node_modules/.bin/esbuild'), [src, '--bundle', '--platform=node', '--format=cjs', `--outfile=${out}`], {
      stdio: 'pipe'
    });
    return JSON.parse(execFileSync(process.execPath, [out], { encoding: 'utf8' }));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const { chromium } = await import('playwright');

let routes = manifestRoutes();
if (LIMIT > 0) routes = routes.slice(0, LIMIT);
console.log(`Smoke-testing ${routes.length} routes…\n`);

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || undefined,
  args: ['--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(String(err)));

await page.goto(APP_URL, { waitUntil: 'networkidle' });
await page.fill('#username', 'superadmin');
await page.fill('input[type="password"]', 'super123');
await page.click('button[type="submit"]');
await page.waitForSelector('.stat-card__value', { timeout: 30000 });

const failures = [];
for (const [index, route] of routes.entries()) {
  consoleErrors.length = 0;
  await page.goto(APP_URL + route, { waitUntil: 'domcontentloaded' });

  const rendered = await page
    .waitForFunction(
      () =>
        !!document.querySelector('table thead th') ||
        !!document.querySelector('.stat-card') ||
        !!document.querySelector('app-load-error'),
      { timeout: 10000 }
    )
    .then(() => true)
    .catch(() => false);

  const missingConfig = (await page.locator('text=No entity configuration found').count()) > 0;
  const errs = consoleErrors.filter((e) => !e.includes('favicon') && !e.includes('Failed to load resource'));

  if (!rendered || missingConfig || errs.length) {
    failures.push(route);
    const why = [!rendered && 'did not render', missingConfig && 'no entity config', errs.length && `${errs.length} console error`]
      .filter(Boolean)
      .join(', ');
    console.log(`  FAIL  ${route}  (${why})`);
    if (errs.length) console.log(`          ${errs[0].slice(0, 160)}`);
  }

  if ((index + 1) % 50 === 0) console.log(`  …${index + 1}/${routes.length}`);
}

await browser.close();

console.log(`\n${routes.length - failures.length}/${routes.length} routes rendered.`);
if (failures.length) {
  console.error(`${failures.length} route(s) failed.`);
  process.exit(1);
}
console.log('Route smoke test passed.');
