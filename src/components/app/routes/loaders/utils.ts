import dayjs from 'dayjs';

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

export {
  determineExistingCheckoutIntentState,
};
