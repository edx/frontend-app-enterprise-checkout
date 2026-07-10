import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DataStoreKey } from '@/constants/checkout';
import { checkoutFormStore } from '@/hooks/useCheckoutFormStore';

import EssentialsAlert from '../EssentialsAlert';

jest.mock('@/components/app/data/hooks/useBFFContext');
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

const mockProduct = {
  name: 'Sustainability',
  longName: 'Sustainability Academy',
  description: 'Sustainability strategy and imperative overview.',
  marketingUrl: 'https://www.edx.org/learn/sustainability',
  thumbnailUrl: 'https://example.com/sustainability.png',
  price: '149.00',
  lookupKey: 'essentials_artificial_intelligence_subscription_license_yearly',
  slug: 'sustainability-academy-yearly',
  courseCount: 12,
  tags: [
    { id: 1, title: 'sustainability', description: 'Test tag1', titleEn: 'sustainability' },
    { id: 2, title: 'strategy', description: 'Test tag2', titleEn: 'strategy' },
  ],
};

describe('EssentialsAlert Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useBFFContext as jest.Mock).mockReturnValue({ data: null });

    // Store has selectedProduct (populated by root loader)
    checkoutFormStore.setState((state) => ({
      ...state,
      formData: {
        ...state.formData,
        [DataStoreKey.AcademySelection]: {
          selectedProduct: mockProduct,
        },
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

  describe('No Product Selected', () => {
    it('should render nothing when no product is in the store', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {},
        },
      }));

      const { container } = renderComponent();
      expect(container.innerHTML).toBe('');
    });

    it('should render nothing when selectedProduct is undefined', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: { selectedProduct: undefined },
        },
      }));

      const { container } = renderComponent();
      expect(container.innerHTML).toBe('');
    });
  });

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
    it('should display price from BFF context', () => {
      (useBFFContext as jest.Mock).mockReturnValue({
        data: 149,
      });
      renderComponent();
      expect(screen.getByText(/From/)).toBeInTheDocument();
      expect(screen.getByText(/149/)).toBeInTheDocument();
      expect(screen.getByText(/\/yr/)).toBeInTheDocument();
    });

    it('should hide price section when BFF price is null', () => {
      (useBFFContext as jest.Mock).mockReturnValue({
        data: null,
      });
      renderComponent();
      expect(screen.queryByText(/From/)).not.toBeInTheDocument();
    });
  });

  describe('Academy Details Card', () => {
    it('should display academy longName when available', () => {
      renderComponent();
      const academyNames = screen.getAllByText('Sustainability Academy');
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
    });

    it('should not render tags section when tags are missing or empty', () => {
      // Case: tags undefined
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: { selectedProduct: { ...mockProduct, tags: undefined } },
        },
      }));

      const { rerender } = render(
        <MemoryRouter>
          <AppContext.Provider value={mockContextValue as any}>
            <IntlProvider locale="en" messages={{}}>
              <EssentialsAlert />
            </IntlProvider>
          </AppContext.Provider>
        </MemoryRouter>,
      );
      expect(screen.queryByText('sustainability')).not.toBeInTheDocument();
      expect(screen.queryByText('strategy')).not.toBeInTheDocument();

      // Case: tags empty array
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: { selectedProduct: { ...mockProduct, tags: [] } },
        },
      }));
      rerender(
        <MemoryRouter>
          <AppContext.Provider value={mockContextValue as any}>
            <IntlProvider locale="en" messages={{}}>
              <EssentialsAlert />
            </IntlProvider>
          </AppContext.Provider>
        </MemoryRouter>,
      );
      expect(screen.queryByText('sustainability')).not.toBeInTheDocument();
      expect(screen.queryByText('strategy')).not.toBeInTheDocument();
    });

    it('should fall back to product name when longName is missing', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: { ...mockProduct, longName: undefined },
          },
        },
      }));

      renderComponent();
      const academyNames = screen.getAllByText('Sustainability');
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
      // Learn more should open in the same tab (no target)
      expect((learnMoreLink as HTMLAnchorElement).target).toBe('');
    });

    it('should display academy description', () => {
      renderComponent();
      expect(
        screen.getByText(/Sustainability strategy and imperative overview/),
      ).toBeInTheDocument();
    });
    it('should handle missing description gracefully', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: { ...mockProduct, description: undefined },
          },
        },
      }));

      renderComponent();
      const academyNames = screen.getAllByText('Sustainability Academy');
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('Sustainability strategy and imperative overview.')).not.toBeInTheDocument();
    });

    it('should handle missing marketingUrl gracefully', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: { ...mockProduct, marketingUrl: undefined },
          },
        },
      }));

      renderComponent();
      // "Learn more" link is not rendered when marketingUrl is missing
      expect(screen.queryByText('Learn more')).not.toBeInTheDocument();
    });

    it('should not display course badge when courseCount is missing', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: { ...mockProduct, courseCount: undefined },
          },
        },
      }));

      renderComponent();
      // Course badge is not rendered when courseCount is missing
      expect(screen.queryByText(/courses/)).not.toBeInTheDocument();
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
      // The Essentials link intentionally opens in the current tab (no target="_blank")
      expect(pickDifferentLink.target).toBe('');
      expect(pickDifferentLink.href).toContain('business.edx.org/course-library-plans-essentials/');
    });

    it('should have "Switch to Teams" link with correct href', () => {
      renderComponent();
      const switchToTeamsLink = screen.getByText('Switch to Teams') as HTMLAnchorElement;
      expect(switchToTeamsLink).toBeInTheDocument();
      expect(switchToTeamsLink.href).toContain('business.edx.org/course-library-plans-teams/');
      expect(switchToTeamsLink.target).toBe('_blank');
      expect(switchToTeamsLink.rel).toContain('noopener');
      expect(switchToTeamsLink.rel).toContain('noreferrer');
    });

    it('should have "Learn more" link with dynamic marketing URL', () => {
      renderComponent();
      const learnMoreLink = screen.getByText('Learn more') as HTMLAnchorElement;
      expect(learnMoreLink).toBeInTheDocument();
      expect(learnMoreLink.href).toBe('https://www.edx.org/learn/sustainability');
      expect(learnMoreLink.target).toBe('');
    });

    it('should render product tags when available', () => {
      renderComponent();
      const alert = screen.getByTestId('essentials-alert');
      const tagsContainer = alert.querySelector('.essentials-alert__tags');
      expect(tagsContainer).toBeTruthy();
      expect(tagsContainer).toHaveTextContent('sustainability');
      expect(tagsContainer).toHaveTextContent('strategy');
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

      expect(essentialsText).toBeInTheDocument();
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
      expect(courseCount).toBeInTheDocument();
    });
  });

  describe('Different Academy Products', () => {
    it('should render correctly with a different selected product', () => {
      const aiProduct = {
        name: 'AI',
        longName: 'AI Academy',
        description: 'Master artificial intelligence fundamentals.',
        marketingUrl: 'https://www.edx.org/learn/ai',
        thumbnailUrl: 'https://example.com/ai.png',
        price: '199.00',
        lookupKey: 'essentials_ai_subscription_license_yearly',
        slug: 'ai-academy-yearly',
        courseCount: 8,
      };

      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: aiProduct,
          },
        },
      }));

      renderComponent();
      const academyNames = screen.getAllByText('AI Academy');
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('8 courses')).toBeInTheDocument();
      expect(screen.getByText(/Master artificial intelligence fundamentals/)).toBeInTheDocument();
    });
  });
});
