import { defineMessages } from '@edx/frontend-platform/i18n';
import { z } from 'zod';

import { validateRegistrationFieldsDebounced } from '@/components/app/data/services/registration';
import { validateFieldDetailed } from '@/components/app/data/services/validation';
import { serverValidationError } from '@/utils/common';

import type { IntlShape, MessageDescriptor } from 'react-intl';

export enum CheckoutStepKey {
  PlanDetails = 'plan-details',
  AccountDetails = 'account-details',
  BillingDetails = 'billing-details',
}

export enum CheckoutSubstepKey {
  Login = 'login',
  Register = 'register',
  Success = 'success',
}

// NEW ENUMS - For Essentials/Academic flow
export enum EssentialsStepKey {
  AcademicSelection = 'academic-selection',
  PlanDetails = 'plan-details',
  AccountDetails = 'account-details',
  BillingDetails = 'billing-details',
}

function reverseEnum<E extends Record<string, string>>(enumObj: E): Record<E[keyof E], keyof E> {
  return Object.fromEntries(
    Object.entries(enumObj).map(([key, value]) => [value, key]),
  ) as Record<E[keyof E], keyof E>;
}

export const CheckoutStepByKey: Record<CheckoutStepKey, CheckoutStep> = reverseEnum(CheckoutStepKey);
export const CheckoutSubstepByKey: Record<CheckoutSubstepKey, CheckoutSubstep> = reverseEnum(CheckoutSubstepKey);

export type FieldErrorCodes = {
  adminEmail: 'invalid_format' | 'not_registered' | 'incomplete_data';
  enterpriseSlug: 'invalid_format' | 'existing_enterprise_customer' | 'slug_reserved' | 'incomplete_data';
  quantity: 'invalid_format' | 'range_exceeded' | 'incomplete_data';
  stripePriceId: 'invalid_format' | 'does_not_exist' | 'incomplete_data';
  companyName: 'existing_enterprise_customer';
};

const errorMessagesByFieldMessages: Record<string, MessageDescriptor> = defineMessages({
  adminEmailInvalidFormat: {
    id: 'checkout.errorMessages.adminEmail.invalidFormat',
    defaultMessage: 'Invalid format for given email address.',
    description: 'Server validation error shown when the admin email format is invalid',
  },
  adminEmailNotRegistered: {
    id: 'checkout.errorMessages.adminEmail.notRegistered',
    defaultMessage: 'Given email address does not correspond to an existing user.',
    description: 'Server validation error shown when the admin email does not correspond to an existing user',
  },
  incompleteData: {
    id: 'checkout.errorMessages.incompleteData',
    defaultMessage: 'Not enough parameters were given.',
    description: 'Server validation error shown when a field is missing required parameters',
  },
  enterpriseSlugInvalidFormat: {
    id: 'checkout.errorMessages.enterpriseSlug.invalidFormat',
    defaultMessage: 'Only alphanumeric lowercase characters and hyphens are allowed.',
    description: 'Server validation error shown when the company URL contains disallowed characters',
  },
  enterpriseSlugExistingCustomer: {
    id: 'checkout.errorMessages.enterpriseSlug.existingCustomer',
    defaultMessage: 'URL is already in use.',
    description: 'Server validation error shown when the company URL is already in use',
  },
  enterpriseSlugReserved: {
    id: 'checkout.errorMessages.enterpriseSlug.reserved',
    defaultMessage: 'The slug is currently reserved by another user.',
    description: 'Server validation error shown when the company URL slug is reserved',
  },
  quantityInvalidFormat: {
    id: 'checkout.errorMessages.quantity.invalidFormat',
    defaultMessage: 'Must be a positive integer.',
    description: 'Server validation error shown when the number of licenses is not a positive integer',
  },
  quantityRangeExceeded: {
    id: 'checkout.errorMessages.quantity.rangeExceeded',
    defaultMessage: 'Exceeded allowed range for given stripe_price_id.',
    description: 'Server validation error shown when the number of licenses exceeds the allowed range',
  },
  stripePriceIdInvalidFormat: {
    id: 'checkout.errorMessages.stripePriceId.invalidFormat',
    defaultMessage: 'Must be a non-empty string.',
    description: 'Server validation error shown when the stripe price id is not a non-empty string',
  },
  stripePriceIdDoesNotExist: {
    id: 'checkout.errorMessages.stripePriceId.doesNotExist',
    defaultMessage: 'This stripe_price_id has not been configured.',
    description: 'Server validation error shown when the stripe price id has not been configured',
  },
  companyNameExistingCustomer: {
    id: 'checkout.errorMessages.companyName.existingCustomer',
    defaultMessage: 'This company already has an edX account. Please contact support to request access or modify the existing account',
    description: 'Server validation error shown when the company already has an edX account',
  },
});

