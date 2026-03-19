import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { FieldContainer } from '@/components/FieldContainer';
import Field from '@/components/FormFields/Field';
import { CHECKOUT_STEPS, PLAN_TYPE, TRACKED_FIELDS } from '@/constants/tracking';
import { useDebounceTracking } from '@/hooks/useDebounceTracking';

import type { UseFormReturn } from 'react-hook-form';

interface CustomUrlFieldProps {
  form: UseFormReturn<AccountDetailsData>
}

const CustomUrlField = ({ form }: CustomUrlFieldProps) => {
  const intl = useIntl();
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { data: bffContext } = useBFFContext(authenticatedUser?.userId || null);
  const checkoutIntentId = bffContext?.checkoutIntent?.id || null;

  // Get the current value of the enterpriseSlug field for org_slug property
  const enterpriseSlugValue = form.watch('enterpriseSlug') || '';

  const handleUrlSlugBlur = useDebounceTracking({
    fieldName: TRACKED_FIELDS.URL_SLUG,
    step: CHECKOUT_STEPS.ACCOUNT_DETAILS,
    checkoutIntentId,
    additionalProperties: {
      plan_type: PLAN_TYPE.TEAMS,
      org_slug: enterpriseSlugValue,
    },
    debounceMs: 500,
  });

  return (
    <FieldContainer>
      <div>
        <h3>
          <FormattedMessage
            id="checkout.customUrlField.title"
            defaultMessage="Create a custom URL for your team"
            description="Title for the custom url field section"
          />
        </h3>
        <p className="fs-4 font-weight-light">
          <FormattedMessage
            id="checkout.customUrl.description"
            defaultMessage="This is how your colleagues will access your team subscription on edX.
           This access link name cannot be changed after your trial subscription starts."
            description="Description text explaining the custom url field purpose"
          />
        </p>
        <span className="d-flex align-items-center mt-3">
          https://enterprise.edx.org/
          <Field
            name="enterpriseSlug"
            type="text"
            form={form}
            placeholder={intl.formatMessage({
              id: 'checkout.customUrlField.enterpriseSlug.floatingLabel',
              defaultMessage: 'URL name',
              description: 'Floating label for the custom url input field',
            })}
            controlClassName="ml-1.5"
            className="flex-grow-1 m-0 pt-2"
            formText="Your link must be alphanumeric, lowercase, and may include hyphens"
            onBlur={handleUrlSlugBlur}
          />
        </span>
      </div>
    </FieldContainer>
  );
};

export default CustomUrlField;
