# Archive — Pre-Phase 1-3 Docs

These files describe the early **cyberpunk / geek-mode prototype** (Feb 2026) that was superseded by:

- **Phase 1:** `light/dark` semantic tokens (`src/styles/tokens.css`, `src/styles/globals.css`) + `data-theme` pre-paint (`index.html`), not `dark/geek`.
- **Phase 2:** canonical content in `src/data/*` + `src/types/portfolio.ts` (`PROFILE`, `CONTACT`, `PROJECTS`, `SKILLS` with `evidence`), not `src/utils/constants.ts` or 70-skill `level` datasets.
- **Phase 3:** session-aware loader (`src/hooks/useSessionLoader.ts`) + IntersectionObserver nav + `skip-link` + native anchors.

**Do not use as reference for new work.** Kept for git history only.

| File | Why archived |
| ---- | ------------ |
| `CYBERPUNK_THEME.md` | Neon palette `#00f0ff/#ff006e/#b026ff` on `#0a0e27` + glow utilities — intentionally removed in Phase 1. |
| `PORTFOLIO_REVIEW.md` | Feb 15 build snapshot (95/100, `Main 636KB` etc.) — superseded by Phase 2/3 build (`index 107kB`, light/dark). |
| `SKILLS_SECTION_STATUS.md` | 4-view Grid/Timeline/Constellation/3D with 54 `level` skills — replaced by canonical 38 `evidence`-linked skills. |
| `SKILLS_VISUALIZATION.md` | GSAP/Rough.js/R3F bar/radial/sketch/3D docs — deferred/removed. |

Canonical docs: `../../README.md`, `../../src/data/*`, `../../src/types/portfolio.ts`.
