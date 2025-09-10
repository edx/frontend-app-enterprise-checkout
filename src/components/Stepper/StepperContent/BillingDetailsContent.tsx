import { Stack } from '@openedx/paragon';

import { StripeFormFields, TermsAndConditions } from '@/components/FormFields';

import type { UseFormReturn } from 'react-hook-form';

interface BillingDetailsContentProps {
  form: UseFormReturn<BillingDetailsData>;
}

const BillingDetailsContent = ({ form }: BillingDetailsContentProps) => (
  <Stack gap={4}>
    <StripeFormFields />
    <TermsAndConditions form={form} />
  </Stack>
);

export default BillingDetailsContent;
