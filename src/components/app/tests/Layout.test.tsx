import { getConfig } from '@edx/frontend-platform/config';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import Layout from '../Layout';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@/components/Header/Header', () => {
  const MockHeader = () => <div data-testid="header" />;
  return MockHeader;
});
jest.mock('../../Footer', () => {
  const MockFooter = () => <div data-testid="footer" />;
  return { Footer: MockFooter };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: jest.fn().mockImplementation(() => <div data-testid="outlet" />),
  ScrollRestoration: jest.fn().mockImplementation(() => <div data-testid="scroll-restoration" />),
}));

const mockGetConfig = getConfig as jest.Mock;

const baseConfig = {
  IS_MAINTENANCE_ALERT_ENABLED: true,
  MAINTENANCE_ALERT_MESSAGE: 'Scheduled maintenance in progress.',
  MAINTENANCE_ALERT_START_TIMESTAMP: null,
  MAINTENANCE_ALERT_END_TIMESTAMP: null,
};

const renderLayout = (configOverrides = {}) => {
  mockGetConfig.mockReturnValue({
    ...baseConfig,
    ...configOverrides,
  });

  return render(
    <IntlProvider locale="en">
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    </IntlProvider>,
  );
};

describe('Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the system-wide warning banner when banner data exists', () => {
    renderLayout();
    expect(screen.getByText('Scheduled maintenance in progress.')).toBeInTheDocument();
  });

  it.each([
    {
      scenario: 'config is null',
      config: null,
    },
    {
      scenario: 'enabled is false',
      config: {
        IS_MAINTENANCE_ALERT_ENABLED: false,
      },
    },
    {
      scenario: 'message is null',
      config: {
        MAINTENANCE_ALERT_MESSAGE: null,
      },
    },
    {
      scenario: 'message is empty',
      config: {
        MAINTENANCE_ALERT_MESSAGE: '',
      },
    },
  ])('does not render the banner when $scenario', ({ config }) => {
    if (config === null) {
      mockGetConfig.mockReturnValue(null);
      render(
        <IntlProvider locale="en">
          <MemoryRouter>
            <Layout />
          </MemoryRouter>
        </IntlProvider>,
      );
    } else {
      renderLayout(config);
    }

    expect(screen.queryByText('Scheduled maintenance in progress.')).not.toBeInTheDocument();
  });
});
