import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Field, { getTrailingElement } from '../Field';

// Mock the hooks
jest.mock('@/hooks/useCheckoutFormStore', () => ({
  __esModule: true,
  default: () => ({
    formData: { planDetails: {} },
    setFormData: jest.fn(),
  }),
}));

jest.mock('@/hooks/useCurrentStep', () => ({
  __esModule: true,
  default: () => 'planDetails',
}));

// Mock the icons
jest.mock('@openedx/paragon/icons', () => ({
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Error: () => <div data-testid="error-icon" />,
}));

describe('Field', () => {
  const mockForm = {
    formState: {
      errors: {},
      touchedFields: {},
    },
    register: jest.fn().mockReturnValue({
      onChange: jest.fn(),
      onBlur: jest.fn(),
      name: 'testField',
      ref: jest.fn(),
    }),
  };

  const defaultProps = {
    name: 'testField',
    form: mockForm as any,
    label: 'Test Field',
  };

  const renderComponent = (props = {}) => render(
    <IntlProvider locale="en">
      <Field {...defaultProps} {...props} />
    </IntlProvider>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTrailingElement', () => {
    it('returns CheckCircle icon when isValid is true', () => {
      const { container } = render(getTrailingElement({ isValid: true, isInvalid: false }));
      expect(container.querySelector('[data-testid="check-circle-icon"]')).toBeInTheDocument();
    });

    it('returns Error icon when isInvalid is true', () => {
      const { container } = render(getTrailingElement({ isValid: false, isInvalid: true }));
      expect(container.querySelector('[data-testid="error-icon"]')).toBeInTheDocument();
    });

    it('returns null when neither isValid nor isInvalid is true', () => {
      const result = getTrailingElement({ isValid: false, isInvalid: false });
      expect(result).toBeNull();
    });
  });

  describe('Field component', () => {
    it('renders a text input by default', () => {
      renderComponent();
      expect(mockForm.register).toHaveBeenCalledWith('testField', expect.any(Object));
    });

    it('renders a select input when type is select', () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];

      // We need to mock Form.Control to check if it's rendered as a select
      const originalFormControl = Form.Control;
      Form.Control = jest.fn().mockImplementation(({ as, children }) => (
        <div data-testid={`form-control-${as || 'input'}`}>
          {children}
        </div>
      ));

      renderComponent({ type: 'select', options });

      expect(screen.getByTestId('form-control-select')).toBeInTheDocument();

      // Restore the original Form.Control
      Form.Control = originalFormControl;
    });

    it('renders a textarea when type is textarea', () => {
      // We need to mock Form.Control to check if it's rendered as a textarea
      const originalFormControl = Form.Control;
      Form.Control = jest.fn().mockImplementation(({ as }) => (
        <div data-testid={`form-control-${as || 'input'}`} />
      ));

      renderComponent({ type: 'textarea' });

      expect(screen.getByTestId('form-control-textarea')).toBeInTheDocument();

      // Restore the original Form.Control
      Form.Control = originalFormControl;
    });

    it('renders error feedback when there is an error', () => {
      // Create a form with an error
      const formWithError = {
        ...mockForm,
        formState: {
          ...mockForm.formState,
          errors: {
            testField: {
              message: 'This field is required',
            },
          },
          touchedFields: {
            testField: true,
          },
        },
      };

      // Mock Form.Control.Feedback to capture the error message
      const originalFormControlFeedback = Form.Control.Feedback;
      Form.Control.Feedback = jest.fn().mockImplementation(({ children }) => (
        <div data-testid="error-feedback">{children}</div>
      ));

      renderComponent({ form: formWithError as any });

      // Check that the error message is rendered
      expect(screen.getByTestId('error-feedback')).toHaveTextContent('This field is required');

      // Restore the original Form.Control.Feedback
      Form.Control.Feedback = originalFormControlFeedback;
    });
  });
});
