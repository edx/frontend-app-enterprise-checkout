import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Col, Row, Stack } from '@openedx/paragon';
import { capitalize } from 'lodash-es';

import { useFirstBillableInvoice } from '@/components/app/data';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

const OrderDetailsBillingInfo = () => {
  const { data: firstBillableInvoice } = useFirstBillableInvoice();
  const planDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const { adminEmail } = planDetailsData;

  if (!firstBillableInvoice) {
    return null;
  }

  const {
    billingAddress,
    customerPhone,
    last4,
    cardBrand,
  } = firstBillableInvoice;

  const cardBrandDisplay = capitalize(cardBrand);

  return (
    <>
      <Row>
        <Col xs={12} md={6} className="mb-4">
          <h3 className="h5 mb-2">
            <FormattedMessage
              id="checkout.orderDetails.adminContactInfo"
              defaultMessage="Admin contact information"
              description="Heading for admin contact information section"
            />
          </h3>
          <p className="text-muted mb-0">{adminEmail}</p>
        </Col>
        <Col xs={12} md={6} className="mb-4">
          <h3 className="h5 mb-2">
            <FormattedMessage
              id="checkout.orderDetails.paymentMethod"
              defaultMessage="Payment method"
              description="Heading for payment method section"
            />
          </h3>
          <div className="d-flex align-items-center">
            <span className="text-muted">
              <FormattedMessage
                id="checkout.orderDetails.cardEnding"
                defaultMessage="{cardBrandDisplay} ending with {last4}"
                description="Card ending information"
                values={{
                  cardBrandDisplay,
                  last4,
                }}
              />
            </span>
          </div>
        </Col>

      </Row>

      <div className="mb-4">
        <h3 className="h5 mb-2">
          <FormattedMessage
            id="checkout.orderDetails.billingAddress"
            defaultMessage="Billing address"
            description="Heading for billing address section"
          />
        </h3>
        <Stack direction="vertical" gap={0} className="text-muted">
          {[
            { key: 'line1', value: billingAddress?.line1 },
            { key: 'line2', value: billingAddress?.line2 },
            {
              key: 'cityStatePostal',
              value: [billingAddress?.city, billingAddress?.state, billingAddress?.postalCode]
                .filter(Boolean)
                .join(', '),
            },
            { key: 'country', value: billingAddress?.country },
            { key: 'phone', value: customerPhone },
          ]
            .filter(({ value }) => Boolean(value))
            .map(({ key, value }) => (
              <span key={`address-${key}`}>{value}</span>
            ))}
        </Stack>
      </div>
    </>
  );
};

export default OrderDetailsBillingInfo;
