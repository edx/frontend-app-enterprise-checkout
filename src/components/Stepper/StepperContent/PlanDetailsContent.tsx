import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import { AuthenticatedUserField, LicensesField, NameAndEmailFields } from '@/components/FormFields';
import { PriceAlert } from '@/components/PriceAlert';

import type { UseFormReturn } from 'react-hook-form';

/**
 * Props for the PlanDetailsContent component.
 */
interface PlanDetailsContentProps {
  /** React Hook Form instance used to register and control the fields shown on this step. */
  form: UseFormReturn<PlanDetailsData>;
}

/**
 * Renders the content for the Plan Details step, including:
 * - Price alert
 * - Licenses field
 * - Either authenticated user read-only fields or name/email inputs for guests
 *
 * The choice between authenticated or guest fields is determined by the
 * authenticated user present in the AppContext.
 */
const PlanDetailsContent = ({ form }: PlanDetailsContentProps) => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return (
    <>
      <PriceAlert />
      <LicensesField form={form} />
      {authenticatedUser
        ? (
          <AuthenticatedUserField
            adminEmail={authenticatedUser.email}
            fullName={authenticatedUser.name || authenticatedUser.username}
          />
        )
        : (<NameAndEmailFields form={form} />)}
    </>
  );
};

export default PlanDetailsContent;
