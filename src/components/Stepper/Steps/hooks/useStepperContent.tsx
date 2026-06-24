import {
  AccountDetailsContent,
  BillingDetailsContent,
  BillingDetailsSuccessContent,
  PlanDetailsContent,
  PlanDetailsLoginContent,
  PlanDetailsRegisterContent,
} from '@/components/Stepper/StepperContent';
import useCurrentPage from '@/hooks/useCurrentPage';

// Define a generic type for components that can accept a form prop
type StepperContentComponent = React.FC<{ form?: any }>;

const EmptyContent: StepperContentComponent = () => null;

const StepperContentByPage = {
  PlanDetails: PlanDetailsContent,
  PlanDetailsLogin: PlanDetailsLoginContent,
  PlanDetailsRegister: PlanDetailsRegisterContent,
  AccountDetails: AccountDetailsContent,
  BillingDetails: BillingDetailsContent,
  BillingDetailsSuccess: BillingDetailsSuccessContent,
} as { [K in CheckoutPage]: StepperContentComponent };

const useStepperContent = (): StepperContentComponent => {
  const currentPage = useCurrentPage();
  const resolved = currentPage ? StepperContentByPage[currentPage] : undefined;

  return resolved ?? EmptyContent;
};

export default useStepperContent;
