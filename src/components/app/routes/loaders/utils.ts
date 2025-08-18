interface DetermineExistingPaidCheckoutIntent {
  existingPaidCheckoutIntent: boolean;
}

const determineExistingPaidCheckoutIntent = (
  checkoutIntent: CheckoutContextCheckoutIntent | null,
): DetermineExistingPaidCheckoutIntent => {
  if (!checkoutIntent) {
    return {
      existingPaidCheckoutIntent: false,
    };
  }
  return {
    existingPaidCheckoutIntent: checkoutIntent.state === 'paid',
  };
};

export {
  determineExistingPaidCheckoutIntent,
};
