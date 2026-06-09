import '@testing-library/jest-dom/vitest';

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

const storage = new Map();

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
  },
});

afterEach(() => {
  cleanup();
  if (
    typeof window !== 'undefined' &&
    window.localStorage &&
    typeof window.localStorage.clear === 'function'
  ) {
    window.localStorage.clear();
  }
  vi.restoreAllMocks();
});
