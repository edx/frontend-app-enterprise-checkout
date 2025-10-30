import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import Header from '@/components/Header/Header';
import { queryClient } from '@/utils/tests';

const renderHeader = (appContextValue: any) => (
  render(
    <IntlProvider locale="en">
      <QueryClientProvider client={queryClient()}>
        <AppContext.Provider value={appContextValue}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </AppContext.Provider>
      </QueryClientProvider>
    </IntlProvider>,
  )
);

describe('Header', () => {
  it('renders the brand logo linking to home', () => {
    renderHeader({ config: {}, authenticatedUser: null });

    const brand = screen.getByTestId('header-brand');
    expect(brand).toBeInTheDocument();

    // Image alt text
    expect(screen.getByAltText('edX for Business logo')).toBeInTheDocument();

    // Link href should be '/'
    const link = brand.querySelector('a');
    expect(link).toBeTruthy();
    expect(link!.getAttribute('href')).toBe('/');
  });

  it('does not render the user menu when unauthenticated', () => {
    renderHeader({ config: {}, authenticatedUser: null });
    expect(screen.queryByTestId('header-user-menu')).not.toBeInTheDocument();
  });

  it('renders the user menu when authenticated and shows username on the toggle', async () => {
    const user = {
      userId: 1,
      username: 'alice',
      name: 'Alice Example',
      email: 'alice@example.com',
      roles: [],
      administrator: false,
    };

    renderHeader({ config: {}, authenticatedUser: user });

    expect(screen.getByTestId('header-user-menu')).toBeInTheDocument();

    // The avatar toggle should be present with the username label
    const toggle = screen.getByRole('button', { name: /alice/i });
    expect(toggle).toBeInTheDocument();
  });
});
