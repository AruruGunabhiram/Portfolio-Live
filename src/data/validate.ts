/**
 * Lightweight canonical data integrity checks.
 * Run in development only; no runtime dependency.
 */

function assertUnique<T>(items: T[], keyFn: (item: T) => string, label: string) {
  const seen = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const dupes = [...seen.entries()].filter(([, n]) => n > 1);
  if (dupes.length) {
    const msg = `${label} duplicates: ${dupes.map(([k, n]) => `${k}×${n}`).join(', ')}`;
    if (import.meta.env.DEV) console.error(`[validate] ${msg}`);
    // Throw in dev to surface early; no throw in prod.
    if (import.meta.env.DEV) throw new Error(msg);
  }
}

export function validatePortfolio(data: {
  projects: Array<{ id: string; slug: string }>;
  skills: Array<{ id: string }>;
  education: Array<{ id: string }>;
  experience: Array<{ id: string }>;
  publications: Array<{ id: string }>;
  leadership: Array<{ id: string }>;
}) {
  assertUnique(data.projects, p => p.id, 'project id');
  assertUnique(data.projects, p => p.slug, 'project slug');
  assertUnique(data.skills, s => s.id, 'skill id');
  assertUnique(data.education, e => e.id, 'education id');
  assertUnique(data.experience, e => e.id, 'experience id');
  assertUnique(data.publications, p => p.id, 'publication id');
  assertUnique(data.leadership, l => l.id, 'leadership id');

  // featuredOrder uniqueness when present
  const featured = data.projects.filter((p: unknown) => (p as { featured?: boolean }).featured);
  const orders = featured.map((p: unknown) => (p as { featuredOrder?: number }).featuredOrder).filter(Boolean) as number[];
  if (orders.length) assertUnique(orders.map(String), s => s, 'featuredOrder');

  return true;
}

export function validateSkillEvidence(
  skills: Array<{ id: string; evidence?: Array<{ type: string; id: string }> }>,
  knownIds: Record<string, Set<string>>
) {
  const missing: string[] = [];
  for (const skill of skills) {
    for (const ev of skill.evidence ?? []) {
      const set = knownIds[ev.type];
      if (!set || !set.has(ev.id)) {
        missing.push(`${skill.id}→${ev.type}:${ev.id}`);
      }
    }
  }
  if (missing.length) {
    const msg = `skill evidence references missing ids: ${missing.join(', ')}`;
    if (import.meta.env.DEV) console.error(`[validate] ${msg}`);
    if (import.meta.env.DEV) throw new Error(msg);
  }
  return missing.length === 0;
}
