import { getConfig } from '@edx/frontend-platform';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { useCallback, useMemo } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export const RECAPTCHA_STATUS = {
  READY: 'ready',
  LOADING: 'loading',
  DISABLED: 'disabled',
  ERRORED: 'error',
} as const;
export type RecaptchaStatus = typeof RECAPTCHA_STATUS[keyof typeof RECAPTCHA_STATUS];

export const RECAPTCHA_ACTIONS = {
  SUBMIT: 'submit',
} as const;
export type KnownRecaptchaAction = typeof RECAPTCHA_ACTIONS[keyof typeof RECAPTCHA_ACTIONS];
export type RecaptchaAction = KnownRecaptchaAction | (string & {});

const MSG = {
  NOT_READY: (action: RecaptchaAction) => `reCAPTCHA not ready for action: ${action}. Proceeding without token.`,
  TOKEN_FAIL: (action: RecaptchaAction) => `Failed to obtain reCAPTCHA verification token for action: ${action}.
  Please try again or contact support if the issue persists.`,
  EXEC_FAIL: 'Failed to execute reCAPTCHA',
} as const;

/** Return type of the hook */
export interface UseRecaptchaTokenResult {
  getToken: () => Promise<string | null>;
  status: RecaptchaStatus;
  /** Convenience booleans */
  isReady: boolean;
  isLoading: boolean;
}

const DEFAULT_ACTION: KnownRecaptchaAction = RECAPTCHA_ACTIONS.SUBMIT;

const useRecaptchaToken = (actionName: RecaptchaAction = DEFAULT_ACTION): UseRecaptchaTokenResult => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { RECAPTCHA_SITE_KEY_WEB } = getConfig();

  const status: RecaptchaStatus = useMemo(() => {
    if (!RECAPTCHA_SITE_KEY_WEB) { return RECAPTCHA_STATUS.DISABLED; }
    if (!executeRecaptcha) { return RECAPTCHA_STATUS.LOADING; }
    return RECAPTCHA_STATUS.READY;
  }, [RECAPTCHA_SITE_KEY_WEB, executeRecaptcha]);

  const executeWithFallback = useCallback(async () => {
    if (status === RECAPTCHA_STATUS.READY) {
      const token = await executeRecaptcha!(actionName);
      if (!token) {
        throw new Error(MSG.TOKEN_FAIL(actionName));
      }
      return token;
    }

    // Fallback: site key exists but recaptcha not initialized yet, or disabled
    if (status !== RECAPTCHA_STATUS.DISABLED) {
      logInfo(MSG.NOT_READY(actionName));
    }
    return null;
  }, [status, executeRecaptcha, actionName]);

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      return await executeWithFallback();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? MSG.EXEC_FAIL;
      logError(message);
      return null;
    }
  }, [executeWithFallback]);

  return {
    getToken,
    status,
    isReady: status === RECAPTCHA_STATUS.READY,
    isLoading: status === RECAPTCHA_STATUS.LOADING,
  };
};

export default useRecaptchaToken;
