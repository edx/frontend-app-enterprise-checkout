import { SnakeCasedPropertiesDeep } from 'type-fest';
import { z } from 'zod';

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
  type AuthenticatedUser = {
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
   * Form and UI Related Types
   * ==============================
   */

  type CheckoutStep = 'PlanDetails' | 'AccountDetails' | 'BillingDetails';

  type CheckoutSubstep = 'Login' | 'Register' | 'Success';

  type CheckoutPage = 'PlanDetails' | 'PlanDetailsLogin' | 'PlanDetailsRegister' | 'AccountDetails' | 'BillingDetails' | 'BillingDetailsSuccess';

  interface CheckoutPageDetails {
    step: CheckoutStep,
    substep: CheckoutSubstep | undefined,
    route: string,
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
  // TODO: This is added an a means to iterate through the project. Will need to be removed.
  type TempAuthenticatedData = { tempAuthenticated: boolean };

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
    companyName: string;
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
  type CheckoutSessionSchema = BaseCheckoutSchema;

  /**
   * Snake-cased version of CheckoutSessionSchema for API communication
   */
  type CheckoutSessionSchemaPayload = Payload<CheckoutSessionSchema>;

  /**
   * Data structure for successful checkout session response
   */
  interface CheckoutSessionData {
    clientSecret: string;
    expiresAt: string;
  }

  /**
   * Successful response structure for checkout session API
   */
  interface CheckoutSessionResponse {
    checkoutSession: CheckoutSessionData;
  }

  /**
   * Alias for ErrorField to maintain backward compatibility
   */
  type CheckoutSessionErrorField = ErrorField;

  /**
   * Error response structure for checkout session API
   */
  type CheckoutSessionErrorResponse = {
    [K in keyof CheckoutSessionSchema]: CheckoutSessionErrorField;
  };

  /**
   * Union type for possible checkout session response types
   */
  type CheckoutSessionResponseType = CheckoutSessionResponse | CheckoutSessionErrorResponse;

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
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  }

  /**
   * Field constraints for checkout form
   */
  interface CheckoutContextFieldConstraints {
    quantity: CheckoutContextFieldConstraint;
    enterpriseSlug: CheckoutContextFieldConstraint;
  }

  /**
   * Complete response structure for checkout context API
   */
  interface CheckoutContextResponse {
    existingCustomersForAuthenticatedUser: CheckoutContextCustomer[];
    pricing: CheckoutContextPricing;
    fieldConstraints: CheckoutContextFieldConstraints;
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
