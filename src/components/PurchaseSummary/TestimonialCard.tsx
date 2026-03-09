import React from 'react';
import { Stack } from '@openedx/paragon';

interface Props {
  testimonial: {
    quote_text: string;
    attribution_name: string;
    attribution_title: string;
  } | null;
}

const TestimonialCard: React.FC<Props> = ({ testimonial }) => {
  if (!testimonial) return null;

  return (
    <div className="border rounded p-3 mt-4 bg-light">
      <Stack gap={2}>
        <div style={{ fontSize: '24px' }}>❝</div>
        <div>{testimonial.quote_text}</div>
        <div className="mt-2">
          <strong>{testimonial.attribution_name}</strong>
          <div className="text-muted">{testimonial.attribution_title}</div>
        </div>
      </Stack>
    </div>
  );
};

export default TestimonialCard;