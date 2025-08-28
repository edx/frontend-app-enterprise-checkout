import { snakeCaseObject } from '@edx/frontend-platform/utils';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

import { errorFieldFactory } from './validation-schema.factory';

/**
 * Factory for creating CreateCheckoutSessionSchema objects
 *
 * Creates a complete CreateCheckoutSessionSchema with randomized values for all fields.
 * CreateCheckoutSessionSchema extends BaseCheckoutSchema in the consolidated types.
 */
Factory.define('createCheckoutSessionSchema')
  .attr('adminEmail', () => faker.internet.email())
  .attr('companyName', () => faker.company.name())
  .attr('enterpriseSlug', () => faker.helpers.slugify(faker.company.name()).toLowerCase())
  .attr('quantity', () => faker.number.int({ min: 5, max: 100 }))
  .attr('stripePriceId', () => `price_${faker.string.alphanumeric(14)}`);

/**
 * Factory for creating CreateCheckoutSessionResponse objects
 */
Factory.define('createCheckoutSessionResponse')
  .attr('checkout_session_client_secret', () => `cs_test_${faker.string.alphanumeric(24)}`);

/**
 * Common error codes used in checkout session validation errors
 */
const CHECKOUT_ERROR_CODES = [
  'not_registered',
  'existing_enterprise_customer',
  'invalid_value',
];

/**
 * Factory function for creating CreateCheckoutSessionSchema objects
 */
export function createCheckoutSessionSchemaFactory(overrides = {}): CreateCheckoutSessionSchema {
  return Factory.build('createCheckoutSessionSchema', overrides);
}

/**
 * Factory function for creating CreateCheckoutSessionSchemaPayload objects (snake_case version)
 */
export function createCheckoutSessionSchemaPayloadFactory(overrides = {}): CreateCheckoutSessionSchemaPayload {
  const schema = createCheckoutSessionSchemaFactory(overrides);
  return snakeCaseObject(schema) as CreateCheckoutSessionSchemaPayload;
}

/**
 * Factory function for creating CreateCheckoutSessionResponse objects
 */
export function checkoutSessionResponseFactory(overrides = {}): CreateCheckoutSessionResponse {
  return Factory.build('createCheckoutSessionResponse', overrides);
}

/**
 * Helper function to get a meaningful error message for a specific error code
 */
function getMessageForErrorCode(errorCode: string): string {
  switch (errorCode) {
    case 'not_registered':
      return 'The provided email has not yet been registered.';
    case 'existing_enterprise_customer':
      return 'Slug conflicts with existing customer.';
    case 'invalid_value':
      return 'The provided value is invalid.';
    default:
      return faker.lorem.sentence();
  }
}

/**
 * Creates a CreateCheckoutSessionErrorField object with randomized error code and message
 *
 * This function uses the common errorFieldFactory but customizes it with
 * checkout-specific error codes.
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A CreateCheckoutSessionErrorField object
 */
export function createCheckoutSessionErrorFieldFactory(overrides = {}): CreateCheckoutSessionErrorField {
  const errorCode = faker.helpers.arrayElement(CHECKOUT_ERROR_CODES);
  return errorFieldFactory({
    errorCode,
    developerMessage: getMessageForErrorCode(errorCode),
    ...overrides,
  });
}

/**
 * Creates a CreateCheckoutSessionErrorResponse object with errors for specified fields
 *
 * @param fields - Array of field names to create errors for (defaults to admin_email and enterprise_slug)
 * @returns A complete CreateCheckoutSessionErrorResponse object
 */
export function createCheckoutSessionErrorResponseFactory(
  fields: Array<keyof CreateCheckoutSessionSchema> = ['adminEmail', 'enterpriseSlug'],
): CreateCheckoutSessionErrorResponse {
  // Create an object with the correct type
  const errorResponse = {} as CreateCheckoutSessionErrorResponse;

  // Add error fields for each specified field
  fields.forEach((field) => {
    errorResponse[field] = createCheckoutSessionErrorFieldFactory();
  });

  return errorResponse;
}
