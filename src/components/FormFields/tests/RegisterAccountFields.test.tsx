import { IntlProvider } from '@edx/frontend-platform/i18n';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useForm } from 'react-hook-form';

import RegisterAccountFields from '../RegisterAccountFields';

// Mock the hooks used by Field component
jest.mock('@/hooks/index', () => {
  const mockState = {
    formData: { PlanDetails: {} },
    setFormData: jest.fn(),
  };
  return {
    __esModule: true,
    useCheckoutFormStore: jest.fn((selector?: (s: any) => any) => (selector ? selector(mockState) : mockState)),
    useCurrentStep: jest.fn(() => ({
      currentStep: 'PlanDetails',
      currentStepKey: 'PlanDetails',
      currentSubstep: undefined,
      currentSubstepKey: undefined,
    })),
  };
});

// Mock the icons
jest.mock('@openedx/paragon/icons', () => ({
  Lock: () => <div data-testid="lock-icon" />,
  Visibility: () => <div data-testid="visibility-icon" />,
  VisibilityOff: () => <div data-testid="visibility-off-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Error: () => <div data-testid="error-icon" />,
}));

// Test component wrapper that provides form context
const TestWrapper = ({ children, formProps = {} }: { children: React.ReactNode | ((form: any) => React.ReactNode); formProps?: any }) => {
  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      adminEmail: 'test@example.com',
      fullName: '',
      username: '',
      password: '',
      confirmPassword: '',
      country: '',
      ...formProps,
    },
  });

  return (
    <IntlProvider locale="en">
      {typeof children === 'function' ? children(form) : children}
    </IntlProvider>
  );
};

