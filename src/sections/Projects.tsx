import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../components';
import { PROJECTS } from '../data/projects';
import type { ProjectCategory } from '../types/portfolio';
import { prefersReducedMotion } from '../utils';
import { usePortfolioMode } from '../context/PortfolioModeContext';
import { FeaturedProject } from '../components/projects/FeaturedProject';
import { ProjectListItem } from '../components/projects/ProjectListItem';
import { ProjectDetail } from '../components/projects/ProjectDetail';
import { ProjectFilters } from '../components/projects/ProjectFilters';

export const Projects = () => {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { isRecruiter } = usePortfolioMode();

  const reduced = typeof window !== 'undefined' ? prefersReducedMotion() : false;

  useEffect(() => {
    if (isRecruiter && explorerOpen) setExplorerOpen(false);
  }, [isRecruiter, explorerOpen]);

  const featured = useMemo(
    () => PROJECTS.filter(p => p.featured).sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99)),
    []
  );

  const allCategories = useMemo(() => {
    const set = new Set<ProjectCategory>();
    PROJECTS.forEach(p => p.categories.forEach(c => set.add(c)));
    return (['all' as const, ...Array.from(set).sort()] ) as (ProjectCategory | 'all')[];
  }, []);

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return PROJECTS;
    return PROJECTS.filter(p => p.categories.includes(selectedCategory as ProjectCategory));
  }, [selectedCategory]);

  const toggleDetail = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  return (
    <section id="projects" className="py-12 sm:py-16 lg:py-20 relative">
      <Container>
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 12 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2, margin: '0px 0px -80px 0px' }}
          transition={{ duration: reduced ? 0 : 0.38, ease: 'easeOut' }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Projects
          </h2>
          <p className="text-sm leading-relaxed mt-2 max-w-[60ch]" style={{ color: 'var(--text-muted)' }}>
            Selected systems, products and experiments.
          </p>
          <div className="mt-4 h-px max-w-[640px]" style={{ background: 'var(--border)' }} aria-hidden="true" />

          {/* Featured — exactly 3, derived from canonical */}
          <div className="mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            {featured.map((project, idx) => {
              const isExpanded = selectedId === project.id;
              return (
                <div key={project.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <FeaturedProject project={project} index={idx} isExpanded={isExpanded} onToggle={() => toggleDetail(project.id)} />
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        id={`detail-${project.id}`}
                        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                        transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
                        className="pb-6"
                      >
                        <ProjectDetail project={project} onClose={() => setSelectedId(null)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Explore control — recruiter de-emphasized */}
          <div className="mt-8 flex justify-start">
            {isRecruiter ? (
              <button
                type="button"
                aria-expanded={explorerOpen}
                aria-controls="project-explorer"
                onClick={() => setExplorerOpen(v => !v)}
                className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline focus-visible:outline-none"
                style={{ color: 'var(--text-muted)' }}
              >
                {explorerOpen ? 'Show fewer projects' : 'View all projects'}
                <span aria-hidden="true" style={{ display: 'inline-block', transform: explorerOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: reduced ? 'none' : 'transform 200ms' }}>
                  ↓
                </span>
              </button>
            ) : (
              <button
                type="button"
                aria-expanded={explorerOpen}
                aria-controls="project-explorer"
                onClick={() => setExplorerOpen(v => !v)}
                className="inline-flex items-center gap-2 text-sm font-medium border rounded-md px-4 py-2.5 transition-colors focus-visible:outline-none"
                style={
                  explorerOpen
                    ? { background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                    : { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
                }
              >
                {explorerOpen ? 'Show fewer projects' : 'Explore all projects'}
                <span aria-hidden="true" style={{ transform: explorerOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: reduced ? 'none' : 'transform 200ms' }}>
                  ↓
                </span>
              </button>
            )}
          </div>

          {/* Explorer — inline expansion, pushes Education down */}
          <AnimatePresence initial={false}>
            {explorerOpen && (
              <motion.div
                id="project-explorer"
                initial={reduced ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={reduced ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: reduced ? 0 : 0.24, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="pt-8">
                  <ProjectFilters categories={allCategories} selected={selectedCategory} onSelect={setSelectedCategory} />

                  <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }} aria-live="polite">
                    {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
                    {selectedCategory !== 'all' ? ` · ${selectedCategory}` : ''}
                  </p>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                    {filtered.map(project => {
                      const isExpanded = selectedId === project.id;
                      return (
                        <div key={project.id} className="min-w-0">
                          <ProjectListItem project={project} isExpanded={isExpanded} onToggle={() => toggleDetail(project.id)} />
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                id={`detail-${project.id}`}
                                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                                transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
                                className="pb-4"
                              >
                                <ProjectDetail project={project} onClose={() => setSelectedId(null)} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {filtered.length === 0 && (
                    <p className="text-sm py-8" style={{ color: 'var(--text-muted)' }}>
                      No projects for this category.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </section>
  );
};
