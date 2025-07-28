const baseValidation: ValidationSchema = {
  adminEmail: '',
  companyName: '',
  enterpriseSlug: '',
  stripePriceId: '',
  quantity: 0,
  fullName: '',
};

const baseCheckoutSession: CheckoutSessionSchema = {
  adminEmail: '',
  enterpriseSlug: '',
  quantity: 0,
  stripePriceId: '',
};

export {
  baseValidation,
  baseCheckoutSession,
};
