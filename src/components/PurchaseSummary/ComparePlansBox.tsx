import { Card } from '@openedx/paragon';

const COMPARE_PLANS_URL = 'https://business.edx.org/course-library-compare-plans/';

const ComparePlansBox = () => (
  <Card className="bg-light border">
    <Card.Body className="text-center">
      <p className="mb-0 text-dark">
        <strong>
          Not sure which plan is right for you?{' '}
          <a
            href={COMPARE_PLANS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Compare plans
          </a>
        </strong>
      </p>
    </Card.Body>
  </Card>
);

export default ComparePlansBox;
