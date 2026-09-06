import { AnimatePresence, motion } from 'framer-motion';
import { prefersReducedMotion } from '../utils';

interface LoaderOverlayProps {
  isLoading: boolean;
}

const LETTERS = 'LOADING'.split('');

export const LoaderOverlay = ({ isLoading }: LoaderOverlayProps) => {
  const reduced = prefersReducedMotion();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: reduced ? 0.12 : 0.2, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1.75rem',
            pointerEvents: 'all',
            overflow: 'hidden',
          }}
          aria-live="polite"
          aria-label="Loading"
        >
          <div style={{ display: 'flex', gap: '0.5em', letterSpacing: '0.28em' }}>
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                style={{
                  display: 'inline-block',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  opacity: 0.4,
                  userSelect: 'none',
                }}
                animate={
                  reduced
                    ? { opacity: 0.6 }
                    : { opacity: [0.3, 0.75, 0.3] }
                }
                transition={
                  reduced
                    ? { duration: 0.2 }
                    : { duration: 1.8, ease: 'easeInOut', delay: i * 0.08, repeat: Infinity, repeatDelay: 0.3 }
                }
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {!reduced && (
            <motion.div
              style={{
                width: '96px',
                height: '1px',
                backgroundColor: 'var(--border)',
                borderRadius: '1px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '40%',
                  backgroundColor: 'var(--accent)',
                  borderRadius: '1px',
                }}
                animate={{ x: ['-40%', '210%'] }}
                transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.2 }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
