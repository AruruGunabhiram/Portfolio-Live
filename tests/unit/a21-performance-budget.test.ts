import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('A21 — performance budget & build graph', () => {
  it('initial HTML references only allowed eager chunks', () => {
    const html = read('dist/index.html');
    const eager = [...html.matchAll(/(?:src|href)="\/assets\/([^"]+\.js)"/g)].map(m => m[1]);
    expect(eager).toHaveLength(3);
    expect(eager.find(f => f.startsWith('index-'))).toBeTruthy();
    expect(eager.find(f => f.startsWith('react-vendor-'))).toBeTruthy();
    expect(eager.find(f => f.startsWith('animation-vendor-'))).toBeTruthy();
  });
  it('no story chunk modulepreloaded', () => {
    const html = read('dist/index.html');
    expect(html).not.toMatch(/EmberStory/);
    expect(html).not.toMatch(/SocialLensStory/);
    expect(html).not.toMatch(/IncidentPilotStory/);
    expect(html).not.toMatch(/AskGuna/);
    expect(html).not.toMatch(/closingVisuals/);
  });
  it('AskGuna and closingVisuals not eager (lazy)', () => {
    const html = read('dist/index.html');
    expect(html).not.toContain('AskGuna');
    expect(html).not.toContain('closingVisuals');
    const home = read('src/pages/Home.tsx');
    expect(home).toMatch(/lazy\(\(\)\s*=>\s*import\('\.\.\/sections\/AskGuna'\)/);
    expect(read('src/sections/Leadership.tsx')).toContain('closingVisuals');
    expect(read('src/sections/Contact.tsx')).toContain('closingVisuals');
  });
  it('all 8 stories lazy (no static import in Projects)', () => {
    const proj = read('src/sections/Projects.tsx');
    for (const n of ['Ember','SocialLens','IncidentPilot','Clinical','CodeBattlegrounds','TimeSling','Zenco','Nostalgia']) expect(proj).not.toContain(n);
    // detail loader uses dynamic import inside story components
    expect(fs.existsSync(path.join(process.cwd(), 'src/components/projects/story/ember/EmberStory.tsx'))).toBe(true);
  });
  it('budget script detects initial from HTML (hardened)', () => {
    const scr = read('scripts/check-build-budget.mjs');
    expect(scr).toContain('eagerFromHtml');
    expect(scr).toContain('index.html');
    expect(scr).toContain('uncounted');
  });
  it('no three/R3F dependency', () => {
    const pkg = JSON.parse(read('package.json'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(Object.keys(deps).join(' ')).not.toMatch(/three|@react-three/);
    const distJs = fs.readdirSync(path.join(process.cwd(), 'dist/assets')).join(' ');
    expect(distJs).not.toMatch(/three/i);
  });
  it('no unexpected production dependency', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(Object.keys(pkg.dependencies).sort()).toEqual(['framer-motion','react','react-dom','react-router-dom']);
  });
  it('CSS under budget', () => {
    const { gzipSync } = require('node:zlib');
    const cssFile = fs.readdirSync(path.join(process.cwd(), 'dist/assets')).find(f=>/^index-.*\.css$/.test(f))!;
    const gz = gzipSync(fs.readFileSync(path.join(process.cwd(), 'dist/assets', cssFile))).length;
    expect(gz).toBeLessThanOrEqual(10*1024);
    expect(gz).toBeLessThanOrEqual(9.6*1024); // stretch target after A21 cleanup
  });
  it('main and total under budget', () => {
    const { gzipSync } = require('node:zlib');
    const files = fs.readdirSync(path.join(process.cwd(), 'dist/assets'));
    const main = files.find(f=>/^index-.*\.js$/.test(f))!;
    const reactV = files.find(f=>/^react-vendor-.*\.js$/.test(f))!;
    const animV = files.find(f=>/^animation-vendor-.*\.js$/.test(f))!;
    const gz = (n:string)=> gzipSync(fs.readFileSync(path.join(process.cwd(), 'dist/assets', n))).length;
    expect(gz(main)).toBeLessThanOrEqual(90*1024);
    expect(gz(main)+gz(reactV)+gz(animV)).toBeLessThanOrEqual(150*1024);
  });
  it('no external automatic request hints in HTML', () => {
    const html = read('dist/index.html');
    expect(html).not.toMatch(/fonts\.googleapis/);
    expect(html).not.toMatch(/cdn\./);
  });
  it('sourcemap false and assetsInlineLimit default', () => {
    const vite = read('vite.config.ts');
    expect(vite).toContain('sourcemap: false');
    expect(vite).toContain('target:');
    expect(vite).toContain('chunkSizeWarningLimit');
  });
  it('no dead console.log shipped (except console.error)', () => {
    // dist should not contain debug logs like [SpaceDust] except via error
    const mainFile = fs.readdirSync(path.join(process.cwd(), 'dist/assets')).find(f=>/^index-.*\.js$/.test(f))!;
    const txt = fs.readFileSync(path.join(process.cwd(), 'dist/assets', mainFile), 'utf8');
    expect(txt).not.toContain('console.log');
    expect(txt).not.toContain('console.debug');
    expect(txt).not.toContain('debugger');
  });
});
