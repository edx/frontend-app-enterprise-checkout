import { defineMessages } from '@edx/frontend-platform/i18n';

import { CheckoutPageDetails } from '@/constants/checkout';
import useCurrentPage from '@/hooks/useCurrentPage';

const fallbackMessages = defineMessages({
  title: {
    id: 'checkout.fallbackPage.title',
    defaultMessage: 'Checkout',
    description: 'Fallback title used when the current checkout step/substep is unrecognized',
  },
});

function useCurrentPageDetails() {
  const currentPage = useCurrentPage();
  // Return an object with empty values instead of null to avoid TypeScript errors
  const emptyDetails: CheckoutPageDetails = {
    step: 'PlanDetails',
    substep: undefined,
    route: '',
    title: fallbackMessages.title,
    buttonMessage: null,
  };
  return currentPage ? CheckoutPageDetails[currentPage] : emptyDetails;
}

export default useCurrentPageDetails;
