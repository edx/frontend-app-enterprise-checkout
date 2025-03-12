import { z } from 'zod';

import {
  Step1Schema,
  Step2Schema,
  steps,
  planTypes,
} from '@/constants';

declare global {
  type PlanType = typeof planTypes[number];

  type Step = typeof steps[number];

  type Step1Data = z.infer<typeof Step1Schema>;
  type Step2Data = z.infer<typeof Step2Schema>;

  type FormData = {
    plan: Partial<Step1Data>;
    organization: Partial<Step2Data>;
    billing: Record<string, unknown>;
  };

  type FormStore = {
    formData: Partial<FormData>;
    setFormData: (step: Step, data: Partial<Step1Data & Step2Data>) => void;
    currentStep: Step;
    setCurrentStep: (step: Step) => void;
    handleNext: () => void;
    handlePrevious: () => void;
  };
}
