import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { SnakeCasedPropertiesDeep } from 'type-fest';
import { z } from 'zod';

import { CheckoutPageRoute } from '@/constants/checkout';

import type { TextMatch } from '@testing-library/react';
// Declaration for SVG modules
declare module '*.svg' {
  import React from 'react';

  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare global {

  let validateText: (
    text: TextMatch,
    options?: {
      exact?: boolean;
      selector?: string;
      ignore?: string | boolean;
      normalizer?: (text: string) => string;
    }
  ) => void;

  /**
   * Routes
   */
  type MakeRouteLoaderFunction = (queryClient?: QueryClient) => LoaderFunction;
  type MakeRouteLoaderFunctionWithQueryClient = (queryClient: QueryClient) => LoaderFunction;

  /**
   * Application Data (general)
   */
  type AuthenticatedUser = ReturnType<typeof getAuthenticatedUser> & {
    userId: number;
    username: string;
    name: string;
    email: string;
    roles: string[];
    administrator: boolean;
    extendedProfile?: Record<string, any>;
  };
  type AppContextValue = {
    authenticatedUser: AuthenticatedUser;
  };

  /**
   * ==============================
   * Loaders
   * ==============================
   */
  type MakeRouteLoaderFunction = (queryClient?: QueryClient) => LoaderFunction;
  export type MakeRouteLoaderFunctionWithQueryClient = (queryClient: QueryClient) => LoaderFunction;

  /**
   * ==============================
   * Form and UI Related Types
   * ==============================
   */

  type CheckoutStep = 'PlanDetails' | 'AccountDetails' | 'BillingDetails' | 'BillingDetailsSuccess';

  type CheckoutSubstep = 'Login' | 'Register' | 'Success';

  type CheckoutPage = 'PlanDetails' | 'PlanDetailsLogin' | 'PlanDetailsRegister' | 'AccountDetails' | 'BillingDetails' | 'BillingDetailsSuccess';

  export type CheckoutPageRouteValue = (typeof CheckoutPageRoute)[keyof typeof CheckoutPageRoute];

  interface CheckoutPageDetails {
    step: CheckoutStep,
    substep: CheckoutSubstep | undefined,
    route: CheckoutPageRouteValue | string,
    formSchema?: any,
    title: object,
    buttonMessage: object | null,
  }

  /**
   * Authentication step identifier
   */
  type AuthStep = 'account-details' | 'billing-details';

  /**
   * Form data types derived from Zod schemas
   */
  type PlanDetailsData = z.infer<typeof PlanDetailsSchema>;
  type PlanDetailsLoginPageData = z.infer<typeof PlanDetailsLoginPageSchema>;
  type PlanDetailsRegisterPageData = z.infer<typeof PlanDetailsRegisterPageSchema>;
  type AccountDetailsData = z.infer<typeof AccountDetailsSchema>;
  type BillingDetailsData = z.infer<typeof BillingDetailsSchema>;

  /**
   * Maps step names to their corresponding data types
   */
  interface StepDataMap {
    'PlanDetails': Partial<PlanDetailsData>;
    'AccountDetails': Partial<AccountDetailsData>;
    'BillingDetails': Partial<BillingDetailsData>;
  }

  /**
   * Complete form data structure combining all steps
   */
  type FormData = {
    [K in keyof StepDataMap]: StepDataMap[K];
  };

  /**
   * Store for managing form data state
   */
  interface FormStore {
    formData: Partial<FormData>;
    setFormData<K extends keyof StepDataMap>(
      step: K,
      data: Partial<FormData<K>>,
    ): void;
  }

  /**
   * Union type for form control elements
   */
  type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  /**
   * ==============================
   * Common Utility Types
   * ==============================
   */

  /**
   * Common error field type used across different API responses
   */
  interface ErrorField {
    errorCode: string;
    developerMessage: string;
  }

  /**
   * Helper type to create snake_cased payload types
   */
  type Payload<T> = SnakeCasedPropertiesDeep<T>;

  /**
   * ==============================
   * API Schema Types
   * ==============================
   */

  /**
   * Base schema for checkout-related schemas
   */
  interface BaseCheckoutSchema {
    adminEmail: string;
    enterpriseSlug: string;
    quantity: number;
    companyName: string;
    stripePriceId: string;
  }

  /**
   * ==============================
   * Validation Types
   * ==============================
   */

  /**
   * Schema for validation requests
   * Extends the base checkout schema with additional fields
   */
  interface ValidationSchema extends BaseCheckoutSchema {
    fullName: string;
  }

  /**
   * Snake-cased version of ValidationSchema for API communication
   */
  type ValidationSchemaPayload = Payload<ValidationSchema>;

  /**
   * Alias for ErrorField to maintain backward compatibility
   */
  type ValidationDecision = ErrorField;

  /**
   * Response structure for validation API
   */
  interface ValidationResponse {
    validationDecisions: {
      [K in keyof ValidationSchema]?: ValidationDecision | ValidationSchemaPayload[K] | null;
    };
    userAuthn: {
      userExistsForEmail: boolean;
    };
  }

  /**
   * Snake-cased version of ValidationResponse for API communication
   */
  type ValidationResponsePayload = Payload<ValidationResponse>;

  /**
   * ==============================
   * Checkout Session Types
   * ==============================
   */

  /**
   * Schema for checkout session requests
   * Uses the base checkout schema without additional fields
   */
  type CreateCheckoutSessionSchema = BaseCheckoutSchema;

  /**
   * Snake-cased version of CreateCheckoutSessionSchema for API communication
   */
  type CreateCheckoutSessionSchemaPayload = Payload<CreateCheckoutSessionSchema>;

  /**
   * Successful response structure for checkout session API
   */
  interface CreateCheckoutSessionResponse {
    checkoutSessionClientSecret: string;
  }

  /**
   * Alias for ErrorField to maintain backward compatibility
   */
  type CreateCheckoutSessionErrorField = ErrorField;

  /**
   * Error response structure for checkout session API
   */
  type CreateCheckoutSessionErrorResponse = {
    [K in keyof CreateCheckoutSessionSchema]: CreateCheckoutSessionErrorField;
  };

  /**
   * Union type for possible checkout session response types
   */
  type CheckoutSessionResponseType = CreateCheckoutSessionResponse | CreateCheckoutSessionErrorResponse;

  /**
   * Snake-cased version of CheckoutSessionResponseType for API communication
   */
  type CheckoutSessionResponseTypePayload = Payload<CheckoutSessionResponseType>;

  /**
   * ==============================
   * Checkout Context Types
   * ==============================
   */

  /**
   * Customer information in checkout context
   */
  interface CheckoutContextCustomer {
    customerUuid: string;
    customerName: string;
    customerSlug: string;
    stripeCustomerId: string;
    isSelfService: boolean;
    adminPortalUrl: string;
  }

  /**
   * Price information in checkout context
   */
  interface CheckoutContextPrice {
    id: string;
    product: string;
    lookupKey: string;
    recurring: {
      internal: string;
      intervalCount: number;
    };
    currency: string;
    unitAmount: number;
    unitAmountDecimal: string;
  }

  /**
   * Pricing information in checkout context
   */
  interface CheckoutContextPricing {
    defaultByLookupKey: string;
    prices: CheckoutContextPrice[];
  }

  /**
   * Field constraint structure for form validation
   */
  interface CheckoutContextFieldConstraint {
    min: number;
    max: number;
    minLength: number;
    maxLength: number;
    pattern: string;
  }

  /**
   * Field constraints for checkout form
   */
  interface CheckoutContextFieldConstraints {
    quantity: CheckoutContextFieldConstraint;
    enterpriseSlug: CheckoutContextFieldConstraint;
  }

  type CheckoutIntentState =
    | 'created'
    | 'paid'
    | 'fulfilled'
    | 'errored_stripe_checkout'
    | 'errored_provisioning'
    | 'expired';

  interface CheckoutContextCheckoutIntent {
    id: number;
    state: CheckoutIntentState;
    enterpriseName: string;
    enterpriseSlug: string;
    stripeCheckoutSessionId: string;
    lastCheckoutError: string;
    lastProvisioningError: string;
    workflowId: string;
    expiresAt: string;
    adminPortalUrl: string;
  }

  interface ExtendedCheckoutContextCheckoutIntent extends CheckoutContextCheckoutIntent {
    existingSuccessfulCheckoutIntent: boolean | null;
    expiredCheckoutIntent: boolean | null;
  }

  /**
   * Complete response structure for checkout context API
   */
  interface CheckoutContextResponse {
    existingCustomersForAuthenticatedUser: CheckoutContextCustomer[];
    pricing: CheckoutContextPricing;
    fieldConstraints: CheckoutContextFieldConstraints;
    checkoutIntent: ExtendedCheckoutContextCheckoutIntent | null;
  }

  /**
   * Snake-cased version of CheckoutContextResponse for API communication
   */
  type CheckoutContextResponsePayload = Payload<CheckoutContextResponse>;

  // Test helper for asserting debounced behavior (declared globally in setupTest.ts)
  interface DebounceTestOptions {
    baseDelayMs: number;
    call: () => Promise<unknown>;
    preCalls?: Array<() => unknown>;
    getInvocationCount?: () => number;
    upperMarginMs?: number;
  }
  function assertDebounce(options: DebounceTestOptions): Promise<{ elapsedMs: number }>;
}
