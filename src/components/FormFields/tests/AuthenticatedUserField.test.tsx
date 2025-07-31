import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import AuthenticatedUserField from '../AuthenticatedUserField';

describe('AuthenticatedUserField', () => {
  const defaultProps = {
    fullName: 'John Doe',
    orgEmail: 'john.doe@example.com',
  };

  const renderComponent = (props = {}) => render(
    <IntlProvider locale="en">
      <AuthenticatedUserField {...defaultProps} {...props} />
    </IntlProvider>,
  );

  it('renders the title correctly', () => {
    renderComponent();
    validateText('Account details');
  });

  it('renders the description correctly', () => {
    renderComponent();
    validateText('Signed in as:');
  });

  it('renders the user name and email correctly', () => {
    renderComponent();
    validateText(`${defaultProps.fullName} (${defaultProps.orgEmail})`);
  });

  it('renders with custom user name and email', () => {
    const customProps = {
      fullName: 'Jane Smith',
      orgEmail: 'jane.smith@example.com',
    };
    renderComponent(customProps);
    validateText(`${customProps.fullName} (${customProps.orgEmail})`);
  });
});
