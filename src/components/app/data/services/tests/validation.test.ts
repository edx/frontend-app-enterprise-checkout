import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import { VALIDATION_DEBOUNCE_MS } from '@/components/app/data/constants';

import {
  validationDecisionFactory,
  validationResponsePayloadFactory,
  validationResponsePayloadWithDecisionsFactory,
  validationResponseWithDecisionsFactory,
  validationSchemaPayloadFactory,
} from '../__factories__';
import fetchCheckoutValidation, { validateFieldDetailed } from '../validation';

// Mock setup
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  snakeCaseObject: jest.fn(),
}));

/**
 * Helper function to verify the structure of a validation response
 */
const verifyValidationResponseStructure = (response: ValidationResponse): ValidationResponse => {
  // Verify the top-level structure
  expect(response).toHaveProperty('validationDecisions');
  expect(response).toHaveProperty('userAuthn');
  expect(response.userAuthn).toHaveProperty('userExistsForEmail');

  return response;
};

const mockConfig = {
  ENTERPRISE_ACCESS_BASE_URL: 'https://example.com',
};

/**
 * Helper function to verify a specific validation decision
 */
const verifyValidationDecision = (
  decision: ValidationDecision,
  expectedErrorCode: string | null,
  expectedMessagePattern: RegExp | string | null,
): void => {
  expect(decision).toHaveProperty('errorCode');
  expect(decision).toHaveProperty('developerMessage');

  if (expectedErrorCode) {
    expect(decision.errorCode).toBe(expectedErrorCode);
  }

  if (expectedMessagePattern) {
    expect(decision.developerMessage).toMatch(expectedMessagePattern);
  }
};

