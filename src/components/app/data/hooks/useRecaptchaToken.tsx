import { getConfig } from '@edx/frontend-platform';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const useRecaptchaToken = (actionName = 'submit') => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { RECAPTCHA_SITE_KEY_WEB } = getConfig();

  const isLoading = !(executeRecaptcha || RECAPTCHA_SITE_KEY_WEB);
  const isReady = !!executeRecaptcha && RECAPTCHA_SITE_KEY_WEB;

  const executeWithFallback = useCallback(async () => {
    if (isReady) {
      const token = await executeRecaptcha(actionName);
      if (!token) {
        throw new Error(`Failed to obtain reCAPTCHA verification token for action: ${actionName}. Please try again or contact support if the issue persists.`);
      }
      return token;
    }

    // Fallback: no reCAPTCHA or not ready
    if (RECAPTCHA_SITE_KEY_WEB) {
      logInfo(`reCAPTCHA not ready for action: ${actionName}. Proceeding without token.`);
    }
    return null;
  }, [isReady, RECAPTCHA_SITE_KEY_WEB, executeRecaptcha, actionName]);

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      return await executeWithFallback();
    } catch (err: any) {
      logError(err?.message || 'Failed to execute reCAPTCHA');
      return null;
    }
  }, [executeWithFallback]);

  return {
    getToken,
    isReady,
    isLoading,
  };
};

export default useRecaptchaToken;
