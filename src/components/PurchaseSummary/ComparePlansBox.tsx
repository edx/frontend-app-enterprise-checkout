import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Card, Hyperlink } from '@openedx/paragon';
import React from 'react';

const renderStrong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

const ComparePlansBox = () => {
  const { COMPARE_ENTERPRISE_PLANS_URL } = getConfig();
  const comparePlansUrl = COMPARE_ENTERPRISE_PLANS_URL || 'https://business.edx.org/course-library-compare-plans/';
  const comparePlansLink = (
    <Hyperlink
      destination={comparePlansUrl}
      target="_blank"
      showLaunchIcon={false}
      role="link"
    >
      <FormattedMessage
        id="checkout.purchaseSummary.comparePlans.link"
        defaultMessage="Compare plans."
        description="Link text for compare plans"
      />
    </Hyperlink>
  );

  return (
    <Card className="bg-light-300 rounded border border-light-400" style={{ width: 'min(100%, 401px)', minHeight: '120px', padding: '32px' }}>
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
