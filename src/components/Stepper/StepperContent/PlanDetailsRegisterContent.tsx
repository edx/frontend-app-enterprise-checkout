import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { useContext, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { RegistrationDisclaimer } from '@/components/Disclaimer';
import { RegisterAccountFields } from '@/components/FormFields';
import { CheckoutSubstepKey } from '@/constants/checkout';
import EVENT_NAMES, { PLAN_TYPE } from '@/constants/events';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

interface PlanDetailsRegisterContentProps {
  form: UseFormReturn<PlanDetailsData>;
}

const PlanDetailsRegisterContent = ({ form }: PlanDetailsRegisterContentProps) => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: bffContext } = useBFFContext(authenticatedUser?.userId || null);
  const checkoutIntentId = bffContext?.checkoutIntent?.id || null;

  // Fire page view tracking event on component mount
  useEffect(() => {
    try {
      sendEnterpriseCheckoutTrackingEvent({
        checkoutIntentId,
        eventName: EVENT_NAMES.SUBSCRIPTION_CHECKOUT.CHECKOUT_PAGE_VIEWED,
        properties: {
          step: CheckoutSubstepKey.Register,
          plan_type: PLAN_TYPE.TEAMS,
        },
      });
    } catch (error) {
      logError('Failed to send page view tracking event for Registration', error);
    }
  }, [checkoutIntentId]);

  return (
    <>
      <RegisterAccountFields form={form} />
      <RegistrationDisclaimer />
    </>
  );
};

export default PlanDetailsRegisterContent;
