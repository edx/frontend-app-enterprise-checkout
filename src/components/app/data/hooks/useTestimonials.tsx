import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { Testimonial } from '@/components/PurchaseSummary/TestimonialCard';

export const SEEDED_ACTIVE_TESTIMONIALS: Testimonial[] = [
  {
    uuid: 'seed-1',
    quote_text: 'Our team ramped up on critical cloud skills in weeks, not months, with the flexibility to learn on demand.',
    attribution_name: 'Nora Patel',
    attribution_title: 'Head of Workforce Transformation, Atlas Systems',
    is_active: true,
  },
  {
    uuid: 'seed-2',
    quote_text: 'The platform made it simple to standardize learning paths across departments while still letting teams choose relevant courses.',
    attribution_name: 'Daniel Kim',
    attribution_title: 'Director of L&D, Brightline Health',
    is_active: true,
  },
  {
    uuid: 'seed-3',
    quote_text: 'We launched a company-wide upskilling initiative with confidence because reporting and course quality were both strong.',
    attribution_name: 'Aisha Morgan',
    attribution_title: 'Chief People Officer, North Harbor Group',
    is_active: true,
  },
  {
    uuid: 'seed-4',
    quote_text: 'In just one quarter, we aligned technical upskilling goals across three business units and saw stronger project delivery outcomes.',
    attribution_name: 'Lena Brooks',
    attribution_title: 'VP, Talent Strategy, Meridian Digital',
    is_active: true,
  },
  {
    uuid: 'seed-5',
    quote_text: 'We needed practical, job-relevant learning at scale. This gave our teams confidence to apply new skills immediately.',
    attribution_name: 'Rahul Mehta',
    attribution_title: 'Senior Director, Engineering Enablement, Apex Mobility',
    is_active: true,
  },
  {
    uuid: 'seed-6',
    quote_text: 'Managers finally had a consistent way to guide development conversations with measurable learning milestones.',
    attribution_name: 'Carla Jimenez',
    attribution_title: 'Head of Learning Operations, Vertex Retail',
    is_active: true,
  },
  {
    uuid: 'seed-7',
    quote_text: 'The breadth of content let us support both early-career hires and senior specialists without changing platforms.',
    attribution_name: 'Owen Clarke',
    attribution_title: 'Chief Technology Officer, Redstone Analytics',
    is_active: true,
  },
  {
    uuid: 'seed-8',
    quote_text: 'This became a core part of our workforce transformation roadmap, especially for data and AI readiness.',
    attribution_name: 'Priya Shah',
    attribution_title: 'Director, Organizational Capability, Harbor Financial',
    is_active: true,
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
  const fallbackTestimonials = SEEDED_ACTIVE_TESTIMONIALS;

  try {
    const user = getAuthenticatedUser();
    const res = user
      ? await getAuthenticatedHttpClient().get(url)
      : await axios.get(url);

    const results = res.data?.results;
    if (!Array.isArray(results)) {
      return fallbackTestimonials;
    }

    const activeTestimonials = results.filter((testimonial) => testimonial?.is_active !== false);
    return activeTestimonials.length ? activeTestimonials : fallbackTestimonials;
  } catch {
    return fallbackTestimonials;
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
