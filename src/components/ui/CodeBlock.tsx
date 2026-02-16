import { useEffect, useRef, useState } from 'react';
import { isBrowser, prefersReducedMotion } from '../../utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeBlock = ({ code, language = 'typescript', className = '' }: CodeBlockProps) => {
  const codeRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isBrowser || !codeRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(codeRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isBrowser || !codeRef.current || !isVisible) return;

    const reducedMotion = prefersReducedMotion();

    // If reduced motion, show all text immediately
    if (reducedMotion) {
      if (codeRef.current) {
        codeRef.current.textContent = code;
      }
      return;
    }

    const codeElement = codeRef.current;
    const characters = code.split('');

    // Clear content
    codeElement.textContent = '';

    // Create span for each character
    const spans = characters.map((char) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.opacity = '0';
      codeElement.appendChild(span);
      return span;
    });

    // Animate typewriter effect
    const timeouts: number[] = [];
    spans.forEach((span, i) => {
      const timeout = setTimeout(() => {
        span.style.opacity = '1';
      }, i * 30); // 30ms between each character
      timeouts.push(timeout);
    });

    // Cleanup timeouts
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [isVisible, code]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 left-2 text-xs text-geek-accent opacity-50">
        {language}
      </div>
      <pre className="bg-black/50 border border-geek-accent rounded-lg p-4 pt-8 overflow-x-auto">
        <code
          ref={codeRef}
          className="text-geek-text font-mono text-sm"
        >
          {/* Content will be populated by animation */}
        </code>
      </pre>
    </div>
  );
};
