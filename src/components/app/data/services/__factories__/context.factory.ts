import { camelCaseObject } from '@edx/frontend-platform/utils';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

/**
 * Type aliases to simplify complex type annotations
 */
type CheckoutContextCustomerPayload = CheckoutContextResponsePayload['existing_customers_for_authenticated_user'][0];
type CheckoutContextPricePayload = CheckoutContextResponsePayload['pricing']['prices'][0];
type CheckoutContextPricingPayload = CheckoutContextResponsePayload['pricing'];
type CheckoutContextFieldConstraintsPayload = CheckoutContextResponsePayload['field_constraints'];

/**
 * Factory for creating checkout context customer objects
 *
 * Creates a customer object with randomized values for all fields
 */
Factory.define('checkoutContextCustomer')
  .attr('customer_uuid', () => faker.string.uuid())
  .attr('customer_name', () => faker.company.name())
  .attr('customer_slug', () => faker.helpers.slugify(faker.company.name()).toLowerCase())
  .attr('stripe_customer_id', () => `cus_${faker.string.alphanumeric(14)}`)
  .attr('is_self_service', () => faker.datatype.boolean())
  .attr('admin_portal_url', () => faker.internet.url());

/**
 * Factory for creating checkout context price objects
 */
Factory.define('checkoutContextPrice')
  .attr('id', () => `price_${faker.string.alphanumeric(14)}`)
  .attr('product', () => `prod_${faker.string.alphanumeric(14)}`)
  .attr('lookup_key', () => faker.string.sample(10))
  .attr('recurring', () => ({
    interval: null,
    property2: null,
  }))
  .attr('currency', () => faker.finance.currencyCode())
  .attr('unit_amount', () => faker.number.int({ min: 1000, max: 10000 }))
  .attr('unit_amount_decimal', ['unit_amount'], (unit_amount: number) => (unit_amount / 100).toFixed(2));

/**
 * Factory for creating checkout context pricing objects
 */
Factory.define('checkoutContextPricing')
  .attr('default_by_lookup_key', () => faker.string.sample(10))
  .attr('prices', () => [
    Factory.build('checkoutContextPrice'),
    Factory.build('checkoutContextPrice'),
  ]);

/**
 * Factory for creating checkout context field constraints objects
 */
Factory.define('checkoutContextFieldConstraints')
  .attr('quantity', () => ({
    min: faker.number.int({ min: 1, max: 5 }),
    max: faker.number.int({ min: 10, max: 100 }),
  }))
  .attr('enterprise_slug', () => ({
    min_length: faker.number.int({ min: 3, max: 5 }),
    max_length: faker.number.int({ min: 20, max: 50 }),
    pattern: '^[a-z0-9-]+$',
  }));

/**
 * Factory for creating checkout context response objects
 */
Factory.define('checkoutContextResponse')
  .attr('existing_customers_for_authenticated_user', () => [
    Factory.build('checkoutContextCustomer'),
    Factory.build('checkoutContextCustomer'),
  ])
  .attr('pricing', () => Factory.build('checkoutContextPricing'))
  .attr('field_constraints', () => Factory.build('checkoutContextFieldConstraints'));

/**
 * Creates a checkout context customer object with randomized values
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A checkout context customer object with snake_case property names
 */
export function checkoutContextCustomerFactory(overrides = {}): CheckoutContextCustomerPayload {
  return Factory.build('checkoutContextCustomer', overrides);
}

/**
 * Creates a checkout context price object with randomized values
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A checkout context price object with snake_case property names
 */
export function checkoutContextPriceFactory(overrides = {}): CheckoutContextPricePayload {
  return Factory.build('checkoutContextPrice', overrides);
}

/**
 * Creates a checkout context pricing object with randomized values
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A checkout context pricing object with snake_case property names
 */
export function checkoutContextPricingFactory(overrides = {}): CheckoutContextPricingPayload {
  return Factory.build('checkoutContextPricing', overrides);
}

/**
 * Creates a checkout context field constraints object with randomized values
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A checkout context field constraints object with snake_case property names
 */
export function checkoutContextFieldConstraintsFactory(overrides = {}): CheckoutContextFieldConstraintsPayload {
  return Factory.build('checkoutContextFieldConstraints', overrides);
}

/**
 * Creates a checkout context response object with randomized values
 *
 * This function generates a complete checkout context response with snake_case
 * property names for API compatibility.
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A checkout context response object with snake_case property names
 */
export function checkoutContextResponseFactory(overrides = {}): CheckoutContextResponsePayload {
  return Factory.build('checkoutContextResponse', overrides);
}

/**
 * Creates a checkout context response object with camelCase property names
 *
 * This function generates a complete checkout context response and converts
 * it to camelCase property names for use in the application.
 *
 * @param overrides - Optional properties to override in the generated object
 * @returns A checkout context response object with camelCase property names
 */
export function camelCasedCheckoutContextResponseFactory(overrides = {}): CheckoutContextResponse {
  const response = checkoutContextResponseFactory(overrides);
  return camelCaseObject(response);
}

// Alias for backward compatibility
export const contextFactory = checkoutContextResponseFactory;
