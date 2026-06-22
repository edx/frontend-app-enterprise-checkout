import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import SystemWideWarningBanner from '../SystemWideWarningBanner';

describe('SystemWideWarningBanner', () => {
  it('renders the banner message when content exists', () => {
    render(
      <SystemWideWarningBanner>
        Scheduled maintenance in progress.
      </SystemWideWarningBanner>,
    );

    expect(screen.getByText('Scheduled maintenance in progress.')).toBeInTheDocument();
  });

  it('does not render a dismiss button by default', () => {
    render(<SystemWideWarningBanner>Maintenance notice</SystemWideWarningBanner>);

    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });
});
