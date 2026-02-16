import { useEffect, useRef, useState } from 'react';
import { isBrowser, prefersReducedMotion } from '../../utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

// Simple syntax highlighter for cyberpunk colors
const highlightCode = (code: string, language: string): string => {
  let highlighted = code;

  if (language === 'typescript' || language === 'javascript') {
    // Keywords (cyan)
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'import', 'export', 'from', 'as', 'async', 'await', 'new', 'this', 'extends', 'implements'];
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-cyber-cyan">${keyword}</span>`);
    });

    // Strings (pink)
    highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="text-cyber-pink">$1$2$1</span>');

    // Comments (purple)
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-cyber-purple opacity-70">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-cyber-purple opacity-70">$1</span>');

    // Numbers (cyan light)
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="text-cyber-cyan-light">$1</span>');
  }

  return highlighted;
};

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
    const codeElement = codeRef.current;

    // Apply syntax highlighting
    const highlightedCode = highlightCode(code, language);

    // If reduced motion, show all text immediately
    if (reducedMotion) {
      codeElement.innerHTML = highlightedCode;
      return;
    }

    // Create a temporary div to parse the highlighted HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = highlightedCode;

    // Clear content
    codeElement.textContent = '';

    // Get all text nodes and elements
    const nodes: Node[] = [];
    const walkNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        nodes.push(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        nodes.push(node);
        Array.from(node.childNodes).forEach(walkNodes);
      }
    };
    Array.from(tempDiv.childNodes).forEach(walkNodes);

    // Animate typewriter effect (legacy - unused, kept for reference)
    // let charIndex = 0;
    const timeouts: number[] = [];

    // const typeNextChar = () => {
    //   if (charIndex < nodes.length) {
    //     const node = nodes[charIndex];
    //     if (node.nodeType === Node.TEXT_NODE) {
    //       const text = node.textContent || '';
    //       for (let i = 0; i < text.length; i++) {
    //         const span = document.createElement('span');
    //         span.textContent = text[i];
    //         span.style.opacity = '0';
    //         span.style.transition = 'opacity 0.1s';
    //         codeElement.appendChild(span);

    //         const timeout = setTimeout(() => {
    //           span.style.opacity = '1';
    //         }, (charIndex + i) * 20);
    //         timeouts.push(timeout);
    //       }
    //       charIndex += text.length;
    //     } else if (node.nodeType === Node.ELEMENT_NODE) {
    //       const clone = (node as Element).cloneNode(false) as HTMLElement;
    //       clone.style.opacity = '0';
    //       clone.style.transition = 'opacity 0.1s';
    //       codeElement.appendChild(clone);

    //       const timeout = setTimeout(() => {
    //         clone.style.opacity = '1';
    //       }, charIndex * 20);
    //       timeouts.push(timeout);
    //       charIndex++;
    //     }
    //   }
    // };

    // Start typing animation (simplified version - show syntax-highlighted code immediately)
    codeElement.innerHTML = highlightedCode;
    const spans = codeElement.querySelectorAll('span');
    spans.forEach((span, i) => {
      (span as HTMLElement).style.opacity = '0';
      (span as HTMLElement).style.transition = 'opacity 0.1s';
      const timeout = setTimeout(() => {
        (span as HTMLElement).style.opacity = '1';
      }, i * 15);
      timeouts.push(timeout);
    });

    // Cleanup timeouts
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [isVisible, code, language]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 left-2 text-xs text-cyber-cyan opacity-50 font-mono">
        {language}
      </div>
      <pre className="bg-cyber-bg-darker/80 border border-cyber-cyan/30 rounded-lg p-4 pt-8 overflow-x-auto backdrop-blur-sm">
        <code
          ref={codeRef}
          className="text-cyber-text-light font-mono text-sm leading-relaxed"
        >
          {/* Content will be populated by animation with syntax highlighting */}
        </code>
      </pre>
    </div>
  );
};
