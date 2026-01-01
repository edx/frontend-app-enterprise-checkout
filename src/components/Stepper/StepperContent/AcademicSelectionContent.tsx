import { AppContext } from '@edx/frontend-platform/react';
import React, { useContext } from 'react';

import { TermsAndConditionsText } from '@/components/TermsAndConditionsText';

const AcademicSelectionContent = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return (
    <>
      {authenticatedUser && (
        <p className="text-sm text-muted" data-testid="authenticated-user-email">
          Logged in as {authenticatedUser.email}
        </p>
      )}

      <div data-testid="terms-and-conditions-wrapper">
        <TermsAndConditionsText />
      </div>
    </>
  );
};

export default AcademicSelectionContent;
