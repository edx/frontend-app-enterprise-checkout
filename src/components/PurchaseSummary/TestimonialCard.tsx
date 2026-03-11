import { Card } from '@openedx/paragon';
import React from 'react';

interface Testimonial {
  quote_text: string;
  attribution_name: string;
  attribution_title: string;
}

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const {
    quote_text: quoteText,
    attribution_name: attributionName,
    attribution_title: attributionTitle,
  } = testimonial;

  return (
    <Card className="mb-3">
      <Card.Body>
        <p>{quoteText}</p>
        <strong>{attributionName}</strong>
        <div>{attributionTitle}</div>
      </Card.Body>
    </Card>
  );
};

export default TestimonialCard;
