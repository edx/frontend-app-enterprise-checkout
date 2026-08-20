import { defineMessages } from '@edx/frontend-platform/i18n';
import { MessageDescriptor } from 'react-intl';
import { z } from 'zod';

import { validateRegistrationFieldsDebounced } from '@/components/app/data/services/registration';
import { validateFieldDetailed } from '@/components/app/data/services/validation';
import { serverValidationError } from '@/utils/common';

/**
 * Formats a message descriptor to a display string. Schema factories below accept this so
 * validation messages can be translated when called from a component (via `intl.formatMessage`).
 * Route loaders validate form state without displaying messages, so they fall back to
 * `defaultFormatMessageFn`, which just interpolates `defaultMessage` untranslated.
 */
export type FormatMessageFn = (descriptor: MessageDescriptor, values?: Record<string, string | number>) => string;

export const defaultFormatMessageFn: FormatMessageFn = (descriptor, values) => {
  let message = String(descriptor.defaultMessage ?? '');
  if (values) {
    Object.entries(values).forEach(([key, value]) => {
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    });
  }
  return message;
};

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

const errorMessagesByFieldMessages = defineMessages({
  adminEmailInvalidFormat: {
    id: 'checkout.errorMessages.adminEmail.invalidFormat',
    defaultMessage: 'Invalid format for given email address.',
    description: 'Server validation error for an incorrectly formatted admin email',
  },
  adminEmailNotRegistered: {
    id: 'checkout.errorMessages.adminEmail.notRegistered',
    defaultMessage: 'Given email address does not correspond to an existing user.',
    description: 'Server validation error when the admin email has no matching account',
  },
  adminEmailIncompleteData: {
    id: 'checkout.errorMessages.adminEmail.incompleteData',
    defaultMessage: 'Not enough parameters were given.',
    description: 'Server validation error when required admin email data is missing',
  },
  enterpriseSlugInvalidFormat: {
    id: 'checkout.errorMessages.enterpriseSlug.invalidFormat',
    defaultMessage: 'Only alphanumeric lowercase characters and hyphens are allowed.',
    description: 'Server validation error for an incorrectly formatted company URL slug',
  },
  // EXISTING_ENTERPRISE_CUSTOMER_FOR_ADMIN uses the same error code on the backend
  enterpriseSlugExistingCustomer: {
    id: 'checkout.errorMessages.enterpriseSlug.existingCustomer',
    defaultMessage: 'URL is already in use.',
    description: 'Server validation error when the company URL slug is already taken',
  },
  enterpriseSlugReserved: {
    id: 'checkout.errorMessages.enterpriseSlug.reserved',
    defaultMessage: 'The slug is currently reserved by another user.',
    description: 'Server validation error when the company URL slug is reserved',
  },
  enterpriseSlugIncompleteData: {
    id: 'checkout.errorMessages.enterpriseSlug.incompleteData',
    defaultMessage: 'Not enough parameters were given.',
    description: 'Server validation error when required company URL slug data is missing',
  },
  quantityInvalidFormat: {
    id: 'checkout.errorMessages.quantity.invalidFormat',
    defaultMessage: 'Must be a positive integer.',
    description: 'Server validation error for a non-positive-integer license quantity',
  },
  quantityRangeExceeded: {
    id: 'checkout.errorMessages.quantity.rangeExceeded',
    defaultMessage: 'Exceeded allowed range for given stripe_price_id.',
    description: 'Server validation error when the license quantity exceeds the allowed range',
  },
  quantityIncompleteData: {
    id: 'checkout.errorMessages.quantity.incompleteData',
    defaultMessage: 'Not enough parameters were given.',
    description: 'Server validation error when required license quantity data is missing',
  },
  stripePriceIdInvalidFormat: {
    id: 'checkout.errorMessages.stripePriceId.invalidFormat',
    defaultMessage: 'Must be a non-empty string.',
    description: 'Server validation error for an empty Stripe price id',
  },
  stripePriceIdDoesNotExist: {
    id: 'checkout.errorMessages.stripePriceId.doesNotExist',
    defaultMessage: 'This stripe_price_id has not been configured.',
    description: 'Server validation error when the Stripe price id is not configured',
  },
  stripePriceIdIncompleteData: {
    id: 'checkout.errorMessages.stripePriceId.incompleteData',
    defaultMessage: 'Not enough parameters were given.',
    description: 'Server validation error when required Stripe price id data is missing',
  },
  companyNameExistingCustomer: {
    id: 'checkout.errorMessages.companyName.existingCustomer',
    defaultMessage: 'This company already has an edX account. Please contact support to request access or modify the existing account',
    description: 'Server validation error when the company name already belongs to an existing enterprise customer',
  },
});

