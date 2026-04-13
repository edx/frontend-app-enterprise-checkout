import React, { useEffect, useRef, useState } from 'react';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import useTestimonials from '@/components/app/data/hooks/useTestimonials';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/index';

import PurchaseSummaryBase from './PurchaseSummaryBase';
import PurchaseSummaryCardButton from './PurchaseSummaryCardButton';
import TestimonialCard, { Testimonial } from './TestimonialCard';

const TeamsPurchaseSummary = () => {
  const quantity = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.PlanDetails]?.quantity,
  );

  const companyName = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.AccountDetails]?.companyName,
  );

  const { yearlyCostPerSubscriptionPerUser } = usePurchaseSummaryPricing();

  const normalizedQuantity = parseInt(quantity, 10) === 0 ? null : quantity;

  const totalPerYear = normalizedQuantity && normalizedQuantity > 0 && yearlyCostPerSubscriptionPerUser
    ? normalizedQuantity * yearlyCostPerSubscriptionPerUser
    : null;

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
    <PurchaseSummaryBase
      headerName={companyName}
      pricePerUser={yearlyCostPerSubscriptionPerUser}
      quantity={normalizedQuantity}
      totalPerYear={totalPerYear}
      actionButton={<PurchaseSummaryCardButton variant="teams" />}
      extraContent={currentTestimonial ? <TestimonialCard testimonial={currentTestimonial} /> : null}
    />
  );
};

export default React.memo(TeamsPurchaseSummary);