export const CheckoutErrorMessagesByField: {
  [K in keyof FieldErrorCodes]: Record<FieldErrorCodes[K], MessageDescriptor>
} = {
  adminEmail: {
    invalid_format: errorMessagesByFieldMessages.adminEmailInvalidFormat,
    not_registered: errorMessagesByFieldMessages.adminEmailNotRegistered,
    incomplete_data: errorMessagesByFieldMessages.incompleteData,
  },
  enterpriseSlug: {
    invalid_format: errorMessagesByFieldMessages.enterpriseSlugInvalidFormat,
    // EXISTING_ENTERPRISE_CUSTOMER_FOR_ADMIN uses the same error code on the backend
    existing_enterprise_customer: errorMessagesByFieldMessages.enterpriseSlugExistingCustomer,
    slug_reserved: errorMessagesByFieldMessages.enterpriseSlugReserved,
    incomplete_data: errorMessagesByFieldMessages.incompleteData,
  },
  quantity: {
    invalid_format: errorMessagesByFieldMessages.quantityInvalidFormat,
    range_exceeded: errorMessagesByFieldMessages.quantityRangeExceeded,
    incomplete_data: errorMessagesByFieldMessages.incompleteData,
  },
  stripePriceId: {
    invalid_format: errorMessagesByFieldMessages.stripePriceIdInvalidFormat,
    does_not_exist: errorMessagesByFieldMessages.stripePriceIdDoesNotExist,
    incomplete_data: errorMessagesByFieldMessages.incompleteData,
  },
  companyName: {
    existing_enterprise_customer: errorMessagesByFieldMessages.companyNameExistingCustomer,
  },
};

