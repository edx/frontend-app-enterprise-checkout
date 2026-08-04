import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { ExternalLink } from '@/components/ExternalLink';

const RegistrationDisclaimer = () => {
  const { TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } = getConfig();
  return (
    <p className="h4 font-weight-light mt-2 mb-3">
      <FormattedMessage
        id="checkout.registration.disclaimer"
        defaultMessage="By creating an account, you agree to the {termsAndHonorLink} and you acknowledge that edX and each Member process your personal data in accordance with the {privacyPolicyLink}."
        description="Registration disclaimer text with links to terms of service, honor code, and privacy policy"
        values={{
          termsAndHonorLink: (
            <ExternalLink
              href={TERMS_OF_SERVICE_URL}
            >
              <FormattedMessage
                id="checkout.registration.disclaimer.termsOfServiceAndHonorCode"
                defaultMessage="Terms of Service and Honor Code"
                description="Link text for Terms of Service and HonorCode in registration disclaimer"
              />
            </ExternalLink>
          ),
          privacyPolicyLink: (
            <ExternalLink
              href={PRIVACY_POLICY_URL}
            >
              <FormattedMessage
                id="checkout.registration.disclaimer.privacyPolicy"
                defaultMessage="Privacy Policy"
                description="Link text for Privacy Policy in registration disclaimer"
              />
            </ExternalLink>
          ),
        }}
      />
    </p>
  );
};

export default RegistrationDisclaimer;
