import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import UserMenu from '@/components/Header/UserMenu/UserMenu';
import { queryClient } from '@/utils/tests';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    LMS_BASE_URL: 'https://lms.example.com',
    LOGOUT_URL: 'https://lms.example.com/logout',
    ACCOUNT_PROFILE_URL: 'https://profiles.example.com',
    ACCOUNT_SETTINGS_URL: 'https://account.example.com/settings',
  }),
}));

const renderUserMenu = (user: AuthenticatedUser) => (
  render(
    <IntlProvider locale="en">
      <QueryClientProvider client={queryClient()}>
        <UserMenu user={user} />
      </QueryClientProvider>
    </IntlProvider>,
  )
);

describe('UserMenu', () => {
  const baseUser: AuthenticatedUser = {
    userId: 1,
    username: 'alice',
    name: 'Alice Example',
    email: 'alice@example.com',
    roles: [],
    administrator: false,
  } as any;

  it('renders the avatar toggle with username label', async () => {
    renderUserMenu(baseUser);
    const toggle = screen.getByRole('button', { name: /alice/i });
    expect(toggle).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('shows name and email in the dropdown header meta', async () => {
    renderUserMenu(baseUser);
    await userEvent.click(screen.getByRole('button', { name: /alice/i }));

    expect(screen.getByTestId('user-full-name')).toHaveTextContent('Alice Example');
    expect(screen.getByTestId('user-email')).toHaveTextContent('alice@example.com');
  });

  it('links to profile, account and logout with correct hrefs', async () => {
    renderUserMenu(baseUser);
    await userEvent.click(screen.getByRole('button', { name: /alice/i }));

    const profile = screen.getByTestId('user-profile-link');
    const account = screen.getByTestId('user-account-link');
    const logout = screen.getByTestId('user-logout-link');

    expect(profile).toHaveAttribute('href', 'https://profiles.example.com/u/alice');
    expect(account).toHaveAttribute('href', 'https://account.example.com/settings');
    expect(logout).toHaveAttribute('href', 'https://lms.example.com/logout');
  });

  it('falls back to username when name is missing', async () => {
    const user = { ...baseUser, name: '' } as AuthenticatedUser;
    renderUserMenu(user);
    await userEvent.click(screen.getByRole('button', { name: /alice/i }));
    expect(screen.getByTestId('user-full-name')).toHaveTextContent('alice');
  });
});
