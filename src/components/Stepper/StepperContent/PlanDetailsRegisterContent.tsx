import { UseFormReturn } from 'react-hook-form';

import { RegisterAccountFields } from '@/components/FormFields';

interface PlanDetailsRegisterContentProps {
  form: UseFormReturn<PlanDetailsData>;
}

const PlanDetailsRegisterContent = ({ form }: PlanDetailsRegisterContentProps) => (
  <RegisterAccountFields form={form} />
);

export default PlanDetailsRegisterContent;
