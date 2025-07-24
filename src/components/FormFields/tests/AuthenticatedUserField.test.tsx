import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText('Account details')).toBeInTheDocument();
  });

  it('renders the description correctly', () => {
    renderComponent();
    expect(screen.getByText('Signed in as:')).toBeInTheDocument();
  });

  it('renders the user name and email correctly', () => {
    renderComponent();
    expect(screen.getByText(`${defaultProps.fullName} (${defaultProps.orgEmail})`)).toBeInTheDocument();
  });

  it('renders with custom user name and email', () => {
    const customProps = {
      fullName: 'Jane Smith',
      orgEmail: 'jane.smith@example.com',
    };
    renderComponent(customProps);
    expect(screen.getByText(`${customProps.fullName} (${customProps.orgEmail})`)).toBeInTheDocument();
  });
});
