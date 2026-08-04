import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card } from '@openedx/paragon';
import React from 'react';

import { ExternalLink } from '@/components/ExternalLink';

const renderStrong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

const ComparePlansBox = () => {
  // This URL can be removed once it is configured in environment files.
  const COMPARE_ENTERPRISE_PLANS_URL = 'https://business.edx.org/course-library-compare-plans/';
  const comparePlansLink = (
    <ExternalLink href={COMPARE_ENTERPRISE_PLANS_URL}>
      <FormattedMessage
        id="checkout.purchaseSummary.comparePlans.link"
        defaultMessage="Compare plans"
        description="Link text for compare plans"
      />
    </ExternalLink>
  );

  return (
    <Card className="bg-light-300 ssp-box border border-light-400 p-4.5" style={{ width: 'min(100%, 401px)', minHeight: '120px' }}>
      <Card.Body className="p-0">
        <p className="mb-0">
          <FormattedMessage
            id="checkout.purchaseSummary.comparePlans.text"
            defaultMessage="<strong>Not sure which plan is right for you? </strong>{comparePlansLink}"
            description="Prompt and link to compare plans in essentials purchase summary"
            values={{
              strong: renderStrong,
              comparePlansLink,
            }}
          />
        </p>
      </Card.Body>
    </Card>
  );
};

export default ComparePlansBox;
