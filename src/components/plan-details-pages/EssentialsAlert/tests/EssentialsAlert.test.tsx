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
    it('should display price from product.price (primary source)', () => {
      renderComponent();
      expect(screen.getByText(/From/)).toBeInTheDocument();
      expect(screen.getByText(/\/yr/)).toBeInTheDocument();
      expect(screen.getByText('$149')).toBeInTheDocument();
    });

    it('should fall back to BFF price when product.price is missing', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: { ...mockProduct, price: null },
          },
        },
      }));
      (useBFFContext as jest.Mock).mockReturnValue({ data: 199 });

      renderComponent();
      expect(screen.getByText('$199')).toBeInTheDocument();
    });

    it('should fall back to BFF price when product.price is empty string', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: { ...mockProduct, price: '' },
          },
        },
      }));
      (useBFFContext as jest.Mock).mockReturnValue({ data: 199 });

      renderComponent();
      expect(screen.getByText('$199')).toBeInTheDocument();
    });

    it('should not display price section when neither source has price', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: { ...mockProduct, price: null },
          },
        },
      }));
      (useBFFContext as jest.Mock).mockReturnValue({ data: null });

      renderComponent();
      expect(screen.queryByText(/From/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\/yr/)).not.toBeInTheDocument();
    });

    it('should prefer product.price over BFF price when both are available', () => {
      (useBFFContext as jest.Mock).mockReturnValue({ data: 199 });

      renderComponent();
      // product.price is 149.00, BFF returns 199 — should show 149
      expect(screen.getByText('$149')).toBeInTheDocument();
      expect(screen.queryByText('$199')).not.toBeInTheDocument();
    });

    it('should display "From $149 /yr" format', () => {
      renderComponent();
      const priceSection = screen.getByText(/From/).parentElement;
      expect(priceSection?.textContent).toContain('From');
      expect(priceSection?.textContent).toContain('$149');
      expect(priceSection?.textContent).toContain('/yr');
    });
    it('should extract price from BFF context using product lookupKey', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: { ...mockProduct, price: null },
          },
        },
      }));

      // Mock useBFFContext to actually invoke the select function
      (useBFFContext as jest.Mock).mockImplementation((_userId: string | null, options: any) => {
        const contextData = {
          pricing: {
            defaultByLookupKey: 'teams_subscription_license_yearly',
            prices: [
              {
                lookupKey: 'essentials_artificial_intelligence_subscription_license_yearly',
                unitAmount: 14900,
              },
              {
                lookupKey: 'essentials_data_subscription_license_yearly',
                unitAmount: 19900,
              },
            ],
          },
        };
        const selected = options?.select?.(contextData);
        return { data: selected };
      });

      renderComponent();
      expect(screen.getByText('$149')).toBeInTheDocument();
    });

    it('should return null from BFF context when lookupKey does not match', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: {
              ...mockProduct,
              price: null,
              lookupKey: 'nonexistent_key',
            },
          },
        },
      }));

      (useBFFContext as jest.Mock).mockImplementation((_userId: string | null, options: any) => {
        const contextData = {
          pricing: {
            defaultByLookupKey: 'teams_subscription_license_yearly',
            prices: [
              {
                lookupKey: 'essentials_artificial_intelligence_subscription_license_yearly',
                unitAmount: 14900,
              },
            ],
          },
        };
        const selected = options?.select?.(contextData);
        return { data: selected };
      });

      renderComponent();
      // No price from product, no match in BFF → price section hidden
      expect(screen.queryByText(/From/)).not.toBeInTheDocument();
    });

    it('should handle null pricing in BFF context', () => {
      checkoutFormStore.setState((state) => ({
        ...state,
        formData: {
          ...state.formData,
          [DataStoreKey.AcademySelection]: {
            selectedProduct: { ...mockProduct, price: null },
          },
        },
      }));

      (useBFFContext as jest.Mock).mockImplementation((_userId: string | null, options: any) => {
        const selected = options?.select?.({ pricing: undefined });
        return { data: selected };
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
      expect(screen.getByText('$199')).toBeInTheDocument();
      expect(screen.getByText(/Master artificial intelligence fundamentals/)).toBeInTheDocument();
    });
  });
});
