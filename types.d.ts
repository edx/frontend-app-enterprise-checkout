import { z } from 'zod';

import {
  PlanSchema,
  AccountSchema,
  steps,
  planTypes,
} from '@/constants';

declare global {
  type PlanType = typeof planTypes[number];

  type Step = typeof steps[number];

  type PlanData = z.infer<typeof PlanSchema>;
  type AccountData = z.infer<typeof AccountSchema>;

  type StepDataMap = {
    plan: Partial<PlanData>;
    account: Partial<AccountData>;
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
