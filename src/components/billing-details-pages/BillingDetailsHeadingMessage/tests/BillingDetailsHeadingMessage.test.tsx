import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { usePolledAuthenticatedUser, usePolledCheckoutIntent } from '@/components/app/data';

import BillingDetailsHeadingMessage from '../BillingDetailsHeadingMessage';

// Mock the hooks
jest.mock('@/components/app/data', () => ({
  usePolledCheckoutIntent: jest.fn(),
  usePolledAuthenticatedUser: jest.fn(),
}));

const mockUsePolledCheckoutIntent = usePolledCheckoutIntent as jest.MockedFunction<typeof usePolledCheckoutIntent>;
const mockUsePolledAuthenticatedUser = (
  usePolledAuthenticatedUser as jest.MockedFunction<typeof usePolledAuthenticatedUser>
);

describe('BillingDetailsHeadingMessage', () => {
  const renderComponent = () => render(
    <IntlProvider locale="en">
      <BillingDetailsHeadingMessage />
    </IntlProvider>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the celebration image', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({
      polledCheckoutIntent: { state: 'fulfilled' },
    } as any);
    mockUsePolledAuthenticatedUser.mockReturnValue({
      polledAuthenticatedUser: { isActive: true },
    } as any);

    renderComponent();
    const image = screen.getByRole('img');

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Celebration of subscription purchase success');
    expect(image).toHaveClass('img-fluid');
  });

  it('renders SuccessHeading when checkout is fulfilled and user is active', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({
      polledCheckoutIntent: { state: 'fulfilled' },
    } as any);
    mockUsePolledAuthenticatedUser.mockReturnValue({
      polledAuthenticatedUser: { isActive: true },
    } as any);

    renderComponent();
    expect(screen.getByText(/Welcome to edX for Teams!/)).toBeInTheDocument();
    expect(screen.getByText(/Go to your administrator dashboard/)).toBeInTheDocument();
  });

  it('renders PendingHeading when checkout is paid and user is active', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({
      polledCheckoutIntent: { state: 'paid' },
    } as any);
    mockUsePolledAuthenticatedUser.mockReturnValue({
      polledAuthenticatedUser: { isActive: true },
    } as any);

    renderComponent();
    expect(screen.getByText(/Welcome to edX for Teams!/)).toBeInTheDocument();
    expect(screen.getByText(/Your account is currently being configured/)).toBeInTheDocument();
  });

  it('renders ErrorHeading when checkout is errored and user is active', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({
      polledCheckoutIntent: { state: 'errored_provisioning' },
    } as any);
    mockUsePolledAuthenticatedUser.mockReturnValue({
      polledAuthenticatedUser: { isActive: true },
    } as any);

    renderComponent();
    expect(screen.getByText(/Account Setup is Taking Longer Than Expected/)).toBeInTheDocument();
    expect(screen.getByText(/We're experiencing a brief delay/)).toBeInTheDocument();
  });

  it('renders InactiveUserHeading when user is inactive regardless of checkout state', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({
      polledCheckoutIntent: { state: 'fulfilled' },
    } as any);
    mockUsePolledAuthenticatedUser.mockReturnValue({
      polledAuthenticatedUser: { isActive: false },
    } as any);

    renderComponent();
    expect(screen.getByText(/Please check your email to complete the account confirmation process/)).toBeInTheDocument();
  });

  it('renders InactiveUserHeading for inactive user even when paid', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({
      polledCheckoutIntent: { state: 'paid' },
    } as any);
    mockUsePolledAuthenticatedUser.mockReturnValue({
      polledAuthenticatedUser: { isActive: false },
    } as any);

    renderComponent();
    expect(screen.getByText(/Please check your email to complete the account confirmation process/)).toBeInTheDocument();
    expect(screen.queryByText(/Your account is currently being configured/)).not.toBeInTheDocument();
  });

  it('renders nothing when checkout intent state is null', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({
      polledCheckoutIntent: { state: null },
    } as any);
    mockUsePolledAuthenticatedUser.mockReturnValue({
      polledAuthenticatedUser: { isActive: true },
    } as any);

    renderComponent();
    // Should only render the image, no heading text
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByText(/Welcome to edX for Teams!/)).not.toBeInTheDocument();
  });

  it('renders nothing when checkout intent is undefined', () => {
    mockUsePolledCheckoutIntent.mockReturnValue({
      polledCheckoutIntent: undefined,
    } as any);
    mockUsePolledAuthenticatedUser.mockReturnValue({
      polledAuthenticatedUser: { isActive: true },
    } as any);

    renderComponent();
    // Should only render the image, no heading text
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByText(/Welcome to edX for Teams!/)).not.toBeInTheDocument();
  });
});
