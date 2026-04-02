import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { QueryClient } from '@tanstack/react-query';
import { redirect } from 'react-router-dom';

import { queryBffContext } from '@/components/app/data/queries/queries';
import { isEssentialsFlow, validateFormState } from '@/components/app/routes/loaders/utils';
import { CheckoutPageRoute, DataStoreKey, EssentialsPageRoute } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';
import { extractPriceId, getCheckoutPageDetails, getStepFromParams } from '@/utils/checkout';

/**
 * Route loader for Plan Details page.
 */
async function planDetailsLoader(): Promise<Response | null> {
  return null;
}

/**
 * Route loader for Plan Details Login page.
 */
async function planDetailsLoginLoader(): Promise<Response | null> {
  const authenticatedUser = getAuthenticatedUser();
  const planDetailsMetadata = checkoutFormStore.getState().formData[DataStoreKey.PlanDetails];
  const redirectToPlanDetails = !planDetailsMetadata.adminEmail;

  if (redirectToPlanDetails || authenticatedUser) {
    if (isEssentialsFlow()) {
      return redirect(EssentialsPageRoute.PlanDetails);
    }
    return redirect(CheckoutPageRoute.PlanDetails);
  }
  return null;
}

/**
 * Route loader for Plan Details Register page.
 */
async function planDetailsRegisterLoader(): Promise<Response | null> {
  const authenticatedUser = getAuthenticatedUser();

  const planDetailsMetadata = checkoutFormStore.getState().formData[DataStoreKey.PlanDetails];
  const redirectToPlanDetails = !(
    planDetailsMetadata.adminEmail
    && planDetailsMetadata.fullName
    && planDetailsMetadata.country
  );

  if (redirectToPlanDetails || authenticatedUser) {
    if (isEssentialsFlow()) {
      return redirect(EssentialsPageRoute.PlanDetails);
    }
    return redirect(CheckoutPageRoute.PlanDetails);
  }

  return null;
}

/**
 * Route loader for Account Details page.
 */
async function accountDetailsLoader(queryClient: QueryClient): Promise<Response | null> {
  const authenticatedUser = getAuthenticatedUser();
  if (!authenticatedUser) {
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

  const { valid, invalidRoute } = await validateFormState({
    checkoutStep: 'AccountDetails',
    constraints: fieldConstraints,
    stripePriceId,
  });

  if (!valid && invalidRoute) {
    return redirect(invalidRoute);
  }

  return null;
}

/**
 * Route loader for Billing Details page.
 */
async function billingDetailsLoader(queryClient: QueryClient): Promise<Response | null> {
  const authenticatedUser = getAuthenticatedUser();
  if (!authenticatedUser) {
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

  const { valid, invalidRoute } = await validateFormState({
    checkoutStep: 'BillingDetails',
    constraints: fieldConstraints,
    stripePriceId,
  });

  if (!valid && invalidRoute) {
    return redirect(invalidRoute);
  }

  const checkoutSessionClientSecret = contextMetadata.checkoutIntent?.checkoutSessionClientSecret;

  // ✅ ONLY CHANGE DONE HERE
  if (!checkoutSessionClientSecret) {
    return null;
  }

  return null;
}

/**
 * Route loader for Billing Details Success page.
 */
async function billingDetailsSuccessLoader(queryClient: QueryClient): Promise<Response | null> {
  const authenticatedUser = getAuthenticatedUser();
  if (!authenticatedUser) {
    return redirect(CheckoutPageRoute.PlanDetails);
  }

  const contextMetadata: CheckoutContextResponse = await queryClient.ensureQueryData(
    queryBffContext(authenticatedUser?.userId || null),
  );

  const { checkoutIntent } = contextMetadata;

  const checkoutIntentType = checkoutFormStore.getState().checkoutSessionStatus?.type;

  if (checkoutIntentType !== 'complete' && !checkoutIntent?.existingSuccessfulCheckoutIntent) {
    return redirect(CheckoutPageRoute.PlanDetails);
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
  BillingDetails: billingDetailsLoader,
  BillingDetailsSuccess: billingDetailsSuccessLoader,
};

/**
 * Factory loader
 */
const makeCheckoutStepperLoader: MakeRouteLoaderFunctionWithQueryClient = function makeRootLoader(queryClient) {
  return async function checkoutStepperLoader({ params = {} }) {
    const { currentStep, currentSubstep } = getStepFromParams(params);
    const pageDetails = getCheckoutPageDetails({ step: currentStep, substep: currentSubstep });

    if (!pageDetails) {
      return null;
    }

    const pageLoader = PAGE_LOADERS[pageDetails.name];
    return pageLoader(queryClient);
  };
};

export default makeCheckoutStepperLoader;
