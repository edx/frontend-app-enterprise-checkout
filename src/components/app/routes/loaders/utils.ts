import { DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';
/**
 * Parameters for populateCompletedFormFields.
 */
type PopulateCompletedFormFieldsProps = {
  /** The checkout intent from the backend context, if any. */
  checkoutIntent: CheckoutContextCheckoutIntent | null,
  /** Stripe price id from the backend context */
  stripePriceId: CheckoutContextPrice['id'] | null,
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
  checkoutIntent: ExtendedCheckoutContextCheckoutIntent | null,
): DetermineExistingPaidCheckoutIntent => {
  if (!checkoutIntent) {
    return {
      existingSuccessfulCheckoutIntent: false,
      expiredCheckoutIntent: true,
    };
  }

  return {
    // @ts-ignore
    existingSuccessfulCheckoutIntent: checkoutIntent.existingSuccessfulCheckoutIntent,
    // @ts-ignore
    expiredCheckoutIntent: checkoutIntent.expiredCheckoutIntent,
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
  stripePriceId,
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
          stripePriceId: s.formData[DataStoreKey.PlanDetails]?.stripePriceId
            ?? stripePriceId
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

const extractCheckoutSessionPayload = (): {
  checkoutSessionPayload: CheckoutSessionSchema,
  isValidPayload: boolean,
} => {
  const checkoutFormData = checkoutFormStore.getState().formData;

  const {
    quantity,
    adminEmail,
    stripePriceId,
  } = checkoutFormData[DataStoreKey.PlanDetails];
  const {
    enterpriseSlug,
    companyName,
  } = checkoutFormData[DataStoreKey.AccountDetails];

  const checkoutSessionPayload = {
    quantity,
    adminEmail,
    stripePriceId,
    enterpriseSlug,
    companyName,
  };

  const isPresent = v => v != null && v !== ''; // != null covers null and undefined

  const isValidPayload = Object.values(checkoutSessionPayload).every(isPresent);

  return {
    checkoutSessionPayload,
    isValidPayload,
  };
};

export {
  determineExistingCheckoutIntentState,
  populateCompletedFormFields,
  extractCheckoutSessionPayload,
};
