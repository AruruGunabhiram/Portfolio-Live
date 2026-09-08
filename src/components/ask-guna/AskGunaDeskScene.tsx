import { useContext, useId } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../context';
import { useReducedMotion } from '../../hooks/useStoryLifecycle';
import { usePortfolioMode } from '../../context/PortfolioModeContext';

/**
 * A19 — Ask Guna desk environment.
 *
 * A back-view workspace drawn entirely in SVG geometry: monitor, desk, lamp,
 * laptop, cup and a generic seated silhouette with no face and no identifying
 * detail. It renders no text at all, so it can never surface an address, a
 * question, an answer or a provider error — it only echoes the interaction
 * state the section already exposes.
 *
 * Decorative and non-interactive: aria-hidden, focusable="false", pointer-events
 * none, zero tab stops. The section works identically when this does not render.
 *
 * Lives inside the lazily-loaded AskGuna chunk.
 */

export type AskGunaSceneState = 'idle' | 'typing' | 'thinking' | 'answer' | 'error';

interface Palette {
  deskTop: string;
  deskFront: string;
  edge: string;
  bezel: string;
  screen: string;
  line: string;
  accent: string;
  error: string;
  person: string;
  personHead: string;
  lamp: string;
  lampLight: string;
  lampStop: string;
  laptop: string;
  laptopScreen: string;
  cup: string;
  glow: string;
  room: string;
}

const LIGHT: Palette = {
  deskTop: '#ddd4c4',
  deskFront: '#c9c0af',
  edge: '#b3aa9b',
  bezel: '#c0b7a9',
  screen: '#faf8f4',
  line: '#aba296',
  accent: '#2f6b80',
  error: '#b42318',
  person: '#b5ab9c',
  personHead: '#a89e8f',
  lamp: '#bdb4a6',
  lampLight: '#e8c48a',
  lampStop: 'rgba(232, 196, 138, 0.22)',
  laptop: '#c9c0af',
  laptopScreen: '#ddd7cb',
  cup: '#c0b7a9',
  glow: 'rgba(47, 107, 128, 0.10)',
  room: 'rgba(255, 248, 236, 0.55)',
};

const DARK: Palette = {
  deskTop: '#1e2a33',
  deskFront: '#162027',
  edge: '#2e404e',
  bezel: '#22303a',
  screen: '#0f181e',
  line: '#33454f',
  accent: '#5ba8c4',
  error: '#ff8a7a',
  person: '#131b22',
  personHead: '#101820',
  lamp: '#2e404e',
  lampLight: '#e8b06a',
  lampStop: 'rgba(232, 176, 106, 0.30)',
  laptop: '#162027',
  laptopScreen: '#131d24',
  cup: '#22303a',
  glow: 'rgba(91, 168, 196, 0.26)',
  room: 'rgba(91, 168, 196, 0.05)',
};

// Monitor glow strength per state — the only ambient level that moves.
const GLOW: Record<AskGunaSceneState, number> = {
  idle: 0.55,
  typing: 0.7,
  thinking: 0.85,
  answer: 1,
  error: 0.4,
};

// Attention shift of the silhouette, in user units. Deliberately tiny.
const LEAN: Record<AskGunaSceneState, number> = {
  idle: 0,
  typing: -1.5,
  thinking: -3,
  answer: 0,
  error: 1.5,
};

