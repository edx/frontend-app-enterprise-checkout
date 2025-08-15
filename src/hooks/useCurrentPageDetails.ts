import { CheckoutPageDetails } from '@/constants/checkout';
import useCurrentPage from '@/hooks/useCurrentPage';

function useCurrentPageDetails() {
  const currentPage = useCurrentPage();
  // Return an object with empty values instead of null to avoid TypeScript errors
  const emptyDetails: CheckoutPageDetails = {
    step: 'PlanDetails',
    substep: undefined,
    route: '',
    title: {},
    buttonMessage: null,
  };
  return currentPage ? CheckoutPageDetails[currentPage] : emptyDetails;
}

export default useCurrentPageDetails;
