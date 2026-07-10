import { logError } from '@edx/frontend-platform/logging';
import { Entries } from 'type-fest';

import fetchCheckoutValidation from '@/components/app/data/services/validation';
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

export const extractPriceObject = (
  pricing: CheckoutContextPricing,
  lookupKey?: string | null,
): CheckoutContextPrice | null => {
  if (!pricing?.prices?.length) {
    return null;
  }

  // If an explicit lookupKey is provided, prefer an exact match
  if (lookupKey) {
    const exact = pricing.prices.find((price) => price.lookupKey === lookupKey);
    if (exact) { return exact; }
  }

  // Fallback to existing behavior: find by defaultByLookupKey substring
  return pricing.prices.find((price) => price.lookupKey.includes(pricing.defaultByLookupKey)) ?? null;
};

export const extractPriceId = (
  pricing: CheckoutContextPricing,
  lookupKey?: string | null,
): CheckoutContextPrice['id'] | null => {
  if (!pricing?.prices?.length) {
    return null;
  }
  const matched = extractPriceObject(pricing, lookupKey);
  return matched?.id ?? null;
};

/**
 * Validate whether a provided product key corresponds to a pricing lookupKey.
 * Returns the key when valid, otherwise `null`.
 */
export const validateProductKey = (
  pricing: CheckoutContextPricing | undefined | null,
  key?: string | null,
): string | null => {
  if (!key || !pricing?.prices?.length) { return null; }
  return pricing.prices.some((p) => p.lookupKey === key) ? key : null;
};

// find price amount by a specific product's lookup key
export const extractPriceByProductLookupKey = (
  pricing: CheckoutContextPricing | undefined,
  lookupKey: string | undefined,
): number | null => {
  if (!pricing?.prices?.length || !lookupKey) {
    return null;
  }
  const matched = extractPriceObject(pricing as CheckoutContextPricing, lookupKey);
  return matched ? matched.unitAmount / 100 : null;
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

  const maxAttempts = 20; // Safety limit to prevent long client-side retry loops

  const validateSlugCandidate = async (candidateSlug: string) => {
    const response = await fetchCheckoutValidation({
      enterprise_slug: candidateSlug,
      admin_email: adminEmail || '',
    });
    const validationDecisions = response?.validationDecisions ?? {};
    return {
      isValid: !validationDecisions.enterpriseSlug,
      validationDecisions,
    };
  };

  const nextCandidateForSuffix = (suffix: number): string => {
    const suffixStr = `-${suffix}`;
    const maxBaseLength = maxLength - suffixStr.length;

    let truncatedBase = baseSlug;
    if (baseSlug.length > maxBaseLength) {
      truncatedBase = baseSlug.substring(0, maxBaseLength);
      truncatedBase = truncatedBase.replace(/-+$/, '');
    }

    return `${truncatedBase}${suffixStr}`;
  };

  const resolveCandidate = async (
    candidateSlug: string,
    suffix: number,
    attempt: number,
    lastValidatedCandidate: string = candidateSlug,
  ): Promise<string> => {
    if (attempt >= maxAttempts) {
      logError(`Slug generation exceeded max attempts for base slug ${baseSlug}`);
      return lastValidatedCandidate;
    }

    try {
      const { isValid, validationDecisions } = await validateSlugCandidate(candidateSlug);

      // If valid (no error), we found an available slug
      if (isValid || !validationDecisions?.enterpriseSlug) {
        return candidateSlug;
      }

      const { errorCode } = validationDecisions.enterpriseSlug;
      const isRetryableCollision = errorCode === 'existing_enterprise_customer' || errorCode === 'slug_reserved';

      if (!isRetryableCollision) {
        logError(`Slug validation returned a non-retryable error for ${candidateSlug}: ${errorCode}`);
        return candidateSlug;
      }

      const nextSuffix = suffix + 1;
      return await resolveCandidate(nextCandidateForSuffix(nextSuffix), nextSuffix, attempt + 1, candidateSlug);
    } catch (error) {
      logError(`Slug validation failed for ${candidateSlug}`, error);
      return candidateSlug;
    }
  };

  return resolveCandidate(baseSlug, 0, 0);
};
