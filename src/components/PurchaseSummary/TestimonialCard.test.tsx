import { render, screen } from '@testing-library/react';
import React from 'react';

import TestimonialCard from '@/components/PurchaseSummary/TestimonialCard';

describe('TestimonialCard', () => {
  const testimonial = {
    quote_text: 'This platform changed our learning strategy.',
    attribution_name: 'John Doe',
    attribution_title: 'VP Learning',
  };

  it('renders testimonial card', () => {
    render(<TestimonialCard testimonial={testimonial} />);
    expect(screen.getByTestId('testimonial-card')).toBeInTheDocument();
  });

  it('renders quote text', () => {
    render(<TestimonialCard testimonial={testimonial} />);
    expect(screen.getByTestId('testimonial-quote')).toHaveTextContent(
      'This platform changed our learning strategy.',
    );
  });

  it('renders attribution name', () => {
    render(<TestimonialCard testimonial={testimonial} />);
    expect(screen.getByTestId('testimonial-name')).toHaveTextContent('John Doe');
  });

  it('renders attribution title', () => {
    render(<TestimonialCard testimonial={testimonial} />);
    expect(screen.getByTestId('testimonial-title')).toHaveTextContent('VP Learning');
  });

  it('returns null when testimonial is null', () => {
    const { container } = render(<TestimonialCard testimonial={null} />);
    expect(container.firstChild).toBeNull();
  });
});
