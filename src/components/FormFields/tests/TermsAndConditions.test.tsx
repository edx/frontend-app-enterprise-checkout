import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import TermsAndConditions from '../TermsAndConditions';

describe('TermsAndConditions', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <TermsAndConditions />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('edX Enterprise Terms');
  });

  it('renders the description correctly', () => {
    renderComponent();
    validateText((content) => content.includes('By subscribing,'));
    validateText((content) => content.includes('linked below.'));
  });
});
