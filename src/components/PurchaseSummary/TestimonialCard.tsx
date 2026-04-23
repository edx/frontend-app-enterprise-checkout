import React from 'react';

export interface Testimonial {
  uuid?: string;
  quote_text: string;
  attribution_name: string;
  attribution_title: string;
  is_active?: boolean;
}

interface Props {
  testimonial: Testimonial | null;
}

const TestimonialCard = ({ testimonial }: Props) => {
  if (!testimonial) {
    return null;
  }

  const {
    quote_text: quoteText,
    attribution_name: attributionName,
    attribution_title: attributionTitle,
  } = testimonial;

  return (
    <div className="testimonial-card mt-4" data-testid="testimonial-card">
      <div className="testimonial-card__body">
        <div className="testimonial-card__quote-icon" aria-hidden="true">
          <span className="testimonial-card__quote-glyph">&#10077;</span>
        </div>

        <p className="testimonial-card__quote mt-4" data-testid="testimonial-quote">
          {quoteText}
        </p>

        <div className="testimonial-card__attribution mt-5">
          <span className="testimonial-card__attribution-dash" aria-hidden="true">&#8212;</span>
          <div className="testimonial-card__attribution-copy">
            <span className="testimonial-card__name" data-testid="testimonial-name">
              {attributionName}
            </span>
            <span className="testimonial-card__title d-block" data-testid="testimonial-title">
              {attributionTitle}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
