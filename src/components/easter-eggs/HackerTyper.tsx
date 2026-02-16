import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '../../utils';

const CODE_SNIPPETS = [
  `function hackTheSystem() {
  console.log("Accessing mainframe...");
  const access = await getAccess();
  if (access.granted) {
    console.log("Access granted!");
    return true;
  }
}`,
  `const matrix = new Matrix();
matrix.setMode('hack');
matrix.bypass(firewall);
console.log("I'm in.");`,
  `class CyberAgent {
  constructor() {
    this.stealth = true;
    this.mission = "classified";
  }
  execute() {
    return this.infiltrate();
  }
}`,
];

interface HackerTyperProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const HackerTyper = memo(({ isActive, onComplete }: HackerTyperProps) => {
  const [displayedCode, setDisplayedCode] = useState('');
  const [codeIndex, setCodeIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayedCode('');
      setCodeIndex(0);
      return;
    }

    const currentSnippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    let charIndex = 0;

    const interval = setInterval(() => {
      if (charIndex < currentSnippet.length) {
        setDisplayedCode(currentSnippet.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2000);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, codeIndex, onComplete]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyPress = () => {
      // Any key press advances the code
      setCodeIndex((prev) => prev + 1);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isActive]);

  const reducedMotion = prefersReducedMotion();

  return (
    <AnimatePresence>
      {isActive && displayedCode && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
          role="dialog"
          aria-label="Hacker typer effect"
        >
          <div className="max-w-4xl w-full">
            <div className="bg-geek-bg border border-geek-accent rounded-lg p-6 shadow-[0_0_30px_rgba(0,255,0,0.3)]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-geek-accent">
                <span className="text-geek-accent font-mono">
                  HACKING IN PROGRESS...
                </span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-geek-accent animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-geek-accent animate-pulse delay-75" />
                  <div className="w-3 h-3 rounded-full bg-geek-accent animate-pulse delay-150" />
                </div>
              </div>

              <pre className="text-geek-text font-mono text-sm overflow-auto max-h-96">
                {displayedCode}
                <span className="animate-pulse">_</span>
              </pre>

              <div className="mt-4 text-xs text-geek-accent opacity-70">
                Keep typing to generate more code...
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

HackerTyper.displayName = 'HackerTyper';
