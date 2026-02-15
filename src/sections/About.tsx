import { motion } from 'framer-motion';
import { Container, ParallaxLayer, CodeBlock } from '../components';
import { useTheme } from '../hooks';
import { fadeInUp, staggerContainer, scrollViewport } from '../utils';

const CODE_SNIPPET = `const developer = {
  name: "Full Stack Developer",
  skills: ["React", "TypeScript", "Node.js"],
  passion: "Building amazing experiences",

  create: () => {
    return "Beautiful & functional apps";
  }
};

console.log(developer.create());`;

export const About = () => {
  const { isGeekMode } = useTheme();

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Parallax Background Layers */}
      <ParallaxLayer speed={-15} className="absolute top-20 left-10 opacity-10">
        <div className={`w-64 h-64 rounded-full ${isGeekMode ? 'bg-geek-accent' : 'bg-dark-accent'} blur-3xl`} />
      </ParallaxLayer>

      <ParallaxLayer speed={-8} className="absolute bottom-20 right-10 opacity-10">
        <div className={`w-96 h-96 rounded-full ${isGeekMode ? 'bg-geek-accent' : 'bg-dark-accent'} blur-3xl`} />
      </ParallaxLayer>

      <Container className="relative z-10">
        <motion.h2
          className={`text-3xl md:text-4xl font-bold mb-8 ${isGeekMode ? 'text-geek-accent' : 'text-white'}`}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
          variants={fadeInUp}
        >
          {isGeekMode ? '> ' : ''}About Me
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
            variants={staggerContainer}
          >
            <motion.p
              className={`text-lg ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}
              variants={fadeInUp}
            >
              {isGeekMode ? '> ' : ''}
              I'm a passionate full-stack developer with a love for creating elegant solutions to complex problems.
              With expertise in modern web technologies, I specialize in building responsive, user-friendly applications
              that deliver exceptional experiences.
            </motion.p>

            <motion.p
              className={`text-lg ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}
              variants={fadeInUp}
            >
              {isGeekMode ? '> ' : ''}
              My journey in software development has equipped me with a diverse skill set spanning front-end frameworks,
              back-end systems, and everything in between. I thrive on continuous learning and staying ahead of
              industry trends.
            </motion.p>

            <motion.p
              className={`text-lg ${isGeekMode ? 'text-geek-text' : 'text-gray-300'}`}
              variants={fadeInUp}
            >
              {isGeekMode ? '> ' : ''}
              When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects,
              or sharing knowledge with the developer community.
            </motion.p>
          </motion.div>

          {/* Animated Code Block - Only in Geek Mode */}
          {isGeekMode && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={scrollViewport}
              variants={fadeInUp}
            >
              <CodeBlock code={CODE_SNIPPET} language="typescript" />
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  );
};
