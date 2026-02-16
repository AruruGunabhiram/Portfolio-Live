import { useEffect, useCallback, useRef } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export const useKonamiCode = (callback: () => void) => {
  const keysPressed = useRef<string[]>([]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      keysPressed.current.push(event.key);

      // Only keep the last N keys where N is the length of the Konami code
      if (keysPressed.current.length > KONAMI_CODE.length) {
        keysPressed.current.shift();
      }

      // Check if the last N keys match the Konami code
      const isMatch = KONAMI_CODE.every(
        (key, index) => keysPressed.current[index] === key
      );

      if (isMatch) {
        callback();
        keysPressed.current = []; // Reset after successful activation
      }
    },
    [callback]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
