import { Card, Stack } from '@openedx/paragon';
import { useCheckoutFormStore } from '@/hooks';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  trailingZeroDisplay: 'stripIfInteger',
});

const SubscriptionSummary: React.FC = () => {
  const numUsers = useCheckoutFormStore((state) => state.formData.plan?.numUsers);
  return (
    <Card variant="muted">
      <Card.Header title="Subscription Summary" subtitle="Review your selected subscription." size="sm" />
      <Card.Section>
        <Stack gap={3}>
          <Card className="shadow-none border border-light">
            <Card.Section className="small">
              <Stack gap={2}>
                <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center">
                  <div>Team plan (price per user)</div>
                  <div className="text-right">$399/yr</div>
                </Stack>
                <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center">
                  <div>Number of users</div>
                  <div className="text-right">
                    {numUsers && numUsers > 0 ? `x ${numUsers}` : '-'}
                  </div>
                </Stack>
                <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center">
                  <div>Total</div>
                  <div className="text-right">
                    {numUsers && numUsers > 0 ? currencyFormatter.format(numUsers * 399) : '-'}
                  </div>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2} className="justify-content-between align-items-end border-top border-muted mt-3 pt-3">
                <div>
                  <div className="font-weight-bold">Annual Payment</div>
                  <div>Annual total</div>
                </div>
                <div className="text-right font-weight-bold">
                  {numUsers && numUsers > 0 ? currencyFormatter.format(numUsers * 399) : '-'}
                </div>
              </Stack>
            </Card.Section>
            <Card.Status variant="info">
              <Stack direction="horizontal" gap={2} className="justify-content-between align-items-center">
                <div>
                  <div className="font-weight-bold">Today&apos;s Payment</div>
                  <div>14-day refund guarantee</div>
                </div>
                <div className="text-align-right">
                  {numUsers && numUsers > 0 ? currencyFormatter.format(numUsers * 399) : '-'}
                </div>
              </Stack>
            </Card.Status>
          </Card>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default SubscriptionSummary;
