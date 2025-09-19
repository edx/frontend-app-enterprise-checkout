import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { PlanDetailsRegisterPageSchema } from '@/constants/checkout';
import RegisterAccountFields from '../RegisterAccountFields';

// Create a test wrapper component
const TestWrapper = () => {
  const form = useForm({
    resolver: zodResolver(PlanDetailsRegisterPageSchema({})),
    defaultValues: {
      adminEmail: '',
      fullName: '',
      username: '',
      password: '',
      confirmPassword: '',
      country: '',
    },
  });

  return (
    <IntlProvider locale="en">
      <RegisterAccountFields form={form} />
    </IntlProvider>
  );
};

describe('RegisterAccountFields', () => {
  it('renders all registration form fields', () => {
    render(<TestWrapper />);

    // Check that all fields are rendered
    expect(screen.getByLabelText(/work email/i)).toBeDefined();
    expect(screen.getByLabelText(/full name/i)).toBeDefined();
    expect(screen.getByLabelText(/public username/i)).toBeDefined();
    expect(screen.getByLabelText(/^password$/i)).toBeDefined();
    expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
    expect(screen.getByLabelText(/country/i)).toBeDefined();
  });

  it('renders registration title and description', () => {
    render(<TestWrapper />);

    expect(screen.getByText(/register your edx account to start the trial/i)).toBeDefined();
    expect(screen.getByText(/your edx learner account will be granted administrator access/i)).toBeDefined();
  });

  it('includes country options', () => {
    render(<TestWrapper />);

    const countrySelect = screen.getByLabelText(/country/i);
    expect(countrySelect).toBeDefined();
    expect(countrySelect.tagName).toBe('SELECT');
  });

  it('has proper field types', () => {
    render(<TestWrapper />);

    expect(screen.getByLabelText(/work email/i).getAttribute('type')).toBe('email');
    expect(screen.getByLabelText(/^password$/i).getAttribute('type')).toBe('password');
    expect(screen.getByLabelText(/confirm password/i).getAttribute('type')).toBe('password');
    expect(screen.getByLabelText(/full name/i).getAttribute('type')).toBe('text');
    expect(screen.getByLabelText(/public username/i).getAttribute('type')).toBe('text');
  });
});