import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { useQuery } from '@tanstack/react-query';
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
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  if (!ENTERPRISE_ACCESS_BASE_URL) {
    return [];
  }

  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/testimonials/`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    const data = camelCaseObject(response.data);

    const results = Array.isArray(data) ? data : data?.results;
    if (!Array.isArray(results)) {
      return [];
    }

    return results
      .filter((testimonial) => testimonial && typeof testimonial === 'object')
      .filter((testimonial) => testimonial?.isActive !== false)
      .map((testimonial) => {
        const quoteText = testimonial.quoteText || testimonial.quote_text;
        const attributionName = testimonial.attributionName || testimonial.attribution_name;
        const attributionTitle = testimonial.attributionTitle || testimonial.attribution_title;

        return {
          uuid: testimonial.uuid,
          quote_text: quoteText,
          attribution_name: attributionName,
          attribution_title: attributionTitle,
          is_active: testimonial.isActive ?? testimonial.is_active,
        };
      })
      .filter((testimonial) => (
        !!testimonial.quote_text
        && !!testimonial.attribution_name
        && !!testimonial.attribution_title
      ));
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
