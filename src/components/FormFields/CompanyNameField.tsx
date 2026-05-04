import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Stack } from '@openedx/paragon';
import { useContext, useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';
import { DataStoreKey } from '@/constants/checkout';
import { PLAN_TYPE, TRACKED_FIELDS } from '@/constants/events';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import useCurrentStep from '@/hooks/useCurrentStep';
import { trackFieldBlur } from '@/hooks/useFieldTracking';
import { findAvailableSlug, generateSlugFromCompanyName } from '@/utils/checkout';

interface CompanyNameFieldProps {
  form: UseFormReturn<AccountDetailsData>
}

const CompanyNameField = ({ form }: CompanyNameFieldProps) => {
  const intl = useIntl();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: bffContext } = useBFFContext(authenticatedUser?.userId || null);
  const checkoutIntentId = bffContext?.checkoutIntent?.id ?? null;
  const checkoutIntentUuid = bffContext?.checkoutIntent?.uuid ?? null;
  const { currentStepKey, currentSubstepKey } = useCurrentStep();

  const planDetailsFormData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  const handleCompanyNameBlur = async () => {
    // Track field blur event
    trackFieldBlur({
      fieldName: TRACKED_FIELDS.COMPANY_NAME,
      step: currentStepKey,
      substep: currentSubstepKey,
      checkoutIntentId,
      checkoutIntentUuid,
      additionalProperties: {
        plan_type: PLAN_TYPE.TEAMS,
      },
    });

    // Get the current company name value
    const companyName = form.getValues('companyName');

    // Clear slug if company name is empty or whitespace-only
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      form.setValue('enterpriseSlug', '', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      return;
    }

    // Don't generate if slug already has a value (to avoid overwriting user's previous selection)
    const currentSlug = form.getValues('enterpriseSlug');
    if (currentSlug && currentSlug.trim().length > 0) {
      return;
    }

    try {
      setIsGeneratingSlug(true);

      // Generate base slug from company name
      const baseSlug = generateSlugFromCompanyName(companyName, 30);

      if (!baseSlug) {
        return;
      }

      // Find an available slug (handles collisions)
      const availableSlug = await findAvailableSlug(
        baseSlug,
        planDetailsFormData.adminEmail,
        30,
      );

      // Populate the enterpriseSlug field
      form.setValue('enterpriseSlug', availableSlug, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    } finally {
      setIsGeneratingSlug(false);
    }
  };

  return (
    <FieldContainer>
      <Stack gap={3}>
        <h3>
          <FormattedMessage
            id="checkout.organizationName.title"
            defaultMessage="What is the name of your company or organization?"
            description="Title for the organization name field section"
          />
        </h3>
        <Field
          form={form}
          name="companyName"
          type="text"
          floatingLabel={intl.formatMessage({
            id: 'checkout.nameAndEmailFields.companyName.floatingLabel',
            defaultMessage: 'Company Name',
            description: 'Floating label for the company name input field',
          })}
          placeholder={intl.formatMessage({
            id: 'checkout.nameAndEmailFields.companyName.placeholder',
            defaultMessage: 'Enter your company name',
            description: 'Placeholder for the company name input field',
          })}
          controlClassName="mr-0 mt-3"
          onBlur={handleCompanyNameBlur}
          disabled={isGeneratingSlug}
        />
      </Stack>
    </FieldContainer>
  );
};

export default CompanyNameField;
