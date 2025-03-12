import {
  Button, Card, Form, Icon, OverlayTrigger, Stack, Stepper, Tooltip,
} from '@openedx/paragon';
import { Check, Remove } from '@openedx/paragon/icons';
import { useCheckoutFormStore } from '@/hooks';
import { steps } from '@/constants';

const BillingDetails: React.FC = () => {
  const { handlePrevious, handleNext } = useCheckoutFormStore();
  const eventKey = steps[2];
  return (
    <Stack gap={4}>
      <Stepper.Step eventKey={eventKey} title="Billing Details">
        <Stack gap={5}>
          <div>
            <h2 className="mb-4.5">Complete your account</h2>
            <Form>
              <Stack gap={3}>
                <Form.Group>
                  <Form.Control
                    type="email"
                    floatingLabel="Email"
                    autoComplete="off"
                    value="john.doe@organization.com"
                    readOnly
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    type="text"
                    floatingLabel="Username"
                    placeholder="johndoe"
                    autoComplete="off"
                  />
                  <Form.Text>This can not be changed later.</Form.Text>
                </Form.Group>
                <Form.Group>
                  <OverlayTrigger
                    placement="left"
                    trigger={['focus']}
                    overlay={(
                      <Tooltip id="password-requirement" variant="light">
                        <span id="letter-check" className="d-flex align-items-center">
                          <Icon className="mr-1 text-success" src={Check} />
                          1 letter
                        </span>
                        <span id="number-check" className="d-flex align-items-center">
                          <Icon className="mr-1 text-light-700" src={Remove} />
                          1 number
                        </span>
                        <span id="characters-check" className="d-flex align-items-center">
                          <Icon className="mr-1 text-light-700" src={Remove} />
                          8 characters
                        </span>
                      </Tooltip>
                    )}
                  >
                    <Form.Control
                      type="password"
                      floatingLabel="Create password"
                      placeholder="Enter password"
                      autoComplete="new-password"
                    />
                  </OverlayTrigger>
                </Form.Group>
              </Stack>
            </Form>
          </div>
          <div>
            <h1 className="h2 mb-4.5">We&apos;re almost there</h1>
            <Card className="mb-4.5">
              <Card.Section>
                [insert payment form]
              </Card.Section>
            </Card>
            <hr />
            <p className="small">
              By confirming this purchase, I agree to the edX for Business Terms and Conditions.
              Your subscription begins today. If you decide to stop auto-renewal, visit your plan
              Billing page to cancel before the next billing date.
            </p>
          </div>
        </Stack>
      </Stepper.Step>
      <Stepper.ActionRow eventKey={eventKey}>
        <Button variant="outline-primary" onClick={handlePrevious}>
          Back
        </Button>
        <Stepper.ActionRow.Spacer />
        <Button onClick={handleNext}>
          Purchase now
        </Button>
      </Stepper.ActionRow>
    </Stack>
  );
};

export default BillingDetails;
