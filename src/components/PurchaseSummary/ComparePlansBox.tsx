import { Card } from '@openedx/paragon';

const COMPARE_PLANS_URL = 'https://business.edx.org/course-library-compare-plans/';

const ComparePlansBox = () => (
  <Card className="compare-plans-box">
    <Card.Body className="text-center">
      <p className="mb-0 compare-plans-text">
        <strong>
          Not sure which plan is right for you?{' '}
          <a
            href={COMPARE_PLANS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="compare-plans-link"
          >
            Compare plans.
          </a>
        </strong>
      </p>
    </Card.Body>
  </Card>
);

export default ComparePlansBox;
