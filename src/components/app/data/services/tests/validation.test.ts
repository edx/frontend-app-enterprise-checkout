import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import {
  validationDecisionFactory,
  validationResponsePayloadFactory,
  validationResponsePayloadWithDecisionsFactory,
  validationSchemaPayloadFactory,
} from '../__factories__';
import fetchCheckoutValidation from '../validation';

// Mock setup
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
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
  const mockConfig = {
    ENTERPRISE_ACCESS_BASE_URL: 'https://example.com',
  };
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
      developerMessage: 'Enterprise slug can only contain lowercase letters, numbers, and hyphens.',
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
      /lowercase letters, numbers, and hyphens/i,
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
        developerMessage: 'Enterprise slug can only contain lowercase letters, numbers, and hyphens.',
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
      /lowercase letters, numbers, and hyphens/i,
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
