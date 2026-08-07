/**
 * Finds a Chromium the test tooling can actually launch.
 *
 * Three things have to line up here, and by default they don't:
 *
 *  - **Karma** looks for a browser only through `CHROME_BIN` or a
 *    system-installed Chrome. This image has neither — its Chromium belongs to
 *    Playwright — so `ng test` dies with "No binary for ChromeHeadless browser
 *    on your platform" before running a single spec.
 *  - **Playwright's** `chromium.executablePath()` is a *computed* path, not a
 *    discovered one: it reports where the browser for the installed Playwright
 *    version would live, whether or not anything is there. When this was
 *    written it named revision 1234 while the image shipped 1194 — a
 *    real-looking path to nothing.
 *  - **Reinstalling is not available.** `playwright install` is disabled in
 *    this image, and the browser is already on disk anyway.
 *
 * So probe in order of specificity and confirm every candidate exists on disk
 * before returning it. Never fall through to `undefined` and let Playwright
 * re-derive the broken path — that turns a clear "no browser" into a confusing
 * launch failure several frames away from the cause.
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Layouts Playwright has used for the Chromium bundle across versions. */
const BUNDLE_LAYOUTS = [
  'chrome-linux/chrome',
  'chrome-linux64/chrome',
  'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
  'chrome-win/chrome.exe'
];

const SYSTEM_PATHS = [
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable'
];

/**
 * Must be a *file*, not merely something that exists: the unversioned
 * `chromium` entry in the browser cache is a directory in some Playwright
 * layouts and a symlink to the binary in others, and handing a directory to
 * `executablePath` fails far from here.
 */
function isBinary(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function firstExisting(candidates) {
  return candidates.find((path) => path && isBinary(path)) ?? null;
}

/** Whatever Playwright thinks it installed — trustworthy only if it's there. */
async function fromPlaywright() {
  try {
    const { chromium } = await import('playwright');
    return firstExisting([chromium.executablePath()]);
  } catch {
    return null;
  }
}

/**
 * Scans the browser cache directly, newest revision first.
 *
 * This is what saves us when the image and the installed Playwright disagree
 * about the revision number: the bundle on disk is perfectly usable, it just
 * isn't the one Playwright would have picked.
 */
function fromBrowserCache() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root) return null;

  let entries;
  try {
    entries = readdirSync(root);
  } catch {
    return null;
  }

  const revisionOf = (name) => Number(name.split('-').pop());
  const ranked = entries
    // Full Chromium before headless_shell: the shell is missing pieces the
    // rendered contrast pass and screenshot checks depend on.
    .filter((name) => /^chromium-\d+$/.test(name))
    .sort((a, b) => revisionOf(b) - revisionOf(a));

  for (const dir of ranked) {
    const found = firstExisting(BUNDLE_LAYOUTS.map((layout) => join(root, dir, layout)));
    if (found) return found;
  }

  // The unversioned symlink the image maintains, as a last resort inside the
  // cache — it survives revision churn even when the directory names move.
  return firstExisting([join(root, 'chromium'), ...BUNDLE_LAYOUTS.map((l) => join(root, 'chromium', l))]);
}

/**
 * Absolute path to a Chromium that exists.
 *
 * @throws if none can be found — callers should let this surface rather than
 *   substituting a default, so the failure names its own cause.
 */
export async function resolveChromeBin() {
  // An override that points at nothing is a mistake worth surfacing, but not
  // one worth failing over while a working browser sits on disk.
  if (process.env.CHROME_BIN && !isBinary(process.env.CHROME_BIN)) {
    console.warn(`CHROME_BIN is set to "${process.env.CHROME_BIN}", which is not a file. Ignoring it.`);
  }

  const found =
    firstExisting([process.env.CHROME_BIN]) ??
    (await fromPlaywright()) ??
    fromBrowserCache() ??
    firstExisting(SYSTEM_PATHS);

  if (found) return found;

  throw new Error(
    'No Chromium found. Looked at $CHROME_BIN, the Playwright install, ' +
      `$PLAYWRIGHT_BROWSERS_PATH (${process.env.PLAYWRIGHT_BROWSERS_PATH ?? 'unset'}) ` +
      `and ${SYSTEM_PATHS.join(', ')}. Set CHROME_BIN to a Chromium binary.`
  );
}
