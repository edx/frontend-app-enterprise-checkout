import { Stack } from '@openedx/paragon';
import React from 'react';

interface FieldWrapperProps {
  children: React.ReactNode;
}

const FieldWrapper = ({ children }: FieldWrapperProps) => (
  <Stack spacing={2} className="bg-light-300 p-4.5 rounded">
    {children}
  </Stack>
);

export default FieldWrapper;
