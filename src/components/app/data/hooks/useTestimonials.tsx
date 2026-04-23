import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { Testimonial } from '@/components/PurchaseSummary/TestimonialCard';

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    uuid: 'fallback-1',
    quote_text: 'The need for qualified IT workers is at an unprecedented level, and our partnership with edX is providing the skills needed to be successful in an IT career.',
    attribution_name: 'Eric Westphal',
    attribution_title: 'Leader of Global Workforce Strategy and Economic Development, Cognizant',
  },
  {
    uuid: 'fallback-2',
    quote_text: 'The subscription has been a game-changer for upskilling our workforce quickly and efficiently.',
    attribution_name: 'Michael Chen',
    attribution_title: 'VP of Engineering, Innovate Inc.',
  },
  {
    uuid: 'fallback-3',
    quote_text: 'Our employees love the flexibility and breadth of courses available on edX.',
    attribution_name: 'Emily Rodriguez',
    attribution_title: 'Chief People Officer, GrowthCo',
  },
];

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
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/testimonials/`;
  try {
    const user = getAuthenticatedUser();
    const res = user
      ? await getAuthenticatedHttpClient().get(url)
      : await axios.get(url);
    return res.data?.results?.length ? res.data.results : DEFAULT_TESTIMONIALS;
  } catch {
    return DEFAULT_TESTIMONIALS;
  }
};

const useTestimonials = () => useQuery({
  queryKey: ['testimonials'],
  queryFn: fetchTestimonials,
  staleTime: Infinity,
});

export default useTestimonials;
