import { AppContext } from '@edx/frontend-platform/react';
import React, { useContext } from 'react';

import { CheckoutSubstepKey, DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore, useCurrentStep } from '@/hooks/index';
import { extractPriceByProductLookupKey } from '@/utils/checkout';

import useBFFContext from '../app/data/hooks/useBFFContext';

import ComparePlansBox from './ComparePlansBox';
import PurchaseSummaryBase from './PurchaseSummaryBase';
import PurchaseSummaryCardButton from './PurchaseSummaryCardButton';

type PlanDetailsWithAcademy = {
  quantity?: number;
  academyName?: string;
};

const EssentialsPurchaseSummary = () => {
  const { currentSubstepKey } = useCurrentStep();
  const planDetailsData = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.PlanDetails] as PlanDetailsWithAcademy,
  );
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const quantity = planDetailsData?.quantity;
  const academySelectionData = useCheckoutFormStore((state) => state.formData[DataStoreKey.AcademySelection]);
  const product = academySelectionData?.selectedProduct;
  const { data: bffPrice } = useBFFContext(authenticatedUser?.userId ?? null, {
    select: (contextData): number | null => extractPriceByProductLookupKey(contextData?.pricing, product?.lookupKey),
  });

  if (!product) {
    return null;
  }
  const academyName = (product?.name || '').trim();

  const pricePerUser = bffPrice ?? null;

  const normalizedQuantity = quantity && Number(quantity) > 0 ? Number(quantity) : null;

  const totalPerYear = normalizedQuantity && pricePerUser
    ? normalizedQuantity * pricePerUser
    : null;

  const isSuccessPage = currentSubstepKey === CheckoutSubstepKey.Success;

  return (
    <>
      <PurchaseSummaryBase
        headerName={academyName}
        isEssentials
        pricePerUser={pricePerUser}
        priceLabel="Essentials subscription, price per user, paid yearly."
        quantity={normalizedQuantity}
        totalPerYear={totalPerYear}
        actionButton={<PurchaseSummaryCardButton />}
      />
      {!isSuccessPage && <div className="mt-4"><ComparePlansBox /></div>}
    </>
  );
};

export default React.memo(EssentialsPurchaseSummary);
