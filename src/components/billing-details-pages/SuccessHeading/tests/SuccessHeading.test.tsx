import { getConfig } from '@edx/frontend-platform/config';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import SuccessHeading from '../SuccessHeading';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

describe('SuccessHeading', () => {
  const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;

  beforeEach(() => {
    mockGetConfig.mockReturnValue({
      LMS_BASE_URL: 'https://lms.example.com',
    });
  });

  const renderComponent = () => render(
    <IntlProvider locale="en">
      <SuccessHeading />
    </IntlProvider>,
  );

  it('renders the welcome message correctly', () => {
    renderComponent();
    validateText((content: string | string[]) => content.includes('Welcome to edX for teams!'));
    validateText((content: string | string[]) => content.includes('Go to your administrator dashboard'));
  });

  it('renders the celebration image', () => {
    renderComponent();
    expect(screen.getByAltText('Celebration of subscription purchase success')).toBeInTheDocument();
  });

  it('renders the dashboard button when URL is valid', () => {
    renderComponent();
    const button = screen.getByRole('link', { name: 'Go To Dashboard' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', 'https://lms.example.com/dashboard');
  });
});
