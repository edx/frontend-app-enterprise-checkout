import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { FieldContainer } from '@/components/FieldWrapper';

const OrganizationNameField = () => (
  <FieldContainer>
    <div>
      <h3>
        <FormattedMessage
          id="checkout.organizationName.title"
          defaultMessage="What is the name of your company or organization?"
          description="Title for the organization name field section"
        />
      </h3>
    </div>
  </FieldContainer>
);

export default OrganizationNameField;
