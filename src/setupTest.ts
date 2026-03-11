// src/setupTest.ts

/* eslint-disable no-console */
import { screen, waitFor } from '@testing-library/react';

import type { TextMatch } from '@testing-library/dom';
import 'whatwg-fetch';

// ------------------ Console suppression ------------------
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const CONSOLE_FILTERS = {
  warn: ['PubSub already loaded'],
  error: ['Support for defaultProps will be removed from function components'],
};

console.error = (...args: any[]) => {
  const message = args[0];
  if (typeof message === 'string' && CONSOLE_FILTERS.error.some(ignored => message.includes(ignored))) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args: any[]) => {
  const message = args[0];
  if (typeof message === 'string' && CONSOLE_FILTERS.warn.some(ignored => message.includes(ignored))) {
    return;
  }
  originalConsoleWarn(...args);
};
/* eslint-enable no-console */

// ------------------ Global fetch polyfill ------------------
beforeAll(() => {
  global.fetch = global.fetch || (jest.fn((url: string) => {
    if (url.includes('/admin/check-email')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ registered: false }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  }) as jest.Mock);
});

afterAll(() => {
  jest.restoreAllMocks();
});

// ------------------ Global validateText helper ------------------
global.validateText = async function (
  text: string | RegExp | ((content: string) => boolean),
  options?: { exact?: boolean },
  timeout = 5000, // increased timeout for slower async pages
) {
  let element;

  await waitFor(() => {
    if (typeof text === 'string' || text instanceof RegExp) {
      element = screen.queryByText(text as TextMatch, options);
    } else if (typeof text === 'function') {
      element = Array.from(document.body.querySelectorAll('*')).find(el => el.textContent && text(el.textContent));
    }

    if (!element) {
      throw new Error(`Unable to find element with text: ${text}`);
    }

    expect(element).toBeInTheDocument();
  }, { timeout });
};

// ------------------ Global debounce helper ------------------
(global as any).assertDebounce = async function assertDebounce(options: {
  baseDelayMs: number;
  call: () => Promise<unknown>;
  preCalls?: Array<() => unknown>;
  getInvocationCount?: () => number;
  upperMarginMs?: number;
}) {
  const { baseDelayMs, call, preCalls = [], getInvocationCount, upperMarginMs = 20 } = options;

  jest.useFakeTimers({ legacyFakeTimers: false });

  for (const fn of preCalls) {
    try { fn(); } catch { /* ignore sync errors */ }
  }

  const start = Date.now();
  const p = call();

  const before = Math.max(0, baseDelayMs - 100);
  if (before > 0) {
    jest.advanceTimersByTime(before);
    await Promise.resolve();
  }

  const justBefore = Math.min(99, Math.max(0, baseDelayMs - before - 1));
  if (justBefore > 0) {
    jest.advanceTimersByTime(justBefore);
    await Promise.resolve();
  }

  if (getInvocationCount) {
    expect(getInvocationCount()).toBe(0);
  }

  jest.advanceTimersByTime(1);
  await p;

  if (getInvocationCount) {
    expect(getInvocationCount()).toBe(1);
  }

  const elapsed = Date.now() - start;
  expect(elapsed).toBeGreaterThanOrEqual(baseDelayMs);
  expect(elapsed).toBeLessThanOrEqual(baseDelayMs + upperMarginMs);

  jest.useRealTimers();

  return { elapsedMs: elapsed };
};
