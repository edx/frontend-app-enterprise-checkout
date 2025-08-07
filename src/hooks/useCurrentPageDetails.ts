import { CheckoutPageDetails } from '@/components/Stepper/constants';
import useCurrentPage from '@/hooks/useCurrentPage';

function useCurrentPageDetails() {
  const currentPage = useCurrentPage();
  // Return an object with empty values instead of null to avoid TypeScript errors
  return currentPage ? CheckoutPageDetails[currentPage] : {
    step: 'PlanDetails',
    substep: undefined,
    route: '',
    title: {},
    buttonMessage: null,
  };
}

export default useCurrentPageDetails;
