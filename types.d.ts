import { z } from 'zod';

import {
  PlanDetailsSchema,
  AccountDetailsSchema,
  BillingDetailsSchema,
} from '@/components/Stepper/constants';

declare global {

  type AuthStep = 'account-details' | 'billing-details';

  type PlanDetailsData = z.infer<typeof PlanDetailsSchema>;
  type AccountDetailsData = z.infer<typeof AccountDetailsSchema>;
  type BillingDetailsData = z.infer<typeof BillingDetailsSchema>;

  type StepDataMap = {
    'planDetails': Partial<PlanDetailsData>;
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
