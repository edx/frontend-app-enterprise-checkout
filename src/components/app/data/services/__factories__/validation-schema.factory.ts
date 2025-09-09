import { snakeCaseObject } from '@edx/frontend-platform/utils';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

/**
 * Factory for creating ValidationSchema objects
 *
 * Creates a complete ValidationSchema with randomized values for all fields
 */
Factory.define('validationSchema')
  .attr('fullName', () => faker.person.fullName())
  .attr('adminEmail', () => faker.internet.email())
  .attr('companyName', () => faker.company.name())
  .attr('enterpriseSlug', () => faker.helpers.slugify(faker.company.name()).toLowerCase())
  .attr('quantity', () => faker.number.int({ min: 5, max: 100 }))
  .attr('stripePriceId', () => `price_${faker.string.alphanumeric(14)}`);

/**
 * Factory for creating FieldErrorSchema objects
 *
 * FieldErrorSchema is a common type used for validation errors across different API responses
 * This is also used as the base for ValidationDecision objects
 */
Factory.define('fieldErrorSchema')
  .attr('errorCode', () => faker.string.alphanumeric(8))
  .attr('developerMessage', () => faker.lorem.sentence());

/**
 * Creates a ValidationSchema object with randomized values
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A complete ValidationSchema object
 */
export function validationSchemaFactory(overrides = {}): ValidationSchema {
  return Factory.build('validationSchema', overrides);
}

/**
 * Creates a ValidationSchemaPayload object (snake_case version of ValidationSchema)
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A ValidationSchemaPayload object with snake_case property names
 */
export function validationSchemaPayloadFactory(overrides = {}): ValidationSchemaPayload {
  const schema = validationSchemaFactory(overrides);
  return snakeCaseObject(schema) as ValidationSchemaPayload;
}

/**
 * Creates an FieldErrorSchema object with randomized error code and message
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A FieldErrorSchema object
 */
export function fieldErrorSchemaFactory(overrides = {}): FieldErrorSchema {
  return Factory.build('fieldErrorSchema', overrides);
}

/**
 * Creates a ValidationDecision object (alias for fieldErrorSchemaFactory)
 *
 * ValidationDecision is a type alias for FieldErrorSchema, so this function
 * simply calls fieldErrorSchemaFactory with the same parameters
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A ValidationDecision object
 */
export function validationDecisionFactory(overrides = {}): ValidationDecision {
  return fieldErrorSchemaFactory(overrides);
}

/**
 * Creates a ValidationResponse object with random validation decisions
 *
 * This function generates a ValidationResponse with validation decisions for a random
 * subset of fields from ValidationSchema. Each decision is a random error.
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A ValidationResponse object with random validation decisions
 */
export function validationResponseFactory(overrides = {}): ValidationResponse {
  const schema = validationSchemaFactory();
  const schemaKeys = Object.keys(schema) as Array<keyof ValidationSchema>;

  // Select a random subset of keys to create validation decisions for
  const numDecisions = faker.number.int({ min: 1, max: schemaKeys.length });
  const selectedKeys = faker.helpers.arrayElements(schemaKeys, numDecisions);

  const validationDecisions: Record<string, ValidationDecision> = {};
  selectedKeys.forEach(key => {
    validationDecisions[key] = fieldErrorSchemaFactory();
  });

  return {
    validationDecisions,
    userAuthn: {
      userExistsForEmail: faker.datatype.boolean(),
    },
    ...overrides,
  };
}

/**
 * Creates a ValidationResponsePayload object (snake_case version of ValidationResponse)
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A ValidationResponsePayload object with snake_case property names
 */
export function validationResponsePayloadFactory(overrides = {}): ValidationResponsePayload {
  const response = validationResponseFactory(overrides);
  return snakeCaseObject(response) as ValidationResponsePayload;
}

/**
 * Creates a ValidationResponse object with specific validation decisions
 *
 * This function allows you to specify exactly which fields should have validation
 * decisions and what those decisions should be.
 *
 * @param decisions - Map of field names to their validation decisions
 * @param userExistsForEmail - Whether the user exists for the email (defaults to true)
 * @returns A ValidationResponse object with the specified validation decisions
 */
export function validationResponseWithDecisionsFactory(
  decisions: Partial<Record<keyof ValidationSchema, ValidationDecision>>,
  userExistsForEmail = true,
): ValidationResponse {
  return {
    validationDecisions: decisions,
    userAuthn: {
      userExistsForEmail,
    },
  };
}

/**
 * Creates a ValidationResponsePayload object with specific validation decisions
 *
 * This is a convenience function that creates a ValidationResponse with specific
 * decisions and then converts it to snake_case for API compatibility.
 *
 * @param decisions - Map of field names to their validation decisions
 * @param userExistsForEmail - Whether the user exists for the email (defaults to true)
 * @returns A ValidationResponsePayload object with snake_case property names
 */
export function validationResponsePayloadWithDecisionsFactory(
  decisions: Partial<Record<keyof ValidationSchema, ValidationDecision>>,
  userExistsForEmail = true,
): ValidationResponsePayload {
  const response = validationResponseWithDecisionsFactory(decisions, userExistsForEmail);
  return snakeCaseObject(response) as ValidationResponsePayload;
}
