# Testing — Phase 21

## What tests exist

**Unit / integration (Vitest + jsdom + Testing Library)**

| File | Covers |
| ---- | ------ |
| `tests/unit/data-integrity.test.ts` | 21D IDs unique, 21E featured invariant (SocialLens/Creator Copilot/Code Battlegrounds order), 21F URL guard, 21G empty certifications, 21AB peer-reviewed guard, 21AC AWS claim guard |
| `tests/unit/snapshot.test.ts` | 21Y / 21BZ public snapshot allowlist, phone excluded from Ask Guna, IMPACT_HIGHLIGHTS / secrets excluded |
| `tests/unit/evidence-resolver.test.ts` | 21U resolver for project/experience/publication/leadership/certification + invalid → null |
| `tests/unit/seo-static.test.ts` | 21AD metadata, 21AE placeholder domain, 21AF robots/sitemap, 21AG favicon/OG assets, 21AH JSON-LD |
| `tests/unit/ask-guna-handler.test.ts` | 21W API validation (empty/whitespace/too long/method, missing key 503, provider 502/timeout 504, rate limit), 21AW offline, 21AX no env secrets in response |
| `tests/unit/ask-guna-security.test.ts` | 21X system prompt constraints, snapshot privacy, 21BX/BY bundle guard placeholder |
| `tests/unit/ask-guna-client.test.ts` | 21V label, disabled while loading, maxLength 800, suggested fill, abort stale, no innerHTML |
| `tests/unit/contact.test.ts` | 21Z contact links, 21AA Copy Email, 21AV resume asset, no innerHTML, back-to-top |

**Browser E2E (Playwright + axe-core)**

| File | Scenarios |
| ---- | --------- |
| `tests/e2e/navigation.spec.ts` | 21M anchors href/target/hash, 21BC hash+recruiter, 21O skip link, 21N mobile menu (375): open/aria-expanded/focus/Escape/close on click/resize |
| `tests/e2e/theme-recruiter.spec.ts` | 21H theme persistence & html data-theme & aria, 21I FOUC (storage before paint), 21J/21BB recruiter URL replaceState/focus/no reload + invalid mode, 21K recruiter content (3 featured, explorer secondary, Ask Guna compact), 21L standard regression (38 skill buttons, suggestions, explorer) |
| `tests/e2e/projects-skills.spec.ts` | 21P explorer open/filter/collapse/focus, 21Q featured+non-featured detail + case study + focus return, 21R demo static (recruiter/reduced motion), 21T skills aria-pressed/evidence/no-evidence/keyboard + recruiter static |
| `tests/e2e/ask-guna-contact.spec.ts` | 21V mocked success/error/loading/suggested + 21BA stale abort, 21Z contact mailto/linkedin/github/résumé/phone/Copy/Back to top |
| `tests/e2e/responsive-accessibility.spec.ts` | 21AL 320/375/1024/1440 no overflow, 21AM 320 with explorer/detail/Ask Guna error, 21AK reduced motion, 21AI axe matrix (375 Light/1024 Dark/375 Recruiter Dark/1024 Recruiter Light reduced motion, 0 critical/serious), 21AS 0 third-party + 0 Ask Guna on load, 21AT no console errors, 21AU internal targets, 21AV resume request 200 |

**Scripts**

| Script | Purpose |
| ------ | ------- |
| `scripts/check-build-budget.mjs` | 21AQ/21AR gzip budgets (main ≤90kB, total initial ≤150kB, CSS ≤10kB) using Node zlib, hashed filenames |
| `scripts/check-secrets.mjs` | 21BX/BY scans dist for GROQ_API_KEY/gsk_/api.groq.com + .env.example empty |
| `scripts/verify-production.mjs` | 21AE/21CH/21CI placeholder canonical warning — warns locally, fails if SITE_URL_CONFIRMED=true or VERIFY_PRODUCTION=true and still placeholder; checks consistency when domain confirmed |

## How to run

```bash
npm install
npx playwright install chromium   # 21BP — one-time browser download (not during npm install)

npm run lint
npm run test                      # vitest run — < ~10s
npm run test:unit                 # vitest run tests/unit only
npm run build
npm run test:budget               # build-budget.mjs
npm run test:secrets              # secret guard
npm run verify                    # lint + test + build + budget + secrets
npm run test:e2e                  # playwright (builds + previews on 127.0.0.1:4173) — < ~2-3m
npx playwright test --project=chromium --reporter=list
npm run verify:production         # placeholder warning — does not fail locally until Phase22 confirms domain
```

All unit tests run without Groq secrets (mocked fetch/env) — 21AW.

E2E intercepts `/api/ask-guna` — no live Groq required (21BS).

## What requires no secrets

- `npm run test`, `npm run build`, `npm run test:budget`, `npm run test:secrets`, `npm run test:e2e` (mocked)

## What Phase 22 live tests remain (21CG / 21CH)

Not claimed in Phase 21:

- live Groq integration + grounding refusal semantics
- production canonical URL proof + sitemap/robots absolute URLs on live host
- `/api/ask-guna` real serverless handler with GROQ_API_KEY
- production cache headers
- live social preview crawlers (Facebook/LinkedIn/Twitter)
- external project links live verification
- final Lighthouse (performance/SEO) on production host
- final manual 200% zoom + assistive tech audit

`npm run verify:production` is dormant locally (warns `NOT PROVEN`) and will gate deployment in Phase 22 when SITE_URL is replaced and `SITE_URL_CONFIRMED=true`.
