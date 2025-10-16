import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';

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
            <Hyperlink
              destination={TERMS_OF_SERVICE_URL}
              target="_blank"
              showLaunchIcon={false}
              role="link"
            >
              <FormattedMessage
                id="checkout.registration.disclaimer.termsOfServiceAndHonorCode"
                defaultMessage="Terms of Service and Honor Code"
                description="Link text for Terms of Service and HonorCode in registration disclaimer"
              />
            </Hyperlink>
          ),
          privacyPolicyLink: (
            <Hyperlink
              destination={PRIVACY_POLICY_URL}
              target="_blank"
              showLaunchIcon={false}
              role="link"
            >
              <FormattedMessage
                id="checkout.registration.disclaimer.privacyPolicy"
                defaultMessage="Privacy Policy"
                description="Link text for Privacy Policy in registration disclaimer"
              />
            </Hyperlink>
          ),
        }}
      />
    </p>
  );
};

export default RegistrationDisclaimer;
