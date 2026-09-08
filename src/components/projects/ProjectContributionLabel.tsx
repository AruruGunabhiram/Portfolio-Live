import type { ProjectContribution } from '../../types/portfolio';

const PUBLIC_LABEL: Partial<Record<ProjectContribution, string>> = {
  'co-built': 'Co-built',
  contributor: 'Contributor',
};

export function ProjectContributionLabel({ contribution }: { contribution?: ProjectContribution }) {
  const label = contribution ? PUBLIC_LABEL[contribution] : undefined;
  if (!label) return null;

  return (
    <span
      className="inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none"
      style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-subtle)' }}
    >
      {label}
    </span>
  );
}
