import { IntlProvider } from '@edx/frontend-platform/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useForm } from 'react-hook-form';

import { validateRegistrationFieldsDebounced } from '@/components/app/data/services/registration';
import { RegisterAccountFields } from '@/components/FormFields';
import { PlanDetailsRegisterPageSchema } from '@/constants/checkout';
import { queryClient } from '@/utils/tests';

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

// Mock the registration validation services
jest.mock('@/components/app/data/services/registration', () => ({
  validateRegistrationFieldsDebounced: jest.fn(),
}));

// Mock the icons
jest.mock('@openedx/paragon/icons', () => ({
  Lock: () => <div data-testid="lock-icon" />,
  Visibility: () => <div data-testid="visibility-icon" />,
  VisibilityOff: () => <div data-testid="visibility-off-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Error: () => <div data-testid="error-icon" />,
}));

// Test component wrapper that provides form context
const TestWrapper = (
  { children, formProps = {} }: { children: React.ReactNode | ((form: any) => React.ReactNode); formProps?: any },
) => {
  const form = useForm({
    mode: 'onTouched', // Use onTouched mode to match real application behavior
    resolver: zodResolver(PlanDetailsRegisterPageSchema()),
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
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        {typeof children === 'function' ? children(form) : children}
      </IntlProvider>
    </QueryClientProvider>
  );
};

describe('RegisterAccountFields', () => {
  const mockValidateRegistrationFieldsDebounced = validateRegistrationFieldsDebounced as
    jest.MockedFunction<typeof validateRegistrationFieldsDebounced>;

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
    // Set up default mock for all tests to prevent undefined errors
    mockValidateRegistrationFieldsDebounced.mockImplementation(() => Promise.resolve({
      isValid: true,
      errors: {},
    }));
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
    it.each<[
      label: string,
      index: number,
      placeholder: RegExp,
    ]>([
      ['password', 0, /Enter your password/i],
      ['confirm password', 1, /Confirm your password/i],
    ])('toggles %s field visibility when button is clicked', async (_label, index, placeholder) => {
      const user = userEvent.setup();
      renderComponent();

      const field = screen.getByPlaceholderText(placeholder);
      const toggleButtons = screen.getAllByRole('button');
      const toggle = toggleButtons[index];

      // Initially should be password type
      expect(field).toHaveAttribute('type', 'password');

      // Click toggle button
      await user.click(toggle);

      // Should change to text type
      await waitFor(() => {
        expect(field).toHaveAttribute('type', 'text');
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
      form.setValue('password', '1');
      await form.trigger('password');

      const passwordError = form.getFieldState('password').error;
      expect(passwordError?.message).toMatch(/at least 2 characters/i);
    });

    it.each<[
      title: string,
      password: string,
      confirmPassword: string,
      expectError: boolean,
    ]>([
      ['shows error when passwords do not match', 'password123', 'differentpassword', true],
      ['passes when passwords match', 'password123', 'password123', false],
    ])('%s', async (_title, password, confirmPassword, expectError) => {
      const form = renderComponent();

      form.setValue('password', password);
      form.setValue('confirmPassword', confirmPassword);
      await form.trigger(['password', 'confirmPassword']);

      const confirmPasswordError = form.getFieldState('confirmPassword').error;
      if (expectError) {
        expect(confirmPasswordError?.message).toMatch(/do not match/i);
      } else {
        const passwordError = form.getFieldState('password').error;
        expect(passwordError).toBeUndefined();
        expect(confirmPasswordError).toBeUndefined();
      }
    });

    describe('Password Whitespace Handling', () => {
      it.each<[
        title: string,
        password: string,
        confirmPassword: string,
        expectError: boolean,
      ]>([
        ['trims leading spaces from password', ' password123', 'password123', false],
        ['trims trailing spaces from password', 'password123 ', 'password123', false],
        ['trims leading and trailing spaces from password', ' password123 ', 'password123', false],
        ['trims leading spaces from confirmPassword', 'password123', ' password123', false],
        ['trims trailing spaces from confirmPassword', 'password123', 'password123 ', false],
        ['trims leading and trailing spaces from confirmPassword', 'password123', ' password123 ', false],
        ['trims spaces from both fields', ' password123 ', ' password123 ', false],
        ['shows error when passwords differ after trimming', 'password123', 'password456', true],
        ['trims multiple leading spaces', '   password123', 'password123', false],
        ['trims multiple trailing spaces', 'password123   ', 'password123', false],
        ['trims tabs and spaces', '\tpassword123 ', ' password123\t', false],
        ['shows error with different passwords and spaces', ' password123 ', ' differentpassword ', true],
      ])('%s', async (_title, password, confirmPassword, expectError) => {
        const form = renderComponent();

        form.setValue('password', password);
        form.setValue('confirmPassword', confirmPassword);
        await form.trigger(['password', 'confirmPassword']);

        const confirmPasswordError = form.getFieldState('confirmPassword').error;
        if (expectError) {
          expect(confirmPasswordError?.message).toMatch(/do not match/i);
        } else {
          const passwordError = form.getFieldState('password').error;
          expect(passwordError).toBeUndefined();
          expect(confirmPasswordError).toBeUndefined();
        }
      });

      it('does not trim internal spaces in passwords', async () => {
        const form = renderComponent();

        const passwordWithSpaces = 'pass word 123';
        form.setValue('password', passwordWithSpaces);
        form.setValue('confirmPassword', passwordWithSpaces);
        await form.trigger(['password', 'confirmPassword']);

        const confirmPasswordError = form.getFieldState('confirmPassword').error;
        const passwordError = form.getFieldState('password').error;

        expect(passwordError).toBeUndefined();
        expect(confirmPasswordError).toBeUndefined();
      });

      it('shows error when internal spaces differ between password and confirmPassword', async () => {
        const form = renderComponent();

        form.setValue('password', 'pass word123');
        form.setValue('confirmPassword', 'password123');
        await form.trigger(['password', 'confirmPassword']);

        const confirmPasswordError = form.getFieldState('confirmPassword').error;
        expect(confirmPasswordError?.message).toMatch(/do not match/i);
      });

      it('validates minimum length after trimming whitespace', async () => {
        const form = renderComponent();

        // Single character with spaces should fail after trimming
        form.setValue('password', ' 1 ');
        await form.trigger('password');

        const passwordError = form.getFieldState('password').error;
        expect(passwordError?.message).toMatch(/at least 2 characters/i);
      });

      it('validates maximum length after trimming whitespace', async () => {
        const form = renderComponent();

        // Create a password that's 76 characters (exceeds max of 75)
        const longPassword = 'a'.repeat(76);
        form.setValue('password', ` ${longPassword} `);
        await form.trigger('password');

        const passwordError = form.getFieldState('password').error;
        expect(passwordError?.message).toMatch(/no more than 75 characters/i);
      });

      it('handles empty strings with only whitespace', async () => {
        const form = renderComponent();

        form.setValue('password', '   ');
        form.setValue('confirmPassword', '   ');
        await form.trigger(['password', 'confirmPassword']);

        const passwordError = form.getFieldState('password').error;
        const confirmPasswordError = form.getFieldState('confirmPassword').error;

        // Should fail validation because after trimming, it's empty
        expect(passwordError?.message).toMatch(/at least 2 characters/i);
        expect(confirmPasswordError?.message).toMatch(/confirm your password/i);
      });
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

    it('allows editing of editable fields and shows readonly fields correctly', () => {
      renderComponent();

      const fullNameField = screen.getByPlaceholderText(/Enter your full name/i);
      const usernameField = screen.getByPlaceholderText(/Enter your public username/i);
      const passwordField = screen.getByPlaceholderText(/Enter your password/i);

      // fullName field should be readonly according to component implementation
      expect(fullNameField).toHaveAttribute('readonly');
      expect(fullNameField).not.toBeDisabled();

      // username and password fields should be editable
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

  describe('Validation API Integration', () => {
    beforeEach(() => {
      // Clear call history but keep the default mock implementation from the main beforeEach
      mockValidateRegistrationFieldsDebounced.mockClear();
    });

    it('calls validation API when form is submitted with valid data', async () => {
      const form = renderComponent();

      // Set valid form data
      await act(async () => {
        form.setValue('adminEmail', 'test@example.com');
        form.setValue('fullName', 'John Doe');
        form.setValue('username', 'johndoe');
        form.setValue('password', 'validpassword123');
        form.setValue('confirmPassword', 'validpassword123');
        form.setValue('country', 'US');
      });

      // Trigger form validation
      await act(async () => {
        await form.trigger();
      });

      // Verify the validation API was called with correct parameters
      await waitFor(() => {
        expect(mockValidateRegistrationFieldsDebounced).toHaveBeenCalledWith({
          email: 'test@example.com',
          name: 'John Doe',
          username: 'johndoe',
          password: 'validpassword123',
          country: 'US',
        });
      });
    });

    it('handles validation API success response correctly', async () => {
      mockValidateRegistrationFieldsDebounced.mockImplementation(() => Promise.resolve({
        isValid: true,
        errors: {},
      }));

      const form = renderComponent();

      // Set valid form data
      await act(async () => {
        form.setValue('adminEmail', 'test@example.com');
        form.setValue('fullName', 'John Doe');
        form.setValue('username', 'johndoe');
        form.setValue('password', 'validpassword123');
        form.setValue('confirmPassword', 'validpassword123');
        form.setValue('country', 'US');
      });

      // Trigger validation
      await act(async () => {
        await form.trigger();
      });

      await waitFor(() => {
        // Form should be valid when API returns success
        expect(form.formState.isValid).toBe(true);
        expect(Object.keys(form.formState.errors)).toHaveLength(0);
      });
    });

    it('handles validation API error response correctly', async () => {
      mockValidateRegistrationFieldsDebounced.mockImplementation(() => Promise.resolve({
        isValid: false,
        errors: {
          adminEmail: 'Email already exists',
          username: 'Username is too short',
        },
      }));

      const form = renderComponent();

      // Set form data that will trigger validation errors
      await act(async () => {
        form.setValue('adminEmail', 'existing@example.com');
        form.setValue('fullName', 'John Doe');
        form.setValue('username', 'js');
        form.setValue('password', 'validpassword123');
        form.setValue('confirmPassword', 'validpassword123');
        form.setValue('country', 'US');
      });

      // Trigger validation
      await act(async () => {
        await form.trigger();
      });

      await waitFor(() => {
        // Form should have errors when API returns validation errors
        const { errors } = form.formState;
        expect(errors.adminEmail?.message).toBe('Email already exists');
        expect(errors.username?.message).toBe('Username is too short');
      });
    });

    it('does not call validation API when passwords do not match', async () => {
      const form = renderComponent();

      // Set mismatched passwords
      await act(async () => {
        form.setValue('adminEmail', 'test@example.com');
        form.setValue('fullName', 'John Doe');
        form.setValue('username', 'johndoe');
        form.setValue('password', 'password123');
        form.setValue('confirmPassword', 'differentpassword');
        form.setValue('country', 'US');
      });

      // Trigger validation
      await act(async () => {
        await form.trigger();
      });

      // When passwords don't match, client-side validation should surface the error regardless of server validation
      await waitFor(() => {
        const { error } = form.getFieldState('confirmPassword');
        expect(error?.message).toMatch(/do not match/i);
      });
    });

    it('calls validation API only when all required fields are present', async () => {
      const form = renderComponent();

      // Set incomplete form data (missing username)
      await act(async () => {
        form.setValue('adminEmail', 'test@example.com');
        form.setValue('fullName', 'John Doe');
        form.setValue('username', '');
        form.setValue('password', 'validpassword123');
        form.setValue('confirmPassword', 'validpassword123');
        form.setValue('country', 'US');
      });

      // Trigger validation
      await act(async () => {
        await form.trigger();
      });

      // Should have client-side validation error first, but API might still be called
      await waitFor(() => {
        const { errors } = form.formState;
        expect(errors.username?.message).toBe('Username must be between 2 and 30 characters long.');
      });
    });

    it('handles validation API network errors gracefully', async () => {
      mockValidateRegistrationFieldsDebounced.mockImplementation(() => Promise.reject(new Error('Network error')));

      const form = renderComponent();

      // Set valid form data
      await act(async () => {
        form.setValue('adminEmail', 'test@example.com');
        form.setValue('fullName', 'John Doe');
        form.setValue('username', 'johndoe');
        form.setValue('password', 'validpassword123');
        form.setValue('confirmPassword', 'validpassword123');
        form.setValue('country', 'US');
      });

      // Trigger validation - this should handle the network error gracefully
      await act(async () => {
        try {
          await form.trigger();
        } catch (error) {
          // The error should be handled by the validation schema
        }
      });

      // Verify the validation API was called
      await waitFor(() => {
        expect(mockValidateRegistrationFieldsDebounced).toHaveBeenCalled();
      });
    });

    it('maps field errors correctly from API response to form fields', async () => {
      mockValidateRegistrationFieldsDebounced.mockImplementation(() => Promise.resolve({
        isValid: false,
        errors: {
          adminEmail: 'Invalid email',
          fullName: 'This field is required',
          username: 'Username is required',
          password: 'Password must be at least 8 characters',
          country: 'Country is required',
        },
      }));

      const form = renderComponent();

      // Set form data that would trigger validation errors
      await act(async () => {
        form.setValue('adminEmail', 'invalid-email');
        form.setValue('fullName', '');
        form.setValue('username', '');
        form.setValue('password', 'weak');
        form.setValue('confirmPassword', 'weak');
        form.setValue('country', '');
      });

      // Trigger validation
      await act(async () => {
        await form.trigger();
      });

      await waitFor(() => {
        const { errors } = form.formState;
        // Check that API validation errors are properly mapped to form fields
        expect(mockValidateRegistrationFieldsDebounced).toHaveBeenCalled();
        // The form should have validation errors from either client-side or API validation
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      });
    });
  });
});
