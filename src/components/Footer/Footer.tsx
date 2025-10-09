import { getConfig } from '@edx/frontend-platform/config';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { Container, Hyperlink, Image } from '@openedx/paragon';
import { MessageDescriptor } from 'react-intl';
import { Link } from 'react-router-dom';

import blackEdxLogo from '@/assets/images/edx-enterprise-black.svg';

const footerMessages: Record<string, MessageDescriptor> = defineMessages({
  terms: {
    id: 'footer.terms',
    defaultMessage: 'Terms of Service',
    description: 'Link to edX terms of service page.',
  },
  privacy: {
    id: 'footer.privacy',
    defaultMessage: 'Privacy policy',
    description: 'Link to edX privacy policy.',
  },
  support: {
    id: 'footer.support',
    defaultMessage: 'Support',
    description: 'Link to edX support page.',
  },
});

const Footer: React.FC = () => {
  const intl = useIntl();
  const { CONTACT_SUPPORT_URL, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } = getConfig();

  return (
    <footer className="footer pb-3">
      <hr className="mt-0" />
      <Container size="lg" className="py-3">
        <div className="text-right text-gray-300">
          <Link className="float-left" to="/">
            <Image
              src={blackEdxLogo}
              alt="edX for Business logo"
              style={{ maxWidth: 200 }}
              fluid
            />
          </Link>
          <Hyperlink className="text-gray-400" destination={TERMS_OF_SERVICE_URL} target="_blank" showLaunchIcon={false}>
            {intl.formatMessage(footerMessages.terms)}
          </Hyperlink>
          <span className="mx-3">|</span>
          <Hyperlink className="text-gray-400" destination={PRIVACY_POLICY_URL} target="_blank" showLaunchIcon={false}>
            {intl.formatMessage(footerMessages.privacy)}
          </Hyperlink>
          <span className="mx-3">|</span>
          <Hyperlink className="text-gray-400" destination={CONTACT_SUPPORT_URL} target="_blank" showLaunchIcon={false}>
            {intl.formatMessage(footerMessages.support)}
          </Hyperlink>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
