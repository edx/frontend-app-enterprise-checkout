import { AppContext } from '@edx/frontend-platform/react';
import React, { useContext } from 'react';

import { TermsAndConditionsText } from '@/components/TermsAndConditionsText';

const AcademicSelectionContent = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  return (
    <>
      {authenticatedUser && (
        <p className="text-sm text-muted">
          Logged in as {authenticatedUser.email}
        </p>
      )}

      <TermsAndConditionsText />
    </>
  );
};

export default AcademicSelectionContent;