describe('fetchCheckoutValidation', () => {
  const mockPost = jest.fn();

  const mockPayload = validationSchemaPayloadFactory();
  const baseUrl = 'https://example.com/api/v1/bffs/checkout/validation/';

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });
    (getConfig as jest.Mock).mockReturnValue(mockConfig);
  });

  it('should call the correct URL with the correct payload', async () => {
    // Setup
    const mockResponseData: ValidationResponsePayload = validationResponsePayloadFactory();
    mockPost.mockResolvedValue({ data: mockResponseData });

    // Execute
    await fetchCheckoutValidation(mockPayload);

    // Verify
    expect(getConfig).toHaveBeenCalled();
    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith(baseUrl, mockPayload);
  });

  it('should return a properly structured response from the API', async () => {
    // Setup
    const mockResponseData: ValidationResponsePayload = validationResponsePayloadFactory();
    mockPost.mockResolvedValue({ data: mockResponseData });

    // Execute
    const result: ValidationResponse = await fetchCheckoutValidation(mockPayload);

    // Verify
    verifyValidationResponseStructure(result);

    // Check validation decisions if they exist
    const decisionKeys = Object.keys(result.validationDecisions);
    if (decisionKeys.length > 0) {
      decisionKeys.forEach(key => {
        const decision = result.validationDecisions[key];
        if (typeof decision === 'object' && decision !== null) {
          verifyValidationDecision(decision as ValidationDecision, null, null);
        }
      });
    }
  });

  it('should handle invalid email validation errors', async () => {
    // Setup
    const invalidEmailError: ValidationDecision = validationDecisionFactory({
      errorCode: 'invalid_email',
      developerMessage: 'The provided email is not valid.',
    });

    const mockResponseData: ValidationResponsePayload = validationResponsePayloadWithDecisionsFactory({
      adminEmail: invalidEmailError,
    }, false);

    mockPost.mockResolvedValue({ data: mockResponseData });

    // Execute
    const result: ValidationResponse = await fetchCheckoutValidation(mockPayload);

    // Verify
    verifyValidationResponseStructure(result);
    expect(result.userAuthn.userExistsForEmail).toBe(false);
    expect(result.validationDecisions).toHaveProperty('adminEmail');
    verifyValidationDecision(
      result.validationDecisions.adminEmail as ValidationDecision,
      'invalid_email',
      /not valid/i,
    );
  });

  it('should handle missing required field validation errors', async () => {
    // Setup
    const requiredFieldError: ValidationDecision = validationDecisionFactory({
      errorCode: 'required_field',
      developerMessage: 'This field is required.',
    });

    const mockResponseData: ValidationResponsePayload = validationResponsePayloadWithDecisionsFactory({
      fullName: requiredFieldError,
      companyName: requiredFieldError,
    });

    mockPost.mockResolvedValue({ data: mockResponseData });

    // Execute
    const result: ValidationResponse = await fetchCheckoutValidation(mockPayload);

    // Verify
    verifyValidationResponseStructure(result);
    expect(result.validationDecisions).toHaveProperty('fullName');
    expect(result.validationDecisions).toHaveProperty('companyName');

    verifyValidationDecision(
      result.validationDecisions.fullName as ValidationDecision,
      'required_field',
      /required/i,
    );

    verifyValidationDecision(
      result.validationDecisions.companyName as ValidationDecision,
      'required_field',
      /required/i,
    );
  });

  it('should handle invalid format validation errors', async () => {
    // Setup
    const invalidSlugError: ValidationDecision = validationDecisionFactory({
      errorCode: 'invalid_format',
      developerMessage: 'Only alphanumeric lowercase characters and hyphens are allowed.',
    });

    const invalidQuantityError: ValidationDecision = validationDecisionFactory({
      errorCode: 'invalid_range',
      developerMessage: 'Quantity must be between 5 and 100.',
    });

    const mockResponseData: ValidationResponsePayload = validationResponsePayloadWithDecisionsFactory({
      enterpriseSlug: invalidSlugError,
      quantity: invalidQuantityError,
    });

    mockPost.mockResolvedValue({ data: mockResponseData });

    // Execute
    const result: ValidationResponse = await fetchCheckoutValidation(mockPayload);

    // Verify
    verifyValidationResponseStructure(result);

    expect(result.validationDecisions).toHaveProperty('enterpriseSlug');
    verifyValidationDecision(
      result.validationDecisions.enterpriseSlug as ValidationDecision,
      'invalid_format',
      /Only alphanumeric lowercase characters and hyphens are allowed./i,
    );

    expect(result.validationDecisions).toHaveProperty('quantity');
    verifyValidationDecision(
      result.validationDecisions.quantity as ValidationDecision,
      'invalid_range',
      /between 5 and 100/i,
    );
  });

  it('should handle multiple validation errors in a single response', async () => {
    // Setup
    const mockResponseData: ValidationResponsePayload = validationResponsePayloadWithDecisionsFactory({
      adminEmail: validationDecisionFactory({
        errorCode: 'invalid_email',
        developerMessage: 'The provided email is not valid.',
      }),
      enterpriseSlug: validationDecisionFactory({
        errorCode: 'invalid_format',
        developerMessage: 'Only alphanumeric lowercase characters and hyphens are allowed.',
      }),
      quantity: validationDecisionFactory({
        errorCode: 'invalid_range',
        developerMessage: 'Quantity must be between 5 and 100.',
      }),
    });

    mockPost.mockResolvedValue({ data: mockResponseData });

    // Execute
    const result: ValidationResponse = await fetchCheckoutValidation(mockPayload);

    // Verify
    verifyValidationResponseStructure(result);

    // Verify we have exactly 3 validation errors
    expect(Object.keys(result.validationDecisions).length).toBe(3);

    // Verify each specific error
    expect(result.validationDecisions).toHaveProperty('adminEmail');
    expect(result.validationDecisions).toHaveProperty('enterpriseSlug');
    expect(result.validationDecisions).toHaveProperty('quantity');

    verifyValidationDecision(
      result.validationDecisions.adminEmail as ValidationDecision,
      'invalid_email',
      /not valid/i,
    );

    verifyValidationDecision(
      result.validationDecisions.enterpriseSlug as ValidationDecision,
      'invalid_format',
      /Only alphanumeric lowercase characters and hyphens/i,
    );

    verifyValidationDecision(
      result.validationDecisions.quantity as ValidationDecision,
      'invalid_range',
      /between 5 and 100/i,
    );
  });

  it('should throw an error if the API call fails', async () => {
    // Setup
    const mockError: Error = new Error('API call failed');
    mockPost.mockRejectedValue(mockError);

    // Execute & Verify
    await expect(fetchCheckoutValidation(mockPayload)).rejects.toThrow('API call failed');
  });
});

