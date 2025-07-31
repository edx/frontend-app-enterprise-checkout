import { defineMessages } from '@edx/frontend-platform/i18n';

import { CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';

/**
 * Define formatted messages for page titles
 * These correspond to the FormattedMessage components used in the page h1 elements
 */
export const titleMessages = defineMessages({
  [CheckoutStepKey.PlanDetails]: {
    id: 'checkout.planDetails.title',
    defaultMessage: 'Plan Details',
    description: 'Title for the plan details step',
  },
  [CheckoutSubstepKey.Login]: {
    id: 'checkout.planDetailsLogin.title',
    defaultMessage: 'Log in to your account',
    description: 'Title for the login page in the plan details step',
  },
  [CheckoutSubstepKey.Register]: {
    id: 'checkout.planDetailsRegistration.title',
    defaultMessage: 'Create your Account',
    description: 'Title for the registration page in the plan details step',
  },
  [CheckoutStepKey.AccountDetails]: {
    id: 'checkout.accountDetails.title',
    defaultMessage: 'Account Details',
    description: 'Title for the account details step',
  },
  [CheckoutStepKey.BillingDetails]: {
    id: 'checkout.billingDetails.title',
    defaultMessage: 'Billing Details',
    description: 'Title for the billing details step',
  },
  [CheckoutSubstepKey.Success]: {
    id: 'checkout.billingDetailsSuccess.title',
    defaultMessage: 'Thank you, {firstName}.',
    description: 'Title for the success page',
  },
});

/**
 * Define formatted messages for button text
 * These correspond to the FormattedMessage components used in the button elements
 */
export const buttonMessages = defineMessages({
  [CheckoutStepKey.PlanDetails]: {
    id: 'checkout.planDetails.continue',
    defaultMessage: 'Continue',
    description: 'Button label for the next step in the plan details step',
  },
  [CheckoutSubstepKey.Login]: {
    id: 'checkout.registrationPage.register',
    defaultMessage: 'Sign in',
    description: 'Button label to register a new user in the plan details step',
  },
  [CheckoutSubstepKey.Register]: {
    id: 'checkout.registrationPage.register',
    defaultMessage: 'Register',
    description: 'Button label to register a new user in the plan details step',
  },
  [CheckoutStepKey.AccountDetails]: {
    id: 'checkout.accountDetails.continue',
    defaultMessage: 'Continue',
    description: 'Button to go to the next page',
  },
  [CheckoutStepKey.BillingDetails]: {
    id: 'checkout.billingDetails.purchaseNow',
    defaultMessage: 'Purchase Now',
    description: 'Button to purchase the subscription product',
  },
  [CheckoutSubstepKey.Success]: {
    id: 'checkout.billingDetailsSuccess.fallback',
  },
});

const determineStepperStep = (params: { step?: CheckoutStepKey, substep?: CheckoutSubstepKey }) => {
  const { step, substep } = params;

  switch (step) {
    case CheckoutStepKey.PlanDetails:
      switch (substep) {
        case CheckoutSubstepKey.Login:
          return CheckoutSubstepKey.Login;
        case CheckoutSubstepKey.Register:
          return CheckoutSubstepKey.Register;
        default:
          return CheckoutStepKey.PlanDetails;
      }
    case CheckoutStepKey.AccountDetails:
      return CheckoutStepKey.AccountDetails;
    case CheckoutStepKey.BillingDetails:
      switch (substep) {
        case CheckoutSubstepKey.Success:
          return CheckoutSubstepKey.Success;
        default:
          return CheckoutStepKey.BillingDetails;
      }
    default:
      return null;
  }
};

/**
 * Determines the appropriate formatted message for the helmet title based on the current step and substep
 *
 * @param params - Object containing the current step and substep
 * @returns The formatted message object to use for the helmet title
 */
const determineStepperTitleText = (params: { step?: CheckoutStepKey, substep?: CheckoutSubstepKey }) => {
  const { step, substep } = params;
  return titleMessages[determineStepperStep({ step, substep })];
};

/**
 * Determines the appropriate formatted message for the button text based on the current step and substep
 *
 * @param params - Object containing the current step and substep
 * @returns The formatted message object to use for the button text
 */
const determineStepperButtonText = (params: { step?: CheckoutStepKey, substep?: CheckoutSubstepKey }) => {
  const { step, substep } = params;
  return buttonMessages[determineStepperStep({ step, substep })];
};

export {
  determineStepperTitleText,
  determineStepperButtonText,
  determineStepperStep,
};
