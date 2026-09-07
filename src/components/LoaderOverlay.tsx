import { AnimatePresence, motion } from 'framer-motion';
import { prefersReducedMotion } from '../utils';

interface LoaderOverlayProps {
  isLoading: boolean;
  shouldRender: boolean;
}

export const LoaderOverlay = ({ isLoading, shouldRender }: LoaderOverlayProps) => {
  const reduced = prefersReducedMotion();

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.08 : 0.2, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            pointerEvents: 'none',
            overflow: 'hidden',
            padding: 'max(1rem, env(safe-area-inset-top, 0px)) max(1rem, env(safe-area-inset-right, 0px)) max(1rem, env(safe-area-inset-bottom, 0px)) max(1rem, env(safe-area-inset-left, 0px))',
          }}
          aria-hidden="true"
        >
          <div
            aria-hidden="true"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.9rem',
            }}
          >
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.32em',
                color: 'var(--text-muted)',
                userSelect: 'none',
              }}
            >
              GUNA
            </span>
            <div
              style={{
                width: '84px',
                height: '1px',
                backgroundColor: 'var(--border)',
                borderRadius: '1px',
                overflow: 'hidden',
                position: 'relative',
              }}
              aria-hidden="true"
            >
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '38%',
                  backgroundColor: 'var(--accent)',
                  borderRadius: '1px',
                }}
                animate={reduced ? undefined : { x: ['-38%', '220%'] }}
                transition={
                  reduced
                    ? undefined
                    : { duration: 1.1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.15 }
                }
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
