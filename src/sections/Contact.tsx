import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { CONTACT } from '../data/resume';

// ─── "Open to" availability banner ────────────────────────────────────────────

const OpenToBanner = ({ isGeekMode }: { isGeekMode: boolean }) => {
  const surface = isGeekMode
    ? 'bg-[#091520]/80 border border-[#2a5060]/60'
    : 'bg-[#0e0e22]/80 border border-gray-700/50';
  const titleColor = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const subColor = isGeekMode ? 'text-[#4a7080]' : 'text-gray-500';
  const btnPrimary = isGeekMode
    ? 'bg-[#1a3a4a] border border-[#3a6a7a]/70 text-[#7ec0d6] hover:bg-[#1e4456]'
    : 'bg-[#1a1a30] border border-gray-600/60 text-gray-300 hover:bg-[#222240]';
  const btnSecondary = isGeekMode
    ? 'border border-[#2a5060]/50 text-[#5a8898] hover:text-[#7ec0d6]'
    : 'border border-gray-700/40 text-gray-500 hover:text-gray-300';

  return (
    <motion.div
      variants={fadeInUp}
      className={`rounded-xl px-6 py-5 mb-10 ${surface}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className={`text-sm font-semibold ${titleColor}`}>
            Open to Summer 2026 SWE internships
          </p>
          <p className={`text-xs mt-0.5 ${subColor}`}>
            Backend / Full-Stack &bull; Boulder / Remote &bull; Fast response via email
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <a
            href={`mailto:${CONTACT.email}`}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${btnPrimary}`}
          >
            Email Me
          </a>
          <a
            href={CONTACT.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${btnSecondary}`}
          >
            LinkedIn
          </a>
          <a
            href="#"
            onClick={e => e.preventDefault()}
            title="Resume PDF — link coming soon"
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${btnSecondary}`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Resume
          </a>
        </div>
      </div>
    </motion.div>
  );
};

interface ContactLink {
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

export const Contact = () => {
  const { isGeekMode } = useTheme();

  const accent = isGeekMode ? 'text-[#7ec0d6]' : 'text-white';
  const body = isGeekMode ? 'text-[#6b8494]' : 'text-gray-400';
  const linkColor = isGeekMode ? 'text-[#5ba8c4] hover:text-[#7ec0d6]' : 'text-[#818cf8] hover:text-[#a5b4fc]';
  const surface = isGeekMode
    ? 'bg-[#0d1829]/60 border border-[#2a5060]/40'
    : 'bg-[#141428]/60 border border-gray-700/30';
  const divider = isGeekMode ? 'divide-[#1e3a4a]/50' : 'divide-gray-700/40';

  const links: ContactLink[] = [
    { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { label: 'Phone', value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, '')}` },
    { label: 'LinkedIn', value: CONTACT.linkedin, href: CONTACT.linkedinUrl, external: true },
    { label: 'GitHub', value: CONTACT.github, href: CONTACT.githubUrl, external: true },
  ];

  return (
    <section id="contact" className="py-20">
      <Container>
        <motion.div
          className="max-w-xl"
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={staggerContainer}
        >
          <OpenToBanner isGeekMode={isGeekMode} />

          <motion.h2
            className={`text-3xl md:text-4xl font-bold mb-4 ${accent}`}
            variants={fadeInUp}
          >
            {isGeekMode ? '> ' : ''}Contact
          </motion.h2>

          <motion.p className={`text-base mb-8 ${body}`} variants={fadeInUp}>
            {isGeekMode ? '> ' : ''}Open to internship and full-time opportunities. Feel free to reach out directly.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className={`rounded-xl divide-y ${surface} ${divider}`}
          >
            {links.map(link => (
              <div key={link.label} className="px-6 py-4 flex items-center justify-between gap-4">
                <span className={`text-xs font-semibold uppercase tracking-widest w-20 shrink-0 ${
                  isGeekMode ? 'text-[#3a6a7a]' : 'text-gray-600'
                }`}>
                  {link.label}
                </span>
                <a
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className={`text-sm font-medium transition-colors ${linkColor}`}
                >
                  {link.value}
                </a>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};
