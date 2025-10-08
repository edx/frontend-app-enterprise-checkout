import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import SummaryRow from '../SummaryRow';

describe('SummaryRow', () => {
  it('renders label and right content', () => {
    const { container } = render(<SummaryRow label="Label" right="Right" />);
    validateText('Label');
    validateText('Right');
    // Container should include justify-content-between class via Stack
    expect(container.querySelector('.justify-content-between')).toBeInTheDocument();
  });

  it('applies boldRight to the right content', () => {
    render(<SummaryRow label="Label" right="Right" boldRight />);
    expect(screen.getByText('Right')).toHaveClass('font-weight-bold');
  });

  it('applies custom className to the row container', () => {
    const { container } = render(<SummaryRow label="Label" right="Right" className="my-row-class" />);
    expect(container.querySelector('.my-row-class')).toBeInTheDocument();
  });
});