export const getCheckoutErrorMessagesByField = (
  formatMessage: FormatMessageFn = defaultFormatMessageFn,
): { [K in keyof FieldErrorCodes]: Record<FieldErrorCodes[K], string> } => ({
  adminEmail: {
    invalid_format: formatMessage(errorMessagesByFieldMessages.adminEmailInvalidFormat),
    not_registered: formatMessage(errorMessagesByFieldMessages.adminEmailNotRegistered),
    incomplete_data: formatMessage(errorMessagesByFieldMessages.adminEmailIncompleteData),
  },
  enterpriseSlug: {
    invalid_format: formatMessage(errorMessagesByFieldMessages.enterpriseSlugInvalidFormat),
    existing_enterprise_customer: formatMessage(errorMessagesByFieldMessages.enterpriseSlugExistingCustomer),
    slug_reserved: formatMessage(errorMessagesByFieldMessages.enterpriseSlugReserved),
    incomplete_data: formatMessage(errorMessagesByFieldMessages.enterpriseSlugIncompleteData),
  },
  quantity: {
    invalid_format: formatMessage(errorMessagesByFieldMessages.quantityInvalidFormat),
    range_exceeded: formatMessage(errorMessagesByFieldMessages.quantityRangeExceeded),
    incomplete_data: formatMessage(errorMessagesByFieldMessages.quantityIncompleteData),
  },
  stripePriceId: {
    invalid_format: formatMessage(errorMessagesByFieldMessages.stripePriceIdInvalidFormat),
    does_not_exist: formatMessage(errorMessagesByFieldMessages.stripePriceIdDoesNotExist),
    incomplete_data: formatMessage(errorMessagesByFieldMessages.stripePriceIdIncompleteData),
  },
  companyName: {
    existing_enterprise_customer: formatMessage(errorMessagesByFieldMessages.companyNameExistingCustomer),
  },
});

const planDetailsLoginSchemaMessages = defineMessages({
  passwordRequired: {
    id: 'checkout.planDetailsLoginSchema.password.required',
    defaultMessage: 'Password is required',
    description: 'Validation error when the login password field is empty',
  },
  passwordMaxLength: {
    id: 'checkout.planDetailsLoginSchema.password.maxLength',
    defaultMessage: 'Maximum 255 characters',
    description: 'Validation error when the login password exceeds the max length',
  },
});

export const PlanDetailsLoginPageSchema = (
  _constraints: CheckoutContextFieldConstraints,
  _stripePriceId?: CheckoutContextPrice['id'],
  formatMessage: FormatMessageFn = defaultFormatMessageFn,
) => (z.object({
  adminEmail: z.string().trim()
    .email()
    .max(254)
    .optional(),
  password: z.string().trim()
    .min(2, formatMessage(planDetailsLoginSchemaMessages.passwordRequired))
    .max(255, formatMessage(planDetailsLoginSchemaMessages.passwordMaxLength)),
}));

