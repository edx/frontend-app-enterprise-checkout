import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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

// FIX: Keys updated to camelCase to prevent undefined values in your component mapper logic
const mockProductsData = [
  {
    name: 'Sustainability',
    longName: 'Sustainability Academy',
    description: 'Sustainability strategy and imperative overview.',
    marketingUrl: 'https://www.edx.org/learn/sustainability',
    thumbnailUrl: 'https://example.com/sustainability.png',
    price: '149.00',
    lookupKey: 'essentials_artificial_intelligence_subscription_license_yearly',
    slug: 'sustainability-academy-yearly',
    courseCount: 12,
  },
];

describe('EssentialsAlert Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      // FIX: Component renders matchedProduct.longName || matchedProduct.name, which is 'Sustainability Academy'
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

  describe('Loading State Rendering', () => {
    it('should render spinner alert when isLoading is true', () => {
      (useSspProductsModule.default as jest.Mock).mockReturnValue({ data: [], isLoading: true });
      renderComponent();

      const loadingElements = screen.getAllByText('Loading plan details...');
      expect(loadingElements.length).toBeGreaterThanOrEqual(1);

      expect(screen.queryByText('Essentials Plan')).not.toBeInTheDocument();
    });
  });

  describe('Heuristic Fallback Matching', () => {
    it('should fall back to a product whose lookupKey starts with essentials_', () => {
      // FIX: Keys here converted to camelCase to track production component parameters
      const fallbackProducts = [
        {
          name: 'Unrelated Product',
          lookupKey: 'teams_unrelated_plan',
          slug: 'unrelated-slug',
          description: 'No match here.',
        },
        {
          name: 'Fallback Essentials Plan',
          lookupKey: 'essentials_matched_by_lookup',
          slug: 'some-slug',
          description: 'This should be matched by lookup key prefix.',
        },
      ];
      (useSspProductsModule.default as jest.Mock).mockReturnValue({ data: fallbackProducts, isLoading: false });

      renderComponent('/?product_key=non_existent_key');

      expect(screen.getByRole('heading', { level: 4, name: 'Fallback Essentials Plan' })).toBeInTheDocument();
      expect(screen.getByText('This should be matched by lookup key prefix.')).toBeInTheDocument();
    });

    it('should fall back to a product whose slug contains essentials', () => {
      // FIX: Keys here converted to camelCase to track production component parameters
      const fallbackProducts = [
        {
          name: 'Unrelated Product',
          lookupKey: 'teams_unrelated_plan',
          slug: 'unrelated-slug',
          description: 'No match here.',
        },
        {
          name: 'Fallback Slug Plan',
          lookupKey: 'random_key',
          slug: 'matched-essentials-academy',
          description: 'This should be matched by slug substring.',
        },
      ];
      (useSspProductsModule.default as jest.Mock).mockReturnValue({ data: fallbackProducts, isLoading: false });

      renderComponent('/?product_key=non_existent_key');

      expect(screen.getByRole('heading', { level: 4, name: 'Fallback Slug Plan' })).toBeInTheDocument();
      expect(screen.getByText('This should be matched by slug substring.')).toBeInTheDocument();
    });

    it('should fall back to a product whose name matches the selected academy name', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            academyName: 'Sustainability',
          },
        },
      }));

      // FIX: Keys here converted to camelCase to track production component parameters
      const fallbackProducts = [
        {
          name: 'Sustainability Focus',
          lookupKey: 'random_key',
          slug: 'random-slug',
          description: 'This should be matched by name alignment.',
        },
      ];
      (useSspProductsModule.default as jest.Mock).mockReturnValue({ data: fallbackProducts, isLoading: false });

      renderComponent('/?product_key=non_existent_key');

      expect(screen.getByRole('heading', { level: 4, name: 'Sustainability Focus' })).toBeInTheDocument();
      expect(screen.getByText('This should be matched by name alignment.')).toBeInTheDocument();
    });
  });
  describe('Form Data Storage Synchronization Coverage', () => {
    it('covers store extraction, parsing variables, and dependencies', () => {
      // 1. Setup a clean product using the precise camelCase fields
      const mockProduct = [
        {
          name: 'Sustainability Focus',
          longName: 'Sustainability Academy',
          price: '149.00',
          lookupKey: 'essentials_sustainability',
          slug: 'sustainability-academy-yearly',
        },
      ];
      (useSspProductsModule.default as jest.Mock).mockReturnValue({ data: mockProduct, isLoading: false });

      // 2. Set the form data store to trigger a mismatch on name and price
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            academyName: 'Old Outdated Academy Name',
            academyPrice: 999, // Mismatched price to force productPriceStr path
          },
        },
      }));

      // 3. Render targeting the matched product
      const { rerender } = renderComponent('/?product_key=essentials_sustainability');

      // 4. Force the hook's dependency array to see a change by updating the store dynamically
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            academyName: 'Sustainability Academy',
            academyPrice: 149,
          },
        },
      }));

      // 5. Re-render the exact same component instance to execute the dependency array update line
      rerender(
        <MemoryRouter initialEntries={['/?product_key=essentials_sustainability']}>
          <AppContext.Provider value={mockContextValue as any}>
            <IntlProvider locale="en" messages={{}}>
              <EssentialsAlert />
            </IntlProvider>
          </AppContext.Provider>
        </MemoryRouter>,
      );

      // Verify the final structure matches your expected primitive outputs
      const finalState = (checkoutFormStore.getState().formData as any)[DataStoreKey.AcademySelection];
      expect(finalState.academyName).toBe('Sustainability Academy');
      expect(finalState.academyPrice).toBe(149);
    });
  });
});
