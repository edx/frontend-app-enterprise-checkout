import { Stack } from '@openedx/paragon';
import React from 'react';

interface FieldContainerProps {
  children: React.ReactNode;
}

const FieldContainer = ({ children }: FieldContainerProps) => (
  <Stack spacing={2} className="bg-light-300 p-4.5 rounded">
    {children}
  </Stack>
);

export default FieldContainer;
