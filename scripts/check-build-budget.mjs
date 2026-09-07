#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

// Phase 19 budgets — 21AQ / 21AR
const BUDGETS = {
  mainJsGzip: 90 * 1024, // 90 kB
  totalInitialJsGzip: 150 * 1024, // 150 kB
  cssGzip: 10 * 1024, // 10 kB
};

const dist = path.join(process.cwd(), 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

const assetsDir = path.join(dist, 'assets');
if (!fs.existsSync(assetsDir)) {
  console.error('dist/assets not found');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);

function findAndGzip(pattern, label) {
  const name = files.find(f => pattern.test(f));
  if (!name) {
    console.error(`[budget] ${label}: NOT FOUND (pattern ${pattern})`);
    process.exit(1);
  }
  const buf = fs.readFileSync(path.join(assetsDir, name));
  const gz = gzipSync(buf).length;
  return { name, gz };
}

const css = findAndGzip(/^index-.*\.css$/, 'CSS');
const main = findAndGzip(/^index-.*\.js$/, 'Main JS');
const reactVendor = findAndGzip(/^react-vendor-.*\.js$/, 'React vendor');
const animVendor = findAndGzip(/^animation-vendor-.*\.js$/, 'Animation vendor');

const totalInitial = main.gz + reactVendor.gz + animVendor.gz;

// ── Hardening (A6) ──────────────────────────────────────────────────────────
// The totals above are hand-picked, so an unexpected eager chunk could bypass them.
// Guard that with dist/index.html itself rather than guessing from filenames:
// anything the entry HTML loads or preloads IS initial and MUST be counted.
const allJs = files.filter(f => f.endsWith('.js'));
const countedInitial = [main.name, reactVendor.name, animVendor.name];

const indexHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const eagerFromHtml = new Set(
  [...indexHtml.matchAll(/(?:src|href)="\/assets\/([^"]+\.js)"/g)].map(m => m[1])
);

// 1. Every chunk the entry HTML loads/preloads must be inside the counted total.
const uncounted = [...eagerFromHtml].filter(f => !countedInitial.includes(f));
if (uncounted.length) {
  console.error(
    `[budget] FAIL — dist/index.html eagerly loads JS excluded from totalInitialJsGzip: ${uncounted.join(', ')}`
  );
  process.exit(1);
}

// 2. Every chunk we count must actually be referenced by the entry HTML.
const countedButUnreferenced = countedInitial.filter(f => !eagerFromHtml.has(f));
if (countedButUnreferenced.length) {
  console.error(
    `[budget] FAIL — counted as initial but not referenced by dist/index.html: ${countedButUnreferenced.join(', ')}`
  );
  process.exit(1);
}

// 3. Everything else is a code-split chunk. It is not counted, but it is reported —
//    a new one appearing here is a deliberate change that should be reviewed.
//    NOTE: AskGuna is code-split but IS fetched shortly after hydration, because
//    <Suspense><AskGuna/></Suspense> is rendered eagerly in Home. It is not
//    render-blocking and is not part of the initial HTML, so it stays uncounted.
const split = allJs.filter(f => !countedInitial.includes(f));
console.log('Build budget check — Phase 19 thresholds (21AQ)');
console.log(`  Entry HTML eager JS: ${[...eagerFromHtml].join(', ')}`);
for (const name of split) {
  const gz = gzipSync(fs.readFileSync(path.join(assetsDir, name))).length;
  console.log(`  Split chunk (not counted): ${name} ${(gz / 1024).toFixed(2)} kB`);
}

function fmt(n) {
  return `${(n / 1024).toFixed(2)} kB`;
}
function check(actual, budget, label) {
  const ok = actual <= budget;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${fmt(actual)} / budget ${fmt(budget)} — ${ok ? 'within' : 'OVER BUDGET'}`);
  return ok;
}

console.log(`  CSS: ${css.name} ${fmt(css.gz)}`);
console.log(`  Main: ${main.name} ${fmt(main.gz)}`);
console.log(`  React: ${reactVendor.name} ${fmt(reactVendor.gz)}`);
console.log(`  Animation: ${animVendor.name} ${fmt(animVendor.gz)}`);
console.log(`  Total initial JS: ${fmt(totalInitial)}`);

let ok = true;
ok = check(main.gz, BUDGETS.mainJsGzip, 'Main JS gzip <= 90 kB') && ok;
ok = check(totalInitial, BUDGETS.totalInitialJsGzip, 'Total initial JS gzip <= 150 kB') && ok;
ok = check(css.gz, BUDGETS.cssGzip, 'CSS gzip <= 10 kB') && ok;

if (!ok) {
  console.error('Build budget FAILED');
  process.exit(1);
}
console.log('Build budget PASS');
