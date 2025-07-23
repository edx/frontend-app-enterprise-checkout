import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';

import Currency from '@/components/Currency/Currency';
import { SUBSCRIPTION_PRICE_PER_USER_PER_MONTH } from '@/components/Stepper/constants';

const PriceAlert = () => (
  <Alert className="price-alert-background">
    {/* @ts-ignore */}
    <Alert.Heading className="justify-content-between">
      <h3 className="price-alert-text">
        <FormattedMessage
          id="checkout.priceAlert.title"
          defaultMessage="Teams subscription"
          description="Title for the teams subscription price alert"
        />
      </h3>
      <h3 className="price-alert-text">
        <span className="font-weight-light">
          <FormattedMessage
            id="checkout.priceAlert.from"
            defaultMessage="From"
            description="Text indicating the starting price of a subscription"
          />
        </span>{' '}
        <Currency value={SUBSCRIPTION_PRICE_PER_USER_PER_MONTH} />
        <span className="font-weight-light">
          <FormattedMessage
            id="checkout.priceAlert.perMonth"
            defaultMessage="/month"
            description="Abbreviation for 'per month' in pricing display"
          />
        </span>
      </h3>
    </Alert.Heading>
    <h4 className="price-alert-text font-weight-light">
      <FormattedMessage
        id="checkout.priceAlert.description"
        defaultMessage="Upskill your team across multiple areas with access to the entire course library."
        description="Description of the benefits of a teams subscription"
      />
    </h4>
  </Alert>
);

export default PriceAlert;
