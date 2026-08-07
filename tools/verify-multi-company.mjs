/**
 * End-to-end check of the multi-company behaviour a unit test cannot see:
 * that the switcher renders, that switching actually changes the data on
 * screen, and that the choice survives a reload.
 *
 * Usage: node tools/verify-multi-company.mjs --url http://127.0.0.1:4200
 */
import { chromium } from 'playwright';

import { resolveChromeBin } from './chrome.mjs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const APP_URL = arg('--url', 'http://127.0.0.1:4200');
const ROUTE = '/flight-operations/route-planning';

const failures = [];
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch({
  executablePath: await resolveChromeBin(),
  args: ['--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(APP_URL, { waitUntil: 'networkidle' });
await page.fill('#username', 'superadmin');
await page.fill('input[type="password"]', 'super123');
await page.click('button[type="submit"]');
await page.waitForSelector('.stat-card__value', { timeout: 30000 });

console.log('\n== Company switcher ==');
const switcher = page.locator('.topbar__company');
check('switcher is visible for a multi-company user', (await switcher.count()) > 0);
const firstCode = (await page.locator('.topbar__company-text strong').textContent())?.trim();
check('shows the active company code', !!firstCode, firstCode);

// The X-Company-Id header itself is not observable here: mockApiInterceptor
// answers requests inside the app, so nothing reaches the network layer
// Playwright watches. company.interceptor.spec.ts asserts the header directly;
// what this script proves is the end-to-end consequence — that the mock
// received it and returned a different company's rows.
console.log('\n== Data is scoped to the active company ==');
await page.goto(APP_URL + ROUTE, { waitUntil: 'networkidle' });
await page.waitForSelector('table thead th', { timeout: 20000 });
await page.waitForTimeout(600);

const rowsOf = async () =>
  page.locator('table tbody tr').evaluateAll((trs) => trs.map((tr) => tr.textContent?.trim().slice(0, 40)));

const beforeRows = await rowsOf();
check('company A shows rows', beforeRows.length > 0, `${beforeRows.length} rows`);

console.log('\n== Switching company changes the data ==');
await switcher.click();
await page.waitForTimeout(400);
// PrimeNG puts `p-disabled` on the <li>, not on the link inside it — the
// currently-active company is rendered disabled, so filter at the item level
// or the click lands on an element that swallows it.
const options = page.locator('.p-menu-overlay li.p-menu-item:not(.p-disabled) .p-menu-item-link');
await options.first().click();
await page.waitForTimeout(2500);

const secondCode = (await page.locator('.topbar__company-text strong').textContent())?.trim();
check('active company changed', secondCode !== firstCode, `${firstCode} → ${secondCode}`);

await page.waitForSelector('table thead th', { timeout: 20000 }).catch(() => undefined);
const afterRows = await rowsOf();
check('row set changed with the company', JSON.stringify(beforeRows) !== JSON.stringify(afterRows), `${afterRows.length} rows`);

console.log('\n== The choice survives a reload ==');
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const afterReload = (await page.locator('.topbar__company-text strong').textContent())?.trim();
check('still in the switched-to company', afterReload === secondCode, `${afterReload}`);

await browser.close();

console.log(failures.length ? `\n${failures.length} check(s) failed.` : '\nAll multi-company checks passed.');
process.exit(failures.length ? 1 : 0);