const validationMessages = defineMessages({
  loginPasswordRequired: {
    id: 'checkout.validation.login.password.required',
    defaultMessage: 'Password is required',
    description: 'Error shown when the password field is empty on the login form',
  },
  loginPasswordMaxLength: {
    id: 'checkout.validation.login.password.maxLength',
    defaultMessage: 'Maximum 255 characters',
    description: 'Error shown when the password on the login form exceeds the maximum length',
  },
  registerEmailRequired: {
    id: 'checkout.validation.register.email.required',
    defaultMessage: 'Email is required',
    description: 'Error shown when the email field is empty on the registration form',
  },
  registerFullNameRequired: {
    id: 'checkout.validation.register.fullName.required',
    defaultMessage: 'Full name is required',
    description: 'Error shown when the full name field is empty on the registration form',
  },
  registerUsernameLength: {
    id: 'checkout.validation.register.username.length',
    defaultMessage: 'Username must be between 2 and 30 characters long.',
    description: 'Error shown when the username on the registration form is too short or too long',
  },
  registerPasswordMinLength: {
    id: 'checkout.validation.register.password.minLength',
    defaultMessage: 'Password must contain at least 8 characters.',
    description: 'Error shown when the password on the registration form is too short',
  },
  registerPasswordMaxLength: {
    id: 'checkout.validation.register.password.maxLength',
    defaultMessage: 'Password must contain no more than 100 characters.',
    description: 'Error shown when the password on the registration form is too long',
  },
  registerPasswordRequiresDigit: {
    id: 'checkout.validation.register.password.requiresDigit',
    defaultMessage: 'Password must contain at least one digit.',
    description: 'Error shown when the password on the registration form does not contain a digit',
  },
  registerCountryRequired: {
    id: 'checkout.validation.register.country.required',
    defaultMessage: 'Country is required',
    description: 'Error shown when the country field is empty on the registration form',
  },
  registerPasswordsDoNotMatch: {
    id: 'checkout.validation.register.passwordsDoNotMatch',
    defaultMessage: 'Passwords do not match',
    description: 'Error shown when the password and confirm password fields do not match',
  },
  quantityRequired: {
    id: 'checkout.validation.planDetails.quantity.required',
    defaultMessage: 'Number of licenses is required',
    description: 'Error shown when the number of licenses field is empty',
  },
  quantityMin: {
    id: 'checkout.validation.planDetails.quantity.min',
    defaultMessage: 'You must have at least {min} licenses',
    description: 'Error shown when the number of licenses is below the allowed minimum',
  },
  quantityMax: {
    id: 'checkout.validation.planDetails.quantity.max',
    // eslint-disable-next-line max-len
    defaultMessage: 'You can only have up to {max} licenses on the Teams plan. Either decrease the number of licenses or choose a different plan.',
    description: 'Error shown when the number of licenses exceeds the allowed maximum',
  },
  planDetailsFullNameRequired: {
    id: 'checkout.validation.planDetails.fullName.required',
    defaultMessage: 'Full name is required',
    description: 'Error shown when the full name field is empty on the plan details form',
  },
  planDetailsFullNameMaxLength: {
    id: 'checkout.validation.planDetails.fullName.maxLength',
    defaultMessage: 'Name is too long. It must contain no more than {max} characters.',
    description: 'Error shown when the full name on the plan details form exceeds the maximum length',
  },
  planDetailsEmailRequired: {
    id: 'checkout.validation.planDetails.email.required',
    defaultMessage: 'Work email is required',
    description: 'Error shown when the work email field is empty on the plan details form',
  },
  planDetailsEmailTooShort: {
    id: 'checkout.validation.planDetails.email.tooShort',
    defaultMessage: 'Please enter valid email (too short)',
    description: 'Error shown when the work email on the plan details form is shorter than the minimum length',
  },
  planDetailsEmailTooLong: {
    id: 'checkout.validation.planDetails.email.tooLong',
    defaultMessage: 'This email address is too long. It must contain no more than {max} characters',
    description: 'Error shown when the work email on the plan details form exceeds the maximum length',
  },
  planDetailsEmailInvalid: {
    id: 'checkout.validation.planDetails.email.invalid',
    defaultMessage: 'Please enter valid email',
    description: 'Error shown when the work email on the plan details form is not a valid email address',
  },
  planDetailsCountryRequired: {
    id: 'checkout.validation.planDetails.country.required',
    defaultMessage: 'Country is required',
    description: 'Error shown when the country field is empty on the plan details form',
  },
});

export const PlanDetailsLoginPageSchema = (
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constraints: CheckoutContextFieldConstraints,
  { intl }: { intl: IntlShape },
) => (z.object({
  adminEmail: z.string().trim()
    .email()
    .max(254)
    .optional(),
  password: z.string().trim()
    .min(2, intl.formatMessage(validationMessages.loginPasswordRequired))
    .max(255, intl.formatMessage(validationMessages.loginPasswordMaxLength)),
}));

