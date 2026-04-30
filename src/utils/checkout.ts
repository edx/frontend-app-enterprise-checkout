import { Entries } from 'type-fest';

import { validateFieldDetailed } from '@/components/app/data/services/validation';
import {
  CheckoutPageDetails,
  CheckoutStepByKey,
  CheckoutStepKey,
  CheckoutSubstepByKey,
  CheckoutSubstepKey,
} from '@/constants/checkout';

/**
 * Determines the step identifiers from the given URL params.
 */
export function getStepFromParams(params) {
  const {
    step: currentStepKey,
    substep: currentSubstepKey,
  }: {
    step?: CheckoutStepKey,
    substep?: CheckoutSubstepKey,
  } = params;
  const currentStep = currentStepKey ? CheckoutStepByKey[currentStepKey] : undefined;
  const currentSubstep = currentSubstepKey ? CheckoutSubstepByKey[currentSubstepKey] : undefined;
  return {
    currentStep,
    currentStepKey,
    currentSubstep,
    currentSubstepKey,
  };
}

/**
 * Determines the current checkout page name & details based on the step names.
 */
export function getCheckoutPageDetails(
  {
    step,
    substep,
  }: {
    step: CheckoutStep | undefined,
    substep: CheckoutSubstep | undefined,
  },
): { name: CheckoutPage, details: CheckoutPageDetails } | null {
  // Find the matching page based on step and substep
  const entry = (Object.entries(CheckoutPageDetails) as Entries<typeof CheckoutPageDetails>).find(
    ([, value]) => value.step === step && value.substep === substep,
  );
  if (entry) {
    return { name: entry[0], details: entry[1] };
  }
  return null;
}

export const extractPriceObject = (pricing: CheckoutContextPricing): CheckoutContextPrice | null => {
  if (!pricing.prices.length) {
    return null;
  }
  return pricing.prices.find((price) => price.lookupKey.includes(pricing.defaultByLookupKey)) ?? null;
};

export const extractPriceId = (pricing: CheckoutContextPricing): CheckoutContextPrice['id'] | null => {
  if (!pricing.prices.length) {
    return null;
  }
  const matched = extractPriceObject(pricing);
  return matched?.id ?? null;
};

/**
 * Generates a URL slug from a company name following specific rules:
 * - Converts to lowercase
 * - Replaces spaces and non-alphanumeric characters with a single dash (-)
 * - Collapses multiple consecutive dashes into one
 * - Trims leading/trailing dashes
 * - Enforces maximum length of 30 characters
 * - Allowed characters: [a-z0-9-]
 *
 * @param companyName - The company name to convert to a slug
 * @param maxLength - Maximum length for the slug (default: 30)
 * @returns The generated slug, or empty string if input is invalid
 *
 * @example
 * generateSlugFromCompanyName('ACME, Inc.') // returns 'acme-inc'
 * generateSlugFromCompanyName('My  Company!!!') // returns 'my-company'
 * generateSlugFromCompanyName('Test & Demo Corp.') // returns 'test-demo-corp'
 */
export const generateSlugFromCompanyName = (
  companyName: string,
  maxLength: number = 30,
): string => {
  if (!companyName || typeof companyName !== 'string') {
    return '';
  }

  // Convert to lowercase
  let slug = companyName.toLowerCase();

  // Replace spaces and non-alphanumeric characters with a single dash
  slug = slug.replace(/[^a-z0-9]+/g, '-');

  // Collapse multiple consecutive dashes into one
  slug = slug.replace(/-+/g, '-');

  // Trim leading and trailing dashes
  slug = slug.replace(/^-+|-+$/g, '');

  // Enforce max length
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Re-trim trailing dash in case truncation created one
    slug = slug.replace(/-+$/, '');
  }

  return slug;
};

/**
 * Finds an available enterprise slug by validating against the backend API
 * and handling collisions with numeric suffixes.
 *
 * If the initial slug is taken, appends incremental numeric suffixes (-1, -2, -3, etc.)
 * until an available slug is found. Respects the maximum length constraint.
 *
 * @param baseSlug - The initial slug to validate
 * @param adminEmail - The admin email to include in validation (optional)
 * @param maxLength - Maximum length for the slug (default: 30)
 * @returns A promise that resolves to an available slug, or the original slug if validation fails
 *
 * @example
 * await findAvailableSlug('acme-inc', 'admin@acme.com')
 * // If 'acme-inc' is taken, tries 'acme-inc-1', then 'acme-inc-2', etc.
 */
export const findAvailableSlug = async (
  baseSlug: string,
  adminEmail?: string,
  maxLength: number = 30,
): Promise<string> => {
  if (!baseSlug) {
    return baseSlug;
  }

  let candidateSlug = baseSlug;
  let suffix = 0;
  const maxAttempts = 100; // Safety limit to prevent infinite loops

  // Try the base slug first
  /* eslint-disable no-await-in-loop */
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { isValid, validationDecisions } = await validateFieldDetailed(
        'enterpriseSlug',
        candidateSlug,
        adminEmail ? { adminEmail } : undefined,
        true, // forceValidate to bypass cache
      );

      // If valid (no error), we found an available slug
      if (isValid || !validationDecisions?.enterpriseSlug) {
        return candidateSlug;
      }

      // If invalid, try with a numeric suffix
      suffix++;
      const suffixStr = `-${suffix}`;

      // Calculate max base length to accommodate suffix
      const maxBaseLength = maxLength - suffixStr.length;

      // Truncate base slug if necessary to fit suffix
      let truncatedBase = baseSlug;
      if (baseSlug.length > maxBaseLength) {
        truncatedBase = baseSlug.substring(0, maxBaseLength);
        // Remove trailing dash after truncation
        truncatedBase = truncatedBase.replace(/-+$/, '');
      }

      candidateSlug = `${truncatedBase}${suffixStr}`;
    } catch (error) {
      // If validation fails for any reason, return the candidate
      return candidateSlug;
    }
  }
  /* eslint-enable no-await-in-loop */

  // If we hit the max attempts, return the last candidate
  return candidateSlug;
};
