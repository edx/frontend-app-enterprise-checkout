import { Entries } from 'type-fest';

import {
  CheckoutPageDetails,
  CheckoutStepByKey,
  CheckoutStepKey,
  CheckoutSubstepByKey,
  CheckoutSubstepKey,
} from '@/constants/checkout';

/**
 * Determines the step identifiers from the given URL params.
 */
function getStepFromParams(params) {
  const {
    step: currentStepKey,
    substep: currentSubstepKey,
  }: {
    step?: CheckoutStepKey,
    substep?: CheckoutSubstepKey,
  } = params;
  const currentStep = currentStepKey ? CheckoutStepByKey[currentStepKey] : undefined;
  const currentSubstep = currentSubstepKey ? CheckoutSubstepByKey[currentSubstepKey] : undefined;
  return {
    currentStep,
    currentStepKey,
    currentSubstep,
    currentSubstepKey,
  };
}

/**
 * Determines the current checkout page name & details based on the step names.
 */
function getCheckoutPageDetails(
  {
    step,
    substep,
  }: {
    step: CheckoutStep | undefined,
    substep: CheckoutSubstep | undefined,
  },
): { name: CheckoutPage, details: CheckoutPageDetails } | null {
  // Find the matching page based on step and substep
  const entry = (Object.entries(CheckoutPageDetails) as Entries<typeof CheckoutPageDetails>).find(
    ([, value]) => value.step === step && value.substep === substep,
  );
  if (entry) {
    return { name: entry[0], details: entry[1] };
  }
  return null;
}

const extractPriceId = (pricing: CheckoutContextPricing): CheckoutContextPrice['id'] | null => {
  if (!pricing.prices.length) {
    return null;
  }
  const matched = pricing.prices.find((price) => price.lookupKey.includes(pricing.defaultByLookupKey));
  return matched?.id ?? null;
};

export {
  getStepFromParams,
  getCheckoutPageDetails,
  extractPriceId,
};
