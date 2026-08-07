/**
 * Browser check for the command palette — the keyboard behaviour and focus
 * handling that unit tests cannot observe.
 *
 * Usage: node tools/verify-palette.mjs --url http://127.0.0.1:4200
 */
import { chromium } from 'playwright';

import { resolveChromeBin } from './chrome.mjs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const APP_URL = arg('--url', 'http://127.0.0.1:4200');

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

const palette = page.locator('.command-palette');
const input = page.locator('.command-palette input');

console.log('\n== Opening ==');
await page.keyboard.press('Control+k');
await page.waitForTimeout(700);
check('Ctrl+K opens the palette', await palette.isVisible());
check('the search box takes focus', await input.evaluate((el) => el === document.activeElement));

console.log('\n== Escape closes ==');
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
check('Escape closes it', !(await palette.isVisible()));

console.log('\n== The topbar button opens it too ==');
await page.locator('.topbar__search').click();
await page.waitForTimeout(700);
check('search button opens the palette', await palette.isVisible());

console.log('\n== Searching ==');
await input.fill('purchase orders');
await page.waitForTimeout(500);
const first = await page.locator('.command-palette__item').first().textContent();
check('the exact match ranks first', (first ?? '').includes('Purchase Orders'), (first ?? '').trim().slice(0, 40));

const resultCount = await page.locator('.command-palette__item').count();
check('results are capped, not hundreds of rows', resultCount > 0 && resultCount <= 30, `${resultCount} results`);

console.log('\n== Keyboard navigation ==');
// A broader query on purpose: "purchase orders" matches exactly one screen,
// where wrapping makes ArrowDown land back on index 0 and the assertions
// below cannot tell movement from no movement.
await input.fill('management');
await page.waitForTimeout(500);
const navCount = await page.locator('.command-palette__item').count();
check('several results to move between', navCount > 2, `${navCount} results`);

await page.keyboard.press('ArrowDown');
await page.waitForTimeout(200);
const activeIndex = await page.locator('.command-palette__item--active').evaluate((el) =>
  Array.from(el.parentElement.children).indexOf(el)
);
check('ArrowDown moves the highlight', activeIndex === 1, `index ${activeIndex}`);

await page.keyboard.press('ArrowUp');
await page.keyboard.press('ArrowUp');
await page.waitForTimeout(200);
const wrapped = await page.locator('.command-palette__item--active').evaluate((el) =>
  Array.from(el.parentElement.children).indexOf(el)
);
check('ArrowUp wraps to the end', wrapped === navCount - 1, `index ${wrapped}`);

console.log('\n== Enter navigates ==');
await input.fill('purchase orders');
await page.waitForTimeout(400);
await page.keyboard.press('Home');
await page.keyboard.press('Enter');
await page.waitForTimeout(2000);
check('navigated to the highlighted screen', page.url().includes('/purchase-orders'), page.url().replace(APP_URL, ''));
check('the palette closed on navigate', !(await palette.isVisible()));

console.log('\n== Recent screens ==');
await page.keyboard.press('Control+k');
await page.waitForTimeout(700);
const recentText = await page.locator('.command-palette__results').textContent();
check('the visited screen is offered as recent', (recentText ?? '').includes('Purchase Orders'));

console.log('\n== No match ==');
await input.fill('zzzznotascreen');
await page.waitForTimeout(400);
check('says so rather than showing an empty list', await page.locator('.command-palette__empty').isVisible());

await browser.close();

console.log(failures.length ? `\n${failures.length} check(s) failed.` : '\nAll palette checks passed.');
process.exit(failures.length ? 1 : 0);
