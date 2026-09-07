import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('21V / 21BA — Ask Guna client invariants (static code guards)', () => {
  const src = fs.readFileSync(path.join(process.cwd(), 'src/sections/AskGuna.tsx'), 'utf8');

  it('label associated via htmlFor/id', () => {
    expect(src).toContain('htmlFor="ask-guna-input"');
    expect(src).toContain('id="ask-guna-input"');
  });

  it('submit disabled while loading or empty', () => {
    expect(src).toContain('disabled={loading || !question.trim()}');
  });

  it('max length enforced (800)', () => {
    expect(src).toContain('maxLength={800}');
    expect(src).toContain('if (trimmed.length > 800)');
  });

  it('suggested question fills/submits (SUGGESTED)', () => {
    expect(src).toContain('SUGGESTED');
    expect(src).toContain('setQuestion(q)');
    expect(src).toContain('ask(q)');
  });

  it('abort logic prevents stale response override', () => {
    expect(src).toContain('abortRef.current?.abort()');
    expect(src).toContain('new AbortController()');
    expect(src).toContain("e.name === 'AbortError'");
  });

  it('no dangerouslySetInnerHTML, answer rendered as plain text', () => {
    expect(src).not.toContain('dangerouslySetInnerHTML');
    expect(src).toContain('{answer}');
    // answer container uses whitespace-pre-wrap but not innerHTML
    expect(src).toContain('whitespace-pre-wrap');
  });

  it('aria-live polite for answer', () => {
    expect(src).toContain('aria-live="polite"');
  });
});