const planDetailsRegisterSchemaMessages = defineMessages({
  adminEmailRequired: {
    id: 'checkout.planDetailsRegisterSchema.adminEmail.required',
    defaultMessage: 'Email is required',
    description: 'Validation error when the registration email field is empty',
  },
  fullNameRequired: {
    id: 'checkout.planDetailsRegisterSchema.fullName.required',
    defaultMessage: 'Full name is required',
    description: 'Validation error when the registration full name field is empty',
  },
  usernameLengthRange: {
    id: 'checkout.planDetailsRegisterSchema.username.lengthRange',
    defaultMessage: 'Username must be between 2 and 30 characters long.',
    description: 'Validation error when the username is outside the allowed length range',
  },
  passwordMinLength: {
    id: 'checkout.planDetailsRegisterSchema.password.minLength',
    defaultMessage: 'Password must contain at least 8 characters.',
    description: 'Validation error when the registration password is too short',
  },
  passwordMaxLength: {
    id: 'checkout.planDetailsRegisterSchema.password.maxLength',
    defaultMessage: 'Password must contain no more than 100 characters.',
    description: 'Validation error when the registration password is too long',
  },
  passwordDigitRequired: {
    id: 'checkout.planDetailsRegisterSchema.password.digitRequired',
    defaultMessage: 'Password must contain at least one digit.',
    description: 'Validation error when the registration password has no digit',
  },
  countryRequired: {
    id: 'checkout.planDetailsRegisterSchema.country.required',
    defaultMessage: 'Country is required',
    description: 'Validation error when the registration country field is empty',
  },
  passwordsDoNotMatch: {
    id: 'checkout.planDetailsRegisterSchema.confirmPassword.mismatch',
    defaultMessage: 'Passwords do not match',
    description: 'Validation error when password and confirm password fields differ',
  },
});

