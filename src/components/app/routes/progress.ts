import NProgress from 'accessible-nprogress';

let counter = 0;
let configured = false;

/**
 * Ensures the NProgress library is configured once for the app.
 * Sets a minimal bar and disables the spinner.
 *
 * @returns {void}
 */
export function progressConfig(): void {
  if (!configured) {
    NProgress.configure({ showSpinner: false, minimum: 0.08, trickleSpeed: 100 });
    configured = true;
  }
}

/**
 * Starts (or increments) the global progress indicator.
 * Multiple overlapping calls are reference-counted; the bar starts when the first call begins.
 *
 * @returns {void}
 */
export function progressBegin(): void {
  progressConfig();
  counter += 1;
  if (counter === 1) { NProgress.start(); }
}

/**
 * Ends (or decrements) the global progress indicator.
 * The bar completes when the last pending operation finishes.
 *
 * @returns {void}
 */
export function progressEnd(): void {
  if (counter > 0) { counter -= 1; }
  if (counter === 0) { NProgress.done(); }
}
