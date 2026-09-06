import { motion } from 'framer-motion';
import { Container } from '../components';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { CONTACT } from '../data/resume';

const OpenToBanner = () => {
  return (
    <motion.div
      variants={fadeInUp}
      className="rounded-md px-6 py-5 mb-10"
      style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Open to Summer 2026 SWE internships</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Backend / Full-Stack • Boulder / Remote • Fast response via email</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors"
            style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }}
          >
            Email Me
          </a>
          <a
            href={CONTACT.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)' }}
          >
            LinkedIn
          </a>
          <a
            href={CONTACT.resumeUrl}
            download="Gunabhiram_Resume.pdf"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
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
          <OpenToBanner />

          <motion.h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text)' }} variants={fadeInUp}>
            Contact
          </motion.h2>

          <motion.p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }} variants={fadeInUp}>
            Open to internship and full-time opportunities. Feel free to reach out directly.
          </motion.p>

          <motion.div variants={fadeInUp} className="rounded-md divide-y" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {links.map(link => (
              <div key={link.label} className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2 sm:gap-4">
                <span className="text-xs font-semibold uppercase tracking-widest w-20 shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {link.label}
                </span>
                <a
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="text-sm font-medium break-all sm:break-normal link-accent"
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
