import { z } from 'zod';

import {
  BuildTrialSchema,
  CreateAccountSchema,
  steps,
  planTypes, CreateAccessLinkSchema, StartTrialSchema, SuccessSchema,
} from '@/components/Stepper/constants';

declare global {
  type PlanType = typeof planTypes[number];

  type Step = typeof steps[number];

  type AuthStep = 'create-access-link' | 'start-trial' | 'success';

  type BuildTrialData = z.infer<typeof BuildTrialSchema>;
  type CreateAccount = z.infer<typeof CreateAccountSchema>;
  type CreateAccessLinkData = z.infer<typeof CreateAccessLinkSchema>;
  type StartTrialData = z.infer<typeof StartTrialSchema>;
  type SuccessTrialData = z.infer<typeof SuccessSchema>;

  type StepDataMap = {
    'buildTrial': Partial<BuildTrialData>;
    'createAccount': Partial<CreateAccount>;
    'createAccessLink': Partial<CreateAccessLinkData>,
    'startTrial': Partial<StartTrialData>,
    'success': Partial<SuccessTrialData>,
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
