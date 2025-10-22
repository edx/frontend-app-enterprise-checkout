import { getConfig } from '@edx/frontend-platform';
import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const useRecaptchaSubmission = (actionName = 'submit') => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { RECAPTCHA_SITE_WEB_KEY } = getConfig();

  const isLoading = !(executeRecaptcha || RECAPTCHA_SITE_WEB_KEY);
  const isReady = !!executeRecaptcha && RECAPTCHA_SITE_WEB_KEY;

  const executeWithFallback = useCallback(async () => {
    if (isReady) {
      const token = await executeRecaptcha(actionName);
      if (!token) {
        throw new Error("Oopsie! reCAPTCHA didn't return a token.");
      }
      return token;
    }

    // Fallback: no reCAPTCHA or not ready
    if (RECAPTCHA_SITE_WEB_KEY) {
      // eslint-disable-next-line no-console
      console.warn(`reCAPTCHA not ready for action: ${actionName}. Proceeding without token.`);
    }
    return null;
  }, [isReady, RECAPTCHA_SITE_WEB_KEY, executeRecaptcha, actionName]);

  return {
    executeWithFallback,
    isReady,
    isLoading,
  };
};

export default useRecaptchaSubmission;
