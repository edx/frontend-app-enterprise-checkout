import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext, type AppContextValue } from '@edx/frontend-platform/react';
import { Alert } from '@openedx/paragon';
import { useContext } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DisplayPrice } from '@/components/DisplayPrice';
import { extractPriceObject } from '@/utils/checkout';

const PriceAlert = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: pricePerYear } = useBFFContext(authenticatedUser?.userId ?? null, {
    select: (contextData): number | null => {
      const priceObject = extractPriceObject(contextData?.pricing);
      return priceObject ? priceObject.unitAmount / 100 : null;
    },
  });

  return (
    <Alert data-testid="price-alert" className="price-alert-background m-0">
      <div className="d-flex justify-content-between align-items-start">
        {/* Left column - Text content */}
        <div className="flex-grow-1 pe-4">
          <h3 className="price-alert-text">
            <FormattedMessage
              id="checkout.priceAlert.title"
              defaultMessage="Teams subscription"
              description="Title for the teams subscription price alert"
            />
          </h3>
          <p className="h4 price-alert-text font-weight-light my-3">
            <FormattedMessage
              id="checkout.priceAlert.description"
              defaultMessage="Upskill your team across multiple areas with access to the entire course library."
              description="Description of the benefits of a teams subscription"
            />
          </p>
          <span className="price-alert-text font-weight-light">
            <FormattedMessage
              id="checkout.priceAlert.trialDescription"
              defaultMessage="Your plan includes a 14-day free trial during which you can cancel at any time during those 14 days. If you do not cancel your plan by the end of the trial period, your subscription will automatically begin and you will be billed."
              description="Description of trial period and billing information"
            />
          </span>
        </div>

        {/* Right column - Price */}
        {pricePerYear != null && (
          <div className="flex-shrink-0 text-end ps-5">
            <h3 className="price-alert-text">
              <span className="font-weight-light">
                <FormattedMessage
                  id="checkout.priceAlert.from"
                  defaultMessage="From"
                  description="Text indicating the starting price of a subscription"
                />
              </span>{' '}
              <DisplayPrice value={pricePerYear} />
              <span className="font-weight-light">
                <FormattedMessage
                  id="checkout.priceAlert.perYear"
                  defaultMessage="/yr"
                  description="Abbreviation for 'per year' in pricing display"
                />
              </span>
            </h3>
          </div>
        )}
      </div>
    </Alert>
  );
};

export default PriceAlert;