export const PlanDetailsRegisterPageSchema = (
  constraints: CheckoutContextFieldConstraints,
  _stripePriceId?: CheckoutContextPrice['id'],
  formatMessage: FormatMessageFn = defaultFormatMessageFn,
) => (z.object({
  adminEmail: z.string().trim()
    .email()
    .min(
      constraints?.adminEmail?.minLength ?? 6,
      formatMessage(planDetailsRegisterSchemaMessages.adminEmailRequired),
    )
    .max(constraints?.adminEmail?.maxLength ?? 253),
  fullName: z.string().trim()
    .min(
      constraints?.fullName?.minLength ?? 1,
      formatMessage(planDetailsRegisterSchemaMessages.fullNameRequired),
    )
    .max(constraints?.fullName?.maxLength ?? 150),
  username: z.string().trim()
    .min(2, formatMessage(planDetailsRegisterSchemaMessages.usernameLengthRange))
    .max(30, formatMessage(planDetailsRegisterSchemaMessages.usernameLengthRange)),
  password: z.string()
    .min(8, formatMessage(planDetailsRegisterSchemaMessages.passwordMinLength))
    .max(100, formatMessage(planDetailsRegisterSchemaMessages.passwordMaxLength))
    .refine((value) => /[0-9]/.test(value), formatMessage(planDetailsRegisterSchemaMessages.passwordDigitRequired)),
  confirmPassword: z.string(),
  country: z.string().trim()
    .min(1, formatMessage(planDetailsRegisterSchemaMessages.countryRequired)),
}).refine((data) => data.password === data.confirmPassword, {
  message: formatMessage(planDetailsRegisterSchemaMessages.passwordsDoNotMatch),
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

const planDetailsSchemaMessages = defineMessages({
  quantityRequired: {
    id: 'checkout.planDetailsSchema.quantity.required',
    defaultMessage: 'Number of licenses is required',
    description: 'Validation error when the number of licenses field is empty',
  },
  quantityMinLicenses: {
    id: 'checkout.planDetailsSchema.quantity.minLicenses',
    defaultMessage: 'You must have at least {min} licenses',
    description: 'Validation error when the number of licenses is below the allowed minimum',
  },
  quantityMaxLicenses: {
    id: 'checkout.planDetailsSchema.quantity.maxLicenses',
    defaultMessage: 'You can only have up to {max} licenses on the Teams plan. Either decrease the number of licenses or choose a different plan.',
    description: 'Validation error when the number of licenses exceeds the allowed maximum',
  },
  fullNameRequired: {
    id: 'checkout.planDetailsSchema.fullName.required',
    defaultMessage: 'Full name is required',
    description: 'Validation error when the plan details full name field is empty',
  },
  fullNameMaxLength: {
    id: 'checkout.planDetailsSchema.fullName.maxLength',
    defaultMessage: 'Name is too long. It must contain no more than {max} characters.',
    description: 'Validation error when the full name exceeds the allowed length',
  },
  adminEmailRequired: {
    id: 'checkout.planDetailsSchema.adminEmail.required',
    defaultMessage: 'Work email is required',
    description: 'Validation error when the work email field is empty',
  },
  adminEmailTooShort: {
    id: 'checkout.planDetailsSchema.adminEmail.tooShort',
    defaultMessage: 'Please enter valid email (too short)',
    description: 'Validation error when the work email is shorter than the allowed minimum',
  },
  adminEmailMaxLength: {
    id: 'checkout.planDetailsSchema.adminEmail.maxLength',
    defaultMessage: 'This email address is too long. It must contain no more than {max} characters',
    description: 'Validation error when the work email exceeds the allowed length',
  },
  adminEmailInvalidFormat: {
    id: 'checkout.planDetailsSchema.adminEmail.invalidFormat',
    defaultMessage: 'Please enter valid email',
    description: 'Validation error when the work email does not match the required format',
  },
  countryRequired: {
    id: 'checkout.planDetailsSchema.country.required',
    defaultMessage: 'Country is required',
    description: 'Validation error when the plan details country field is empty',
  },
});

export const PlanDetailsSchema = (
  constraints: CheckoutContextFieldConstraints,
  stripePriceId: CheckoutContextPrice['id'],
  formatMessage: FormatMessageFn = defaultFormatMessageFn,
) => (z.object({
  quantity: z.coerce.number()
    .min(
      1,
      formatMessage(planDetailsSchemaMessages.quantityRequired),
    )
    .min(
      constraints?.quantity?.min ?? 5,
      formatMessage(planDetailsSchemaMessages.quantityMinLicenses, { min: constraints?.quantity?.min ?? 5 }),
    )
    .max(
      constraints?.quantity?.max ?? 50,
      formatMessage(planDetailsSchemaMessages.quantityMaxLicenses, { max: constraints?.quantity?.max ?? 50 }),
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
          message: serverValidationError('quantity', validationDecisions, getCheckoutErrorMessagesByField(formatMessage)),
        });
      }
    }),
  fullName: z.string().trim()
    .min(
      constraints?.fullName?.minLength ?? 1,
      formatMessage(planDetailsSchemaMessages.fullNameRequired),
    )
    .max(
      constraints?.fullName?.maxLength ?? 150,
      formatMessage(planDetailsSchemaMessages.fullNameMaxLength, { max: constraints?.fullName?.maxLength ?? 150 }),
    ),
  adminEmail: z.string().trim()
    .min(
      1,
      formatMessage(planDetailsSchemaMessages.adminEmailRequired),
    )
    .min(
      constraints?.adminEmail?.minLength ?? 6,
      formatMessage(planDetailsSchemaMessages.adminEmailTooShort),
    )
    .max(
      constraints?.adminEmail?.maxLength ?? 253,
      formatMessage(planDetailsSchemaMessages.adminEmailMaxLength, { max: constraints?.adminEmail?.maxLength ?? 253 }),
    )
    .regex(
      new RegExp(constraints?.adminEmail?.pattern ?? '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'),
      formatMessage(planDetailsSchemaMessages.adminEmailInvalidFormat),
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
            message: serverValidationError('adminEmail', validationDecisions, getCheckoutErrorMessagesByField(formatMessage)),
          });
        }
        // For 'not_registered', we allow the form to submit and handle navigation in the submit callback
      }
    }),
  country: z.string().trim()
    .min(
      constraints?.country?.minLength ?? 2,
      formatMessage(planDetailsSchemaMessages.countryRequired),
    ),
  stripePriceId: z.string().trim().optional().nullable(),
}));

const stringRequired = (min: number, max: number, requiredMsg: string, maxMsg: string) => z.preprocess(
  (val) => val ?? '',
  z.string()
    .trim()
    .min(min, requiredMsg)
    .max(max, maxMsg),
);

