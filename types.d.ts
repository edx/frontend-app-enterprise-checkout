import { SnakeCasedPropertiesDeep } from 'type-fest';
import { z } from 'zod';

import {
  AccountDetailsSchema,
  BillingDetailsSchema,
  PlanDetailsLoginSchema,
  PlanDetailsRegistrationSchema,
  PlanDetailsSchema,
} from '@/components/Stepper/constants';

// Declaration for SVG modules
declare module '*.svg' {
  import React from 'react';

  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare global {

  type AuthStep = 'account-details' | 'billing-details';

  type PlanDetailsData = z.infer<typeof PlanDetailsSchema>;
  type AccountDetailsData = z.infer<typeof AccountDetailsSchema>;
  type BillingDetailsData = z.infer<typeof BillingDetailsSchema>;
  // TODO: This is added an a means to iterate through the project. Will need to be removed.
  type PlanDetailsRegistrationData = z.infer<typeof PlanDetailsRegistrationSchema>;
  type PlanDetailsLoginData = z.infer<typeof PlanDetailsLoginSchema>;

  type StepDataMap = {
    'planDetails': Partial<PlanDetailsData>;
    'createAccount': Partial<AccountDetailsData>;
    'billingDetails': Partial<BillingDetailsData>,
    // TODO: This is added an a means to iterate through the project. Will need to be removed.
    'planDetailsRegistration': Partial<PlanDetailsRegistrationData>;
    'planDetailsLogin': Partial<PlanDetailsLoginData>;
  };

  type FormData = {
    [K in keyof StepDataMap]: StepDataMap[K];
  };

  type FormStore = {
    formData: Partial<FormData>;
    setFormData<K extends keyof StepDataMap>(
      step: K,
      data: Partial<FormData<K>>,
    ): void;
  };

  type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  type ValidationSchema = {
    fullName: string;
    adminEmail: string;
    companyName: string;
    enterpriseSlug: string;
    quantity: number;
    stripePriceId: string;
  };

  type ValidationSchemaPayload = SnakeCasedPropertiesDeep<ValidationSchema>;
}
