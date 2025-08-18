import {
  CompanyNameField,
  CustomUrlField,
} from '@/components/FormFields';

import type { UseFormReturn } from 'react-hook-form';

interface AccountDetailsContentProps {
  form: UseFormReturn<AccountDetailsData>;
}

const AccountDetailsContent = ({ form }: AccountDetailsContentProps) => (
  <>
    <CompanyNameField form={form} />
    <CustomUrlField form={form} />
  </>
);

export default AccountDetailsContent;
