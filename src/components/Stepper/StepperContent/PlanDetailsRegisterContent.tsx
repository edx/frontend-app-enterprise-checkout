import { UseFormReturn } from 'react-hook-form';

import { RegisterAccountFields } from '@/components/FormFields';

interface PlanDetailsRegisterContentProps {
  form: UseFormReturn<Partial<PlanDetailsData>>;
}

const PlanDetailsRegisterContent = ({ form }: PlanDetailsRegisterContentProps) => (
  <RegisterAccountFields form={form} />
);

export default PlanDetailsRegisterContent;