describe('validateFieldDetailed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getConfig as jest.Mock).mockReturnValue(mockConfig);
  });

  it('validates value of field with no options passed and returns true', async () => {
    // Setup
    const mockField = 'fullName';
    const mockValue = 'John Doe';
    const mockResponse: ValidationResponse = validationResponseWithDecisionsFactory({
      // @ts-ignore
      [mockField]: null,
    });

    const mockPost = jest.fn().mockResolvedValue({ data: mockResponse });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });

    // Execute
    const result = await validateFieldDetailed(mockField, mockValue);

    // Verify
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        full_name: mockValue, // Field name is converted to snake_case in the implementation
      }),
    );
    expect(result.isValid).toBe(true);
  });

  it('validates all fields and options passed and returns true', async () => {
    // Setup
    const mockField = 'fullName';
    const mockValue = 'John Doe';
    const mockExtras = {
      companyName: 'Acme Inc',
      quantity: 10,
    };

    // Clear any previous values in the cache
    // This is necessary because validateFieldDetailed caches previous values
    // and skips validation if the value hasn't changed
    jest.resetModules();

    const mockResponse: ValidationResponse = validationResponseWithDecisionsFactory({
      [mockField]: undefined,
      companyName: undefined,
      quantity: undefined,
    });

    const mockPost = jest.fn().mockResolvedValue({ data: mockResponse });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });

    // Execute
    const result = await validateFieldDetailed(mockField, mockValue, mockExtras);

    // Verify
    expect(result.isValid).toBe(true);

    // Since validateFieldDetailed uses debouncing and caching, we can't reliably
    // test the exact payload in this test. Instead, we'll just verify
    // that the function returns the expected result.
  });

  it('returns false if a single validation fails', async () => {
    // Setup
    const mockField = 'adminEmail';
    const mockValue = 'invalid-email';

    const mockResponse: ValidationResponse = validationResponseWithDecisionsFactory({
      [mockField]: validationDecisionFactory({
        errorCode: 'invalid_email',
        developerMessage: 'The provided email is not valid.',
      }),
    });

    const mockPost = jest.fn().mockResolvedValue({ data: mockResponse });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });

    // Execute
    const result = await validateFieldDetailed(mockField, mockValue);

    // Verify
    expect(result.isValid).toBe(false);
  });

  it('returns false if partial validation fails for multiple values in options with field', async () => {
    // This test verifies that validateFieldDetailed returns false if any field in the extras fails validation

    // Setup
    const mockField = 'fullName';
    const mockValue = 'John Doe';
    const mockExtras = {
      companyName: '',
      quantity: 10,
    };

    // Create a response where companyName has a validation error
    const mockResponse = {
      data: {
        validation_decisions: {
          full_name: null,
          company_name: {
            error_code: 'required_field',
            developer_message: 'This field is required.',
          },
          quantity: null,
        },
        user_authn: {
          user_exists_for_email: true,
        },
      },
    };

    const mockPost = jest.fn().mockResolvedValue(mockResponse);
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });

    // Execute
    const result = await validateFieldDetailed(mockField, mockValue, mockExtras);

    // Verify
    expect(result.isValid).toBe(false);
  });

  it('returns false if all validation fails for multiple values in options with field', async () => {
    // Setup
    const mockField = 'fullName';
    const mockValue = '';
    const mockExtras = {
      companyName: '',
      quantity: 0,
    };

    const mockResponse: ValidationResponse = validationResponseWithDecisionsFactory({
      [mockField]: validationDecisionFactory({
        errorCode: 'required_field',
        developerMessage: 'This field is required.',
      }),
      companyName: validationDecisionFactory({
        errorCode: 'required_field',
        developerMessage: 'This field is required.',
      }),
      quantity: validationDecisionFactory({
        errorCode: 'invalid_range',
        developerMessage: 'Quantity must be between 5 and 100.',
      }),
    });

    const mockPost = jest.fn().mockResolvedValue({ data: mockResponse });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });

    // Execute
    const result = await validateFieldDetailed(mockField, mockValue, mockExtras);

    // Verify
    expect(result.isValid).toBe(false);
  });

  it('debounces validations: executes ~500ms after last call and only once', async () => {
    // Minimal config and HTTP client mocks
    (getConfig as jest.Mock).mockReturnValue({ ENTERPRISE_ACCESS_BASE_URL: 'https://example.test' });

    const mockPost = jest.fn().mockResolvedValue({
      data: {
        validation_decisions: {
          company_name: null,
        },
        user_authn: { user_exists_for_email: true },
      },
    });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post: mockPost });

    await assertDebounce({
      baseDelayMs: VALIDATION_DEBOUNCE_MS,
      preCalls: [() => validateFieldDetailed('companyName', 'Acme-1')],
      call: () => validateFieldDetailed('companyName', 'Acme-2'),
      getInvocationCount: () => mockPost.mock.calls.length,
      upperMarginMs: 20,
    });
  });
});

describe('validateFieldDetailed memoization', () => {
  it('memoizes results for identical field/value/extras and avoids additional API calls', async () => {
    // Configure base URL and HTTP mock
    (getConfig as jest.Mock).mockReturnValue({ ENTERPRISE_ACCESS_BASE_URL: 'https://example.test' });

    const mockPost = jest.fn().mockResolvedValue({
      data: {
        validation_decisions: {
          company_name: {
            error_code: 'required_field',
            developer_message: 'This field is required.',
          },
        },
        user_authn: { user_exists_for_email: true },
      },
    });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post: mockPost });

    // First call: drive debounce and cache the non-valid result
    let firstResult: { isValid: boolean; validationDecisions: ValidationResponse['validationDecisions'] | null } | undefined;
    await assertDebounce({
      baseDelayMs: VALIDATION_DEBOUNCE_MS,
      call: async () => {
        const r = await validateFieldDetailed('companyName', '');
        firstResult = r;
        return r;
      },
      getInvocationCount: () => mockPost.mock.calls.length,
      upperMarginMs: 20,
    });

    expect(firstResult).toBeDefined();
    expect(firstResult!.isValid).toBe(false);
    expect(firstResult!.validationDecisions?.companyName).toBeDefined();

    // Second call with identical inputs should hit the memoization cache and not call HTTP
    mockPost.mockClear();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post: mockPost });

    const secondResult = await validateFieldDetailed('companyName', '');
    expect(secondResult.isValid).toBe(false);
    expect(secondResult.validationDecisions?.companyName).toBeDefined();
    expect(mockPost).not.toHaveBeenCalled();
  });
});
