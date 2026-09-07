# Gunabhiram Aruru — Portfolio

Engineered portfolio for a backend / full-stack engineer (MS CS, CU Boulder). Focus: production-grade systems, clear evidence, recruiter-readable in 30s, explorable in depth.

Live stack after Phases 0–3: **React 19 + TypeScript 5.9 strict + Vite 7.3 + Tailwind 4 + Framer Motion**. Design system is `light/dark` via semantic CSS vars, not `geek/dark`.

---

## Stack

- **Core:** React 19, TypeScript 5.9 (strict, `verbatimModuleSyntax`), Vite 7.3, React Router
- **Styling:** Tailwind 4 (`@import "tailwindcss"`), semantic tokens in `src/styles/tokens.css` + `src/styles/globals.css` (`--bg`, `--surface`, `--text`, `--accent`, etc.), `data-theme="light|dark"` pre-paint script in `index.html`
- **Animation:** Framer Motion only for shell/section enters (GSAP/ScrollTrigger, `react-scroll-parallax`, `tsparticles` remain installed but not in primary path — removal deferred to Phase 19)
- **3D:** Three / R3F / Drei kept isolated for future project demos, not in shell; `SpaceDustBackground` is the only always-on canvas (light/dark aware, `prefers-reduced-motion` respected)

---

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build → dist/
npm run preview  # http://localhost:4173
npm run lint     # eslint . (warnings only from legacy SKILL radial chart any)
```

Node `>=18`, npm `>=9` (Vite target `es2015`, `chunkSizeWarningLimit 1000`).

---

## Project Structure

```
src/
  App.tsx                 # shell: skip-link, Loader, Header, main#main-content, Footer, SpaceDust
  main.tsx
  index.css               # @import tokens + globals + legacy cyber aliases → var(--*)
  styles/
    tokens.css            # light/dark semantic vars + motion tokens
    globals.css           # base, typography roles, focus ring, selection, scrollbar, scroll-margin
  types/
    portfolio.ts          # canonical Profile, Project, Skill, Experience, Education, Publication, Certification, Leadership
    theme.ts              # Theme = 'light'|'dark'
  data/
    profile.ts            # PROFILE + TECH_CHIPS + IMPACT_HIGHLIGHTS
    contact.ts            # CONTACT (public: email/phone/linkedin/github/resumeUrl)
    experience.ts         # EXPERIENCE[1] id: infini-ai-intern
    projects.ts           # PROJECTS[6] ids: sociallens, creator-copilot, zenco, code-battlegrounds, timesling, nostalgia (featured 3)
    education.ts          # EDUCATION[2]
    publications.ts       # PUBLICATIONS[1] ieee-cad-late-fusion-2025
    skills.ts             # SKILLS[38] flat + SKILL_CATEGORIES[7] with evidence[] (no level %)
    leadership.ts, certifications.ts, practices.ts
    snapshot.ts           # getPublicPortfolioSnapshot() for Ask Guna / recruiter mode (public-only)
    validate.ts           # dev-only duplicate/evidence checks
    index.ts              # barrel
  components/
    LoaderOverlay.tsx + hooks/useSessionLoader.ts  # readiness-aware (fonts + 2rAF, hard 1400ms, session skip)
    ui/{Button,Container,Card,SpaceDustBackground,CustomCursor*}
    skills/{SkillConstellation,Skill3DSphere*}     # isolated, ts-nocheck (Phase 12 rebuild)
  sections/
    Header.tsx            # native <a href="#id">, 7 recruiter items, IntersectionObserver spy, mobile aria-controls/expanded, Escape
    Hero.tsx, About.tsx, Experience.tsx, Projects.tsx, Skills.tsx, Education.tsx, Publications.tsx, Leadership.tsx, Contact.tsx, Footer.tsx
  context/ThemeContext.tsx # light/dark with localStorage + prefers-color-scheme + data-theme, 260ms subtle
  hooks/useTheme.ts
```

`src/utils/constants.ts` is now empty (canonical lives in `src/data/*`); legacy `src/data/resume.ts` is a deprecated shim re-exporting canonical.

---

## Editing Content (canonical)

Do **not** edit `src/utils/constants.ts` or old `SKILLS level` datasets. Edit:

```ts
// src/data/profile.ts
export const PROFILE = { name, shortName, headline, valueProposition };

// src/data/contact.ts
export const CONTACT = { email, phone, linkedinUrl, githubUrl, resumeUrl };

// src/data/projects.ts
{
  id: 'sociallens', slug: 'sociallens',
  title, subtitle, summary,
  categories: ['backend'],
  technologies: ['Java','Spring Boot',...],
  featured: true, featuredOrder: 1,
  highlights: [...],
  links: { github, live },
  caseStudy, architecture, demo // demo optional undefined until Phase 7/8
}

// src/data/skills.ts
{ id: 'python', name: 'Python', category: 'languages', evidence: [{type:'project', id:'sociallens'}] }
```

Categories: `languages | backend | frontend | databases | ai | design | devops` (skills) and `backend | full-stack | ai | developer-tools | desktop | browser-extension` (projects).
Evidence refs are `project|experience|publication|leadership|certification` ids — validated by `validateSkillEvidence` (dev).

---

## Theming

- First paint theme set by inline script in `index.html` from `localStorage portfolio-theme` else `prefers-color-scheme`.
- Toggle in Header (sun/moon, `aria-label`, `aria-pressed`) writes `localStorage` + `documentElement data-theme` + `colorScheme`.
- Tokens: `--bg` `#f6f6f3` light / `#0e1418` dark, `--surface`, `--text`, `--border`, `--accent` `#3f7d90/#5ba8c4`. Focus `2px solid var(--focus)`.

---

## Status

- **Phases 0–3 done:** forensic audit, light/dark tokens + `data-theme` pre-paint, canonical `src/data/*` (38 skills, 6 projects, featured 3), shell with session loader + skip-link + native-anchor nav + scroll spy + mobile a11y.
- **Next:** Phase 4 Hero, 5 Experience, 6 Project Explorer, 7/8 demos, 12 skills evidence UI, 14 Ask Guna (uses `snapshot.ts`), etc.
- **Legacy docs archived:** `docs/archive/` (`CYBERPUNK_THEME.md`, `PORTFOLIO_REVIEW.md`, `SKILLS_*.md`) — cyberpunk `dark/geek` prototype, kept for history only.

---

## License

MIT
