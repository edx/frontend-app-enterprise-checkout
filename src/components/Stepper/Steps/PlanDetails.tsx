import { getConfig } from '@edx/frontend-platform/config';
import { ReactElement } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import PlanDetailsPage from '@/components/plan-details-pages/PlanDetailsPage';

const PlanDetails = (): ReactElement => {
  const { RECAPTCHA_SITE_KEY_WEB } = getConfig();
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY_WEB}
      useEnterprise
    >
      <PlanDetailsPage />
    </GoogleReCaptchaProvider>
  );
};

export default PlanDetails;
