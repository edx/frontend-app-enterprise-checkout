import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import * as useBFFContextModule from '@/components/app/data/hooks/useBFFContext';
import * as useSspProductsModule from '@/components/app/data/hooks/useSspProducts';
import { DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

import EssentialsAlert from '../EssentialsAlert';

jest.mock('@/components/app/data/hooks/useSspProducts');
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    ESSENTIALS_PRODUCT_URL: 'https://business.edx.org/course-library-plans-essentials/',
    TEAMS_PRODUCT_URL: 'https://business.edx.org/course-library-plans-teams/',
  })),
}));
jest.mock('@/components/app/data/hooks/useBFFContext');
jest.mock('@/components/DisplayPrice', () => ({
  DisplayPrice: ({ value }: { value: number }) => <span>${value}</span>,
}));

const mockAuthenticatedUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  name: 'Test User',
  userId: 1,
};

const mockContextValue = {
  authenticatedUser: mockAuthenticatedUser,
};

const defaultBFFContextValue = {
  data: 149,
  isLoading: false,
  error: null,
};

const mockProductsData = [
  {
    name: 'Sustainability',
    long_name: 'Sustainability Academy',
    description: 'Sustainability strategy and imperative overview.',
    marketing_url: 'https://www.edx.org/learn/sustainability',
    thumbnail_url: 'https://example.com/sustainability.png',
    price: '149.00',
    lookup_key: 'essentials_artificial_intelligence_subscription_license_yearly', // Bound to default fallback key
    slug: 'sustainability-academy-yearly',
    course_count: 12,
  },
];

