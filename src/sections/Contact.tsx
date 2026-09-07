import { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../components';
import { CONTACT } from '../data/contact';
import { prefersReducedMotion } from '../utils';

export const Contact = () => {
  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select via prompt
      window.prompt('Copy email:', CONTACT.email);
    }
  };

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.08, delayChildren: reduced ? 0 : 0.04 } },
  };
  const item = {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.36, ease: 'easeOut' as const } },
  };

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 relative">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: '0px 0px -80px 0px' }}
          variants={container}
          className="max-w-3xl"
        >
          <motion.h2
            variants={item}
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            Contact
          </motion.h2>

          <motion.div variants={item} className="mt-4 h-px max-w-[640px]" style={{ background: 'var(--border)' }} aria-hidden="true" />

          <motion.p variants={item} className="text-sm leading-relaxed mt-6 max-w-prose" style={{ color: 'var(--text-secondary)' }}>
            For roles, collaborations, or questions about my work, email is the best place to reach me.
          </motion.p>

          {/* Email as primary */}
          <motion.div variants={item} className="mt-6">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
              Email
            </p>
            <div className="mt-2 flex flex-col xs:flex-row flex-wrap items-start xs:items-center gap-3 min-w-0">
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-sm sm:text-base font-medium break-all focus-visible:outline-none link-accent min-w-0"
                style={{ overflowWrap: 'anywhere' }}
              >
                {CONTACT.email}
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border transition-colors focus-visible:outline-none min-h-[32px] min-w-[88px] justify-center shrink-0"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)' }}
                aria-live="polite"
                aria-label={copied ? 'Email copied' : 'Copy email address'}
              >
                {copied ? 'Copied' : 'Copy email'}
              </button>
              {copied && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }} role="status">
                  Copied to clipboard
                </span>
              )}
            </div>
            <div className="mt-4">
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-sm font-medium border shadow-sm transition-colors focus-visible:outline-none min-h-[44px]"
                style={{ background: 'var(--accent-button)', borderColor: 'var(--accent-button)', color: '#fff' }}
              >
                Email Guna
              </a>
            </div>
          </motion.div>

          {/* Secondary links: LinkedIn, GitHub, Resume + phone de-emphasized */}
          <motion.div variants={item} className="mt-8 pt-6 border-t flex flex-wrap gap-4 sm:gap-6 text-sm" style={{ borderColor: 'var(--border)' }}>
            <a
              href={CONTACT.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline-offset-4 hover:underline focus-visible:outline-none"
              style={{ color: 'var(--text-secondary)' }}
            >
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
            <a
              href={CONTACT.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline-offset-4 hover:underline focus-visible:outline-none"
              style={{ color: 'var(--text-secondary)' }}
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a
              href={CONTACT.resumeUrl}
              download="Gunabhiram_Resume.pdf"
              aria-label="Download résumé (PDF)"
              className="inline-flex items-center gap-1 underline-offset-4 hover:underline focus-visible:outline-none"
              style={{ color: 'var(--text-secondary)' }}
            >
              Résumé <span aria-hidden="true">↓</span>
            </a>
            {/* Phone retained but de-emphasized per privacy flag — not primary */}
            <a
              href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
              aria-label={`Call ${CONTACT.phone}`}
              className="inline-flex items-center gap-1 underline-offset-4 hover:underline focus-visible:outline-none"
              style={{ color: 'var(--text-muted)' }}
            >
              {CONTACT.phone}
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-10">
            <a
              href="#hero"
              className="inline-flex items-center gap-1 text-xs tracking-wide focus-visible:outline-none"
              style={{ color: 'var(--text-muted)' }}
            >
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};
