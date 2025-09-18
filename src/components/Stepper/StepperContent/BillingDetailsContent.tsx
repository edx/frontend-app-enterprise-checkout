import { Stack } from '@openedx/paragon';

import { TermsAndConditions } from '@/components/billing-details-pages/TermsAndConditions';
import { BillingDetailsDisclaimer } from '@/components/Disclaimer';
import { StripeFormFields } from '@/components/FormFields';

import type { UseFormReturn } from 'react-hook-form';

interface BillingDetailsContentProps {
  form: UseFormReturn<BillingDetailsData>;
}

const BillingDetailsContent = ({ form }: BillingDetailsContentProps) => (
  <Stack gap={4}>
    <StripeFormFields />
    <TermsAndConditions form={form} />
    <BillingDetailsDisclaimer />
  </Stack>
);

export default BillingDetailsContent;
