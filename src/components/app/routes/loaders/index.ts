/**
 * Loader factories for application routes.
 * - makeRootLoader: Handles root route redirects based on auth and checkout intent.
 * - makeCheckoutStepperLoader: Dispatches to per-page loaders within the stepper routes.
 */
export { default as makeRootLoader } from './rootLoader';
export { default as makeCheckoutStepperLoader } from './checkoutStepperLoader';
