import { useRef } from 'react';
import { motion, useTransform, type MotionValue, useMotionValue } from 'framer-motion';
import { useStoryLifecycle, useIsCompactStory } from '../../hooks/useStoryLifecycle';

const SCENE_LABEL = 'An engineering system linking a workstation, API service, database, cloud infrastructure, and AI service.';
const SCENE_DESC =
  'Workstation with code connects through an API service to a database and cloud infrastructure, with an adjacent AI reasoning node. Connectors indicate data flow.';

function Laptop({ shouldAnimate }: { shouldAnimate: boolean }) {
  return (
    <div
      className="rounded-md border overflow-hidden min-w-0"
      style={{
        background: 'var(--surface-raised)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
        width: '148px',
      }}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-subtle)' }}>
        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--border-strong)' }} aria-hidden="true" />
        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--border-strong)' }} aria-hidden="true" />
        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--border-strong)' }} aria-hidden="true" />
        <span className="text-[9px] font-medium ml-1" style={{ color: 'var(--text-muted)' }}>
          workstation
        </span>
      </div>
      <motion.div
        className="px-2.5 py-2.5"
        animate={shouldAnimate ? { y: [0, -1.5, 0] } : undefined}
        transition={shouldAnimate ? { duration: 5.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <div className="space-y-1.5">
          <div className="h-1.5 rounded" style={{ background: 'var(--accent)', opacity: 0.9, width: '82%' }} aria-hidden="true" />
          <div className="h-1 rounded" style={{ background: 'var(--border-strong)', width: '64%' }} aria-hidden="true" />
          <div className="h-1 rounded" style={{ background: 'var(--text-muted)', opacity: 0.35, width: '48%' }} aria-hidden="true" />
          <div className="flex gap-1 pt-1">
            <span className="h-1 rounded flex-1" style={{ background: 'var(--story-backend-border)', opacity: 0.7 }} aria-hidden="true" />
            <span className="h-1 rounded flex-1" style={{ background: 'var(--story-database-border)', opacity: 0.7 }} aria-hidden="true" />
          </div>
        </div>
        <div className="mt-2.5 h-1.5 rounded-sm mx-auto" style={{ background: 'var(--border)', width: '72%' }} aria-hidden="true" />
      </motion.div>
    </div>
  );
}

