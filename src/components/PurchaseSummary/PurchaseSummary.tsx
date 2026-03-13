import { Card, Stack } from '@openedx/paragon';
import React, { useEffect, useRef, useState } from 'react';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import useTestimonials from '@/components/app/data/hooks/useTestimonials';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/index';

import AutoRenewNotice from './AutoRenewNotice';
import DueTodayRow from './DueTodayRow';
import LicensesRow from './LicensesRow';
import PricePerUserRow from './PricePerUserRow';
import PurchaseSummaryCardButton from './PurchaseSummaryCardButton';
import PurchaseSummaryHeader from './PurchaseSummaryHeader';
import TestimonialCard, { Testimonial } from './TestimonialCard';
import TotalAfterTrialRow from './TotalAfterTrialRow';

const PurchaseSummary = () => {
  const quantity = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.PlanDetails]?.quantity,
  );

  const companyName = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.AccountDetails]?.companyName,
  );

  const {
    yearlySubscriptionCostForQuantity,
    yearlyCostPerSubscriptionPerUser,
  } = usePurchaseSummaryPricing();

  const normalizedQuantity = parseInt(quantity, 10) === 0 ? null : quantity;

  // ✅ Move testimonials API call to client hook
  const { data: testimonials = [] } = useTestimonials();
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null);
  const shownTestimonialsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!testimonials.length) { return; }

    let available = testimonials.filter(
      (t) => t.uuid && !shownTestimonialsRef.current.includes(t.uuid),
    );

    if (available.length === 0) {
      available = testimonials;
      shownTestimonialsRef.current = [];
    }

    const random = available[Math.floor(Math.random() * available.length)];

    setCurrentTestimonial(random);

    if (random.uuid) {
      shownTestimonialsRef.current = [...shownTestimonialsRef.current, random.uuid];
    }
  }, [testimonials]);

  return (
    <Card>
      <PurchaseSummaryHeader companyName={companyName} />

      <Card.Section className="pt-2">
        <Stack gap={3}>
          <PricePerUserRow pricePerUser={yearlyCostPerSubscriptionPerUser} />
          <LicensesRow quantity={normalizedQuantity} />

          <hr className="w-100" />

          <TotalAfterTrialRow
            quantity={normalizedQuantity}
            totalPerYear={yearlySubscriptionCostForQuantity}
          />

          <AutoRenewNotice
            quantity={normalizedQuantity}
            totalPerYear={yearlySubscriptionCostForQuantity}
          />

          <DueTodayRow amountDue={0} />

          {currentTestimonial && (
            <TestimonialCard testimonial={currentTestimonial} />
          )}
        </Stack>
      </Card.Section>

      <Card.Footer>
        <PurchaseSummaryCardButton />
      </Card.Footer>
    </Card>
  );
};

export default React.memo(PurchaseSummary);
