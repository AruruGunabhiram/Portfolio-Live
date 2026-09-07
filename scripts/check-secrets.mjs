#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// 21BX / 21BY — ensure no secret leaks into client bundle
const dist = path.join(process.cwd(), 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

const patterns = [
  { label: 'GROQ_API_KEY', regex: /GROQ_API_KEY/ },
  { label: 'gsk_ prefix', regex: /gsk_/ },
  { label: 'api.groq.com in client', regex: /api\.groq\.com/ },
];

let failed = false;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.isFile() && (p.endsWith('.js') || p.endsWith('.html'))) {
      const content = fs.readFileSync(p, 'utf8');
      for (const pat of patterns) {
        if (pat.regex.test(content)) {
          // For api.groq.com, allow only if it's in server handler (api folder not in dist)? dist client should not contain
          // But check if file is dist/assets — if found, it's client leak
          if (p.includes('dist')) {
            console.error(`FAIL ${pat.label} found in ${path.relative(process.cwd(), p)}`);
            // show snippet
            const idx = content.search(pat.regex);
            console.error(`  snippet: ...${content.slice(Math.max(0, idx - 40), idx + 60).replace(/\n/g, ' ')}...`);
            failed = true;
          }
        }
      }
    }
  }
}

walk(dist);

// Also check .env.example must have empty secret value — 21BX
const envExample = path.join(process.cwd(), '.env.example');
if (fs.existsSync(envExample)) {
  const txt = fs.readFileSync(envExample, 'utf8');
  // should not contain real key
  const m = txt.match(/GROQ_API_KEY=(\S+)/);
  if (m && m[1] && m[1] !== '' && !m[1].startsWith('#') && m[1].length > 1) {
    if (m[1].trim() !== '') {
      // empty is expected: GROQ_API_KEY=
      if (m[1].trim().length > 0) {
        console.error('FAIL .env.example GROQ_API_KEY should be empty');
        failed = true;
      }
    }
  }
  if (/gsk_/.test(txt)) {
    console.error('FAIL .env.example contains gsk_');
    failed = true;
  }
}

if (failed) {
  console.error('Secret scan FAILED — client bundle leaks secret or provider URL');
  process.exit(1);
}
console.log('PASS Secret scan — no GROQ_API_KEY / gsk_ / api.groq.com in dist (client)');
console.log('PASS .env.example clean');
