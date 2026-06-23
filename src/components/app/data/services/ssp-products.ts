import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import axios, { AxiosResponse, AxiosResponseTransformer } from 'axios';

export type SspProduct = {
  name?: string;
  longName?: string;
  description?: string;
  marketingUrl?: string | null;
  thumbnailUrl?: string | null;
  price?: string | null;
  lookupKey?: string | null;
  slug?: string | null;
  courseCount?: number | null;
};

export async function fetchSspProducts(): Promise<AxiosResponse<SspProduct[]>> {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/ssp-products/`;

  const defaultTransforms: AxiosResponseTransformer[] = (
    [axios.defaults.transformResponse ?? []].flat()
  );

  const requestConfig = {
    transformResponse: defaultTransforms.concat((response) => camelCaseObject(response)),
  };

  return axios.get<SspProduct[]>(url, requestConfig);
}
