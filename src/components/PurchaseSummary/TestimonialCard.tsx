import { Card, Stack } from '@openedx/paragon';
import React from 'react';

export interface Testimonial {
  uuid?: string;
  quote_text: string;
  attribution_name: string;
  attribution_title: string;
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
    <Card className="mt-4 border-light" data-testid="testimonial-card">
      <Card.Body>
        <Stack gap={2}>
          <div className="h3" aria-hidden="true">
            ❝
          </div>

          <blockquote className="mb-0" data-testid="testimonial-quote">
            {quoteText}
          </blockquote>

          <div className="mt-2">
            <strong data-testid="testimonial-name">
              {attributionName}
            </strong>

            <div className="text-muted" data-testid="testimonial-title">
              {attributionTitle}
            </div>
          </div>
        </Stack>
      </Card.Body>
    </Card>
  );
};

export default TestimonialCard;
