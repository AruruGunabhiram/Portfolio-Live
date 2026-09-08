#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const mdPath = path.join(process.cwd(), 'src/data/ask-guna-knowledge.md');
const tsPath = path.join(process.cwd(), 'src/data/askGunaKnowledge.ts');

const md = fs.readFileSync(mdPath, 'utf8');

const ts = `// Auto-generated from ask-guna-knowledge.md — do not edit manually. Run: node scripts/sync-knowledge.mjs to regenerate.
// This is the authoritative runtime knowledge for Ask Guna (Cloudflare Worker + Vite dev).

export const ASK_GUNA_KNOWLEDGE = ${JSON.stringify(md)};

export function getAskGunaKnowledge(): string {
  return ASK_GUNA_KNOWLEDGE;
}
`;

fs.writeFileSync(tsPath, ts);
console.log(`Regenerated ${path.relative(process.cwd(), tsPath)} from ${path.relative(process.cwd(), mdPath)} (${md.length} chars)`);
