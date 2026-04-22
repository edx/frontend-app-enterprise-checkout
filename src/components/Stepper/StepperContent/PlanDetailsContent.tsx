import { getConfig } from '@edx/frontend-platform/config';
import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import { isEssentialsFlow } from '@/components/app/routes/loaders/utils';
import { AuthenticatedUserField, LicensesField, NameAndEmailFields } from '@/components/FormFields';
import { EssentialsAlert } from '@/components/plan-details-pages/EssentialsAlert';
import { PriceAlert } from '@/components/plan-details-pages/PriceAlert';
import { TermsAndConditionsText } from '@/components/TermsAndConditionsText';
import { isFeatureEnabled } from '@/utils/common';

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
  const {
    FEATURE_SELF_SERVICE_PURCHASING,
    FEATURE_SELF_SERVICE_PURCHASING_KEY,
  } = getConfig();
  const isEssentials = isEssentialsFlow();
  const featureCheck = isFeatureEnabled(
    FEATURE_SELF_SERVICE_PURCHASING,
    FEATURE_SELF_SERVICE_PURCHASING_KEY,
  );
  return (
    <>
      {isEssentials && <EssentialsAlert />}
      {
        featureCheck && !isEssentials && <PriceAlert />
}
      <LicensesField form={form} />
      {authenticatedUser
        ? (
          <AuthenticatedUserField
            adminEmail={authenticatedUser.email}
            fullName={authenticatedUser.name || authenticatedUser.username}
          />
        )
        : (<NameAndEmailFields form={form} />)}

      <TermsAndConditionsText />
    </>
  );
};

export default PlanDetailsContent;
