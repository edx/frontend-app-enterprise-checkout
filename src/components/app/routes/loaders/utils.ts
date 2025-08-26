import { zodResolver } from '@hookform/resolvers/zod';

import { AccountDetailsSchema, CheckoutPageRoute, DataStoreKey, PlanDetailsSchema } from '@/constants/checkout';
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
 * @param {ExtendedCheckoutContextCheckoutIntent | null} checkoutIntent - The checkout intent from the checkout context.
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

/**
 * Build the payload for creating a checkout session from the current form state
 * and indicate whether all required fields are present.
 *
 * @returns {{ checkoutSessionPayload: CheckoutSessionSchema, isValidPayload: boolean }}
 *   The assembled payload and a flag indicating validity.
 */
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

/**
 * A union of all route path values defined on CheckoutPageRoute (e.g., "/plan-details").
 */
type CheckoutPageRouteValue = (typeof CheckoutPageRoute)[keyof typeof CheckoutPageRoute];

/**
 * Result of validating whether navigation to a given route is allowed based on form state.
 */
type ValidationResult = {
  /** Whether all prerequisites passed. */
  valid: boolean;
  /** If invalid, the first route the user should be redirected to fix validation. */
  invalidRoute?: CheckoutPageRouteValue; // route of the first page that failed validation
};

/**
 * Build React Hook Form resolvers (zod-based) for the various checkout form slices,
 * using the provided field constraints and Stripe price ID where required.
 *
 * Note: Billing Details resolver can be added later when the schema is available.
 *
 * @param {CheckoutContextFieldConstraints} constraints - Field-level constraints from the BFF context.
 * @param {CheckoutContextPrice['id']} stripePriceId - Stripe price identifier used by the Plan Details schema.
 * @returns {{ planDetailsResolver: Function, accountDetailsResolver: Function }} An object with resolvers.
 */
const makeResolvers = (
  constraints: CheckoutContextFieldConstraints,
  stripePriceId: CheckoutContextPrice['id'],
) => {
  const planDetailsResolver = zodResolver(PlanDetailsSchema(constraints, stripePriceId));

  const accountDetailsResolver = zodResolver(AccountDetailsSchema(constraints));

  // const billingDetailsResolver: ResolverFn =
  //   zodResolver(BillingDetailsSchema(constraints));

  return {
    planDetailsResolver,
    accountDetailsResolver,
    // billingDetailsResolver,
  };
};

interface PrerequisiteCheck<T> {
  pick: (formData: any) => T;
  getResolver: (
    constraints: CheckoutContextFieldConstraints, stripePriceId: CheckoutContextPrice['id']
  ) => (values: any, ctx?: any, opts?: any) => any;
  failRoute: CheckoutPageRouteValue;
}

/**
 * For each target route, list the prerequisite slices to validate, in order.
 * Each entry includes which form slice to validate, how to build its resolver,
 * and the route that should be returned if that slice is invalid.
 */
const prerequisiteSpec: Record<string, Array<PrerequisiteCheck<any>>> = {
  PlanDetails: [],
  AccountDetails: [
    {
      pick: (formData) => formData[DataStoreKey.PlanDetails] as PlanDetailsData,
      getResolver: (constraints, formData) => makeResolvers(constraints, formData).planDetailsResolver,
      failRoute: CheckoutPageRoute.PlanDetails,
    },
  ],
  BillingDetails: [
    {
      pick: (formData) => formData[DataStoreKey.PlanDetails] as PlanDetailsData,
      getResolver: (constraints, formData) => makeResolvers(constraints, formData).planDetailsResolver,
      failRoute: CheckoutPageRoute.PlanDetails,
    },
    {
      pick: (formData) => formData[DataStoreKey.AccountDetails] as AccountDetailsData,
      getResolver: (constraints, formData) => makeResolvers(constraints, formData).accountDetailsResolver,
      failRoute: CheckoutPageRoute.AccountDetails,
    },
    // If you add a BillingDetails schema, include it as the last guard:
    // {
    //   pick: (formData) => formData[DataStoreKey.BillingDetails],
    //   getResolver: (constraints, formData) => makeResolvers(constraints, formData).billingDetailsResolver,
    //   failRoute: CheckoutPageRoute.BillingDetails,
    // },
  ],

  BillingDetailsSuccess: [
    {
      pick: (formData) => formData[DataStoreKey.PlanDetails] as PlanDetailsData,
      getResolver: (constraints, formData) => makeResolvers(constraints, formData).planDetailsResolver,
      failRoute: CheckoutPageRoute.PlanDetails,
    },
    {
      pick: (formData) => formData[DataStoreKey.AccountDetails] as AccountDetailsData,
      getResolver: (constraints, formData) => makeResolvers(constraints, formData).accountDetailsResolver,
      failRoute: CheckoutPageRoute.AccountDetails,
    },
    // {
    //   pick: (formData) => formData[DataStoreKey.BillingDetails],
    //   getResolver: (constraints, formData) => makeResolvers(constraints, formData).billingDetailsResolver,
    //   failRoute: CheckoutPageRoute.BillingDetails,
    // },
  ],
};

