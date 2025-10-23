import { getCountryMessages, useIntl } from '@edx/frontend-platform/i18n';
import { useMemo } from 'react';

import useFormValidationConstraints from './useFormValidationConstraints';

interface CountryOption {
  value: string;
  label: string;
}

/**
 * Hook to get country dropdown options with embargo filtering
 *
 * Returns all countries from getCountryMessages(), localized to the current locale,
 * with embargoed countries filtered out based on field_constraints from the BFF API.
 *
 * Country values are 2-character ISO codes, labels are localized names.
 *
 * @returns {CountryOption[]} Filtered and sorted country options
 */
const useCountryOptions = (): CountryOption[] => {
  const intl = useIntl();
  const { data: fieldConstraints } = useFormValidationConstraints();

  const countryOptions = useMemo(() => {
    const allCountries = getCountryMessages(intl.locale);

    // Fetch embargo countries from Context BFF API (via field_constraints)
    const embargoedCountries = fieldConstraints?.embargoedCountries || [];

    return Object.keys(allCountries).reduce((acc, code) => {
      if (!embargoedCountries.includes(code)) {
        acc.push({ value: code, label: allCountries[code] as string });
      }
      return acc;
    }, [] as { value: string; label: string }[])
      .sort((a, b) => a.label.localeCompare(b.label, intl.locale));
  }, [intl.locale, fieldConstraints?.embargoedCountries]);

  return countryOptions;
};

export default useCountryOptions;
