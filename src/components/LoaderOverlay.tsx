import { AnimatePresence, motion } from 'framer-motion';
import { prefersReducedMotion } from '../utils';

interface LoaderOverlayProps {
  isLoading: boolean;
}

const LETTERS = 'LOADING'.split('');

/**
 * Premium loader — Option 2: letter-spaced blur-to-sharp wave.
 * Each letter fades from blur to sharp left→right, loops.
 * On exit: fade + scale-down.
 * Respects prefers-reduced-motion.
 */
export const LoaderOverlay = ({ isLoading }: LoaderOverlayProps) => {
  const reduced = prefersReducedMotion();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          transition={{ duration: reduced ? 0.15 : 0.35, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: '#06090f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '2rem',
            pointerEvents: 'all',
            overflow: 'hidden',
          }}
          aria-live="polite"
          aria-label="Loading"
        >
          {/* Letter wave */}
          <div
            style={{
              display: 'flex',
              gap: '0.55em',
              letterSpacing: '0.3em',
            }}
          >
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                style={{
                  display: 'inline-block',
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  color: '#8bbfd4',
                  opacity: 0.15,
                  filter: 'blur(6px)',
                  userSelect: 'none',
                }}
                animate={
                  reduced
                    ? { opacity: 0.6, filter: 'blur(0px)' }
                    : {
                        opacity: [0.12, 0.72, 0.12],
                        filter: ['blur(6px)', 'blur(0px)', 'blur(6px)'],
                      }
                }
                transition={
                  reduced
                    ? { duration: 0.2 }
                    : {
                        duration: 2.2,
                        ease: 'easeInOut',
                        delay: i * 0.12,
                        repeat: Infinity,
                        repeatDelay: 0.4,
                      }
                }
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Subtle progress line */}
          {!reduced && (
            <motion.div
              style={{
                width: '120px',
                height: '1px',
                backgroundColor: 'rgba(91,168,196,0.15)',
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
                  backgroundColor: 'rgba(91,168,196,0.55)',
                  borderRadius: '1px',
                }}
                animate={{ x: ['-40%', '210%'] }}
                transition={{
                  duration: 1.6,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 0.2,
                }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
