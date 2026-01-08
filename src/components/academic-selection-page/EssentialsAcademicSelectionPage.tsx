import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, Stepper } from '@openedx/paragon';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';

import { useStepperContent } from '@/components/Stepper/Steps/hooks';
import {CheckoutStepKey, DataStoreKey} from '@/constants/checkout';
import {useCheckoutFormStore, useCurrentPageDetails} from '@/hooks/index';
import {useFormValidationConstraints} from "@/components/app/data";

const EssentialsAcademicSelectionPage = () => {
  console.log('Academic Selection Page');
  const StepperContent = useStepperContent();
  const { data: formValidationConstraints } = useFormValidationConstraints();
  const eventKey = CheckoutStepKey.Essentials;
  const {
    formSchema,
  } = useCurrentPageDetails();
  const essentialsFormData = useCheckoutFormStore((state) => state.formData[DataStoreKey.EssentialsAcademicSelection]);

  const essentialsAcademicSelectionSchema = useMemo(() => (
    formSchema(formValidationConstraints)
  ));

  const form = useForm<AccountDetailsData>({
    mode: 'onTouched',
    resolver: zodResolver(essentialsAcademicSelectionSchema),
    defaultValues: essentialsFormData,
  });

  return (
    <>
      <Helmet title="Academic Selection Page" />
      <Stack gap={4}>
        <Stepper.Step eventKey={eventKey} title="Academic Selection Page">
          <Stack gap={4}>
            <StepperContent form={form} />
          </Stack>
        </Stepper.Step>
      </Stack>
    </>
  );
};

export default EssentialsAcademicSelectionPage;
