// eslint-disable-next-line import/no-extraneous-dependencies
import { screen } from '@testing-library/react';

// @ts-ignore
import type { TextMatch } from '@testing-library/dom';

// Suppress specific console.error warnings
/* eslint-disable no-console */

// TODO: Once there are no more console errors in tests, uncomment the code below
// const { error } = global.console;

// global.console.error = (...args) => {
//   error(...args);
//   throw new Error(args.join(' '));
// };

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const CONSOLE_FILTERS = {
  warn: [
    'PubSub already loaded',
  ],
  error: [
    'Support for defaultProps will be removed from function components',
  ],
};

// Override `console.error`
console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string'
    && CONSOLE_FILTERS.error.some(ignored => message.includes(ignored))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Override `console.warn`
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string'
    && CONSOLE_FILTERS.warn.some(ignored => message.includes(ignored))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
/* eslint-enable no-console */

// @ts-ignore
// eslint-disable-next-line func-names
global.validateText = function (
  text: TextMatch,
  options?: {
    exact?: boolean;
    selector?: string;
    ignore?: string | boolean;
    normalizer?: (text: string) => string;
  },
) {
  expect(screen.getByText(text, options)).toBeInTheDocument();
};

// Global helper to validate debounced behavior in a deterministic, reusable way
// Usage example:
// await assertDebounce({
//   baseDelayMs: 500,
//   preCalls: [() => debouncedFn(arg1)],
//   call: () => debouncedFn(arg2),
//   getInvocationCount: () => mockFn.mock.calls.length,
// });
// It will:
//  - Use modern fake timers
//  - Assert nothing runs before baseDelayMs
//  - Advance time in phases and verify only one invocation occurs
//  - Measure elapsed time from the last call until the promise resolves
//  - Restore real timers at the end
// Notes:
//  - preCalls are invoked synchronously before measuring the final call
//  - call must return a Promise that settles when the debounced work completes
//  - getInvocationCount is optional; if provided, assertions on invocations are made
//  - You can override the upper margin via upperMarginMs (default 20ms)
//  - This helper sets and restores jest timers; avoid toggling timers inside call/preCalls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).assertDebounce = async function assertDebounce(options: {
  baseDelayMs: number;
  call: () => Promise<unknown>;
  preCalls?: Array<() => unknown>;
  getInvocationCount?: () => number;
  upperMarginMs?: number;
}) {
  const {
    baseDelayMs,
    call,
    preCalls = [],
    getInvocationCount,
    upperMarginMs = 20,
  } = options;

  // Use modern fake timers to drive debounce deterministically
  jest.useFakeTimers({ legacyFakeTimers: false });

  // Execute any preliminary rapid calls to be debounced
  for (const fn of preCalls) {
    try {
      fn();
    } catch (e) {
      // ignore sync errors from preCalls; actual validation will happen on final call
    }
  }

  // Start measuring from the LAST call
  const start = Date.now();
  const p = call();

  // Advance time to just before the debounce threshold in two steps
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

  // Verify nothing has executed yet if we can observe invocations
  if (getInvocationCount) {
    expect(getInvocationCount()).toBe(0);
  }

  // Cross the boundary by 1ms to trigger the debounced execution
  jest.advanceTimersByTime(1);

  // Await completion of the debounced promise
  await p;

  // Optionally assert exactly one invocation happened
  if (getInvocationCount) {
    expect(getInvocationCount()).toBe(1);
  }

  // Measure elapsed and assert timing window
  const elapsed = Date.now() - start;
  expect(elapsed).toBeGreaterThanOrEqual(baseDelayMs);
  expect(elapsed).toBeLessThanOrEqual(baseDelayMs + upperMarginMs);

  // Always restore real timers
  jest.useRealTimers();

  return { elapsedMs: elapsed };
};
