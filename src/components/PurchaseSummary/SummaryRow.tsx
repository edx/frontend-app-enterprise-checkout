import { Stack } from '@openedx/paragon';
import classNames from 'classnames';
import React from 'react';

interface SummaryRowProps {
  label: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  boldRight?: boolean;
}

const SummaryRowComponent: React.FC<SummaryRowProps> = ({ label, right, className, boldRight }) => (
  <Stack gap={6} direction="horizontal" className={classNames('justify-content-between', className)}>
    <div>{label}</div>
    <div className={classNames('text-right', { 'font-weight-bold': boldRight })}>{right}</div>
  </Stack>
);

const SummaryRow = React.memo(SummaryRowComponent);
export default SummaryRow;
