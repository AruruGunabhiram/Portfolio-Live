import '@testing-library/jest-dom/vitest';

// jsdom lacks WAAPI `element.animate` used by framer-motion 12
// Provide minimal polyfill so MotionValue bindings don't crash in unit tests.
// No visual animation needed in tests — static values suffice.
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  // @ts-ignore
  Element.prototype.animate = function () {
    return {
      finished: Promise.resolve(),
      cancel() {},
      play() {},
      pause() {},
      reverse() {},
    } as unknown as Animation;
  };
}
