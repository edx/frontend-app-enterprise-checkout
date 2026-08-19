import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';

import { useRotatingTestimonial } from '@/components/app/data/hooks/useTestimonials';

import AcademicSelection from '../AcademicSelection';

jest.mock('@/components/app/data/hooks/useTestimonials', () => ({
  useRotatingTestimonial: jest.fn(),
}));

jest.mock('@/components/PurchaseSummary', () => ({
  PurchaseSummary: () => <div data-testid="purchase-summary" />,
}));

const renderAcademicSelection = () => render(
  <IntlProvider locale="en">
    <AcademicSelection />
  </IntlProvider>,
);

describe('AcademicSelection', () => {
  beforeEach(() => {
    (useRotatingTestimonial as jest.Mock).mockReturnValue(null);
  });

  it('renders the coming soon heading', () => {
    renderAcademicSelection();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('renders the purchase summary', () => {
    renderAcademicSelection();
    expect(screen.getByTestId('purchase-summary')).toBeInTheDocument();
  });

  it('renders a testimonial card when one is available', () => {
    (useRotatingTestimonial as jest.Mock).mockReturnValue({
      quote_text: 'edX helped us upskill quickly.',
      attribution_name: 'Jane Doe',
      attribution_title: 'VP Learning',
    });
    renderAcademicSelection();
    expect(screen.getByTestId('testimonial-quote')).toHaveTextContent('edX helped us upskill quickly.');
  });
});
