import { Entries } from 'type-fest';

import {
  CheckoutStepByKey,
  CheckoutSubstepByKey,
} from '@/components/Stepper/constants';
import { CheckoutPageDetails, CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';

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

export {
  getStepFromParams,
  getCheckoutPageDetails,
};
