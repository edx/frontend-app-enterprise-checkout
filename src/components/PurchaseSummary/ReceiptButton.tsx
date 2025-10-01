import { AppContext } from '@edx/frontend-platform/react';
import { Button } from '@openedx/paragon';
import { useContext } from 'react';

import useBFFSuccess from '@/components/app/data/hooks/useBFFSuccess';

const ReceiptButton = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: contextData } = useBFFSuccess(authenticatedUser.userId);
  const { checkoutIntent } = contextData ?? {};

  // TODO: Stub button
  return (
    <Button className="w-100" variant="secondary" size="lg" disabled={!checkoutIntent?.stripeCustomerId}>
      View Receipt
    </Button>
  );
};

export default ReceiptButton;
