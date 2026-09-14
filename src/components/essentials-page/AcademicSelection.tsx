import { defineMessages, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Col,
  Container,
  Icon,
  Row,
  Stack,
} from '@openedx/paragon';
import { MenuBook } from '@openedx/paragon/icons';
import React from 'react';

import { useRotatingTestimonial } from '@/components/app/data/hooks/useTestimonials';
import { PurchaseSummary } from '@/components/PurchaseSummary';
import TestimonialCard from '@/components/PurchaseSummary/TestimonialCard';

const messages = defineMessages({
  comingSoon: {
    id: 'essentials.academicSelection.comingSoon',
    defaultMessage: 'Coming Soon',
    description: 'Heading shown on the academic selection page while it is under construction',
  },
});

const AcademicSelection: React.FC = () => {
  const currentTestimonial = useRotatingTestimonial('academic-selection');

  return (
    <Container size="lg" className="py-4.5">
      <Row>
        <Col md={12} lg={8}>
          <Stack gap={4} className="text-center my-5 py-5">
            <div className="d-flex justify-content-center">
              <Icon
                src={MenuBook}
                style={{
                  width: '80px',
                  height: '80px',
                  color: '#0075b4',
                }}
              />
            </div>

            <h1 className="display-3 fw-bold">
              <FormattedMessage {...messages.comingSoon} />
            </h1>
          </Stack>
        </Col>
        <Col md={12} lg={4}>
          <PurchaseSummary />
          <TestimonialCard testimonial={currentTestimonial} />
        </Col>
      </Row>
    </Container>
  );
};

export default AcademicSelection;
