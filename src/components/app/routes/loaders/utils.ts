import dayjs from 'dayjs';

import { DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

/**
 * Parameters for populateCompletedFormFields.
 */
type PopulateCompletedFormFieldsProps = {
  /** The checkout intent from the backend context, if any. */
  checkoutIntent: CheckoutContextCheckoutIntent | null,
  /** The currently authenticated user as exposed by the platform auth util. */
  authenticatedUser: AuthenticatedUser,
};

/**
 * Summary of checkout intent state used by loaders to decide routing.
 */
interface DetermineExistingPaidCheckoutIntent {
  /**
   * Whether there is an existing successful checkout intent (paid or fulfilled).
   */
  existingSuccessfulCheckoutIntent: boolean;
  /**
   * Whether the checkout intent is expired with respect to current time.
   */
  expiredCheckoutIntent: boolean;
}

/**
 * Computes a compact state object from an optional checkout intent.
 *
 * @param {CheckoutContextCheckoutIntent | null} checkoutIntent - The checkout intent from the checkout context.
 * @returns {DetermineExistingPaidCheckoutIntent}
 *   Object indicating if a successful intent exists and if the intent is expired.
 */
const determineExistingCheckoutIntentState = (
  checkoutIntent: CheckoutContextCheckoutIntent | null,
): DetermineExistingPaidCheckoutIntent => {
  if (!checkoutIntent) {
    return {
      existingSuccessfulCheckoutIntent: false,
      expiredCheckoutIntent: true,
    };
  }

  return {
    existingSuccessfulCheckoutIntent: ['paid', 'fulfilled'].includes(checkoutIntent.state),
    expiredCheckoutIntent: dayjs(checkoutIntent.expiresAt).isBefore(dayjs()),
  };
};

/**
 * Populates relevant steps in the local checkout form store using information
 * from the authenticated user and (optionally) an existing checkout intent.
 *
 * This function intentionally performs a shallow merge into the current form state
 * so that any user-entered values are preserved unless explicitly overwritten.
 *
 * It sets:
 * - Plan Details: authenticated flag, full name, admin email, and country
 * - Account Details: enterprise slug and company name from the checkout intent
 *
 * @param {PopulateCompletedFormFieldsProps} params - Function parameters.
 * @returns {void}
 */
const populateCompletedFormFields = ({
  checkoutIntent,
  authenticatedUser,
}: PopulateCompletedFormFieldsProps): void => {
  checkoutFormStore.setState(
    (s) => ({
      formData: {
        ...s.formData,
        [DataStoreKey.PlanDetails]: {
          ...s.formData[DataStoreKey.PlanDetails],
          fullName: s.formData[DataStoreKey.PlanDetails]?.fullName
            ?? authenticatedUser.name
            ?? authenticatedUser.username,
          adminEmail: s.formData[DataStoreKey.PlanDetails]?.adminEmail
            ?? authenticatedUser.email,
          country: s.formData[DataStoreKey.PlanDetails]?.country
            ?? authenticatedUser.country
            ?? null,
        },
        [DataStoreKey.AccountDetails]: {
          ...s.formData[DataStoreKey.AccountDetails],
          enterpriseSlug: s.formData[DataStoreKey.AccountDetails]?.enterpriseSlug
            ?? checkoutIntent?.enterpriseSlug,
          companyName: s.formData[DataStoreKey.AccountDetails]?.companyName
            ?? checkoutIntent?.enterpriseName,
        },
      },
    }),
    false,
  );
};

export {
  determineExistingCheckoutIntentState,
  populateCompletedFormFields,
};
