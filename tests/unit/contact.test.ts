import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CONTACT } from '../../src/data/contact';

describe('21Z / 21AA / 21AV — Contact invariants', () => {
  it('canonical email used consistently', () => {
    expect(CONTACT.email).toBe('gunabhiram.a@gmail.com');
    const contactSrc = fs.readFileSync(path.join(process.cwd(), 'src/sections/Contact.tsx'), 'utf8');
    expect(contactSrc).toContain('CONTACT.email');
    expect(contactSrc).toContain('mailto:');
  });

  it('LinkedIn / GitHub profile URLs correct', () => {
    expect(CONTACT.linkedinUrl).toBe('https://www.linkedin.com/in/gunabhiram-aruru/');
    expect(CONTACT.githubUrl).toBe('https://github.com/AruruGunabhiram');
  });

  it('résumé URL resolves to the real PDF that ships in public/ (A17C)', () => {
    // A17C: CONTACT.resumeUrl previously pointed at /Gunabhiram_Resume.pdf, which does not
    // exist in public/. The SPA fallback made that look fine in the browser. No fallback
    // branch here any more — the exact filename must exist and must be a real PDF.
    expect(CONTACT.resumeUrl).toMatch(/^\/[^/]+\.pdf$/);
    const resumePath = path.join(
      process.cwd(),
      'public',
      decodeURIComponent(path.basename(CONTACT.resumeUrl))
    );
    expect(fs.existsSync(resumePath)).toBe(true);
    const head = fs.readFileSync(resumePath).subarray(0, 5).toString();
    expect(head).toBe('%PDF-');
    // guard against the stale name silently returning
    expect(CONTACT.resumeUrl).not.toBe('/Gunabhiram_Resume.pdf');
  });

  it('phone presence follows current decision (rendered but de-emphasized)', () => {
    expect(CONTACT.phone).toBe('+1 720-314-6492');
    const src = fs.readFileSync(path.join(process.cwd(), 'src/sections/Contact.tsx'), 'utf8');
    expect(src).toContain('CONTACT.phone');
  });

  it('no dangerouslySetInnerHTML in AskGuna or Contact', () => {
    const askSrc = fs.readFileSync(path.join(process.cwd(), 'src/sections/AskGuna.tsx'), 'utf8');
    const contactSrc = fs.readFileSync(path.join(process.cwd(), 'src/sections/Contact.tsx'), 'utf8');
    expect(askSrc).not.toContain('dangerouslySetInnerHTML');
    expect(contactSrc).not.toContain('dangerouslySetInnerHTML');
  });

  it('Back to top anchor exists in Contact', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'src/sections/Contact.tsx'), 'utf8');
    expect(src).toContain('href="#hero"');
    expect(src).toContain('Back to top');
  });

  it('Copy Email uses clipboard writeText with canonical email', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'src/sections/Contact.tsx'), 'utf8');
    expect(src).toContain('navigator.clipboard.writeText(CONTACT.email)');
    expect(src).toContain('Copy email');
  });
});
