import {
  AcademicSelectionContent,
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

const StepperContentByPage = {
  AcademicSelection: AcademicSelectionContent,
  PlanDetails: PlanDetailsContent,
  PlanDetailsLogin: PlanDetailsLoginContent,
  PlanDetailsRegister: PlanDetailsRegisterContent,
  AccountDetails: AccountDetailsContent,
  BillingDetails: BillingDetailsContent,
  BillingDetailsSuccess: BillingDetailsSuccessContent,
} as { [K in CheckoutPage]: StepperContentComponent };

const useStepperContent = (): StepperContentComponent => {
  const currentPage = useCurrentPage();
  // Return a default empty component if currentPage is null
  return currentPage ? StepperContentByPage[currentPage] : () => null;
};

export default useStepperContent;
