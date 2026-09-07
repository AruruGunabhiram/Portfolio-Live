import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../components';
import { prefersReducedMotion } from '../utils';

const SUGGESTED = [
  'What backend projects has Guna built?',
  'Which projects use AI?',
  'What did Guna work on at InfiniAI?',
  'What research has he published?',
];

export const AskGuna = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;

  const ask = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setError('Please enter a question.');
      return;
    }
    if (trimmed.length > 800) {
      setError('Question too long (max 800).');
      return;
    }
    // abort previous
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch('/api/ask-guna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => ({}))) as { answer?: string; message?: string; error?: string };
      if (!res.ok) {
        setError(data.message || 'Ask Guna is temporarily unavailable.');
        return;
      }
      if (data.answer) setAnswer(data.answer);
      else setError("I couldn't answer that right now. Please try again.");
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError("I couldn't answer that right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <section id="ask-guna" className="py-16 sm:py-20 relative">
      <Container>
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 12 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2, margin: '0px 0px -80px 0px' }}
          transition={{ duration: reduced ? 0 : 0.38, ease: 'easeOut' }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Ask Guna
          </h2>
          <p className="text-sm leading-relaxed mt-2 max-w-[60ch]" style={{ color: 'var(--text-muted)' }}>
            Ask about projects, experience, research, or skills.
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Answers are based only on the information in this portfolio.
          </p>
          <div className="mt-4 h-px max-w-[640px]" style={{ background: 'var(--border)' }} aria-hidden="true" />

          <div className="mt-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-start">
            {/* Left: input + suggestions */}
            <div className="min-w-0">
              <form onSubmit={handleSubmit} className="space-y-3">
                <label htmlFor="ask-guna-input" className="block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Your question
                </label>
                <input
                  id="ask-guna-input"
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Ask about Guna's projects, experience, or skills"
                  maxLength={800}
                  autoComplete="off"
                  className="w-full rounded-md border px-3 py-2.5 text-sm focus-visible:outline-none"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  aria-describedby="ask-guna-help"
                  disabled={loading}
                />
                <p id="ask-guna-help" className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Single question · 800 character limit
                </p>
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none"
                  style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }}
                >
                  {loading ? 'Checking portfolio…' : 'Ask'}
                </button>
              </form>

              <div className="mt-6">
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Try
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SUGGESTED.map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setQuestion(q);
                        ask(q);
                      }}
                      disabled={loading}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border transition-colors disabled:opacity-50 focus-visible:outline-none"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: answer */}
            <div className="min-w-0">
              <div
                className="rounded-md border p-4 sm:p-5 min-h-[180px]"
                style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)' }}
                aria-live="polite"
                aria-busy={loading ? 'true' : 'false'}
              >
                {loading && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }} role="status">
                    Checking portfolio…
                  </p>
                )}
                {!loading && error && (
                  <p className="text-sm" style={{ color: '#b42318' }} role="alert">
                    {error}
                  </p>
                )}
                {!loading && !error && answer && <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{answer}</p>}
                {!loading && !error && !answer && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Your answer will appear here. For example, try asking which projects use Java or what Guna built at InfiniAI.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