export const PlanDetailsRegisterPageSchema = (
  constraints: CheckoutContextFieldConstraints,
  { intl }: { intl: IntlShape },
) => (z.object({
  adminEmail: z.string().trim()
    .email()
    .min(
      constraints?.adminEmail?.minLength ?? 6,
      intl.formatMessage(validationMessages.registerEmailRequired),
    )
    .max(constraints?.adminEmail?.maxLength ?? 253),
  fullName: z.string().trim()
    .min(
      constraints?.fullName?.minLength ?? 1,
      intl.formatMessage(validationMessages.registerFullNameRequired),
    )
    .max(constraints?.fullName?.maxLength ?? 150),
  username: z.string().trim()
    .min(2, intl.formatMessage(validationMessages.registerUsernameLength))
    .max(30, intl.formatMessage(validationMessages.registerUsernameLength)),
  password: z.string()
    .min(8, intl.formatMessage(validationMessages.registerPasswordMinLength))
    .max(100, intl.formatMessage(validationMessages.registerPasswordMaxLength))
    .refine((value) => /[0-9]/.test(value), intl.formatMessage(validationMessages.registerPasswordRequiresDigit)),
  confirmPassword: z.string(),
  country: z.string().trim()
    .min(1, intl.formatMessage(validationMessages.registerCountryRequired)),
}).refine((data) => data.password === data.confirmPassword, {
  message: intl.formatMessage(validationMessages.registerPasswordsDoNotMatch),
  path: ['confirmPassword'],
}).superRefine(async (data, ctx) => {
  const { isValid, errors } = await validateRegistrationFieldsDebounced({
    email: data.adminEmail,
    name: data.fullName,
    username: data.username,
    password: data.password,
    country: data.country,
  });
  if (!isValid) {
    // Map LMS errors back to Zod issues
    Object.entries(errors).forEach(([field, message]) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: field === 'root' ? [] : [field],
      });
    });
  }
}));

export const PlanDetailsSchema = (
  constraints: CheckoutContextFieldConstraints,
  { stripePriceId, intl }: { stripePriceId: CheckoutContextPrice['id'], intl: IntlShape },
) => (z.object({
  quantity: z.coerce.number()
    .min(
      1,
      intl.formatMessage(validationMessages.quantityRequired),
    )
    .min(
      constraints?.quantity?.min ?? 5,
      intl.formatMessage(validationMessages.quantityMin, { min: constraints?.quantity?.min ?? 5 }),
    )
    .max(
      constraints?.quantity?.max ?? 50,
      intl.formatMessage(validationMessages.quantityMax, { max: constraints?.quantity?.max ?? 50 }),
    )
    .superRefine(async (quantity, ctx) => {
      const { isValid, validationDecisions } = await validateFieldDetailed(
        'quantity',
        quantity,
        { stripePriceId, adminEmail: '' },
      );
      if (!isValid && validationDecisions?.quantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: serverValidationError('quantity', validationDecisions, CheckoutErrorMessagesByField, intl),
        });
      }
    }),
  fullName: z.string().trim()
    .min(
      constraints?.fullName?.minLength ?? 1,
      intl.formatMessage(validationMessages.planDetailsFullNameRequired),
    )
    .max(
      constraints?.fullName?.maxLength ?? 150,
      intl.formatMessage(
        validationMessages.planDetailsFullNameMaxLength,
        { max: constraints?.fullName?.maxLength ?? 150 },
      ),
    ),
  adminEmail: z.string().trim()
    .min(
      1,
      intl.formatMessage(validationMessages.planDetailsEmailRequired),
    )
    .min(
      constraints?.adminEmail?.minLength ?? 6,
      intl.formatMessage(validationMessages.planDetailsEmailTooShort),
    )
    .max(
      constraints?.adminEmail?.maxLength ?? 253,
      intl.formatMessage(
        validationMessages.planDetailsEmailTooLong,
        { max: constraints?.adminEmail?.maxLength ?? 253 },
      ),
    )
    .regex(
      new RegExp(constraints?.adminEmail?.pattern ?? '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'),
      intl.formatMessage(validationMessages.planDetailsEmailInvalid),
    )
    .email()
    .superRefine(async (adminEmail, ctx) => {
      // TODO: Nice to have to avoid calling this API if client side validation catches first
      const { isValid, validationDecisions } = await validateFieldDetailed(
        'adminEmail',
        adminEmail,
      );
      if (!isValid && validationDecisions?.adminEmail) {
        // Check if the validation error is 'not_registered'
        const adminEmailDecision = validationDecisions?.adminEmail;
        if (adminEmailDecision.errorCode !== 'not_registered') {
          // Only throw validation error for other error codes, not 'not_registered'
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: serverValidationError('adminEmail', validationDecisions, CheckoutErrorMessagesByField, intl),
          });
        }
        // For 'not_registered', we allow the form to submit and handle navigation in the submit callback
      }
    }),
  country: z.string().trim()
    .min(
      constraints?.country?.minLength ?? 2,
      intl.formatMessage(validationMessages.planDetailsCountryRequired),
    ),
  stripePriceId: z.string().trim().optional().nullable(),
}));

