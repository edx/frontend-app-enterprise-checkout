import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { QueryClient } from '@tanstack/react-query';
import { redirect } from 'react-router-dom';

import { extractPriceId } from '@/components/app/data/hooks/useStripePriceId';
import { queryBffContext, queryCheckoutSession } from '@/components/app/data/queries/queries';
import { extractCheckoutSessionPayload, validateFormState } from '@/components/app/routes/loaders/utils';
import { CheckoutPageRoute } from '@/constants/checkout';
import { getCheckoutPageDetails, getStepFromParams } from '@/utils/checkout';

/**
 * Route loader for Plan Details page
 */
async function planDetailsLoader(): Promise<Response | null> {
  // Plan Details page doesn't require authentication
  return null;
}

/**
 * Route loader for Plan Details Login page
 */
async function planDetailsLoginLoader(): Promise<Response | null> {
  const authenticatedUser = getAuthenticatedUser();
  if (authenticatedUser) {
    // If the user is already authenticated, redirect to PlanDetails Page.
    return redirect(CheckoutPageRoute.PlanDetails);
  }
  return null;
}

/**
 * Route loader for Plan Details Register page
 */
async function planDetailsRegisterLoader(): Promise<Response | null> {
  const authenticatedUser = getAuthenticatedUser();
  if (authenticatedUser) {
    // If the user is already authenticated, redirect to PlanDetails Page.
    return redirect(CheckoutPageRoute.PlanDetails);
  }
  return null;
}

/**
 * Route loader for Account Details page
 */
async function accountDetailsLoader(queryClient: QueryClient): Promise<Response | null> {
  const authenticatedUser = getAuthenticatedUser();
  if (!authenticatedUser) {
    // If the user is NOT authenticated, redirect to PlanDetails Page.
    return redirect(CheckoutPageRoute.PlanDetails);
  }

  const contextMetadata: CheckoutContextResponse = await queryClient.ensureQueryData(
    queryBffContext(authenticatedUser?.userId || null),
  );

  const { fieldConstraints, pricing } = contextMetadata;

  const stripePriceId = extractPriceId(pricing);

  if (!stripePriceId) {
    return redirect(CheckoutPageRoute.PlanDetails);
  }

  const {
    valid,
    invalidRoute,
  } = await validateFormState({
    currentRoute: CheckoutPageRoute.AccountDetails,
    constraints: fieldConstraints,
    stripePriceId,
  });

  if (!valid && invalidRoute) {
    return redirect(invalidRoute);
  }
  return null;
}

/**
 * Route loader for Billing Details page
 */
async function billingDetailsLoader(queryClient: QueryClient): Promise<Response | null> {
  const authenticatedUser = getAuthenticatedUser();
  if (!authenticatedUser) {
    // If the user is NOT authenticated, redirect to PlanDetails Page.
    return redirect(CheckoutPageRoute.PlanDetails);
  }

  const contextMetadata: CheckoutContextResponse = await queryClient.ensureQueryData(
    queryBffContext(authenticatedUser?.userId || null),
  );

  const { fieldConstraints, pricing } = contextMetadata;
  const stripePriceId = extractPriceId(pricing);

  if (!stripePriceId) {
    return redirect(CheckoutPageRoute.PlanDetails);
  }

  const {
    valid,
    invalidRoute,
  } = await validateFormState({
    currentRoute: CheckoutPageRoute.BillingDetails,
    constraints: fieldConstraints,
    stripePriceId,
  });

  if (!valid && invalidRoute) {
    return redirect(invalidRoute);
  }

  const {
    checkoutSessionPayload,
    isValidPayload,
  } = extractCheckoutSessionPayload();

  if (!isValidPayload) {
    return redirect(CheckoutPageRoute.PlanDetails);
  }

  await queryClient.ensureQueryData(
    queryCheckoutSession(checkoutSessionPayload),
  );

  return null;
}

/**
 * Route loader for Billing Details Success page
 */
async function billingDetailsSuccessLoader(queryClient: QueryClient): Promise<Response | null> {
  const authenticatedUser = getAuthenticatedUser();
  if (!authenticatedUser) {
    // If the user is NOT authenticated, redirect to PlanDetails Page.
    return redirect(CheckoutPageRoute.PlanDetails);
  }

  const contextMetadata: CheckoutContextResponse = await queryClient.ensureQueryData(
    queryBffContext(authenticatedUser?.userId || null),
  );

  const { fieldConstraints, pricing } = contextMetadata;
  const stripePriceId = extractPriceId(pricing);

  if (!stripePriceId) {
    return redirect(CheckoutPageRoute.PlanDetails);
  }

  const {
    valid,
    invalidRoute,
  } = await validateFormState({
    currentRoute: CheckoutPageRoute.BillingDetails,
    constraints: fieldConstraints,
    stripePriceId,
  });

  if (!valid && invalidRoute) {
    return redirect(invalidRoute);
  }

  return null;
}

/**
 * Page-specific route loaders mapped by checkout page
 */
const PAGE_LOADERS: Record<CheckoutPage, (queryClient: QueryClient) => Promise<Response | null>> = {
  PlanDetails: planDetailsLoader,
  PlanDetailsLogin: planDetailsLoginLoader,
  PlanDetailsRegister: planDetailsRegisterLoader,
  AccountDetails: accountDetailsLoader,
  BillingDetails: (queryClient) => billingDetailsLoader(queryClient),
  BillingDetailsSuccess: billingDetailsSuccessLoader,
};

/**
 * Factory that creates the checkout stepper loader handling both `/:step` and `/:step/:substep`.
 *
 * It determines the current step/substep from the route params, looks up the matching page details,
 * and delegates to the page-specific loader (see PAGE_LOADERS). If the route is invalid, it returns null
 * so that the 404 boundary can take over.
 *
 * @param {QueryClient} queryClient - Provided for parity with other loader factories (unused here).
 * @returns {LoaderFunction} A loader that dispatches to page-specific loaders based on route params.
 */
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const makeCheckoutStepperLoader: MakeRouteLoaderFunctionWithQueryClient = function makeRootLoader(queryClient) {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async function checkoutStepperLoader({ params = {}, request }) {
    const { currentStep, currentSubstep } = getStepFromParams(params);
    const pageDetails = getCheckoutPageDetails({ step: currentStep, substep: currentSubstep });
    if (!pageDetails) {
      // Invalid route, do nothing. 404 page should kick in automatically.
      return null;
    }
    const pageLoader = PAGE_LOADERS[pageDetails.name];
    return pageLoader(queryClient);
  };
};

export default makeCheckoutStepperLoader;
