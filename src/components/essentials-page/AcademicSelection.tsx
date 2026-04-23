import {
  Col,
  Container,
  Icon,
  Row,
  Stack,
} from '@openedx/paragon';
import { MenuBook } from '@openedx/paragon/icons';
import React, { useEffect, useState } from 'react';

import useTestimonials, {
  getShownTestimonialUuids,
  pickNextTestimonial,
  setShownTestimonialUuids,
} from '@/components/app/data/hooks/useTestimonials';
import { PurchaseSummary } from '@/components/PurchaseSummary';
import TestimonialCard, { Testimonial } from '@/components/PurchaseSummary/TestimonialCard';

const AcademicSelection: React.FC = () => {
  const { data: testimonials = [] } = useTestimonials();
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (!testimonials.length) {
      setCurrentTestimonial(null);
      return;
    }

    const shownUuids = getShownTestimonialUuids();
    const nextTestimonial = pickNextTestimonial(testimonials, shownUuids);
    setShownTestimonialUuids(shownUuids);
    setCurrentTestimonial(nextTestimonial);
  }, [testimonials]);

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
              Coming Soon
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
