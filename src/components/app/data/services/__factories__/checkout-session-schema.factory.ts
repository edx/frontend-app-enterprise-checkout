import { snakeCaseObject } from '@edx/frontend-platform/utils';
import { faker } from '@faker-js/faker'; // eslint-disable-line import/no-extraneous-dependencies
import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import { errorFieldFactory } from './validation-schema.factory';

/**
 * Factory for creating CheckoutSessionSchema objects
 *
 * Creates a complete CheckoutSessionSchema with randomized values for all fields.
 * CheckoutSessionSchema extends BaseCheckoutSchema in the consolidated types.
 */
Factory.define('checkoutSessionSchema')
  .attr('adminEmail', () => faker.internet.email())
  .attr('enterpriseSlug', () => faker.helpers.slugify(faker.company.name()).toLowerCase())
  .attr('quantity', () => faker.number.int({ min: 5, max: 100 }))
  .attr('stripePriceId', () => `price_${faker.string.alphanumeric(14)}`);

/**
 * Factory for creating CheckoutSessionData objects
 */
Factory.define('checkoutSessionData')
  .attr('client_secret', () => `cs_test_${faker.string.alphanumeric(24)}`)
  .attr('expires_at', () => Math.floor(Date.now() / 1000 + 3600).toString());

/**
 * Factory for creating CheckoutSessionResponse objects
 */
Factory.define('checkoutSessionResponse')
  .attr('checkout_session', () => Factory.build('checkoutSessionData'));

/**
 * Common error codes used in checkout session validation errors
 */
const CHECKOUT_ERROR_CODES = [
  'not_registered',
  'existing_enterprise_customer',
  'invalid_value',
];

/**
 * Factory function for creating CheckoutSessionSchema objects
 */
export function checkoutSessionSchemaFactory(overrides = {}): CheckoutSessionSchema {
  return Factory.build('checkoutSessionSchema', overrides);
}

/**
 * Factory function for creating CheckoutSessionSchemaPayload objects (snake_case version)
 */
export function checkoutSessionSchemaPayloadFactory(overrides = {}): CheckoutSessionSchemaPayload {
  const schema = checkoutSessionSchemaFactory(overrides);
  return snakeCaseObject(schema) as CheckoutSessionSchemaPayload;
}

/**
 * Factory function for creating CheckoutSessionData objects
 */
export function checkoutSessionDataFactory(overrides = {}): CheckoutSessionData {
  return Factory.build('checkoutSessionData', overrides);
}

/**
 * Factory function for creating CheckoutSessionResponse objects
 */
export function checkoutSessionResponseFactory(overrides = {}): CheckoutSessionResponse {
  return Factory.build('checkoutSessionResponse', overrides);
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
 * Creates a CheckoutSessionErrorField object with randomized error code and message
 *
 * This function uses the common errorFieldFactory but customizes it with
 * checkout-specific error codes.
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A CheckoutSessionErrorField object
 */
export function checkoutSessionErrorFieldFactory(overrides = {}): CheckoutSessionErrorField {
  const errorCode = faker.helpers.arrayElement(CHECKOUT_ERROR_CODES);
  return errorFieldFactory({
    errorCode,
    developerMessage: getMessageForErrorCode(errorCode),
    ...overrides,
  });
}

/**
 * Creates a CheckoutSessionErrorResponse object with errors for specified fields
 *
 * @param fields - Array of field names to create errors for (defaults to admin_email and enterprise_slug)
 * @returns A complete CheckoutSessionErrorResponse object
 */
export function checkoutSessionErrorResponseFactory(
  fields: Array<keyof CheckoutSessionSchema> = ['adminEmail', 'enterpriseSlug'],
): CheckoutSessionErrorResponse {
  // Create an object with the correct type
  const errorResponse = {} as CheckoutSessionErrorResponse;

  // Add error fields for each specified field
  fields.forEach((field) => {
    errorResponse[field] = checkoutSessionErrorFieldFactory();
  });

  return errorResponse;
}