describe('EssentialsAlert Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useBFFContextModule.default as jest.Mock).mockReturnValue(defaultBFFContextValue);
    (useSspProductsModule.default as jest.Mock).mockReturnValue({ data: mockProductsData, isLoading: false });
    checkoutFormStore.setState((state) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.AcademySelection]: {},
      },
    }));
  });

  const renderComponent = (initialRoute = '/') => render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppContext.Provider value={mockContextValue as any}>
        <IntlProvider locale="en" messages={{}}>
          <EssentialsAlert />
        </IntlProvider>
      </AppContext.Provider>
    </MemoryRouter>,
  );

  describe('Rendering and Header', () => {
    it('should render the component', () => {
      renderComponent();
      expect(screen.getByText('Essentials Plan')).toBeInTheDocument();
    });

    it('should display the plan header with "Essentials Plan" title', () => {
      renderComponent();
      const header = screen.getByText('Essentials Plan');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('H3');
    });

    it('should display confirmation text with academy name', () => {
      renderComponent();
      expect(screen.getByText(/You have picked/)).toBeInTheDocument();
      const confirmationElements = screen.getAllByText(/Sustainability Academy/);
      expect(confirmationElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/as your focus area/)).toBeInTheDocument();
    });
  });

  describe('Pricing Display', () => {
    it('should display pricing information', () => {
      renderComponent();
      expect(screen.getByText(/From/)).toBeInTheDocument();
      expect(screen.getByText(/\/yr/)).toBeInTheDocument();
      expect(screen.getByText('$149')).toBeInTheDocument();
    });

    it('should display "From $149 /yr" format', () => {
      renderComponent();
      const priceSection = screen.getByText(/From/).parentElement;
      expect(priceSection?.textContent).toContain('From');
      expect(priceSection?.textContent).toContain('$149');
      expect(priceSection?.textContent).toContain('/yr');
    });

    it('should display fallback price when loading and no price data is available', () => {
      (useBFFContextModule.default as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderComponent();
      const priceElements = screen.queryAllByText(/\$149/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should display fallback price when the API fails and no price data is available', () => {
      (useBFFContextModule.default as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Unable to load price'),
      });

      renderComponent();
      const priceElements = screen.queryAllByText(/\$149/);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  describe('Academy Details Card', () => {
    it('should display selected academy name from user selection when available', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            academyName: 'AI Academy',
          },
        },
      }));

      // Force products empty to let fallback name resolve cleanly from state store
      (useSspProductsModule.default as jest.Mock).mockReturnValue({ data: [], isLoading: false });
      renderComponent();
      const academyNames = screen.getAllByText('AI Academy');
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
    });

    it('should display academy name', () => {
      renderComponent();
      const academyNames = screen.getAllByText('Sustainability Academy');
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
    });

    it('should display course count badge', () => {
      renderComponent();
      expect(screen.getByText('12 courses')).toBeInTheDocument();
    });

    it('should display "Learn more" link', () => {
      renderComponent();
      const learnMoreLink = screen.getByText('Learn more');
      expect(learnMoreLink).toBeInTheDocument();
      expect(learnMoreLink.tagName).toBe('A');
    });

    it('should display academy description', () => {
      renderComponent();
      expect(
        screen.getByText(/Sustainability strategy and imperative overview/),
      ).toBeInTheDocument();
    });
  });

  describe('External Links', () => {
    it('should have "Pick a different academy" link with correct href', () => {
      renderComponent();
      const pickDifferentLink = screen.getByText('Pick a different academy') as HTMLAnchorElement;
      expect(pickDifferentLink).toBeInTheDocument();
      expect(pickDifferentLink.href).toContain('business.edx.org/course-library-plans-essentials/');
    });

    it('should open "Pick a different academy" link in same tab', () => {
      renderComponent();
      const pickDifferentLink = screen.getByText('Pick a different academy') as HTMLAnchorElement;
      expect(pickDifferentLink.target).not.toBe('_blank');
    });

    it('should have "Switch to Teams" link with correct href', () => {
      renderComponent();
      const switchToTeamsLink = screen.getByText('Switch to Teams') as HTMLAnchorElement;
      expect(switchToTeamsLink).toBeInTheDocument();
      expect(switchToTeamsLink.href).toContain('business.edx.org/course-library-plans-teams/');
    });

    it('should have "Learn more" link with dynamic marketing URL', () => {
      renderComponent();
      const learnMoreLink = screen.getByText('Learn more') as HTMLAnchorElement;
      expect(learnMoreLink).toBeInTheDocument();
      expect(learnMoreLink.href).toBe('https://www.edx.org/learn/sustainability');
    });
  });

  describe('Footer Upsell Section', () => {
    it('should display upsell message', () => {
      renderComponent();
      expect(
        screen.getByText(/Need to upskill your team in more than one focus area/),
      ).toBeInTheDocument();
    });

    it('should display "Switch to Teams" link in footer', () => {
      renderComponent();
      const switchLink = screen.getByText('Switch to Teams');
      expect(switchLink).toBeInTheDocument();
    });

    it('should have correct link count for external resources', () => {
      renderComponent();
      const buttons = screen.queryAllByRole('button');
      const links = screen.queryAllByRole('link');
      const totalNavigationElements = buttons.length + links.length;
      expect(totalNavigationElements).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Styling and Layout', () => {
    it('should have alert wrapper container', () => {
      const { container } = renderComponent();
      const alertDiv = container.querySelector('[class*="alert"]');
      expect(alertDiv).toBeInTheDocument();
    });

    it('should have card background for academy details', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderComponent();
      const mainHeading = screen.getByText('Essentials Plan');
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.tagName).toBe('H3');

      const academyHeadings = screen.getAllByText('Sustainability Academy');
      expect(academyHeadings.length).toBeGreaterThanOrEqual(1);
    });

    it('links should be focusable', () => {
      renderComponent();
      const buttons = screen.getAllByRole('link');
      buttons.forEach((button) => {
        expect(button).toHaveProperty('href');
      });
    });
  });

  describe('Content Completeness', () => {
    it('should display all required sections', () => {
      renderComponent();
      expect(screen.getByText('Essentials Plan')).toBeInTheDocument();
      const academyNames = screen.getAllByText('Sustainability Academy');
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('12 courses')).toBeInTheDocument();
      expect(
        screen.getByText(/Sustainability strategy and imperative overview/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Need to upskill your team in more than one focus area/),
      ).toBeInTheDocument();
    });

    it('should not have required fields missing', () => {
      renderComponent();
      const essentialsText = screen.getByText('Essentials Plan');
      const academyNames = screen.getAllByText('Sustainability Academy');
      const courseCount = screen.getByText('12 courses');
      const price = screen.getByText('$149');

      expect(essentialsText).toBeInTheDocument();
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
      expect(courseCount).toBeInTheDocument();
      expect(price).toBeInTheDocument();
    });
  });

  describe('BFF Context Integration', () => {
    it('should fetch pricing from BFF context', () => {
      renderComponent();
      expect(useBFFContextModule.default).toHaveBeenCalled();
    });

    it('should use fallback price when BFF data is null', () => {
      (useBFFContextModule.default as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      renderComponent();
      expect(screen.getByText('Essentials Plan')).toBeInTheDocument();
      const academyNames = screen.getAllByText('Sustainability Academy');
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
      const priceElements = screen.queryAllByText(/\$149/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should handle BFF context errors gracefully', () => {
      (useBFFContextModule.default as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('BFF Error'),
      });

      renderComponent();
      expect(screen.getByText('Essentials Plan')).toBeInTheDocument();
      const priceElements = screen.queryAllByText(/\$149/);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  describe('Loading State Rendering', () => {
    it('should render spinner alert when isLoading is true', () => {
      (useSspProductsModule.default as jest.Mock).mockReturnValue({ data: [], isLoading: true });
      renderComponent();

      // Use getAllByText to catch both the visible text and the screen-reader text safely
      const loadingElements = screen.getAllByText('Loading plan details...');
      expect(loadingElements.length).toBeGreaterThanOrEqual(1);

      expect(screen.queryByText('Essentials Plan')).not.toBeInTheDocument();
    });
  });
});
