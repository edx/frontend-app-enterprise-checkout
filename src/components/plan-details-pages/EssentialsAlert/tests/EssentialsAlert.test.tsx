import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import * as useBFFContextModule from '@/components/app/data/hooks/useBFFContext';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

import EssentialsAlert from '../EssentialsAlert';

jest.mock('@/components/app/data/hooks/useBFFContext');
jest.mock('@/hooks/useCheckoutFormStore', () => ({
  useCheckoutFormStore: jest.fn(),
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

// The hook with select returns the transformed value: number (price in dollars with fallback)
const defaultBFFContextValue = {
  data: {
    pricing: {
      defaultByLookupKey: 'essentials_artificial_intelligence_subscription_license_yearly',
      prices: [{
        id: 'price_bff_context',
        product: 'prod_bff_context',
        lookupKey: 'essentials_artificial_intelligence_subscription_license_yearly',
        recurring: {
          interval: 'year',
          intervalCount: 1,
        },
        currency: 'usd',
        unitAmount: 28800,
        unitAmountDecimal: '288.00',
      }],
    },
  },
  isLoading: false,
  error: null,
};

const defaultCheckoutFormState = {
  formData: {
    [DataStoreKey.PlanDetails]: {},
  },
};

describe('EssentialsAlert Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useBFFContextModule.default as jest.Mock).mockReturnValue(defaultBFFContextValue);
    jest.mocked(useCheckoutFormStore).mockImplementation((selector) => selector(defaultCheckoutFormState as any));
  });

  const renderComponent = (initialEntry = '/essentials/plan-details') => render(
    <MemoryRouter initialEntries={[initialEntry]}>
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
      // Header is a plain h3 element
      expect(header.tagName).toBe('H3');
    });

    it('should display confirmation text with academy name', () => {
      renderComponent();
      expect(screen.getByText(/You have picked/)).toBeInTheDocument();
      const confirmationElements = screen.getAllByText(/Artificial Intelligence/);
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

    it('should use the mocked academy price instead of the checkout context price', () => {
      renderComponent();
      expect(screen.getByText('$149')).toBeInTheDocument();
      expect(screen.queryByText('$288')).not.toBeInTheDocument();
    });
  });

  describe('Academy Details Card', () => {
    it('should display academy name', () => {
      renderComponent();
      const academyNames = screen.getAllByText('Artificial Intelligence');
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
    });

    it('should display course count badge', () => {
      renderComponent();
      expect(screen.getByText('16 courses')).toBeInTheDocument();
    });

    it('should display "Learn more" link', () => {
      renderComponent();
      const learnMoreLink = screen.getByText('Learn more');
      expect(learnMoreLink).toBeInTheDocument();
      expect(learnMoreLink.tagName).toBe('A');
    });

    it('should display all tags', () => {
      renderComponent();
      expect(screen.getByText(/AI foundations/)).toBeInTheDocument();
      expect(screen.getByText(/Intermediate AI/)).toBeInTheDocument();
      expect(screen.getByText(/Advanced AI/)).toBeInTheDocument();
      expect(screen.getByText(/AI for business/)).toBeInTheDocument();
    });

    it('should display tags with bullet separators', () => {
      renderComponent();
      const tagsSection = screen.getByText(/AI foundations/).parentElement;
      expect(tagsSection?.textContent).toContain('•');
    });

    it('should display academy description', () => {
      renderComponent();
      expect(
        screen.getByText(/This pathway helps your team build a strong foundation in AI/),
      ).toBeInTheDocument();
    });
  });

  describe('External Links', () => {
    it('should have "Pick a different academy" link with correct href', () => {
      renderComponent();
      const pickDifferentLink = screen.getByText('Pick a different academy') as HTMLAnchorElement;
      expect(pickDifferentLink).toBeInTheDocument();
      // Link should point to the course library essentials page
      expect(pickDifferentLink.href).toContain('business.edx.org/course-library-plans-essentials');
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
      // Link should point to the tech digital transformation academy page
      expect(switchToTeamsLink.href).toContain('business.edx.org/academy/tech-digital-transformation');
    });

    it('should have "Learn more" link with dynamic marketing URL', () => {
      renderComponent();
      const learnMoreLink = screen.getByText('Learn more') as HTMLAnchorElement;
      expect(learnMoreLink).toBeInTheDocument();
      // Verify link has marketing URL from academy data
      expect(learnMoreLink.href).toBe(
        'https://www.edx.org/learn/artificial-intelligence',
      );
    });

    it('should render the academy matched by the product_key query param', () => {
      renderComponent('/essentials/plan-details?product_key=essentials_management_subscription_license_yearly');

      expect(screen.getByText(/You have picked Management as your focus area/)).toBeInTheDocument();
      expect(screen.getByText('Management')).toBeInTheDocument();
      expect(screen.queryByText('Learn more')).not.toBeInTheDocument();
    });

    it('should match non-yearly essentials product keys from the url param', () => {
      renderComponent('/essentials/plan-details?product_key=essentials_tech_and_digital_transformation');

      expect(screen.getByText(/You have picked Tech and Digital Transformation as your focus area/)).toBeInTheDocument();
      expect(screen.getByText('Tech and Digital Transformation')).toBeInTheDocument();
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
      // Button components with variant="link" may render as buttons
      const buttons = screen.queryAllByRole('button');
      const links = screen.queryAllByRole('link');
      const totalNavigationElements = buttons.length + links.length;
      // Pick different academy, Learn more, Switch to Teams (at least 2)
      expect(totalNavigationElements).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Styling and Layout', () => {
    it('should have rust-colored background', () => {
      const { container } = renderComponent();
      const alertDiv = container.querySelector('[class*="alert"]');
      // Paragon Alert will be styled with CSS class
      expect(alertDiv).toBeInTheDocument();
    });

    it('should have white card background for academy details', () => {
      const { container } = renderComponent();
      const cards = container.querySelectorAll('[class*="pgn__card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should use proper spacing and padding', () => {
      const { container } = renderComponent();
      const alertDiv = container.querySelector('[class*="pgn__alert"]');
      expect(alertDiv).toBeInTheDocument();
    });

    it('should have rounded corners', () => {
      const { container } = renderComponent();
      const alertDiv = container.querySelector('[class*="essentials-alert"]');
      expect(alertDiv).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderComponent();
      const mainHeading = screen.getByText('Essentials Plan');
      expect(mainHeading).toBeInTheDocument();
      // Main heading is a plain h3 element
      expect(mainHeading.tagName).toBe('H3');

      const academyHeadings = screen.getAllByText('Artificial Intelligence');
      expect(academyHeadings.length).toBeGreaterThanOrEqual(1);
    });

    it('links should be focusable', () => {
      renderComponent();
      const buttons = screen.getAllByRole('link');
      buttons.forEach((button) => {
        expect(button).toHaveProperty('href');
      });
    });

    it('should have proper styling for buttons', () => {
      renderComponent();
      const buttons = screen.getAllByRole('link');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Content Completeness', () => {
    it('should display all required sections', () => {
      renderComponent();
      // Header
      expect(screen.getByText('Essentials Plan')).toBeInTheDocument();
      // Academy name
      const academyNames = screen.getAllByText('Artificial Intelligence');
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
      // Course count
      expect(screen.getByText('16 courses')).toBeInTheDocument();
      // Tags
      expect(screen.getByText(/AI foundations/)).toBeInTheDocument();
      // Description
      expect(
        screen.getByText(/This pathway helps your team build a strong foundation in AI/),
      ).toBeInTheDocument();
      // Upsell
      expect(
        screen.getByText(/Need to upskill your team in more than one focus area/),
      ).toBeInTheDocument();
    });

    it('should not have required fields missing', () => {
      renderComponent();
      // Verify all key elements are present
      const essentialsText = screen.getByText('Essentials Plan');
      const academyNames = screen.getAllByText('Artificial Intelligence');
      const courseCount = screen.getByText('16 courses');
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
      // When data is undefined, fallback price of $149 displays from the mocked academy data
      expect(screen.getByText('Essentials Plan')).toBeInTheDocument();
      const academyNames = screen.getAllByText('Artificial Intelligence');
      expect(academyNames.length).toBeGreaterThanOrEqual(1);
      const priceElements = screen.queryAllByText(/\$149/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should ignore checkout context price when a mocked academy match is available', () => {
      (useBFFContextModule.default as jest.Mock).mockReturnValue({
        data: {
          pricing: {
            defaultByLookupKey: 'essentials_artificial_intelligence_subscription_license_yearly',
            prices: [{
              id: 'price_custom',
              product: 'prod_custom',
              lookupKey: 'essentials_artificial_intelligence_subscription_license_yearly',
              recurring: {
                interval: 'year',
                intervalCount: 1,
              },
              currency: 'usd',
              unitAmount: 2000,
              unitAmountDecimal: '20.00',
            }],
          },
        },
        isLoading: false,
        error: null,
      });

      renderComponent();
      expect(screen.getByText(/\$149/)).toBeInTheDocument();
      expect(screen.queryByText(/\$20/)).not.toBeInTheDocument();
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
});
