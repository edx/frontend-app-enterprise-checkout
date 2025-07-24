import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import DataPrivacyPolicyField from '../DataPrivacyPolicyField';

describe('DataPrivacyPolicyField', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <DataPrivacyPolicyField />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    expect(screen.getByText('Data Privacy Policy and Master Service Agreement')).toBeInTheDocument();
  });

  it('renders the description correctly', () => {
    renderComponent();
    expect(screen.getByText((content) => content.includes('By clicking "Purchase now", you agree to edX for Enterprise Data'))).toBeInTheDocument();

    expect(screen.getByText((content) => content.includes('Privacy Policy and Master Service Agreement and authorize the recurring charge'))).toBeInTheDocument();
  });
});
