import React from 'react';

import { CheckoutSubstepKey, DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore, useCurrentStep } from '@/hooks/index';

import ComparePlansBox from './ComparePlansBox';
import PurchaseSummaryBase from './PurchaseSummaryBase';
import PurchaseSummaryCardButton from './PurchaseSummaryCardButton';

// TODO: Remove this hardcoded price once it correctly propagates from the Stripe API
const ESSENTIALS_PRICE_PER_USER = 149;

type AcademySelectionData = {
  academyName?: string;
};

type PlanDetailsWithAcademy = {
  quantity?: number;
  academyName?: string;
};

const EssentialsPurchaseSummary = () => {
  const { currentSubstepKey } = useCurrentStep();
  const planDetailsData = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.PlanDetails] as PlanDetailsWithAcademy,
  );

  const quantity = planDetailsData?.quantity;

  const academySelectionData = useCheckoutFormStore(
    (state) => (state.formData as Record<string, AcademySelectionData>)[DataStoreKey.AcademySelection],
  );

  const academyName = academySelectionData?.academyName ?? null;

  const normalizedQuantity = quantity && Number(quantity) > 0 ? Number(quantity) : null;

  const totalPerYear = normalizedQuantity && normalizedQuantity > 0
    ? normalizedQuantity * ESSENTIALS_PRICE_PER_USER
    : null;

  const isSuccessPage = currentSubstepKey === CheckoutSubstepKey.Success;

  return (
    <>
      <PurchaseSummaryBase
        headerName={academyName}
        isEssentials
        pricePerUser={ESSENTIALS_PRICE_PER_USER}
        priceLabel="Essentials subscription, price per user, paid yearly."
        quantity={normalizedQuantity}
        totalPerYear={totalPerYear}
        actionButton={<PurchaseSummaryCardButton />}
      />
      {!isSuccessPage && <div className="mt-3"><ComparePlansBox /></div>}
    </>
  );
};

export default React.memo(EssentialsPurchaseSummary);
