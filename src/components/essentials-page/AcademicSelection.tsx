import {
  Col,
  Container,
  Icon,
  Row,
  Stack,
} from '@openedx/paragon';
import { MenuBook } from '@openedx/paragon/icons';
import React from 'react';

import { PurchaseSummary } from '@/components/PurchaseSummary';

const AcademicSelection: React.FC = () => (
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
      </Col>
    </Row>
  </Container>
);

export default AcademicSelection;
