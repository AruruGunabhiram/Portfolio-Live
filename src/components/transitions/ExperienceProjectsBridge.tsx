import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { Container } from '../index';
import { StoryNode, type StoryNodeVariant } from '../story/StoryNode';
import { StoryConnector } from '../story/StoryConnector';
import { useExperienceProjectsProgress } from '../../hooks/useSectionTransitionProgress';
import { useIsCompactStory, useReducedMotion } from '../../hooks/useStoryLifecycle';
import { usePortfolioMode } from '../../context/PortfolioModeContext';

/**
 * A6 — Experience → Projects capability recomposition.
 *
 * Transitional boundary object, NOT a section. The professional story visuals
 * (PROJXON controlled AI workflow, InfiniAI backend service) simplify into four
 * reusable capability modules that lead into Projects.
 *
 * Motion split, deliberately:
 * - continuous scroll-derived values drive TRANSFORMS only (rail scaleX, cluster y/scale)
 * - the reveal itself is a one-shot `whileInView`, the pattern used elsewhere in the app
 * Scroll progress is bounded (no pinning, no added scroll height) and reversing is safe
 * because the reveal runs `once`. Recruiter + reduced motion render the final
 * composition statically with no transforms at all.
 */

const CAPABILITIES: Array<{ label: string; detail: string; variant: StoryNodeVariant }> = [
  { label: 'AI Systems', detail: 'reasoning within bounds', variant: 'ai' },
  { label: 'Backend', detail: 'services and execution', variant: 'backend' },
  { label: 'Automation', detail: 'workflow and control', variant: 'automation' },
  { label: 'Interfaces', detail: 'request and response', variant: 'neutral' },
];

const GROUP_LABEL =
  'Professional engineering capabilities: AI Systems, Backend, Automation, and Interfaces.';

function CapabilityModule({ label, detail, variant }: (typeof CAPABILITIES)[number]) {
  return <StoryNode variant={variant} subtle label={label} detail={detail} state="active" />;
}

const cluster = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const moduleItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: 'easeOut' as const } },
};

export function ExperienceProjectsBridge() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useExperienceProjectsProgress(ref);
  const isCompact = useIsCompactStory(1024);
  const { isRecruiter } = usePortfolioMode();
  const isReduced = useReducedMotion();
  const isStatic = isRecruiter || isReduced;

  // Transform-only, continuous across the bounded window. Reverse-safe by construction.
  const railScaleX = useTransform(progress, [0, 0.5], [0.3, 1]);
  const clusterY = useTransform(progress, [0, 0.7], [14, 0]);
  const clusterScale = useTransform(progress, [0, 0.7, 1], [0.97, 1, 0.995]);

  if (isStatic) {
    // Recruiter / reduced motion — final composition, scan-first, no transforms.
    return (
      <div ref={ref} className="pt-0 pb-2" data-a6-static="true">
        <Container>
          <div className="h-px max-w-[640px] mb-4" style={{ background: 'var(--border)' }} aria-hidden="true" />
          <p
            className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2.5"
            style={{ color: 'var(--text-muted)' }}
            aria-hidden="true"
          >
            Capabilities from this work
          </p>
          <div
            role="group"
            aria-label={GROUP_LABEL}
            className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-w-[720px] min-w-0"
          >
            {CAPABILITIES.map(c => (
              <CapabilityModule key={c.label} {...c} />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div ref={ref} className="pt-0 pb-2 min-w-0" data-a6-static="false">
      <Container>
        {/* Rail carried over from the Experience story grammar — decorative, scroll-derived */}
        <motion.div
          className="h-px max-w-[640px] mb-4 origin-left pointer-events-none"
          style={{ background: 'var(--border)', scaleX: railScaleX } as unknown as React.CSSProperties}
          aria-hidden="true"
        />

        <motion.div
          className="min-w-0"
          style={{ y: clusterY, scale: clusterScale, transformOrigin: 'left top' } as unknown as React.CSSProperties}
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4, margin: '0px 0px -40px 0px' }}
            variants={cluster}
            className="min-w-0"
          >
            <motion.p
              variants={moduleItem}
              className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2.5"
              style={{ color: 'var(--text-muted)' }}
              aria-hidden="true"
            >
              Capabilities from this work
            </motion.p>

            {isCompact ? (
              // Compact / tablet — 2×2, simple reveal, no choreography
              <div role="group" aria-label={GROUP_LABEL} className="grid grid-cols-2 gap-2.5 max-w-[420px] min-w-0">
                {CAPABILITIES.map(c => (
                  <motion.div key={c.label} variants={moduleItem} className="min-w-0">
                    <CapabilityModule {...c} />
                  </motion.div>
                ))}
              </div>
            ) : (
              // Desktop — shallow asymmetric cluster, deliberately not a 4-column feature grid
              <div role="group" aria-label={GROUP_LABEL} className="min-w-0 max-w-[620px]">
                <div className="flex flex-wrap gap-2.5 min-w-0">
                  {CAPABILITIES.slice(0, 2).map(c => (
                    <motion.div key={c.label} variants={moduleItem} className="min-w-0 w-[186px]">
                      <CapabilityModule {...c} />
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2.5 mt-2.5 pl-[56px] min-w-0">
                  {CAPABILITIES.slice(2).map(c => (
                    <motion.div key={c.label} variants={moduleItem} className="min-w-0 w-[186px]">
                      <CapabilityModule {...c} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Hand-off into Projects — decorative connector grammar, not a heading */}
            <motion.div variants={moduleItem} className="mt-1 flex items-center gap-2 min-w-0" aria-hidden="true">
              <div className={isCompact ? 'pl-1' : 'pl-[24px]'}>
                <StoryConnector active orientation="vertical" dense />
              </div>
              <span className="text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                applied in the work below
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}
