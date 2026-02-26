import { motion } from 'framer-motion';
import { Container } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';
import { CONTACT } from '../data/resume';

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
