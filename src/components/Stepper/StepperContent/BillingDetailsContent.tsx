import { Stack } from '@openedx/paragon';

import { StripeFormFields, TermsAndConditions } from '@/components/FormFields';

const BillingDetailsContent = () => (
  <Stack gap={4}>
    <StripeFormFields />
    <TermsAndConditions />
  </Stack>
);

export default BillingDetailsContent;
