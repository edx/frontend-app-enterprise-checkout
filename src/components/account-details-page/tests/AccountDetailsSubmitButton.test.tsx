import { useIntl } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { useCurrentPageDetails } from '@/hooks/index';

import AccountDetailsSubmitButton from '../AccountDetailsSubmitButton';

// Mock useIntl and useCurrentPageDetails
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: jest.fn(),
}));

// Mock useCurrentPageDetails().buttonMessage
jest.mock('@/hooks/index', () => ({
  useCurrentPageDetails: jest.fn(),
}));
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
  // Mock the formatMessage implementation to return the message descriptor's defaultMessage or id
  const formatMessage = jest.fn(
    (descriptor) => descriptor.defaultMessage || descriptor.id || String(descriptor),
  );
  (useIntl as jest.Mock).mockReturnValue({ formatMessage });

  return render(<AccountDetailsSubmitButton {...props} />);
}

describe('AccountDetailsSubmitButton', () => {
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
    // Can't use expect(button).toBeDisabled() because the Paragon StatefulButton doesn't actually
    // set the `disabled` attribute (no idea why not). Therefore, we need to look at the
    // aria-disabled attribute instead.
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
    // Can't use expect(button).toBeDisabled() because the Paragon StatefulButton doesn't actually
    // set the `disabled` attribute (no idea why not). Therefore, we need to look at the
    // aria-disabled attribute instead.
    expect(button).toHaveAttribute('aria-disabled', 'true');
    // Should show a spinning icon.
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
