import React, { useEffect, useState } from 'react';
import { Card, Stack } from '@openedx/paragon';

import TestimonialCard from './TestimonialCard';
import { usePurchaseSummaryPricing } from '@/components/app/data';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/index';

import AutoRenewNotice from './AutoRenewNotice';
import DueTodayRow from './DueTodayRow';
import LicensesRow from './LicensesRow';
import PricePerUserRow from './PricePerUserRow';
import PurchaseSummaryCardButton from './PurchaseSummaryCardButton';
import PurchaseSummaryHeader from './PurchaseSummaryHeader';
import TotalAfterTrialRow from './TotalAfterTrialRow';

const PurchaseSummary: React.FC = () => {
  const quantity = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.PlanDetails]?.quantity
  );

  const companyName = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.AccountDetails].companyName
  );

  const {
    yearlySubscriptionCostForQuantity,
    yearlyCostPerSubscriptionPerUser,
  } = usePurchaseSummaryPricing();

  const normalizedQuantity =
    parseInt(quantity, 10) === 0 ? null : quantity;

  // -----------------------------
  // Testimonial State
  // -----------------------------
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState<any | null>(null);
  const [shownTestimonials, setShownTestimonials] = useState<string[]>([]);

  // -----------------------------
  // Fetch testimonials
  // -----------------------------
  useEffect(() => {
    const abortController = new AbortController();

    const url = `${process.env.ENTERPRISE_ACCESS_BASE_URL}/api/v1/testimonials/`;

    fetch(url, { signal: abortController.signal })
      .then((res) => {
        if (!res.ok) {
          console.error('Testimonials API failed:', res.status);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        const results = data?.results || [];

        setTestimonials(results);

        if (results.length > 0) {
          const randomIndex = Math.floor(Math.random() * results.length);
          const firstTestimonial = results[randomIndex];

          setCurrentTestimonial(firstTestimonial);
          setShownTestimonials([firstTestimonial.uuid]);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch testimonials:', err);
        }
      });

    return () => abortController.abort();
  }, []);

  // -----------------------------
  // Rotation logic
  // -----------------------------
  const showNextTestimonial = () => {
    if (!testimonials.length) return;

    let available = testimonials.filter(
      (t) => !shownTestimonials.includes(t.uuid)
    );

    if (available.length === 0) {
      available = testimonials;
      setShownTestimonials([]);
    }

    const random =
      available[Math.floor(Math.random() * available.length)];

    setCurrentTestimonial(random);
    setShownTestimonials((prev) => [...prev, random.uuid]);
  };

  // Rotate when quantity changes
  useEffect(() => {
    if (testimonials.length > 0) {
      showNextTestimonial();
    }
  }, [quantity, testimonials]);

  return (
    <Card>
      <PurchaseSummaryHeader companyName={companyName} />

      <Card.Section className="pt-2">
        <Stack gap={3}>
          <PricePerUserRow
            pricePerUser={yearlyCostPerSubscriptionPerUser}
          />

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

          {/* Testimonial */}
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