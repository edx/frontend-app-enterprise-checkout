import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
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
        throw new Error("Oopsie! reCAPTCHA didn't return a token.");
      }
      return token;
    }

    // Fallback: no reCAPTCHA or not ready
    if (RECAPTCHA_SITE_KEY_WEB) {
      // eslint-disable-next-line no-console
      console.warn(`reCAPTCHA not ready for action: ${actionName}. Proceeding without token.`);
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
