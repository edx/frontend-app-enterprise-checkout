import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

import { fieldErrorSchemaFactory } from './validation-schema.factory';

/**
 * Factory for creating CreateCheckoutSessionRequestSchema objects
 *
 * Creates a complete CreateCheckoutSessionRequestSchema with randomized values for all fields.
 */
Factory.define('createCheckoutSessionRequest')
  .attr('adminEmail', () => faker.internet.email())
  .attr('companyName', () => faker.company.name())
  .attr('enterpriseSlug', () => faker.helpers.slugify(faker.company.name()).toLowerCase())
  .attr('quantity', () => faker.number.int({ min: 5, max: 100 }))
  .attr('stripePriceId', () => `price_${faker.string.alphanumeric(14)}`);

/**
 * Factory for creating CreateCheckoutSessionSuccessResponse objects
 */
Factory.define('createCheckoutSessionSuccessResponse')
  .attr('checkoutSessionClientSecret', () => `cs_test_${faker.string.alphanumeric(24)}`);

/**
 * Common error codes used in checkout session validation errors
 */
const CHECKOUT_ERROR_CODES = [
  'not_registered',
  'existing_enterprise_customer',
  'invalid_value',
];

/**
 * Factory function for creating CreateCheckoutSessionRequestSchema objects
 */
export function createCheckoutSessionRequestFactory(overrides = {}): CreateCheckoutSessionRequestSchema {
  return Factory.build('createCheckoutSessionRequest', overrides);
}

/**
 * Factory function for creating CreateCheckoutSessionResponse objects
 */
export function createCheckoutSessionSuccessResponseFactory(
  overrides = {},
): CreateCheckoutSessionSuccessResponseSchema {
  return Factory.build('createCheckoutSessionSuccessResponse', overrides);
}

/**
 * Creates a CreateCheckoutSessionFieldError object with randomized error code and message
 *
 * This function uses the common fieldErrorSchemaFactory but customizes it with
 * checkout-specific error codes.
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A CreateCheckoutSessionFieldError object
 */
export function createCheckoutSessionFieldErrorFactory(overrides = {}): CreateCheckoutSessionFieldError {
  const errorCode = faker.helpers.arrayElement(CHECKOUT_ERROR_CODES);
  return fieldErrorSchemaFactory({
    errorCode,
    developerMessage: 'foobar bad value.',
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
  fields: Array<keyof CreateCheckoutSessionRequestSchema> = ['adminEmail', 'enterpriseSlug'],
): CreateCheckoutSessionErrorResponseSchema {
  // Create an object with the correct type
  const errorResponse: CreateCheckoutSessionErrorResponseSchema = {};

  // Add error fields for each specified field
  fields.forEach((field) => {
    errorResponse[field] = createCheckoutSessionFieldErrorFactory();
  });

  return errorResponse;
}
