import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Stepper } from '@openedx/paragon';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { RouteObject } from 'react-router';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { queryCacheOnErrorHandler } from '@/utils/common';

import type { RenderResult } from '@testing-library/react';

interface RenderWithRouterOptions {
  routes?: RouteObject[];
  initialEntries?: string[];
  customRouter?: ReturnType<typeof createMemoryRouter>;
}

export function renderWithRouterProvider(
  children: ReactElement,
  { routes = [], initialEntries, customRouter }: RenderWithRouterOptions = {},
): RenderResult {
  const defaultRoutes: RouteObject[] = [
    // Do we really need to hard-code these??
    { path: '/:step', element: children },
    { path: '/:step/:substep', element: children },
  ];

  const router = customRouter ?? createMemoryRouter([...defaultRoutes, ...routes], {
    initialEntries: initialEntries ?? ['/'],
    initialIndex: 0,
  });

  return render(<RouterProvider router={router} />);
}

export function queryClient(defaultOptions = {}) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: queryCacheOnErrorHandler,
    }),
    defaultOptions: {
      ...defaultOptions,
      queries: {
        retry: false,
        // @ts-ignore
        ...defaultOptions.queries,
      },
    },
  });
}

/**
 * Generates all possible permutations of an object where each key has multiple possible values.
 *
 * This function returns the [cartesian product](https://en.wikipedia.org/wiki/Cartesian_product) of the input values:
 * if there are `n` keys, and each key `k` has `v_k` possible values, then the total number of combinations is:
 *
 *    total = v₁ × v₂ × ... × vₙ
 *
 * @param {Object.<string, any[]>} options - An object where each key maps to an array of possible values.
 * @returns {Object[]} - An array of objects, each representing a unique combination of the input values.
 *
 * @example
 * const input = {
 *   shouldUpdateActiveEnterpriseCustomerUser: [true, false],
 *   isBFFData: [true, false],
 *   anotherFlag: ["A", "B"]
 * };
 * // The total number of permutations is: 2 × 2 × 2 = 8
 *
 * const result = generatePermutations(input);
 * console.log(result);
 *
 * // Output:
 * // [
 * //   { shouldUpdateActiveEnterpriseCustomerUser: true, isBFFData: true, anotherFlag: "A" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: true, isBFFData: true, anotherFlag: "B" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: true, isBFFData: false, anotherFlag: "A" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: true, isBFFData: false, anotherFlag: "B" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: false, isBFFData: true, anotherFlag: "A" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: false, isBFFData: true, anotherFlag: "B" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: false, isBFFData: false, anotherFlag: "A" },
 * //   { shouldUpdateActiveEnterpriseCustomerUser: false, isBFFData: false, anotherFlag: "B" }
 * // ]
 */
export const generateTestPermutations = (options: { [s: string]: any[]; }): object[] => Object.entries(options).reduce(
  (acc, [key, values]) => acc.flatMap(prev => values.map(value => ({ ...prev, [key]: value }))),
  [{}],
);

/**
 * Renders a component with a Stepper context provider.
 * This is useful for testing components that use Stepper.Step or Stepper.ActionRow.
 *
 * @param {ReactElement} children - The component to render
 * @param {string} activeKey - The active step key to set in the Stepper context
 * @returns {RenderResult} - The render result
 */
export function renderWithStepperProvider(
  children: ReactElement,
  activeKey: string,
): RenderResult {
  return render(
    <IntlProvider locale="en">
      <Stepper activeKey={activeKey}>
        {children}
      </Stepper>
    </IntlProvider>,
  );
}

/**
 * Renders a component with both a Router and Stepper context provider.
 * This is useful for testing components that use both routing and Stepper.Step or Stepper.ActionRow.
 *
 * @param {ReactElement} children - The component to render
 * @param {string} activeKey - The active step key to set in the Stepper context
 * @param {RenderWithRouterOptions} routerOptions - Options for the router provider
 * @returns {RenderResult} - The render result
 */
export function renderWithRouterAndStepperProvider(
  children: ReactElement,
  activeKey: string,
  routerOptions: RenderWithRouterOptions = {},
): RenderResult {
  const wrappedChildren = (
    <IntlProvider locale="en">
      <Stepper activeKey={activeKey}>
        {children}
      </Stepper>
    </IntlProvider>
  );

  return renderWithRouterProvider(wrappedChildren, routerOptions);
}
