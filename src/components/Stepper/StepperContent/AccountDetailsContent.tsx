import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import { AuthenticatedUserField,
  CompanyNameField,
  CustomUrlField } from '@/components/FormFields';

import type { UseFormReturn } from 'react-hook-form';

interface AccountDetailsContentProps {
  form: UseFormReturn<AccountDetailsData>;
}

const AccountDetailsContent = ({ form }: AccountDetailsContentProps) => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return (
    <>
      {authenticatedUser
            && (
              <AuthenticatedUserField
                adminEmail={authenticatedUser.email}
                fullName={authenticatedUser.name || authenticatedUser.username}
              />
            ) }
      <CompanyNameField form={form} />
      <CustomUrlField form={form} />
    </>
  );
};

export default AccountDetailsContent;
