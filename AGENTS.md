# AGENTS — Portfolio-Live

Compact ops guide for OpenCode. Every line is here because an agent would guess wrong without it.

## Commands (exact)

```bash
npm install
npm run dev      # Vite on http://localhost:5173 (host:true, open:true)
npm run build    # tsc -b && vite build → dist/  (tsc is the gate)
npm run preview  # Vite preview on http://localhost:4173
npm run lint     # eslint .  — 0 errors expected; 3 warnings in SkillRadialChart are pre-existing
```

No test harness yet. No `format`/`typecheck` separate script — `npm run build` is the typecheck. Node `>=18`, npm `>=9`.

Order matters: `lint` → `build` (build includes `tsc -b`). Don't run `build` without passing `tsc -b`.

## Architecture (not obvious from filenames)

- **Entrypoint:** `src/main.tsx` → `ThemeProvider` → `src/App.tsx` → `src/pages/Home.tsx` (single route `/`, `BrowserRouter` + `ParallaxProvider` wrapper)
- **Shell:** `App.tsx` owns `skip-link → LoaderOverlay → SpaceDustBackground (fixed, pointer-events:none) → Header → motion.main#main-content → Footer`. Keep this hierarchy; don't dump easter-egg logic into `App.tsx`.
- **Sections live in `src/sections/`** (`Hero, About, Experience, Projects, Skills, Education, Publications, Leadership, Contact, Header, Footer`). `Projects.tsx` is still a scroll-narrative (960vh sticky) until Phase 6 explorer replaces it — don't refactor it as a simple list yet.
- **Single source of truth:** `src/types/portfolio.ts` + `src/data/*`. `src/data/resume.ts` is a **deprecated shim** re-exporting canonical — don't add new content there. `src/utils/constants.ts` is empty (stale `PROJECTS[3]` removed Phase 2).
- **Data barrel:** `src/data/index.ts` → `PROFILE, CONTACT, PROJECTS, SKILLS, EDUCATION, PUBLICATIONS, LEADERSHIP, CERTIFICATIONS, ENGINEERING_PRACTICES, getPublicPortfolioSnapshot, validatePortfolio`. Prefer importing from `src/data/*` directly for tree-shake clarity; barrel is for cross-cutting consumers (`Ask Guna`, recruiter mode).
- **Build split:** `vite.config.ts` `manualChunks: react-vendor / animation-vendor / three-vendor`. `three-vendor ~1.2MB (344kB gz)` warning is expected — not a regression. `chunkSizeWarningLimit:1000`, `target:es2015`, `sourcemap:false`, `optimizeDeps` includes `framer-motion,gsap`.

## Design System — light/dark (Phase 1)

- **Tokens:** `src/styles/tokens.css` defines `:root` (light) and `[data-theme='dark']` overrides for `--bg, --surface, --text, --border, --accent, --focus, --shadow, --radius`. `src/styles/globals.css` applies them plus `.skip-link`, `section[id]{scroll-margin-top:72px}`, `html{scroll-behavior:smooth}` (auto on `prefers-reduced-motion`).
- **Theme init:** Inline script in `index.html` sets `documentElement[data-theme]` **before paint** from `localStorage portfolio-theme` else `prefers-color-scheme`. `ThemeContext` syncs `data-theme` + `colorScheme` + `localStorage`. Don't move theme to `useEffect`-only — you'll FOUC.
- **Toggle:** Header sun/moon (`aria-label`/`aria-pressed`), 260ms CSS transition, instant if `prefers-reduced-motion`. `isGeekMode` is a deprecated alias for `isDark` — don't branch on it for new UI.

## Data / Content Rules (Phase 2 hard-won)

- **Edit content here:** `src/data/profile.ts` (name/headline/valueProposition + `TECH_CHIPS`), `src/data/contact.ts` (email/phone/linkedin/github/resumeUrl), `src/data/projects.ts` (8 ids: `ember, sociallens, incidentpilot, clinical-reconciliation, code-battlegrounds, timesling, zenco, nostalgia`; `featured` 3: ember→sociallens→incidentpilot; optional `contribution: 'solo'|'co-built'|'contributor'`), `src/data/skills.ts` (7 cats `languages|backend|frontend|databases|ai|design|devops`, 37 flat `Skill{id,category,evidence}`), `src/data/experience|education|publications|leadership|certifications|practices.ts`.
- **Don't invent:** `year/status` on projects, metrics, or certifications not proven — leave `optional`/`undefined`. `IMPACT_HIGHLIGHTS` is an orphaned array in `profile.ts` — don't assign to a project without provenance.
- **Evidence:** `Skill.evidence: {type:'project'|'experience'|..., id:string}` must reference existing ids (`validateSkillEvidence` dev-only). Run mentally or call `validatePortfolio`/`validateSkillEvidence` in dev.
- **Project links needing human check:** `ember` (private repo — intentionally no link), `zenco`/`code-battlegrounds`/`nostalgia` (other owners). Don't silently rewrite.
- **Public vs private:** `src/data/snapshot.ts` `getPublicPortfolioSnapshot()` is the Ask-Guna allowlist (includes phone because Contact renders it — flag if you make phone private).

## Gotchas & Quirks

- **TS strict:** `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals/Parameters`, `noUncheckedSideEffectImports` — imports must be `type` where appropriate; unused locals fail build.
- **ESLint overrides:** `react-hooks/purity` and `set-state-in-effect` are `off`, `ban-ts-comment` is `off` — because `SpaceDust`/`Skill3DSphere`/`SkillGridView`/`SkillRadialChart` use intentional canvas `Math.random` and `@ts-nocheck` for legacy viz (Phase 12 rebuild). The 3 remaining `SkillRadialChart` warnings (`any` ×2, `exhaustive-deps`) are pre-existing — don't chase them.
- **Loader:** `src/hooks/useSessionLoader.ts` — show only if readiness (`document.fonts.ready` + 2×rAF) exceeds 120ms, min visible 180ms, hard timeout 1400ms, `sessionStorage portfolio-loader-seen` skips repeat. Don't reintroduce fixed 900/2200ms delays; don't wait for `three`/SpaceDust.
- **Header nav:** 7 items `Experience, Projects, Education, Research(=publications), Skills, Leadership, Contact` as native `<a href="#id">`. Active spy via `IntersectionObserver rootMargin -72px 0 -55% 0`. Mobile menu `aria-controls="mobile-nav"` + Escape + `motion y:-4 160ms`. `scroll-margin-top` already handles sticky 56px header — don't manually offset scroll.
- **Background:** `SpaceDustBackground` is always mounted, light/dark aware via `data-theme` check + `prefers-reduced-motion` early return. Don't add aurora/mesh/extra canvas (deferred to Phase 19). Light mode mutes particles `0.45×`.
- **Artifacts:** `dist/` is built output (gitignored), `docs/archive/` holds frozen cyberpunk docs — don't treat as source. `package-lock.json` is the lockfile (npm, not pnpm/yarn). No `.github` CI yet.
- **Tailwind:** v4 via `@import "tailwindcss"` in `src/index.css`; legacy `cyber-*` aliases still mapped to `var(--*)` for dead files — don't reintroduce `cyber-*` in new code.
