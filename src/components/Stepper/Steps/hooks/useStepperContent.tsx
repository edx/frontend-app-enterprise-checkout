import {
  AccountDetailsContent,
  BillingDetailsContent,
  BillingDetailsSuccessContent,
  PlanDetailsContent,
  PlanDetailsLoginContent,
  PlanDetailsRegisterContent,
} from '@/components/Stepper/StepperContent';
import { useCurrentPage } from '@/hooks/useCurrentStep';

const StepperContentByPage = {
  PlanDetails: PlanDetailsContent,
  PlanDetailsLogin: PlanDetailsLoginContent,
  PlanDetailsRegister: PlanDetailsRegisterContent,
  AccountDetails: AccountDetailsContent,
  BillingDetails: BillingDetailsContent,
  BillingDetailsSuccess: BillingDetailsSuccessContent,
} as { [K in CheckoutPage]: React.FC };

const useStepperContent = () => {
  const currentPage = useCurrentPage();
  return currentPage ? StepperContentByPage[currentPage] : undefined;
};

export default useStepperContent;
