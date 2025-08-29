import { useIntl } from '@edx/frontend-platform/i18n';

import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore, useCurrentPageDetails } from '@/hooks/index';

const StepperTitle = () => {
  const {
    title: pageTitle,
  } = useCurrentPageDetails();
  const intl = useIntl();
  const { fullName } = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  return (
    <h1 className="text-center p-3 mb-4" data-testid="stepper-title">
      {intl.formatMessage(pageTitle, { firstName: fullName })}
    </h1>
  );
};

export default StepperTitle;
