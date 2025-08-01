import { UseFormReturn } from 'react-hook-form';

import { LoginFields } from '@/components/FormFields';

interface PlanDetailsLoginContentProps {
  form: UseFormReturn<Partial<PlanDetailsData>>;
}

const PlanDetailsLoginContent = ({ form }: PlanDetailsLoginContentProps) => (
  <LoginFields form={form} />
);

export default PlanDetailsLoginContent;
