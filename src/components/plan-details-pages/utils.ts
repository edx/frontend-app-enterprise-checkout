import { defineMessages } from '@edx/frontend-platform/i18n';

import { CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';

/**
 * Define formatted messages for page titles
 * These correspond to the FormattedMessage components used in the page h1 elements
 */
export const messages = defineMessages({
  planDetailsTitle: {
    id: 'checkout.planDetails.title',
    defaultMessage: 'Plan Details',
    description: 'Title for the plan details step',
  },
  planDetailsLoginTitle: {
    id: 'checkout.login.title',
    defaultMessage: 'Log in to your account',
    description: 'Title for the login page in the plan details step',
  },
  planDetailsRegisterTitle: {
    id: 'checkout.registration.title',
    defaultMessage: 'Create your Account',
    description: 'Title for the registration page in the plan details step',
  },
  accountDetailsTitle: {
    id: 'checkout.accountDetails.title',
    defaultMessage: 'Account Details',
    description: 'Title for the account details step',
  },
  billingDetailsTitle: {
    id: 'checkout.billingDetails.title',
    defaultMessage: 'Billing Details',
    description: 'Title for the billing details step',
  },
  successTitle: {
    id: 'checkout.accountDetails.title',
    defaultMessage: 'Thank you, {firstName}.',
    description: 'Title for the success page',
  },
});

/**
 * Determines the appropriate formatted message for the helmet title based on the current step and substep
 *
 * @param params - Object containing the current step and substep
 * @returns The formatted message object to use for the helmet title
 */
const determineStepperTitle = (params: { step?: CheckoutStepKey, substep?: CheckoutSubstepKey }) => {
  const { step, substep } = params;

  switch (step) {
    case CheckoutStepKey.PlanDetails:
      switch (substep) {
        case CheckoutSubstepKey.Login:
          return messages.planDetailsLoginTitle;
        case CheckoutSubstepKey.Register:
          return messages.planDetailsRegisterTitle;
        default:
          return messages.planDetailsTitle;
      }
    case CheckoutStepKey.AccountDetails:
      return messages.accountDetailsTitle;
    case CheckoutStepKey.BillingDetails:
      switch (substep) {
        case CheckoutSubstepKey.Success:
          return messages.successTitle;
        default:
          return messages.billingDetailsTitle;
      }
    default:
      return messages.planDetailsTitle;
  }
};

export {
  determineStepperTitle,
};
