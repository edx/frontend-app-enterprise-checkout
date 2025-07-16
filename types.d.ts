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

  type BuildTrial = z.infer<typeof BuildTrialSchema>;
  type CreateAccount = z.infer<typeof CreateAccountSchema>;
  type CreateAccessLink = z.infer<typeof CreateAccessLinkSchema>;
  type StartTrial = z.infer<typeof StartTrialSchema>;
  type SuccessTrial = z.infer<typeof SuccessSchema>;

  type StepDataMap = {
    'buildTrial': Partial<BuildTrial>;
    'createAccount': Partial<CreateAccount>;
    'createAccessLink': Partial<CreateAccessLink>,
    'startTrial': Partial<StartTrial>,
    'success': Partial<SuccessTrial>,
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