const accountDetailsValidationMessages = defineMessages({
  companyNameRequired: {
    id: 'checkout.validation.accountDetails.companyName.required',
    defaultMessage: 'Company name is required',
    description: 'Error shown when the company name field is empty',
  },
  companyNameMaxLength: {
    id: 'checkout.validation.accountDetails.companyName.maxLength',
    defaultMessage: 'Maximum {max} characters',
    description: 'Error shown when the company name exceeds the maximum length',
  },
  enterpriseSlugRequired: {
    id: 'checkout.validation.accountDetails.enterpriseSlug.required',
    defaultMessage: 'Company URL is required',
    description: 'Error shown when the company URL field is empty',
  },
  enterpriseSlugMaxLength: {
    id: 'checkout.validation.accountDetails.enterpriseSlug.maxLength',
    defaultMessage: 'Maximum {max} characters',
    description: 'Error shown when the company URL exceeds the maximum length',
  },
  enterpriseSlugPattern: {
    id: 'checkout.validation.accountDetails.enterpriseSlug.pattern',
    defaultMessage: 'Only alphanumeric lowercase characters and hyphens are allowed.',
    description: 'Error shown when the company URL contains disallowed characters',
  },
});

const stringRequired = (min: number, max: number, requiredMsg: string, maxMsg: string) => z.preprocess(
  (val) => val ?? '',
  z.string()
    .trim()
    .min(min, requiredMsg)
    .max(max, maxMsg),
);

export const AccountDetailsSchema = (
  constraints: CheckoutContextFieldConstraints,
  { adminEmail, intl }: { adminEmail?: string, intl: IntlShape },
) => z.object({
  companyName: stringRequired(
    constraints?.companyName?.minLength ?? 1,
    constraints?.companyName?.maxLength ?? 255,
    intl.formatMessage(accountDetailsValidationMessages.companyNameRequired),
    intl.formatMessage(
      accountDetailsValidationMessages.companyNameMaxLength,
      { max: constraints?.companyName?.maxLength ?? 255 },
    ),
  ).superRefine(async (companyName, ctx) => {
    if (!companyName) { return; }

    const { isValid, validationDecisions } = await validateFieldDetailed(
      'companyName',
      companyName,
    );

    if (!isValid && validationDecisions?.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: serverValidationError(
          'companyName',
          validationDecisions,
          CheckoutErrorMessagesByField,
          intl,
        ),
      });
    }
  }),
  enterpriseSlug: z.preprocess(
    (val) => val ?? '',
    z.string()
      .trim()
      .min(
        constraints?.enterpriseSlug?.minLength ?? 1,
        intl.formatMessage(accountDetailsValidationMessages.enterpriseSlugRequired),
      )
      .max(
        constraints?.enterpriseSlug?.maxLength ?? 255,
        intl.formatMessage(
          accountDetailsValidationMessages.enterpriseSlugMaxLength,
          { max: constraints?.enterpriseSlug?.maxLength ?? 255 },
        ),
      )
      .regex(
        new RegExp(constraints?.enterpriseSlug?.pattern ?? '^[a-z0-9-]+$'),
        intl.formatMessage(accountDetailsValidationMessages.enterpriseSlugPattern),
      ),
  ).superRefine(async (enterpriseSlug, ctx) => {
    if (!enterpriseSlug) { return; }

    const { isValid, validationDecisions } = await validateFieldDetailed(
      'enterpriseSlug',
      enterpriseSlug,
      { adminEmail: adminEmail || '' },
    );

    if (!isValid && validationDecisions?.enterpriseSlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: serverValidationError(
          'enterpriseSlug',
          validationDecisions,
          CheckoutErrorMessagesByField,
          intl,
        ),
      });
    }
  }),
});

