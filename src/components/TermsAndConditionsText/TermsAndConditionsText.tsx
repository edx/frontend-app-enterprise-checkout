import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const TermsAndConditionsText = () => {
  const { TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } = getConfig();

  return (
    <div className="mt-3 mb-0">
      <p style={{ fontSize: '20px' }}>
        <FormattedMessage
          id="checkout.planDetails.termsAndConditions"
          defaultMessage="By submitting your info in the form above, you agree to our {termsOfUseLink} and {privacyNoticeLink}. We may use this info to contact you and/or use data from third parties to personalize your experience"
          description="Terms and conditions text for plan details form"
          values={{
            termsOfUseLink: (
              <a
                href={TERMS_OF_SERVICE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Use
              </a>
            ),
            privacyNoticeLink: (
              <a
                href={PRIVACY_POLICY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Notice
              </a>
            ),
          }}
        />
      </p>
    </div>
  );
};

export default TermsAndConditionsText;
