import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../components';
import { prefersReducedMotion } from '../utils';
import { usePortfolioMode } from '../context/PortfolioModeContext';
import { AskGunaDeskScene } from '../components/ask-guna/AskGunaDeskScene';
import type { AskGunaSceneState } from '../components/ask-guna/AskGunaDeskScene';

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
  const { isRecruiter } = usePortfolioMode();

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

  // Scene state is derived from the interaction the section already tracks —
  // the illustration never owns state of its own.
  const sceneState: AskGunaSceneState = error
    ? 'error'
    : loading
      ? 'thinking'
      : answer
        ? 'answer'
        : question.trim()
          ? 'typing'
          : 'idle';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <section id="ask-guna" className={isRecruiter ? 'py-8 sm:py-10 lg:py-12 relative' : 'py-12 sm:py-16 lg:py-20 relative'}>
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
            {isRecruiter ? 'Have a specific question about a project or experience?' : 'Ask about projects, experience, research, or skills.'}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Answers are based only on the information in this portfolio.
          </p>
          <div className="mt-4 h-px max-w-[640px]" style={{ background: 'var(--border)' }} aria-hidden="true" />

          <div className="mt-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-start">
            {/* Left: input + suggestions */}
            <div className="min-w-0">
              <form onSubmit={handleSubmit} className="space-y-3 min-w-0" noValidate>
                <label htmlFor="ask-guna-input" className="block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                  Your question
                </label>
                <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                  <input
                    id="ask-guna-input"
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="Ask about Guna's projects, experience, or skills"
                    maxLength={800}
                    autoComplete="off"
                    className="w-full flex-1 min-w-0 rounded-md border px-3 py-2.5 text-sm focus-visible:outline-none min-h-[44px]"
                    style={{ background: 'var(--surface)', borderColor: error ? 'var(--error)' : 'var(--border)', color: 'var(--text)' }}
                    aria-describedby={error ? 'ask-guna-help ask-guna-error' : 'ask-guna-help'}
                    aria-invalid={error ? 'true' : undefined}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none min-h-[44px] shrink-0 sm:w-auto w-full"
                    style={{ background: 'var(--accent-button)', borderColor: 'var(--accent-button)', color: '#fff' }}
                  >
                    {loading ? 'Checking portfolio…' : 'Ask'}
                  </button>
                </div>
                <p id="ask-guna-help" className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Single question · 800 character limit
                </p>
                {error && (
                  <p id="ask-guna-error" className="text-xs" style={{ color: 'var(--error)' }} role="alert">
                    {error}
                  </p>
                )}
              </form>

              {!isRecruiter && (
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
              )}
            </div>

            {/* Right: answer + decorative desk environment */}
            <div className="min-w-0 flex flex-col gap-4">
              <div className="order-2 lg:order-1 flex lg:justify-end">
                <AskGunaDeskScene state={sceneState} />
              </div>
              <div
                className="order-1 lg:order-2"
              >
              <div
                className="rounded-md border p-4 sm:p-5 min-h-[140px] sm:min-h-[180px] min-w-0 overflow-hidden"
                style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)' }}
                aria-live="polite"
                aria-busy={loading ? 'true' : 'false'}
              >
                {loading && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Checking portfolio…
                  </p>
                )}
                {!loading && error && (
                  <p className="text-sm" style={{ color: 'var(--error)' }}>
                    {error}
                  </p>
                )}
                {!loading && !error && answer && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'var(--text-secondary)', overflowWrap: 'anywhere' as const }}>{answer}</p>}
                {!loading && !error && !answer && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Your answer will appear here. For example, try asking which projects use Java or what Guna built at InfiniAI.
                  </p>
                )}
              </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
