import { Card, Stack } from '@openedx/paragon';
import React, { useEffect, useRef, useState } from 'react';

import { usePurchaseSummaryPricing } from '@/components/app/data';
import useTestimonials from '@/components/app/data/hooks/useTestimonials';
import { isEssentialsFlow } from '@/components/app/routes/loaders/utils';
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

  const { yearlyCostPerSubscriptionPerUser } = usePurchaseSummaryPricing();

  const normalizedQuantity = parseInt(quantity, 10) === 0 ? null : quantity;

  const isEssentials = isEssentialsFlow();

  // For Essentials, hardcode price to $149
  const pricePerUser = isEssentials ? 149 : yearlyCostPerSubscriptionPerUser;
  const totalPerYear = normalizedQuantity && normalizedQuantity > 0 && pricePerUser
    ? normalizedQuantity * pricePerUser
    : null;

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
    <Stack gap={3}>
      <Card className="border border-secondary">
        <PurchaseSummaryHeader companyName={companyName} isEssentials={isEssentials} />

        <Card.Section className="pt-2">
          <Stack gap={3}>
            <PricePerUserRow pricePerUser={pricePerUser} isEssentials={isEssentials} />
            <LicensesRow quantity={normalizedQuantity} />

            <hr className="w-100" />

            <TotalAfterTrialRow
              quantity={normalizedQuantity}
              totalPerYear={totalPerYear}
            />

            <AutoRenewNotice
              quantity={normalizedQuantity}
              totalPerYear={totalPerYear}
            />

            <DueTodayRow amountDue={0} />

            {currentTestimonial && !isEssentials && (
              <TestimonialCard testimonial={currentTestimonial} />
            )}
          </Stack>
        </Card.Section>

        <Card.Footer>
          <PurchaseSummaryCardButton isEssentials={isEssentials} />
        </Card.Footer>
      </Card>

      {isEssentials && (
        <Card className="bg-light border">
          <Card.Body className="text-center">
            <p className="mb-0">
              Not sure which plan is right for you?{' '}
              <a
                href="https://business.edx.org/course-library-compare-plans/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Compare plans
              </a>
            </p>
          </Card.Body>
        </Card>
      )}
    </Stack>
  );
};

export default React.memo(PurchaseSummary);
