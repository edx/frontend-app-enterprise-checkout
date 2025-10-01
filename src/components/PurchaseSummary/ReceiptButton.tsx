import { Button } from '@openedx/paragon';

import { useCreateBillingPortalSession } from '@/components/app/data';

const ReceiptButton = () => {
  const { data: billingPortalSession } = useCreateBillingPortalSession();

  // TODO: Stub button
  return (
    <Button className="w-100" variant="secondary" size="lg" disabled={!billingPortalSession?.url} href={billingPortalSession?.url} target="_blank" rel="noopener noreferrer">
      View Receipt
    </Button>
  );
};

export default ReceiptButton;
