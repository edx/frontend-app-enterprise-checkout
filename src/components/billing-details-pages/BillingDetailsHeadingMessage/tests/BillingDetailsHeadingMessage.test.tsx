import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import BillingDetailsHeadingMessage from '../BillingDetailsHeadingMessage';

describe('BillingDetailsHeadingMessage', () => {
  const renderComponent = (children?: React.ReactNode) => render(
    <BillingDetailsHeadingMessage>
      {children}
    </BillingDetailsHeadingMessage>,
  );

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders the celebration image with correct props', () => {
    renderComponent();
    const image = screen.getByRole('img');

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Celebration of subscription purchase success');
    expect(image).toHaveClass('img-fluid');
  });

  it('renders the container with correct classes', () => {
    renderComponent();
    const container = screen.getByRole('img').closest('.container-fluid');

    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('container-fluid', 'text-center');
  });

  it('renders children content correctly', () => {
    const testContent = 'Test child content';
    renderComponent(<div data-testid="test-child">{testContent}</div>);

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('renders children alongside the image', () => {
    const testContent = 'Test child content';
    renderComponent(<div data-testid="test-child">{testContent}</div>);

    // Both image and children should be present
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('handles multiple children correctly', () => {
    renderComponent(
      <>
        <div data-testid="child-1">First child</div>
        <div data-testid="child-2">Second child</div>
      </>,
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
  });

  it('renders without children', () => {
    renderComponent();

    // Should still render the image
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
