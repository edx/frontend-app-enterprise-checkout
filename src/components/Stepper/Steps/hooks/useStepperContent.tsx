import { useParams } from 'react-router';

import {
  AccountDetailsContent,
  BillingDetailsContent,
  BillingDetailsSuccessContent,
  PlanDetailsContent,
  PlanDetailsLoginContent,
  PlanDetailsRegisterContent,
} from '@/components/Stepper/StepperContent';
import { determineStepperStep } from '@/components/Stepper/utils';
import { CheckoutStepKey, CheckoutSubstepKey } from '@/constants/checkout';

const StepperContent = {
  [CheckoutStepKey.PlanDetails]: PlanDetailsContent,
  [CheckoutSubstepKey.Login]: PlanDetailsLoginContent,
  [CheckoutSubstepKey.Register]: PlanDetailsRegisterContent,
  [CheckoutStepKey.AccountDetails]: AccountDetailsContent,
  [CheckoutStepKey.BillingDetails]: BillingDetailsContent,
  [CheckoutSubstepKey.Success]: BillingDetailsSuccessContent,
  fallback: () => {},
};

const useStepperContent = () => {
  const params = useParams<{ step: CheckoutStepKey, substep: CheckoutSubstepKey }>();
  const currentStep = determineStepperStep(params);
  // @ts-ignore
  return StepperContent[currentStep];
};

export default useStepperContent;
