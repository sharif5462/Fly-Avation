/**
 * Runs `ng test` with CHROME_BIN pointing at a Chromium that exists.
 *
 * Karma's ChromeHeadless launcher reads CHROME_BIN and nothing else, so
 * without this every `npm test` in a fresh shell fails at browser launch —
 * having already spent half a minute building the spec bundle, which makes it
 * look like a compilation problem rather than a missing binary.
 *
 * Arguments are forwarded, so `npm test -- --include=**\/date.util.spec.ts`
 * works exactly as it would against the CLI.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { resolveChromeBin } from './chrome.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

let chromeBin;
try {
  chromeBin = await resolveChromeBin();
} catch (error) {
  console.error(`\n${error.message}\n`);
  process.exit(1);
}

console.log(`Chromium: ${chromeBin}\n`);

const child = spawn(
  process.execPath,
  [join(repoRoot, 'node_modules/@angular/cli/bin/ng.js'), 'test', ...process.argv.slice(2)],
  { stdio: 'inherit', cwd: repoRoot, env: { ...process.env, CHROME_BIN: chromeBin } }
);

// A signalled child reports code `null`; exiting 0 there would report a killed
// test run as a passing one.
child.on('exit', (code, signal) => process.exit(signal ? 1 : (code ?? 1)));
