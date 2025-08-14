import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import { AuthenticatedUserField, LicensesField, NameAndEmailFields } from '@/components/FormFields';
import { PriceAlert } from '@/components/PriceAlert';

import type { UseFormReturn } from 'react-hook-form';

interface PlanDetailsContentProps {
  form: UseFormReturn<PlanDetailsData>;
}

const PlanDetailsContent = ({ form }: PlanDetailsContentProps) => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return (
    <>
      <PriceAlert />
      <LicensesField form={form} />
      {authenticatedUser
        ? (<AuthenticatedUserField 
             adminEmail={authenticatedUser.email}
             fullName={authenticatedUser.name || authenticatedUser.username}
           />)
        : (<NameAndEmailFields form={form} />)}
    </>
  );
};

export default PlanDetailsContent;
