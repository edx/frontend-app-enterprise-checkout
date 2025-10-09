import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { CheckoutPageRoute } from '@/constants/checkout';

import EditPlanButton from './EditPlanButton';
import ReceiptButton from './ReceiptButton';

const BUTTON_TYPES = {
  EDIT: 'edit',
  RECEIPT: 'receipt',
  NONE: 'none',
} as const;

type ButtonType = typeof BUTTON_TYPES[keyof typeof BUTTON_TYPES];

const ROUTE_BUTTON_MAP: Record<string, ButtonType> = {
  [CheckoutPageRoute.AccountDetails]: BUTTON_TYPES.EDIT,
  [CheckoutPageRoute.BillingDetails]: BUTTON_TYPES.EDIT,
  [CheckoutPageRoute.BillingDetailsSuccess]: BUTTON_TYPES.RECEIPT,
  [CheckoutPageRoute.PlanDetails]: BUTTON_TYPES.NONE,
  [CheckoutPageRoute.PlanDetailsLogin]: BUTTON_TYPES.NONE,
  [CheckoutPageRoute.PlanDetailsRegister]: BUTTON_TYPES.NONE,
};

const BUTTON_COMPONENTS: Record<ButtonType, React.ComponentType | null> = {
  [BUTTON_TYPES.EDIT]: EditPlanButton,
  [BUTTON_TYPES.RECEIPT]: ReceiptButton,
  [BUTTON_TYPES.NONE]: null,
};

const PurchaseSummaryCardButton: React.FC = () => {
  const location = useLocation();

  const buttonType = useMemo(
    (): ButtonType => ROUTE_BUTTON_MAP[location.pathname] ?? BUTTON_TYPES.NONE,
    [location.pathname],
  );

  const ButtonComponent = BUTTON_COMPONENTS[buttonType];

  return ButtonComponent ? <ButtonComponent /> : null;
};

export default PurchaseSummaryCardButton;