const accountDetailsSchemaMessages = defineMessages({
  companyNameRequired: {
    id: 'checkout.accountDetailsSchema.companyName.required',
    defaultMessage: 'Company name is required',
    description: 'Validation error when the company name field is empty',
  },
  companyNameMaxLength: {
    id: 'checkout.accountDetailsSchema.companyName.maxLength',
    defaultMessage: 'Maximum {max} characters',
    description: 'Validation error when the company name exceeds the allowed length',
  },
  enterpriseSlugRequired: {
    id: 'checkout.accountDetailsSchema.enterpriseSlug.required',
    defaultMessage: 'Company Url is required',
    description: 'Validation error when the company URL slug field is empty',
  },
  enterpriseSlugMaxLength: {
    id: 'checkout.accountDetailsSchema.enterpriseSlug.maxLength',
    defaultMessage: 'Maximum {max} characters',
    description: 'Validation error when the company URL slug exceeds the allowed length',
  },
  enterpriseSlugInvalidFormat: {
    id: 'checkout.accountDetailsSchema.enterpriseSlug.invalidFormat',
    defaultMessage: 'Only alphanumeric lowercase characters and hyphens are allowed.',
    description: 'Validation error when the company URL slug contains disallowed characters',
  },
});

export const AccountDetailsSchema = (
  constraints: CheckoutContextFieldConstraints,
  adminEmail?: string,
  formatMessage: FormatMessageFn = defaultFormatMessageFn,
) => z.object({
  companyName: stringRequired(
    constraints?.companyName?.minLength ?? 1,
    constraints?.companyName?.maxLength ?? 255,
    formatMessage(accountDetailsSchemaMessages.companyNameRequired),
    formatMessage(
      accountDetailsSchemaMessages.companyNameMaxLength,
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
          getCheckoutErrorMessagesByField(formatMessage),
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
        formatMessage(accountDetailsSchemaMessages.enterpriseSlugRequired),
      )
      .max(
        constraints?.enterpriseSlug?.maxLength ?? 255,
        formatMessage(
          accountDetailsSchemaMessages.enterpriseSlugMaxLength,
          { max: constraints?.enterpriseSlug?.maxLength ?? 255 },
        ),
      )
      .regex(
        new RegExp(constraints?.enterpriseSlug?.pattern ?? '^[a-z0-9-]+$'),
        formatMessage(accountDetailsSchemaMessages.enterpriseSlugInvalidFormat),
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
          getCheckoutErrorMessagesByField(formatMessage),
        ),
      });
    }
  }),
});

const billingDetailsSchemaMessages = defineMessages({
  confirmTnCRequired: {
    id: 'checkout.billingDetailsSchema.confirmTnC.required',
    defaultMessage: 'Please accept the terms.',
    description: 'Validation error when the terms and conditions checkbox is not checked',
  },
  confirmSubscriptionRequired: {
    id: 'checkout.billingDetailsSchema.confirmSubscription.required',
    defaultMessage: 'Please confirm organization subscription.',
    description: 'Validation error when the organization subscription confirmation checkbox is not checked',
  },
});

export const BillingDetailsSchema = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _constraints: CheckoutContextFieldConstraints,
  formatMessage: FormatMessageFn = defaultFormatMessageFn,
) => (
  z.object({
    confirmTnC: z.boolean().refine((value) => value, {
      message: formatMessage(billingDetailsSchemaMessages.confirmTnCRequired),
    }),
    confirmSubscription: z.boolean().refine((value) => value, {
      message: formatMessage(billingDetailsSchemaMessages.confirmSubscriptionRequired),
    }),
  })
);

const academicSelectionSchemaMessages = defineMessages({
  academyNameRequired: {
    id: 'checkout.academicSelectionSchema.academyName.required',
    defaultMessage: 'Academy name is required',
    description: 'Validation error when the academy name field is empty',
  },
  academyNameMaxLength: {
    id: 'checkout.academicSelectionSchema.academyName.maxLength',
    defaultMessage: 'Academy name must be no more than 255 characters',
    description: 'Validation error when the academy name exceeds the allowed length',
  },
});

// Schema for capturing academy name in Essentials flow
export const AcademicSelectionSchema = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _constraints: CheckoutContextFieldConstraints,
  formatMessage: FormatMessageFn = defaultFormatMessageFn,
) => (
  z.object({
    academyName: z.string().trim()
      .min(1, formatMessage(academicSelectionSchemaMessages.academyNameRequired))
      .max(255, formatMessage(academicSelectionSchemaMessages.academyNameMaxLength)),
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