const billingDetailsValidationMessages = defineMessages({
  confirmTnCRequired: {
    id: 'checkout.validation.billingDetails.confirmTnC.required',
    defaultMessage: 'Please accept the terms.',
    description: 'Error shown when the terms and conditions checkbox is not checked',
  },
  confirmSubscriptionRequired: {
    id: 'checkout.validation.billingDetails.confirmSubscription.required',
    defaultMessage: 'Please confirm organization subscription.',
    description: 'Error shown when the organization subscription confirmation checkbox is not checked',
  },
});

export const BillingDetailsSchema = (
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constraints: CheckoutContextFieldConstraints,
  { intl }: { intl: IntlShape },
) => (
  z.object({
    confirmTnC: z.boolean().refine((value) => value, {
      message: intl.formatMessage(billingDetailsValidationMessages.confirmTnCRequired),
    }),
    confirmSubscription: z.boolean().refine((value) => value, {
      message: intl.formatMessage(billingDetailsValidationMessages.confirmSubscriptionRequired),
    }),
  })
);

const academicSelectionValidationMessages = defineMessages({
  academyNameRequired: {
    id: 'checkout.validation.academicSelection.academyName.required',
    defaultMessage: 'Academy name is required',
    description: 'Error shown when the academy name field is empty',
  },
  academyNameMaxLength: {
    id: 'checkout.validation.academicSelection.academyName.maxLength',
    defaultMessage: 'Academy name must be no more than 255 characters',
    description: 'Error shown when the academy name exceeds the maximum length',
  },
});

// Schema for capturing academy name in Essentials flow
export const AcademicSelectionSchema = (
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constraints: CheckoutContextFieldConstraints,
  { intl }: { intl: IntlShape },
) => (
  z.object({
    academyName: z.string().trim()
      .min(1, intl.formatMessage(academicSelectionValidationMessages.academyNameRequired))
      .max(255, intl.formatMessage(academicSelectionValidationMessages.academyNameMaxLength)),
  })
);

export const CheckoutPageRoute = {
  PlanDetails: `/${CheckoutStepKey.PlanDetails}`,
  PlanDetailsLogin: `/${CheckoutStepKey.PlanDetails}/${CheckoutSubstepKey.Login}`,
  PlanDetailsRegister: `/${CheckoutStepKey.PlanDetails}/${CheckoutSubstepKey.Register}`,
  AccountDetails: `/${CheckoutStepKey.AccountDetails}`,
  BillingDetails: `/${CheckoutStepKey.BillingDetails}`,
  BillingDetailsSuccess: `/${CheckoutStepKey.BillingDetails}/${CheckoutSubstepKey.Success}`,
} as const;

// NEW ROUTES - Essentials flow
export const EssentialsPageRoute = {
  Base: '/essentials',
  AcademicSelection: `/essentials/${EssentialsStepKey.AcademicSelection}`,
  PlanDetails: `/essentials/${EssentialsStepKey.PlanDetails}`,
  AccountDetails: `/essentials/${EssentialsStepKey.AccountDetails}`,
  BillingDetails: `/essentials/${EssentialsStepKey.BillingDetails}`,
  BillingDetailsSuccess: `/essentials/${EssentialsStepKey.BillingDetails}/${CheckoutSubstepKey.Success}`,
} as const;

// NEW PAGE DETAILS - Essentials flow
export const EssentialsPageDetails = {
  AcademicSelection: {
    step: 'AcademicSelection',
    substep: undefined,
    formSchema: AcademicSelectionSchema,
    route: EssentialsPageRoute.AcademicSelection,
    title: defineMessages({
      title: {
        id: 'essentials.academicSelection.title',
        defaultMessage: 'Academic Selection',
        description: 'Title for the academic selection page',
      },
    }).title,
    buttonMessage: null,
  },

} as const;