export function AskGunaDeskScene({ state }: { state: AskGunaSceneState }) {
  const uid = useId().replace(/:/g, '');
  const isDark = useContext(ThemeContext)?.isDark ?? false;
  const isReduced = useReducedMotion();
  const { isRecruiter } = usePortfolioMode();
  const isStatic = isReduced || isRecruiter;
  const p = isDark ? DARK : LIGHT;

  const t = (duration: number) => ({ duration: isStatic ? 0 : duration, ease: 'easeOut' as const });
  const lampGlowId = `lamp-${uid}`;
  const monitorGlowId = `mon-${uid}`;
  const roomId = `room-${uid}`;

  return (
    <motion.div
      aria-hidden="true"
      data-scene="ask-guna-desk"
      data-scene-state={state}
      className="w-full max-w-[260px] md:max-w-[280px] lg:max-w-[340px]"
      style={{ pointerEvents: 'none' }}
      initial={isStatic ? undefined : { opacity: 0, y: 10 }}
      whileInView={isStatic ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: isStatic ? 0 : 0.5, ease: 'easeOut' }}
    >
      <svg
        viewBox="0 0 400 235"
        width="100%"
        role="presentation"
        focusable="false"
        style={{ display: 'block', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <radialGradient id={monitorGlowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.glow} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id={roomId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.room} />
            <stop offset="55%" stopColor={p.room} stopOpacity="0.35" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id={lampGlowId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.lampStop} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Ambient room light — daylight wash in light theme, faint bounce in dark.
            An ellipse, not a rect: the gradient must reach transparent on every
            edge or it paints a visible box. */}
        <ellipse cx="230" cy="72" rx="190" ry="120" fill={`url(#${roomId})`} />

        {/* Monitor bloom, the one level that tracks interaction state */}
        <motion.ellipse
          cx="200"
          cy="76"
          rx="150"
          ry="82"
          fill={`url(#${monitorGlowId})`}
          initial={false}
          animate={{ opacity: GLOW[state] }}
          transition={t(0.45)}
        />

        {/* ── Lamp (left) — shade, arm, base; cone lit only in dark theme ── */}
        <g>
          {isDark && <path d="M58 96 L102 96 L120 150 L40 150 Z" fill={`url(#${lampGlowId})`} />}
          <path d="M60 94 L100 94 L106 112 L54 112 Z" fill={p.lamp} />
          <rect x="78" y="112" width="3" height="30" fill={p.edge} />
          <ellipse cx="79.5" cy="142" rx="14" ry="4" fill={p.lamp} />
          {isDark && <ellipse cx="80" cy="112" rx="24" ry="5" fill={p.lampLight} opacity="0.5" />}
        </g>

        {/* ── Monitor ── */}
        <g>
          <rect x="128" y="30" width="144" height="86" rx="5" fill={p.bezel} />
          <rect x="136" y="36" width="128" height="70" rx="3" fill={p.screen} />
          <rect x="194" y="116" width="12" height="18" fill={p.bezel} />
          <path d="M176 134 L224 134 L232 142 L168 142 Z" fill={p.edge} />
          <ScreenContent state={state} p={p} isStatic={isStatic} />
        </g>

        {/* ── Desk ── */}
        <path d="M40 142 L360 142 L388 168 L12 168 Z" fill={p.deskTop} />
        <path d="M12 168 L388 168 L388 178 L12 178 Z" fill={p.deskFront} />
        <path d="M40 142 L360 142" stroke={p.edge} strokeWidth="1" fill="none" />

        {/* ── Laptop (right, on desk) — dim/closed-feeling in dark ── */}
        <g>
          <path d="M300 116 L350 112 L354 146 L302 150 Z" fill={p.laptop} />
          <path d="M305 120 L347 117 L350 143 L306 146 Z" fill={p.laptopScreen} />
          <path d="M296 150 L356 146 L368 160 L304 164 Z" fill={p.laptop} />
        </g>

        {/* ── Cup ── */}
        <g>
          <path d="M108 128 L128 128 L125 150 L111 150 Z" fill={p.cup} />
          <path d="M128 133 Q136 136 128 143" stroke={p.cup} strokeWidth="3" fill="none" />
        </g>

        {/* ── Person, back view. No face, no identifying detail. ── */}
        <motion.g initial={false} animate={{ x: LEAN[state] }} transition={t(0.7)}>
          <path d="M126 235 Q132 194 200 190 Q268 194 274 235 Z" fill={p.person} />
          <ellipse cx="200" cy="176" rx="27" ry="29" fill={p.personHead} />
        </motion.g>
      </svg>
    </motion.div>
  );
}

/** Screen interior. Text-free by construction — bars and dots only. */
function ScreenContent({ state, p, isStatic }: { state: AskGunaSceneState; p: Palette; isStatic: boolean }) {
  // Window chrome — constant across states
  const chrome = (
    <g opacity="0.5">
      <rect x="144" y="43" width="34" height="4" rx="2" fill={p.line} />
      <rect x="136" y="53" width="128" height="1" fill={p.line} />
    </g>
  );

  if (state === 'thinking') {
    return (
      <>
        {chrome}
        <g>
          {[0, 1, 2].map(i => (
            <motion.circle
              key={i}
              cx={186 + i * 14}
              cy={76}
              r="3"
              fill={p.accent}
              initial={false}
              animate={isStatic ? { opacity: 0.75 } : { opacity: [0.25, 1, 0.25] }}
              transition={isStatic ? { duration: 0 } : { duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
            />
          ))}
        </g>
      </>
    );
  }

  if (state === 'answer') {
    return (
      <>
        {chrome}
        <g>
          {[
            { y: 64, w: 108 },
            { y: 74, w: 96 },
            { y: 84, w: 72 },
          ].map((l, i) => (
            <motion.rect
              key={l.y}
              x="144"
              y={l.y}
              width={l.w}
              height="4"
              rx="2"
              fill={p.accent}
              // `x` on a motion element is a transform, not the SVG attribute —
              // animating it would translate these bars clean off the screen.
              initial={isStatic ? false : { opacity: 0 }}
              animate={{ opacity: 0.55 }}
              transition={{ duration: isStatic ? 0 : 0.32, delay: isStatic ? 0 : i * 0.11, ease: 'easeOut' }}
            />
          ))}
          <motion.rect
            x="144"
            y="96"
            width="26"
            height="2"
            rx="1"
            fill={p.accent}
            initial={isStatic ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: isStatic ? 0 : 0.3, delay: isStatic ? 0 : 0.44 }}
          />
        </g>
      </>
    );
  }

  if (state === 'error') {
    return (
      <>
        {chrome}
        <g>
          <rect x="144" y="70" width="60" height="4" rx="2" fill={p.line} opacity="0.6" />
          <rect x="144" y="82" width="20" height="3" rx="1.5" fill={p.error} opacity="0.55" />
        </g>
      </>
    );
  }

  // idle + typing share the placeholder body; typing adds the caret
  return (
    <>
      {chrome}
      <g>
        <rect x="144" y="66" width="84" height="4" rx="2" fill={p.line} opacity="0.35" />
        <rect x="144" y="78" width="58" height="4" rx="2" fill={p.line} opacity="0.28" />
        {state === 'typing' && (
          <motion.rect
            x="206"
            y="76"
            width="2"
            height="9"
            fill={p.accent}
            initial={false}
            animate={isStatic ? { opacity: 1 } : { opacity: [1, 0, 1] }}
            transition={isStatic ? { duration: 0 } : { duration: 1.06, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </g>
    </>
  );
}
