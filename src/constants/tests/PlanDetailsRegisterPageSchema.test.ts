import { PlanDetailsRegisterPageSchema } from '../checkout';

// Mock the validateRegistrationFields to avoid network calls in tests
jest.mock('@/components/app/data/services/registration', () => ({
  validateRegistrationFields: jest.fn().mockResolvedValue({
    isValid: true,
    errors: {},
  }),
}));

describe('PlanDetailsRegisterPageSchema', () => {
  const schema = PlanDetailsRegisterPageSchema({});

  it('validates valid registration data', async () => {
    const validData = {
      adminEmail: 'test@example.com',
      fullName: 'John Doe',
      username: 'johndoe',
      password: 'password123',
      confirmPassword: 'password123',
      country: 'US',
    };

    const result = await schema.safeParseAsync(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', async () => {
    const invalidData = {
      adminEmail: 'invalid-email',
      fullName: 'John Doe',
      username: 'johndoe',
      password: 'password123',
      confirmPassword: 'password123',
      country: 'US',
    };

    const result = await schema.safeParseAsync(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('valid email');
    }
  });

  it('rejects short passwords', async () => {
    const invalidData = {
      adminEmail: 'test@example.com',
      fullName: 'John Doe',
      username: 'johndoe',
      password: '123',
      confirmPassword: '123',
      country: 'US',
    };

    const result = await schema.safeParseAsync(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('8 characters');
    }
  });

  it('rejects when passwords do not match', async () => {
    const invalidData = {
      adminEmail: 'test@example.com',
      fullName: 'John Doe',
      username: 'johndoe',
      password: 'password123',
      confirmPassword: 'different123',
      country: 'US',
    };

    const result = await schema.safeParseAsync(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('do not match');
    }
  });

  it('rejects invalid username format', async () => {
    const invalidData = {
      adminEmail: 'test@example.com',
      fullName: 'John Doe',
      username: 'john@doe!', // Invalid characters
      password: 'password123',
      confirmPassword: 'password123',
      country: 'US',
    };

    const result = await schema.safeParseAsync(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('letters, numbers, hyphens, and underscores');
    }
  });

  it('requires all fields', async () => {
    const invalidData = {
      adminEmail: '',
      fullName: '',
      username: '',
      password: '',
      confirmPassword: '',
      country: '',
    };

    const result = await schema.safeParseAsync(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should have multiple validation errors
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});