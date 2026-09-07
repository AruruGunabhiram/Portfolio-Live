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

function fmt(n) {
  return `${(n / 1024).toFixed(2)} kB`;
}
function check(actual, budget, label) {
  const ok = actual <= budget;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${fmt(actual)} / budget ${fmt(budget)} — ${ok ? 'within' : 'OVER BUDGET'}`);
  return ok;
}

console.log('Build budget check — Phase 19 thresholds (21AQ)');
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
