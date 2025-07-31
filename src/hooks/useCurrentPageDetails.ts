import { CheckoutPageDetails } from '@/components/Stepper/constants';
import useCurrentPage from '@/hooks/useCurrentPage';

function useCurrentPageDetails() {
  const currentPage = useCurrentPage();
  return currentPage ? CheckoutPageDetails[currentPage] : null;
}

export default useCurrentPageDetails;