/**
 * Resolve a route enum key (e.g., "PlanDetails") from its path value string.
 *
 * @param {CheckoutPageRouteValue} value - A route value (path) from CheckoutPageRoute.
 * @returns {keyof typeof CheckoutPageRoute | undefined} The matching enum key if found; otherwise undefined.
 */
const getRouteKeyFromValue = (
  value: CheckoutPageRouteValue,
): keyof typeof CheckoutPageRoute | undefined => (
  Object.keys(CheckoutPageRoute) as Array<keyof typeof CheckoutPageRoute>
)
  .find((k) => CheckoutPageRoute[k] === value);

/**
 * Validate all prerequisites for navigating to a target route.
 *
 * It evaluates, in order, the prerequisite form slices defined in `prerequisiteSpec` for the
 * provided `currentRoute`. Each slice is validated using its zod resolver (built from
 * backend-provided `constraints` and `stripePriceId` where needed). The first failing slice
 * determines the `invalidRoute` to redirect to.
 *
 * @param {Object} params - Parameters object.
 * @param {CheckoutPageRouteValue} params.currentRoute - Route path the user is attempting to visit.
 * @param {CheckoutContextFieldConstraints | null} params.constraints - Field constraints from BFF;
 *   if null, validation fails to Plan Details.
 * @param {CheckoutContextPrice['id']} params.stripePriceId - Stripe price id required by Plan Details resolver.
 * @returns {Promise<ValidationResult>} Validation result indicating whether navigation can proceed.
 */
const validateFormState = async ({
  currentRoute,
  constraints,
  stripePriceId,
}: {
  currentRoute: CheckoutPageRouteValue;
  constraints: CheckoutContextFieldConstraints | null;
  stripePriceId: CheckoutContextPrice['id'];
}): Promise<ValidationResult> => {
  const routeKey = getRouteKeyFromValue(currentRoute);
  if (!routeKey) {
    return { valid: false, invalidRoute: CheckoutPageRoute.PlanDetails };
  }

  const { formData } = checkoutFormStore.getState();
  if (!constraints) {
    return { valid: false, invalidRoute: CheckoutPageRoute.PlanDetails };
  }

  const checks = prerequisiteSpec[routeKey] ?? [];

  // Build all validation promises up front, check against the defined zod resolver
  const validationPromises = checks.map(async ({ pick, getResolver, failRoute }) => {
    const values = pick(formData);
    const resolver = getResolver(constraints, stripePriceId);
    const { errors } = await resolver(values, undefined, { criteriaMode: 'all' });
    return { failRoute, hasErrors: errors && Object.keys(errors).length > 0 };
  });

  const results = await Promise.all(validationPromises);

  // Find the first failing validation (preserving order)
  const firstFail = results.find(result => result.hasErrors);
  if (firstFail) {
    return { valid: false, invalidRoute: firstFail.failRoute };
  }

  return { valid: true };
};

export {
  determineExistingCheckoutIntentState,
  populateCompletedFormFields,
  extractCheckoutSessionPayload,
  validateFormState,
};
