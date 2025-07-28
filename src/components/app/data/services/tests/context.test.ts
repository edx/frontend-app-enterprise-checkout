import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import {
  checkoutContextCustomerFactory,
  contextFactory,
} from '../__factories__/context.factory';
import fetchCheckoutContext from '../context';

// Mock setup
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

/**
 * Helper function to verify the structure of a checkout context response
 */
const verifyCheckoutContextResponse = (response) => {
  // Verify the top-level structure
  expect(response).toHaveProperty('existingCustomersForAuthenticatedUser');
  expect(response).toHaveProperty('pricing');
  expect(response).toHaveProperty('fieldConstraints');

  // Verify pricing structure
  expect(response.pricing).toHaveProperty('prices');
  expect(Array.isArray(response.pricing.prices)).toBe(true);

  // Verify field constraints structure
  expect(response.fieldConstraints).toHaveProperty('quantity');
  expect(response.fieldConstraints).toHaveProperty('enterpriseSlug');

  return response;
};

/**
 * Helper function to verify the structure of a customer in the context response
 */
const verifyCustomerStructure = (customer) => {
  expect(customer).toHaveProperty('customerUuid');
  expect(customer).toHaveProperty('customerName');
  expect(customer).toHaveProperty('customerSlug');
  expect(customer).toHaveProperty('stripeCustomerId');
  expect(customer).toHaveProperty('isSelfService');
  expect(customer).toHaveProperty('adminPortalUrl');

  // Verify data types
  expect(typeof customer.customerUuid).toBe('string');
  expect(typeof customer.customerName).toBe('string');
  expect(typeof customer.customerSlug).toBe('string');

  return customer;
};

describe('fetchCheckoutContext', () => {
  const mockPost = jest.fn();
  const mockConfig = {
    ENTERPRISE_ACCESS_BASE_URL: 'https://example.com',
  };
  const baseUrl = 'https://example.com/api/v1/bffs/checkout/context/';

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });
    (getConfig as jest.Mock).mockReturnValue(mockConfig);
  });

  it('should call the correct URL', async () => {
    // Setup
    const mockResponse = {
      data: contextFactory(),
    };
    mockPost.mockResolvedValue(mockResponse);

    // Execute
    await fetchCheckoutContext();

    // Verify
    expect(getConfig).toHaveBeenCalled();
    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith(baseUrl);
  });

  it('should return a properly structured response from the API', async () => {
    // Setup
    const mockResponse = {
      data: contextFactory(),
    };
    mockPost.mockResolvedValue(mockResponse);

    // Execute
    const result = await fetchCheckoutContext();

    // Verify
    verifyCheckoutContextResponse(result);

    // Check customers if they exist
    if (result.existingCustomersForAuthenticatedUser.length > 0) {
      result.existingCustomersForAuthenticatedUser.forEach(customer => {
        verifyCustomerStructure(customer);
      });
    }

    // Check pricing details
    expect(result.pricing.prices.length).toBeGreaterThan(0);
    if (result.pricing.prices.length > 0) {
      const price = result.pricing.prices[0];
      expect(price).toHaveProperty('id');
      expect(price).toHaveProperty('product');
      expect(price).toHaveProperty('lookupKey');
      expect(price).toHaveProperty('currency');
      expect(price).toHaveProperty('unitAmount');
      expect(price).toHaveProperty('unitAmountDecimal');
    }

    // Check field constraints
    const { quantity, enterpriseSlug } = result.fieldConstraints;
    expect(quantity).toHaveProperty('min');
    expect(quantity).toHaveProperty('max');
    expect(enterpriseSlug).toHaveProperty('minLength');
    expect(enterpriseSlug).toHaveProperty('maxLength');
    expect(enterpriseSlug).toHaveProperty('pattern');
  });

  it('should handle responses with customers', async () => {
    // Setup - Create a response with multiple customers using snake_case property names
    const mockCustomers = [
      checkoutContextCustomerFactory({ customer_name: 'Company A' }),
      checkoutContextCustomerFactory({ customer_name: 'Company B' }),
    ];

    // Create a mock response with our custom customers
    const mockResponseData = contextFactory({
      existing_customers_for_authenticated_user: mockCustomers,
    });

    mockPost.mockResolvedValue({ data: mockResponseData });

    // Execute
    const result = await fetchCheckoutContext();

    // Verify
    verifyCheckoutContextResponse(result);

    // Verify customers - note that the response will have camelCase property names
    expect(result.existingCustomersForAuthenticatedUser.length).toBe(2);

    // The factory converts snake_case to camelCase, so we need to check camelCase properties
    expect(result.existingCustomersForAuthenticatedUser[0].customerName).toBe('Company A');
    expect(result.existingCustomersForAuthenticatedUser[1].customerName).toBe('Company B');

    // Verify customer structure
    result.existingCustomersForAuthenticatedUser.forEach(customer => {
      verifyCustomerStructure(customer);
    });
  });

  it('should throw an error if the API call fails', async () => {
    // Setup
    const mockError = new Error('API call failed');
    mockPost.mockRejectedValue(mockError);

    // Execute & Verify
    await expect(fetchCheckoutContext()).rejects.toThrow('API call failed');
  });
});
