import { useState, useRef, useEffect, memo } from 'react';
import type { KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { prefersReducedMotion } from '../../utils';

interface TerminalCommand {
  command: string;
  output: string | string[];
}

const COMMANDS: Record<string, string | string[]> = {
  help: [
    'Available commands:',
    '  help     - Show this help message',
    '  about    - About this portfolio',
    '  skills   - List my skills',
    '  contact  - Get my contact info',
    '  clear    - Clear the terminal',
    '  matrix   - Enable the matrix',
    '  secret   - ???',
  ],
  about: [
    'Full-stack developer with a passion for building amazing web experiences.',
    'This portfolio was built with React, TypeScript, and lots of coffee ☕',
  ],
  skills: [
    'Frontend: React, TypeScript, Next.js, Tailwind CSS',
    'Backend: Node.js, Express, Python, Django',
    'Tools: Git, Docker, AWS, Firebase',
  ],
  contact: [
    'Email: your.email@example.com',
    'GitHub: github.com/yourusername',
    'LinkedIn: linkedin.com/in/yourusername',
  ],
  matrix: 'Wake up, Neo... The Matrix has you...',
  secret: '🎉 You found the secret! 🎉',
  clear: '',
};

export const HiddenTerminal = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<TerminalCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Ctrl + ` to toggle terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();

    if (trimmedCmd === 'clear') {
      setHistory([]);
      return;
    }

    const output = COMMANDS[trimmedCmd] || `Command not found: ${trimmedCmd}. Type 'help' for available commands.`;

    setHistory((prev) => [...prev, { command: cmd, output }]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      executeCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  const reducedMotion = prefersReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t-2 border-geek-accent shadow-[0_-4px_20px_rgba(0,255,0,0.3)]"
          initial={{ y: reducedMotion ? 0 : '100%' }}
          animate={{ y: 0 }}
          exit={{ y: reducedMotion ? 0 : '100%' }}
          transition={{ duration: reducedMotion ? 0 : 0.3, ease: 'easeOut' }}
          role="dialog"
          aria-label="Hidden terminal"
        >
          <div className="max-h-96 overflow-y-auto p-4 font-mono text-sm">
            {/* Terminal Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-geek-accent">
              <span className="text-geek-accent">
                Hidden Terminal v1.0.0
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-geek-accent hover:text-geek-text transition-colors"
                aria-label="Close terminal"
              >
                [X]
              </button>
            </div>

            {/* Welcome Message */}
            {history.length === 0 && (
              <div className="text-geek-text mb-4">
                <p>Welcome to the hidden terminal!</p>
                <p>Type 'help' to see available commands.</p>
                <p className="text-xs mt-2 opacity-70">Tip: Press Ctrl + ` to toggle terminal</p>
              </div>
            )}

            {/* Command History */}
            {history.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="text-geek-accent">
                  <span className="text-geek-text">{'>'}</span> {item.command}
                </div>
                <div className="text-geek-text mt-1 ml-4">
                  {Array.isArray(item.output) ? (
                    item.output.map((line, i) => <div key={i}>{line}</div>)
                  ) : (
                    <div>{item.output}</div>
                  )}
                </div>
              </div>
            ))}

            <div ref={historyEndRef} />

            {/* Command Input */}
            <div className="flex items-center text-geek-accent mt-2">
              <span className="text-geek-text mr-2">{'>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-geek-accent caret-geek-accent"
                placeholder="Enter command..."
                aria-label="Terminal command input"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

HiddenTerminal.displayName = 'HiddenTerminal';
