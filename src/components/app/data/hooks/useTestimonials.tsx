import { getConfig } from '@edx/frontend-platform/config';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { Testimonial } from '@/components/PurchaseSummary/TestimonialCard';

export const TESTIMONIALS_SESSION_KEY = 'sspc.testimonials.shown.uuids';

export const getShownTestimonialUuids = (): Set<string> => {
  if (typeof window === 'undefined') {
    return new Set<string>();
  }

  try {
    const raw = window.sessionStorage.getItem(TESTIMONIALS_SESSION_KEY);
    if (!raw) {
      return new Set<string>();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }
    return new Set<string>(parsed.filter((value) => typeof value === 'string'));
  } catch {
    return new Set<string>();
  }
};

export const setShownTestimonialUuids = (shownUuids: Set<string>): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(TESTIMONIALS_SESSION_KEY, JSON.stringify(Array.from(shownUuids)));
};

export const pickNextTestimonial = (
  testimonials: Testimonial[],
  shownUuids: Set<string>,
): Testimonial | null => {
  if (!testimonials.length) {
    return null;
  }

  const testimonialKey = ({ uuid, quote_text: quoteText, attribution_name: attributionName }: Testimonial) => (
    uuid || `${attributionName}::${quoteText}`
  );

  let available = testimonials.filter((testimonial) => !shownUuids.has(testimonialKey(testimonial)));

  if (!available.length) {
    shownUuids.clear();
    available = testimonials;
  }

  const next = available[Math.floor(Math.random() * available.length)];
  shownUuids.add(testimonialKey(next));

  return next;
};

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  const config = getConfig() as Record<string, string | undefined>;
  const shouldUseRelativePath = config.TESTIMONIALS_API_USE_RELATIVE_PATH === 'true';
  const testimonialsBaseUrl = config.TESTIMONIALS_API_BASE_URL || config.ENTERPRISE_ACCESS_BASE_URL;
  const url = shouldUseRelativePath
    ? '/api/v1/testimonials/'
    : `${testimonialsBaseUrl}/api/v1/testimonials/`;

  if (!shouldUseRelativePath && !testimonialsBaseUrl) {
    return [];
  }

  try {
    const res = await axios.get(url);

    const payload = res.data;
    const results = Array.isArray(payload) ? payload : payload?.results;
    if (!Array.isArray(results)) {
      return [];
    }

    return results.filter((testimonial) => testimonial?.is_active !== false);
  } catch {
    return [];
  }
};

const useTestimonials = () => useQuery({
  queryKey: ['testimonials'],
  queryFn: fetchTestimonials,
  staleTime: Infinity,
});

export const useRotatingTestimonial = (rotationKey?: string | number): Testimonial | null => {
  const { data: testimonials = [] } = useTestimonials();
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (!testimonials.length) {
      setCurrentTestimonial(null);
      return;
    }

    const shownUuids = getShownTestimonialUuids();
    const nextTestimonial = pickNextTestimonial(testimonials, shownUuids);
    setShownTestimonialUuids(shownUuids);
    setCurrentTestimonial(nextTestimonial);
  }, [rotationKey, testimonials]);

  return currentTestimonial;
};

export default useTestimonials;
