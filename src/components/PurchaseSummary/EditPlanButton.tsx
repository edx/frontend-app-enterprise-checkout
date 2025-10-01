import { Button } from '@openedx/paragon';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import { CheckoutPageRoute } from '@/constants/checkout';

const EditPlanButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline-danger"
      className="border-light w-100"
      onClick={() => navigate(CheckoutPageRoute.PlanDetails)}
      data-testid="edit-plan-button"
    >
      <FormattedMessage
        id="components.PurchaseSummary.EditPlanButton.editPlan"
        defaultMessage="Edit Plan"
        description="Button text to edit the current plan selection"
      />
    </Button>
  );
};

export default React.memo(EditPlanButton);
