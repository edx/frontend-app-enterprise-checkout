import { Stack } from '@openedx/paragon';

import { DataPrivacyPolicyField, StripeFormFields } from '@/components/FormFields';

const BillingDetailsContent = () => (
  <Stack gap={4}>
    <StripeFormFields />
    <DataPrivacyPolicyField />
  </Stack>
);

export default BillingDetailsContent;
