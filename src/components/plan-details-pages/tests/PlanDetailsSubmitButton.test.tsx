import { useIntl } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { useCurrentPageDetails } from '@/hooks/index';

import PlanDetailsSubmitButton from '../PlanDetailsSubmitButton';

// Mock useIntl and useCurrentPageDetails
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: jest.fn(),
}));

jest.mock('@/hooks/index', () => ({
  useCurrentPageDetails: jest.fn(),
}));

// Set a default buttonMessage for tests
(useCurrentPageDetails as jest.Mock).mockReturnValue({
  buttonMessage: {
    id: 'checkout.continue',
    defaultMessage: 'Continue',
    description: 'Continue to next step',
  },
});

function setup(props = {
  formIsValid: false,
  submissionIsPending: false,
  submissionIsSuccess: false,
  submissionIsError: false,
}) {
  // Mock formatMessage to return defaultMessage or id
  const formatMessage = jest.fn(
    (descriptor) => descriptor.defaultMessage || descriptor.id || String(descriptor),
  );
  (useIntl as jest.Mock).mockReturnValue({ formatMessage });

  return render(<PlanDetailsSubmitButton {...props} />);
}

describe('PlanDetailsSubmitButton', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default state and enabled', () => {
    setup({
      formIsValid: true,
      submissionIsPending: false,
      submissionIsSuccess: false,
      submissionIsError: false,
    });
    const button = screen.getByTestId('stepper-submit-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Continue');
    expect(button).not.toBeDisabled();
  });

  it('renders as disabled when form is not valid', () => {
    setup({
      formIsValid: false,
      submissionIsPending: false,
      submissionIsSuccess: false,
      submissionIsError: false,
    });
    const button = screen.getByTestId('stepper-submit-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Continue');
    // Paragon StatefulButton uses aria-disabled
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows pending state when submission is pending', () => {
    setup({
      formIsValid: true,
      submissionIsPending: true,
      submissionIsSuccess: false,
      submissionIsError: false,
    });
    const button = screen.getByTestId('stepper-submit-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Submitting...');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button.querySelector('.icon-spin')).toBeInTheDocument();
  });

  it('shows complete state when submission is successful', () => {
    setup({
      formIsValid: true,
      submissionIsPending: false,
      submissionIsSuccess: true,
      submissionIsError: false,
    });
    const button = screen.getByTestId('stepper-submit-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Submitted');
    expect(button).not.toBeDisabled();
  });

  it('prioritizes complete state over invalid form', () => {
    setup({
      formIsValid: false,
      submissionIsPending: false,
      submissionIsSuccess: true,
      submissionIsError: false,
    });
    const button = screen.getByTestId('stepper-submit-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Submitted');
    expect(button).not.toBeDisabled();
  });

  it('renders the error state', () => {
    setup({
      formIsValid: true,
      submissionIsPending: false,
      submissionIsSuccess: false,
      submissionIsError: true,
    });
    const button = screen.getByTestId('stepper-submit-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Try Again');
    expect(button).not.toBeDisabled();
  });
});
