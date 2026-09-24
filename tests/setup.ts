import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(cleanup);
// jsdom has no layout/scroll engine. Keep real controls, context and events.
HTMLElement.prototype.scrollIntoView = vi.fn();

// Radix Checkbox observes control size; geometry is outside these tests.
vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});
