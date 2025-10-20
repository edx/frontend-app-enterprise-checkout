import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import { VALIDATION_DEBOUNCE_MS } from '@/components/app/data/constants';
import {
  validateRegistrationFields,
  validateRegistrationFieldsDebounced,
} from '@/components/app/data/services/registration';

// Mocks
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

// Provide predictable utils behavior if needed
jest.mock('@edx/frontend-platform', () => ({
  camelCaseObject: (obj: any) => obj,
  snakeCaseObject: (obj: any) => obj,
}));

const mockConfig = {
  LMS_BASE_URL: 'https://lms.example.com',
};

// Helpers
const makeAllPassDecisions = () => ({
  validationDecisions: {
    name: '',
    username: '',
    email: '',
    password: '',
    country: '',
  },
});

const makeValues = (overrides: Partial<RegistrationRequestSchema> = {}): RegistrationRequestSchema => ({
  email: 'user@example.com',
  name: 'Jane Doe',
  username: 'janedoe',
  password: 'password-12345678',
  country: 'US',
  ...overrides,
});

describe('registration.ts validation', () => {
  const mockPost = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getConfig as jest.Mock).mockReturnValue(mockConfig);
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post: mockPost });
  });

  describe('validateRegistrationFields', () => {
    it('returns isValid=true and empty errors when all fields pass (empty strings)', async () => {
      // Setup
      mockPost.mockResolvedValue({ data: makeAllPassDecisions() });

      const values = makeValues();

      // Execute
      const result = await validateRegistrationFields(values);

      // Verify
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('maps single field error and returns isValid=false', async () => {
      // Setup: name fails, others pass
      mockPost.mockResolvedValue({
        data: {
          validationDecisions: {
            name: 'Enter your full name',
            username: '',
            email: '',
            password: '',
            country: '',
          },
        },
      });

      const result = await validateRegistrationFields(makeValues({ name: '' }));

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({ fullName: 'Enter your full name' });
    });

    it('maps multiple field errors and returns all messages with isValid=false', async () => {
      mockPost.mockResolvedValue({
        data: {
          validationDecisions: {
            name: '',
            username: 'Username must be between 2 and 30 characters long.',
            email: 'Enter a valid email address that contains at least 3 characters.',
            password: 'This password is too short. It must contain at least 2 characters.',
            country: 'Select your country or region of residence',
          },
        },
      });

      const result = await validateRegistrationFields(makeValues({ username: 'a' }));

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        adminEmail: 'Enter a valid email address that contains at least 3 characters.',
        username: 'Username must be between 2 and 30 characters long.',
        password: 'This password is too short. It must contain at least 2 characters.',
        country: 'Select your country or region of residence',
      });
    });

    it('treats HTTP errors as non-blocking and returns a safe default', async () => {
      mockPost.mockRejectedValue(new Error('Server error'));

      const result = await validateRegistrationFields(makeValues());

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('validateRegistrationFieldsDebounced', () => {
    it('debounces validations: executes ~500ms after last call and only once', async () => {
      // Minimal post mock returning all-valid decisions
      mockPost.mockResolvedValue({ data: makeAllPassDecisions() });

      await assertDebounce({
        baseDelayMs: VALIDATION_DEBOUNCE_MS,
        preCalls: [
          () => validateRegistrationFieldsDebounced(makeValues({ username: 'user1' })),
        ],
        call: () => validateRegistrationFieldsDebounced(makeValues({ username: 'user2' })),
        getInvocationCount: () => mockPost.mock.calls.length,
        upperMarginMs: 20,
      });
    });
  });
});
