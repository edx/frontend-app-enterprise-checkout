import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { useContext, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { RegistrationDisclaimer } from '@/components/Disclaimer';
import { RegisterAccountFields } from '@/components/FormFields';
import { CHECKOUT_STEPS, PLAN_TYPE, TRACKING_EVENT_NAMES } from '@/constants/tracking';
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
        eventName: TRACKING_EVENT_NAMES.CHECKOUT_PAGE_VIEW,
        properties: {
          step: CHECKOUT_STEPS.REGISTRATION,
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
