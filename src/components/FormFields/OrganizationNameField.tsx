import { FormattedMessage } from '@edx/frontend-platform/i18n';

import FieldWrapper from '@/components/FieldWrapper/FieldWrapper';

const OrganizationNameField = () => (
  <FieldWrapper>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.organizationName.title"
          defaultMessage="What is the name of your company or organization?"
          description="Title for the organization name field section"
        />
      </h3>
    </div>
  </FieldWrapper>
);

export default OrganizationNameField;
