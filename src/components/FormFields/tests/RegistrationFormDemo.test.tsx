import { render } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { PlanDetailsRegisterPageSchema } from '@/constants/checkout';
import RegisterAccountFields from '../RegisterAccountFields';

// Demo component that shows the registration form structure
const RegistrationFormDemo = () => {
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
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1>Registration Form Demo</h1>
        <p>This demonstrates the implemented registration form with all validation fields:</p>
        <RegisterAccountFields form={form} />
        
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
          <h3>Validation Features Implemented:</h3>
          <ul>
            <li>✅ Work Email field (email validation, pre-populated when available)</li>
            <li>✅ Full Name field (required, max 255 chars)</li>
            <li>✅ Public Username field (required, alphanumeric + hyphens/underscores)</li>
            <li>✅ Password field (min 8 chars, max 255 chars)</li>
            <li>✅ Confirm Password field (must match password)</li>
            <li>✅ Country dropdown (required, predefined options)</li>
            <li>✅ Server-side validation via LMS registration endpoint</li>
            <li>✅ Error mapping from LMS to friendly field-specific messages</li>
          </ul>
        </div>
      </div>
    </IntlProvider>
  );
};

describe('Registration Form Demo', () => {
  it('renders complete registration form structure', () => {
    const { container } = render(<RegistrationFormDemo />);
    
    // Verify the main form structure is in place
    expect(container.querySelector('input[type="email"]')).toBeTruthy();
    expect(container.querySelector('input[type="password"]')).toBeTruthy();
    expect(container.querySelector('select')).toBeTruthy();
    
    // Check form field count (should have 6 fields)
    const inputs = container.querySelectorAll('input, select');
    expect(inputs.length).toBe(6);
  });
});