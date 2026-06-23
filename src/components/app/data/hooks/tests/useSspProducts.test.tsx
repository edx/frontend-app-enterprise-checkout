import { getConfig } from '@edx/frontend-platform/config';
import axios from 'axios';

import { fetchSspProducts } from '../useSspProducts';

jest.mock('axios');
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    ENTERPRISE_ACCESS_BASE_URL: 'https://api.mocked-url.com',
  })),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchSspProducts API utility coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('covers successful try block with array data', async () => {
    const mockPayload = [{ name: 'Test Academy', lookup_key: 'test_key' }];
    mockedAxios.get.mockResolvedValueOnce({ data: mockPayload });

    const result = await fetchSspProducts();

    expect(getConfig).toHaveBeenCalled();
    // Add the missing trailing slash to match the exact runtime URL call string
    expect(mockedAxios.get).toHaveBeenCalledWith('https://api.mocked-url.com/api/v1/ssp-products/');
    expect(result).toEqual(mockPayload);
  });

  it('covers the !Array.isArray(data) validation check', async () => {
    // Simulates an API response returning an object container instead of a list array
    mockedAxios.get.mockResolvedValueOnce({ data: { unexpected_object: 'error' } });

    const result = await fetchSspProducts();

    expect(result).toEqual([]);
  });

  it('covers the catch error block branch', async () => {
    // Force a mock network failure rejection to route flow execution straight into the catch map
    mockedAxios.get.mockRejectedValueOnce(new Error('500 Internal Server Error'));

    const result = await fetchSspProducts();

    expect(result).toEqual([]);
  });
});
