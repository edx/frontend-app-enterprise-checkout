import { z } from 'zod';

import {
  PlanDetailsSchema,
  AccountDetailsSchema,
  BillingDetailsSchema,
  PlanDetailsRegistrationSchema, PlanDetailsLoginSchema,
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
  type PlanDetailsRegistrationData = z.infer<typeof PlanDetailsRegistrationSchema>;
  type PlanDetailsLoginData = z.infer<typeof PlanDetailsLoginSchema>;
  type AccountDetailsData = z.infer<typeof AccountDetailsSchema>;
  type BillingDetailsData = z.infer<typeof BillingDetailsSchema>;

  type StepDataMap = {
    'planDetails': Partial<PlanDetailsData>;
    'planDetailsRegistration': Partial<PlanDetailsRegistrationData>;
    'planDetailsLogin': Partial<PlanDetailsLoginData>;
    'createAccount': Partial<AccountDetailsData>;
    'billingDetails': Partial<BillingDetailsData>,
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
}