function ServiceNode({ label, sub, variant, subtle, shouldAnimate, delay = 0 }: { label: string; sub: string; variant: 'backend' | 'database' | 'cloud' | 'ai' | 'neutral'; subtle?: boolean; shouldAnimate: boolean; delay?: number }) {
  const colorMap: Record<string, string> = {
    backend: 'var(--story-backend)',
    database: 'var(--story-database)',
    cloud: 'var(--story-cloud)',
    ai: 'var(--story-ai)',
    neutral: 'var(--story-neutral)',
  };
  return (
    <motion.div
      className={`story-node story-node--${variant} min-w-0`}
      data-variant={subtle ? 'subtle' : undefined}
      style={{ width: '116px', padding: '8px 10px' }}
      animate={shouldAnimate ? { y: [0, -2.5, 0] } : undefined}
      transition={shouldAnimate ? { duration: 4.8 + delay, repeat: Infinity, ease: 'easeInOut', delay } : undefined}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" aria-hidden="true" style={{ background: colorMap[variant], opacity: 0.9 }} />
        <span className="text-[10px] font-semibold leading-none truncate" style={{ color: 'var(--text)', fontSize: '10px' }}>
          {label}
        </span>
      </div>
      <span className="text-[9px] leading-none mt-1 block" style={{ color: 'var(--text-muted)' }}>
        {sub}
      </span>
      {variant === 'database' && (
        <div className="flex gap-0.5 mt-1.5" aria-hidden="true">
          <span className="h-1 flex-1 rounded" style={{ background: colorMap[variant], opacity: 0.18 }} />
          <span className="h-1 flex-1 rounded" style={{ background: colorMap[variant], opacity: 0.32 }} />
          <span className="h-1 flex-1 rounded" style={{ background: colorMap[variant], opacity: 0.52 }} />
        </div>
      )}
      {variant === 'ai' && (
        <motion.div
          className="mt-1.5 h-1 rounded"
          style={{ background: colorMap[variant], opacity: 0.22 }}
          animate={shouldAnimate ? { opacity: [0.22, 0.42, 0.22] } : undefined}
          transition={shouldAnimate ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}

function PacketDot({ shouldAnimate, offset = 0 }: { shouldAnimate: boolean; offset?: number }) {
  if (!shouldAnimate) return <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', opacity: 0.85, display: 'inline-block' }} />;
  return (
    <motion.span
      aria-hidden="true"
      className="w-1.5 h-1.5 rounded-full inline-block"
      style={{ background: 'var(--accent)' } as React.CSSProperties}
      animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.15, 1] }}
      transition={{ duration: 3.2 + offset, repeat: Infinity, ease: 'easeInOut', delay: offset }}
    />
  );
}

interface HeroEngineeringSceneProps {
  transitionProgress?: MotionValue<number>;
}

export function HeroEngineeringScene({ transitionProgress }: HeroEngineeringSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { shouldAnimate } = useStoryLifecycle(ref, { competitive: false });
  const isCompact = useIsCompactStory(1024);

  const fallback = useMotionValue(0);
  const progress = transitionProgress ?? fallback;

  // Desktop transition values — restrained
  const clusterY = useTransform(progress, [0, 0.4, 0.65, 1], [0, -4, -14, -22]);
  const clusterX = useTransform(progress, [0, 0.65, 1], [0, 8, 14]);
  const clusterScale = useTransform(progress, [0, 0.65, 1], [1, 0.99, 0.97]);
  const clusterOpacity = useTransform(progress, [0, 0.82, 1], [1, 0.94, 0.86]);
  const transitionPacketX = useTransform(progress, [0.2, 0.65], [0, 52]);
  const transitionPacketY = useTransform(progress, [0.2, 0.65], [0, -38]);
  const transitionPacketOpacity = useTransform(progress, [0.2, 0.32, 0.55, 0.65], [0, 1, 1, 0]);
  const compactY = useTransform(progress, [0, 0.65, 1], [0, -6, -12]);
  const compactConnectorOpacity = useTransform(progress, [0.2, 0.45], [0.42, 0.9]);
  const compactPacketY = useTransform(progress, [0.2, 0.65], [0, 28]);
  const path1Opacity = useTransform(progress, [0.2, 0.45], [0.42, 0.9]);
  const path2Opacity = useTransform(progress, [0.2, 0.55], [0.42, 0.9]);
  const path3Opacity = useTransform(progress, [0.3, 0.6], [0.42, 0.9]);
  const ambientPacketOpacity = useTransform(progress, [0, 0.2], [0.85, 0]);

  if (isCompact) {
    return (
      <motion.div
        ref={ref}
        role="img"
        aria-label={SCENE_LABEL}
        className="rounded-md border p-3 min-w-0 relative overflow-hidden"
        style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', minHeight: '220px', y: compactY } as unknown as React.CSSProperties}
      >
        <p className="sr-only">{SCENE_DESC}</p>
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
          System
        </p>
        <div className="flex flex-col items-center gap-0 min-w-0">
          <Laptop shouldAnimate={shouldAnimate} />
          <motion.div className="flex flex-col items-center py-1" aria-hidden="true" style={{ opacity: shouldAnimate ? 1 : 1 } as React.CSSProperties}>
            <motion.div className="w-px h-4" style={{ background: 'var(--accent)', opacity: compactConnectorOpacity } as unknown as React.CSSProperties} />
            <PacketDot shouldAnimate={shouldAnimate} />
            <motion.div className="w-px h-4 mt-1" style={{ background: 'var(--accent)', opacity: compactConnectorOpacity } as unknown as React.CSSProperties} />
            {/* transition-driven signal (subtle down-dot) */}
            <motion.span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full mt-1"
              style={{ background: 'var(--accent)', opacity: transitionPacketOpacity, y: compactPacketY } as unknown as React.CSSProperties}
            />
          </motion.div>
          <div className="flex gap-2 items-start justify-center flex-wrap min-w-0 w-full">
            <ServiceNode label="API" sub="service" variant="backend" shouldAnimate={shouldAnimate} />
            <ServiceNode label="DB" sub="store" variant="database" shouldAnimate={shouldAnimate} delay={0.6} />
          </div>
          <motion.div className="flex flex-col items-center py-1" aria-hidden="true" style={{ opacity: compactConnectorOpacity } as unknown as React.CSSProperties}>
            <div className="w-px h-4" style={{ background: 'var(--border-strong)', opacity: 0.5 }} />
            <PacketDot shouldAnimate={shouldAnimate} offset={0.4} />
            <div className="w-px h-4 mt-1" style={{ background: 'var(--border-strong)', opacity: 0.5 }} />
          </motion.div>
          <ServiceNode label="Cloud · AI" sub="infra / reasoning" variant="cloud" subtle shouldAnimate={shouldAnimate} delay={1.1} />
        </div>
        <p className="text-[10px] leading-snug mt-3 text-center" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
          {shouldAnimate ? 'Ambient · pauses offscreen' : 'Static system (reduced motion)'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      role="img"
      aria-label={SCENE_LABEL}
      className="rounded-md border min-w-0 relative overflow-hidden"
      style={{
        background: 'var(--surface-subtle)',
        borderColor: 'var(--border)',
        minHeight: '340px',
        opacity: clusterOpacity,
      } as unknown as React.CSSProperties}
    >
      <p className="sr-only">{SCENE_DESC}</p>
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
          Engineering system
        </span>
        <span className="flex gap-1" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--border-strong)' }} />
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--border-strong)' }} />
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </span>
      </div>

      <div className="relative p-4 sm:p-5 min-w-0" style={{ perspective: '900px', transformStyle: 'preserve-3d' as const }}>
        <div
          className="absolute inset-3 rounded-md pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            opacity: 0.55,
          }}
          aria-hidden="true"
        />

        <motion.div
          className="relative min-w-0"
          style={{
            transform: 'perspective(900px) rotateX(5deg) rotateY(-7deg) rotateZ(-0.6deg)',
            transformOrigin: '50% 50%',
            height: '268px',
            x: clusterX,
            y: clusterY,
            scale: clusterScale,
          } as unknown as React.CSSProperties}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 220" preserveAspectRatio="none" aria-hidden="true">
            <motion.path d="M 96 168 C 96 138, 122 122, 148 108" fill="none" stroke="var(--accent)" strokeWidth="1.1" strokeLinecap="round" style={{ opacity: path1Opacity } as unknown as React.CSSProperties} />
            <motion.path d="M 188 86 C 212 86, 212 92, 236 92" fill="none" stroke="var(--accent)" strokeWidth="1.1" strokeLinecap="round" style={{ opacity: path2Opacity } as unknown as React.CSSProperties} />
            <motion.path d="M 236 72 C 236 44, 244 36, 258 32" fill="none" stroke="var(--accent)" strokeWidth="1.1" strokeLinecap="round" style={{ opacity: path3Opacity } as unknown as React.CSSProperties} />
            <path d="M 48 72 C 72 72, 92 86, 118 96" fill="none" stroke="var(--border-strong)" strokeWidth="0.9" opacity={0.32} strokeDasharray="4 4" strokeLinecap="round" />
          </svg>

          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{ background: 'var(--accent)', left: '96px', top: '168px', x: transitionPacketX, y: transitionPacketY, opacity: transitionPacketOpacity } as unknown as React.CSSProperties}
            aria-hidden="true"
          />
          {/* ambient packet (fades during transition) */}
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{ background: 'var(--accent)', left: '96px', top: '168px', opacity: ambientPacketOpacity } as unknown as React.CSSProperties}
            aria-hidden="true"
          >
            {shouldAnimate && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--accent)' } as React.CSSProperties}
                animate={{ x: [0, 26, 52], y: [0, -18, -38], opacity: [0, 1, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.6 }}
              />
            )}
          </motion.div>

          <div className="absolute" style={{ left: '18px', top: '128px', transform: 'translateZ(18px)' } as React.CSSProperties}>
            <Laptop shouldAnimate={shouldAnimate} />
          </div>
          <div className="absolute" style={{ left: '10px', top: '22px', transform: 'translateZ(4px)' } as React.CSSProperties}>
            <ServiceNode label="AI" sub="reasoning" variant="ai" subtle shouldAnimate={shouldAnimate} delay={0.3} />
          </div>
          <div className="absolute" style={{ left: '118px', top: '72px', transform: 'translateZ(12px)' } as React.CSSProperties}>
            <ServiceNode label="API" sub="service" variant="backend" shouldAnimate={shouldAnimate} delay={0.5} />
          </div>
          <div className="absolute" style={{ left: '196px', top: '58px', transform: 'translateZ(10px)' } as React.CSSProperties}>
            <ServiceNode label="Database" sub="PostgreSQL" variant="database" subtle shouldAnimate={shouldAnimate} delay={0.8} />
          </div>
          <div className="absolute" style={{ left: '208px', top: '6px', transform: 'translateZ(16px)' } as React.CSSProperties}>
            <ServiceNode label="Cloud" sub="infra" variant="cloud" shouldAnimate={shouldAnimate} delay={1.0} />
          </div>

          <div
            className="absolute hidden sm:block rounded border px-2 py-1.5"
            style={{ right: '10px', bottom: '14px', background: 'var(--surface)', borderColor: 'var(--border)', width: '92px', transform: 'translateZ(8px)' } as React.CSSProperties}
            aria-hidden="true"
          >
            <div className="space-y-1">
              <div className="h-1 rounded" style={{ background: 'var(--text-muted)', opacity: 0.2, width: '70%' }} />
              <div className="h-1 rounded" style={{ background: 'var(--story-backend)', opacity: 0.18, width: '86%' }} />
              <div className="h-1 rounded" style={{ background: 'var(--story-ai)', opacity: 0.14, width: '54%' }} />
            </div>
          </div>
        </motion.div>
      </div>

      <p className="text-[10px] leading-snug px-3 pb-2.5 text-center" style={{ color: 'var(--text-muted)' }} aria-hidden="true">
        {shouldAnimate ? 'Ambient · pauses offscreen' : 'Static system (reduced motion)'}
      </p>
    </motion.div>
  );
}
