import { Entries } from 'type-fest';

import {
  CheckoutPageDetails,
  CheckoutStepByKey,
  CheckoutStepKey,
  CheckoutSubstepByKey,
} from '@/constants/checkout';

/**
 * Determines the step identifiers from the given URL params.
 */
// When a user enters the dashboard, the Academic Selection page is displayed initially.
function getStepFromParams(params) {
  const { step, substep } = params;

  // Essentials uses substep as the step
  const resolvedStep = step ?? substep ?? CheckoutStepKey.AcademicSelection;

  const currentStepKey = resolvedStep as CheckoutStepKey;

  const currentSubstepKey = step && substep ? substep : undefined;

  const currentStep = CheckoutStepByKey[currentStepKey];
  const currentSubstep = currentSubstepKey
    ? CheckoutSubstepByKey[currentSubstepKey]
    : undefined;
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

const extractPriceObject = (pricing: CheckoutContextPricing): CheckoutContextPrice | null => {
  if (!pricing.prices.length) {
    return null;
  }
  return pricing.prices.find((price) => price.lookupKey.includes(pricing.defaultByLookupKey)) ?? null;
};

const extractPriceId = (pricing: CheckoutContextPricing): CheckoutContextPrice['id'] | null => {
  if (!pricing.prices.length) {
    return null;
  }
  const matched = extractPriceObject(pricing);
  return matched?.id ?? null;
};

export {
  getStepFromParams,
  getCheckoutPageDetails,
  extractPriceId,
  extractPriceObject,
};