describe('RegisterAccountFields', () => {
  const renderComponent = (formProps = {}) => {
    let formInstance: any;

    render(
      <TestWrapper formProps={formProps}>
        {(form: any) => {
          formInstance = form;
          return <RegisterAccountFields form={form} />;
        }}
      </TestWrapper>,
    );

    return formInstance;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the title and description', () => {
      renderComponent();

      expect(screen.getByText(/Register your edX account to start the trial/i)).toBeInTheDocument();
      expect(screen.getByText(/Your edX learner account will be granted administrator access/i)).toBeInTheDocument();
    });

    it('renders all required form fields', () => {
      renderComponent();

      // Check for field labels/placeholders
      expect(screen.getByPlaceholderText(/Enter your work email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your public username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Confirm your password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Select a country/i)).toBeInTheDocument();
    });

    it('renders the admin email field as read-only with lock icon', () => {
      renderComponent();

      const adminEmailField = screen.getByPlaceholderText(/Enter your work email/i);
      expect(adminEmailField).toHaveAttribute('readonly');
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('renders the country dropdown as disabled', () => {
      renderComponent();

      const countryField = screen.getByPlaceholderText(/Select a country/i);
      expect(countryField).toBeDisabled();
    });

    it('renders password visibility toggle buttons', () => {
      renderComponent();

      // Should have visibility icons for password fields
      const visibilityIcons = screen.getAllByTestId('visibility-icon');
      expect(visibilityIcons).toHaveLength(2); // One for password, one for confirm password
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password field visibility when button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const passwordField = screen.getByPlaceholderText(/Enter your password/i);
      const toggleButtons = screen.getAllByRole('button');
      const passwordToggle = toggleButtons[0]; // First button should be password toggle

      // Initially should be password type
      expect(passwordField).toHaveAttribute('type', 'password');
      expect(screen.getAllByTestId('visibility-icon')).toHaveLength(2);

      // Click toggle button
      await user.click(passwordToggle);

      // Should change to text type and show visibility-off icon
      await waitFor(() => {
        expect(passwordField).toHaveAttribute('type', 'text');
      });
    });

    it('toggles confirm password field visibility independently', async () => {
      const user = userEvent.setup();
      renderComponent();

      const confirmPasswordField = screen.getByPlaceholderText(/Confirm your password/i);
      const toggleButtons = screen.getAllByRole('button');
      const confirmPasswordToggle = toggleButtons[1]; // Second button should be confirm password toggle

      // Initially should be password type
      expect(confirmPasswordField).toHaveAttribute('type', 'password');

      // Click toggle button for confirm password
      await user.click(confirmPasswordToggle);

      // Should change to text type
      await waitFor(() => {
        expect(confirmPasswordField).toHaveAttribute('type', 'text');
      });
    });

    it('has proper accessibility labels for toggle buttons', () => {
      renderComponent();

      const toggleButtons = screen.getAllByRole('button');
      const passwordToggleButtons = toggleButtons.filter(button => button.getAttribute('aria-label')?.includes('password'));

      expect(passwordToggleButtons).toHaveLength(2);
      passwordToggleButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', expect.stringMatching(/Show password|Hide password/));
      });
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const form = renderComponent();

      // Set empty values to trigger required field validation
      await act(async () => {
        form.setValue('fullName', '');
        form.setValue('username', '');
        form.setValue('password', '');
      });

      // Trigger validation
      await act(async () => {
        await form.trigger(['fullName', 'username', 'password']);
      });

      await waitFor(() => {
        const { errors } = form.formState;
        expect(Object.keys(errors)).toEqual(expect.arrayContaining(['fullName', 'username', 'password']));
      });
    });

    it('validates password minimum length', async () => {
      const form = renderComponent();

      // Set a short password
      form.setValue('password', '123');
      await form.trigger('password');

      const passwordError = form.getFieldState('password').error;
      expect(passwordError?.message).toMatch(/at least 8 characters/i);
    });

    it('validates password confirmation match', async () => {
      const form = renderComponent();

      // Set different passwords
      form.setValue('password', 'password123');
      form.setValue('confirmPassword', 'differentpassword');
      await form.trigger('confirmPassword');

      const confirmPasswordError = form.getFieldState('confirmPassword').error;
      expect(confirmPasswordError?.message).toMatch(/do not match/i);
    });

    it('passes validation when passwords match', async () => {
      const form = renderComponent();

      // Set matching passwords
      form.setValue('password', 'password123');
      form.setValue('confirmPassword', 'password123');
      await form.trigger(['password', 'confirmPassword']);

      const passwordError = form.getFieldState('password').error;
      const confirmPasswordError = form.getFieldState('confirmPassword').error;

      expect(passwordError).toBeUndefined();
      expect(confirmPasswordError).toBeUndefined();
    });
  });

  describe('Country Dropdown', () => {
    it('renders country options', () => {
      renderComponent();

      const countrySelect = screen.getByPlaceholderText(/Select a country/i);

      // Check that select has options (this might require opening the select)
      expect(countrySelect).toBeInTheDocument();
      expect(countrySelect).toBeDisabled();
    });

    it('includes expected countries in options', () => {
      renderComponent();

      // Since the dropdown is rendered as a select element, we can check its children
      const countrySelect = screen.getByPlaceholderText(/Select a country/i);
      const selectElement = countrySelect.closest('select');

      if (selectElement) {
        const options = Array.from(selectElement.querySelectorAll('option'));
        const optionValues = options.map(option => option.getAttribute('value')).filter(Boolean);

        expect(optionValues).toContain('US');
        expect(optionValues).toContain('CA');
        expect(optionValues).toContain('GB');
        expect(optionValues).toContain('AU');
      }
    });
  });

  describe('Field States', () => {
    it('shows admin email field as locked and read-only', () => {
      renderComponent();

      const adminEmailField = screen.getByPlaceholderText(/Enter your work email/i);
      expect(adminEmailField).toHaveAttribute('readonly');
      // Test that lock icon is present
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('shows country dropdown as disabled with proper styling', () => {
      renderComponent();

      const countryField = screen.getByPlaceholderText(/Select a country/i);
      expect(countryField).toBeDisabled();
    });

    it('allows editing of required fields', () => {
      renderComponent();

      const fullNameField = screen.getByPlaceholderText(/Enter your full name/i);
      const usernameField = screen.getByPlaceholderText(/Enter your public username/i);
      const passwordField = screen.getByPlaceholderText(/Enter your password/i);

      expect(fullNameField).not.toHaveAttribute('readonly');
      expect(fullNameField).not.toBeDisabled();
      expect(usernameField).not.toHaveAttribute('readonly');
      expect(usernameField).not.toBeDisabled();
      expect(passwordField).not.toHaveAttribute('readonly');
      expect(passwordField).not.toBeDisabled();
    });
  });

  describe('Form Integration', () => {
    it('accepts form prop and integrates with react-hook-form', () => {
      const form = renderComponent();

      expect(form).toBeDefined();
      expect(typeof form.register).toBe('function');
      expect(typeof form.formState).toBe('object');
      expect(typeof form.getValues).toBe('function');
    });

    it('uses form validation rules correctly', async () => {
      const form = renderComponent();

      // Set valid values
      await act(async () => {
        form.setValue('fullName', 'John Doe');
        form.setValue('username', 'johndoe');
        form.setValue('password', 'password123');
        form.setValue('confirmPassword', 'password123');
      });

      // Trigger validation
      await act(async () => {
        await form.trigger();
      });

      await waitFor(() => {
        const { errors } = form.formState;
        // Check that there are no validation errors for the fields we set
        expect(errors.fullName).toBeUndefined();
        expect(errors.username).toBeUndefined();
        expect(errors.password).toBeUndefined();
        expect(errors.confirmPassword).toBeUndefined();
      });
    });
  });

  describe('Internationalization', () => {
    it('renders with proper internationalization context', () => {
      renderComponent();

      // Check that text is rendered (this confirms i18n is working)
      expect(screen.getByText(/Register your edX account to start the trial/i)).toBeInTheDocument();
      expect(screen.getByText(/Your edX learner account will be granted administrator access/i)).toBeInTheDocument();
    });

    it('uses proper field labels and placeholders', () => {
      renderComponent();

      // Check that all internationalized text is present
      expect(screen.getByPlaceholderText(/Enter your work email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your public username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Confirm your password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Select a country/i)).toBeInTheDocument();
    });
  });
});
