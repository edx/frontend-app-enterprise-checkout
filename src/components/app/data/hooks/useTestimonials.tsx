import { getConfig } from '@edx/frontend-platform/config';
import { useQuery } from '@tanstack/react-query';

import { Testimonial } from '@/components/PurchaseSummary/TestimonialCard';

const fetchTestimonials = async (): Promise<Testimonial[]> => {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const res = await fetch(`${ENTERPRISE_ACCESS_BASE_URL}/api/v1/testimonials/`);
  if (!res.ok) { return []; }
  const data = await res.json();
  return data.results || [];
};

const useTestimonials = () => useQuery({
  queryKey: ['testimonials'],
  queryFn: fetchTestimonials,
  staleTime: Infinity,
});

export default useTestimonials;
