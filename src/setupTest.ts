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