export const CheckoutPageDetails: { [K in CheckoutPage]: CheckoutPageDetails } = {
  PlanDetails: {
    step: 'PlanDetails',
    substep: undefined,
    formSchema: PlanDetailsSchema,
    route: CheckoutPageRoute.PlanDetails,
    title: defineMessages({
      title: {
        id: 'checkout.planDetails.title',
        defaultMessage: 'Plan Details',
        description: 'Title for the plan details page',
      },
    }).title,
    buttonMessage: defineMessages({
      buttonMessage: {
        id: 'checkout.planDetails.continue',
        defaultMessage: 'Continue',
        description: 'Button label for the next step in the plan details step',
      },
    }).buttonMessage,
  },
  PlanDetailsLogin: {
    step: 'PlanDetails',
    substep: 'Login',
    formSchema: PlanDetailsLoginPageSchema,
    route: CheckoutPageRoute.PlanDetailsLogin,
    title: defineMessages({
      title: {
        id: 'checkout.planDetailsLogin.title',
        defaultMessage: 'Log in to your account',
        description: 'Title for the login page in the plan details step',
      },
    }).title,
    buttonMessage: defineMessages({
      buttonMessage: {
        id: 'checkout.registrationPage.login',
        defaultMessage: 'Sign in',
        description: 'Button label to login a user in the plan details step',
      },
    }).buttonMessage,
  },
  PlanDetailsRegister: {
    step: 'PlanDetails',
    substep: 'Register',
    formSchema: PlanDetailsRegisterPageSchema,
    route: CheckoutPageRoute.PlanDetailsRegister,
    title: defineMessages({
      title: {
        id: 'checkout.planDetailsRegistration.title',
        defaultMessage: 'Create your Account',
        description: 'Title for the registration page in the plan details step',
      },
    }).title,
    buttonMessage: defineMessages({
      buttonMessage: {
        id: 'checkout.registrationPage.register',
        defaultMessage: 'Register',
        description: 'Button label to register a new user in the plan details step',
      },
    }).buttonMessage,
  },
  AccountDetails: {
    step: 'AccountDetails',
    substep: undefined,
    formSchema: AccountDetailsSchema,
    route: CheckoutPageRoute.AccountDetails,
    title: defineMessages({
      title: {
        id: 'checkout.accountDetails.title',
        defaultMessage: 'Account Details',
        description: 'Title for the account details step',
      },
    }).title,
    buttonMessage: defineMessages({
      buttonMessage: {
        id: 'checkout.accountDetails.continue',
        defaultMessage: 'Continue',
        description: 'Button to go to the next page',
      },
    }).buttonMessage,
  },
  BillingDetails: {
    step: 'BillingDetails',
    substep: undefined,
    formSchema: BillingDetailsSchema,
    route: CheckoutPageRoute.BillingDetails,
    title: defineMessages({
      title: {
        id: 'checkout.billingDetails.title',
        defaultMessage: 'Billing Details',
        description: 'Title for the billing details step',
      },
    }).title,
    buttonMessage: defineMessages({
      buttonMessage: {
        id: 'checkout.billingDetails.purchaseNow',
        defaultMessage: 'Subscribe',
        description: 'Button to purchase the subscription product',
      },
    }).buttonMessage,
  },
  BillingDetailsSuccess: {
    step: 'BillingDetails',
    substep: 'Success',
    formSchema: BillingDetailsSchema,
    route: CheckoutPageRoute.BillingDetailsSuccess,
    title: defineMessages({
      title: {
        id: 'checkout.billingDetailsSuccess.title',
        defaultMessage: 'Thank you, {firstName}.',
        description: 'Title for the success page',
      },
    }).title,
    buttonMessage: null,
  },
};

// Constants specific to the Stepper component
export const authenticatedSteps = [
  'account-details',
  'billing-details',
] as const;

export enum DataStoreKey {
  AcademySelection = 'AcademySelection',
  PlanDetails = 'PlanDetails',
  AccountDetails = 'AccountDetails',
  BillingDetails = 'BillingDetails',
}

export enum SubmitCallbacks {
  PlanDetails = 'PlanDetails',
  PlanDetailsLogin = 'PlanDetailsLogin',
  PlanDetailsRegister = 'PlanDetailsRegister',
}
