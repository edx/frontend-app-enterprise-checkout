import { BillingAddress, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Col, Row, Stack } from '@openedx/paragon';

interface OrderDetailsBillingInfoProps {
  adminEmail: string;
  cardBrand: string;
  cardLast4: string;
  phoneNumber: string;
  billingAddress: BillingAddress | null;
}

const OrderDetailsBillingInfo = ({
  adminEmail,
  cardBrand,
  cardLast4,
  phoneNumber,
  billingAddress,
}: OrderDetailsBillingInfoProps) => {
  const hasBillingAddress = Boolean(
    billingAddress
    && (billingAddress.line1
      || billingAddress.city
      || billingAddress.state
      || billingAddress.postalCode
      || billingAddress.country),
  );

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
                defaultMessage="{cardBrand} ending with {last4}"
                description="Card ending information"
                values={{
                  cardBrand,
                  last4: cardLast4,
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
        {hasBillingAddress ? (
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
              { key: 'phone', value: phoneNumber },
            ]
              .filter(({ value }) => Boolean(value))
              .map(({ key, value }) => (
                <span key={`address-${key}`}>{value}</span>
              ))}
          </Stack>
        ) : (
          <p className="text-muted mb-0">
            <FormattedMessage
              id="checkout.orderDetails.noBillingAddress"
              defaultMessage="Billing address not available"
              description="Message shown when billing address is not available"
            />
          </p>
        )}
      </div>
    </>
  );
};

export default OrderDetailsBillingInfo;
