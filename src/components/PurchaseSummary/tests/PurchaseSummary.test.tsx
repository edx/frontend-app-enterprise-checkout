import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import PurchaseSummary from '../PurchaseSummary';

jest.mock('@/utils/common', () => ({
  isEssentialsFlow: jest.fn(),
}));

jest.mock('../TeamsPurchaseSummary', () => function MockTeamsPurchaseSummary() {
  return <div>Teams Purchase Summary</div>;
});
jest.mock('../EssentialsPurchaseSummary', () => function MockEssentialsPurchaseSummary() {
  return <div>Essentials Purchase Summary</div>;
});

describe('PurchaseSummary', () => {
  const { isEssentialsFlow } = jest.requireMock('@/utils/common');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders teams wrapper for non-essentials flow', () => {
    (isEssentialsFlow as jest.Mock).mockReturnValue(false);

    render(<PurchaseSummary />);

    expect(screen.getByText('Teams Purchase Summary')).toBeInTheDocument();
    expect(screen.queryByText('Essentials Purchase Summary')).not.toBeInTheDocument();
  });

  it('renders essentials wrapper for essentials flow', () => {
    (isEssentialsFlow as jest.Mock).mockReturnValue(true);

    render(<PurchaseSummary />);

    expect(screen.getByText('Essentials Purchase Summary')).toBeInTheDocument();
    expect(screen.queryByText('Teams Purchase Summary')).not.toBeInTheDocument();
  });
});
