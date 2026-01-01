import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ConfirmationPage from '@/components/confirmation-page/ConfirmationPage';

jest.mock('@openedx/paragon', () => {
  const Container = ({ children, size, className }) => (
    <div
      data-testid="container"
      data-size={size}
      className={className}
    >
      {children}
    </div>
  );

  const Stack = ({ children, gap }) => (
    <div data-testid="stack" data-gap={gap}>
      {children}
    </div>
  );

  const Skeleton = ({ height }) => (
    <div data-testid="skeleton" data-height={height} />
  );

  const Alert = ({ children, variant, icon: Icon, dismissible }) => {
    const [visible, setVisible] = React.useState(true);

    if (!visible) {
      return null;
    }

    return (
      <div data-testid="alert" data-variant={variant}>
        {Icon ? <Icon /> : null}

        {dismissible && (
          <button
            type="button"
            aria-label="close"
            data-testid="alert-close"
            onClick={() => setVisible(false)}
          >
            x
          </button>
        )}

        {children}
      </div>
    );
  };

  Alert.Heading = function AlertHeading({ children }) {
    return <div data-testid="alert-heading">{children}</div>;
  };

  return {
    Container,
    Stack,
    Skeleton,
    Alert,
  };
});

jest.mock('@openedx/paragon/icons', () => ({
  CheckCircle: () => <span data-testid="check-circle" />,
}));

describe('ConfirmationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders headings, messages, and skeleton', () => {
    render(<ConfirmationPage />);

    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent(
      'Congratulations, your subscription is confirmed!',
    );

    expect(
      screen.getByRole('heading', { level: 2 }),
    ).toHaveTextContent(
      "We're processing your subscription...",
    );

    expect(screen.getByText('authenticatedUser')).toBeInTheDocument();
    expect(screen.getByText('@edx/frontend-platform')).toBeInTheDocument();
    expect(screen.getByText('enterprise_admin')).toBeInTheDocument();

    expect(screen.getByTestId('skeleton')).toHaveAttribute(
      'data-height',
      '200',
    );
  });

  it('renders Alert with CheckCircle icon and is dismissible', () => {
    render(<ConfirmationPage />);

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveAttribute('data-variant', 'success');

    expect(screen.getByTestId('check-circle')).toBeInTheDocument();

    expect(screen.getByTestId('alert-heading')).toHaveTextContent(
      'Enjoy your free trial subscription',
    );
    expect(
      screen.getByText('Lorem ipsum dolar sit emit.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('alert-close'));
    expect(alert).not.toBeInTheDocument();
  });
});
